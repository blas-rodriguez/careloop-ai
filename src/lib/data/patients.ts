import "server-only";

import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { FollowupStatus, Patient } from "@/lib/types";
import { ageFromBirthDate } from "@/lib/validation";

type SpecialtyRelation = { name: string };
type DoctorRelation = {
  full_name: string;
  specialty: SpecialtyRelation | SpecialtyRelation[] | null;
};

type PatientRow = {
  id: string;
  full_name: string;
  birth_date: string | null;
  phone: string;
  primary_doctor: DoctorRelation | DoctorRelation[] | null;
  consultations: Array<{
    occurred_at: string;
    followups: Array<{ scheduled_for: string; status: string }>;
  }>;
};

function first<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value?: string) {
  return value
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(value))
    : "No consultation";
}

function followupLabel(value?: string) {
  return value
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))
    : "Not scheduled";
}

function mapStatus(value?: string): FollowupStatus {
  if (value === "completed") return "Follow-up Completed";
  if (value === "failed") return "Call Failed";
  return "Scheduled";
}

function mapPatient(row: PatientRow): Patient {
  const doctor = first(row.primary_doctor);
  const specialty = first(doctor?.specialty);
  const consultations = [...row.consultations].sort((a, b) =>
    b.occurred_at.localeCompare(a.occurred_at),
  );
  const followups = consultations
    .flatMap((item) => item.followups)
    .sort((a, b) => b.scheduled_for.localeCompare(a.scheduled_for));
  return {
    id: row.id,
    initials: row.full_name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase(),
    name: row.full_name,
    age: ageFromBirthDate(row.birth_date),
    phone: row.phone,
    doctor: doctor?.full_name ?? "Unassigned",
    specialty: specialty?.name ?? "No specialty",
    lastConsultation: formatDate(consultations[0]?.occurred_at),
    nextFollowup: followupLabel(followups[0]?.scheduled_for),
    status: mapStatus(followups[0]?.status),
  };
}

export async function getPatients(): Promise<Patient[]> {
  await connection();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("patients")
      .select(
        "id, full_name, birth_date, phone, primary_doctor:doctors!patients_primary_doctor_id_fkey(full_name, specialty:specialties(name)), consultations(occurred_at, followups(scheduled_for, status))",
      )
      .order("full_name");
    if (error) throw error;
    return (data ?? []).map((row) => mapPatient(row as PatientRow));
  } catch (error) {
    console.error("Unable to load patients.", error);
    return [];
  }
}

export async function getPatient(id: string) {
  return (await getPatients()).find((patient) => patient.id === id);
}
