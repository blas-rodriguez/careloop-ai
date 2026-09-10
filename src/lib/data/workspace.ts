import "server-only";

import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type AppointmentItem = {
  id: string;
  patient: string;
  doctor: string;
  specialty: string;
  startsAt: string;
  status: string;
  source: string;
};
export type DoctorItem = {
  id: string;
  name: string;
  email: string;
  specialty: string;
  active: boolean;
};
export type DashboardStats = {
  patients: number;
  calls: number;
  completed: number;
  needsReview: number;
  appointments: number;
  rating: number;
};
export type PatientFormRecord = {
  id: string;
  fullName: string;
  birthDate: string;
  phone: string;
  doctorId: string;
  consent: boolean;
};
export type FollowupItem = {
  id: string;
  patientId: string;
  patient: string;
  doctor: string;
  scheduledFor: string;
  status: string;
  attemptCount: number;
  consent: boolean;
  callStatus: string | null;
  summary: string | null;
  needsReview: boolean;
};
export type TimelineEvent = {
  id: string;
  kind: "consultation" | "call";
  date: string;
  title: string;
  detail: string | null;
  recommendations: string[];
  result: CallResultItem | null;
};
export type CallResultItem = {
  id: string;
  outcome: string;
  recommendationsFollowed: boolean | null;
  newSymptoms: string | null;
  needsReview: boolean;
  reviewedAt: string | null;
  appointmentRequested: boolean;
  doctorRating: number | null;
  summary: string | null;
  transcript: string | null;
};

export async function getAppointments(): Promise<AppointmentItem[]> {
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, status, source, patient:patients(full_name), doctor:doctors(full_name, specialty:specialties(name))",
    )
    .order("starts_at");
  if (error) {
    console.error("Unable to load appointments", error);
    return [];
  }
  return (data ?? []).map((row) => {
    const patient = Array.isArray(row.patient) ? row.patient[0] : row.patient;
    const doctor = Array.isArray(row.doctor) ? row.doctor[0] : row.doctor;
    const specialties = doctor && "specialty" in doctor ? doctor.specialty : [];
    const specialty = Array.isArray(specialties) ? specialties[0] : specialties;
    return {
      id: row.id,
      patient: patient?.full_name ?? "Unknown patient",
      doctor: doctor?.full_name ?? "Unassigned",
      specialty: specialty?.name ?? "General",
      startsAt: row.starts_at,
      status: row.status,
      source: row.source,
    };
  });
}

export async function getDoctors(): Promise<DoctorItem[]> {
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("doctors")
    .select("id, full_name, email, active, specialty:specialties(name)")
    .order("full_name");
  if (error) {
    console.error("Unable to load doctors", error);
    return [];
  }
  return (data ?? []).map((row) => {
    const specialties = Array.isArray(row.specialty)
      ? row.specialty
      : row.specialty
        ? [row.specialty]
        : [];
    return {
      id: row.id,
      name: row.full_name,
      email: row.email ?? "No email",
      active: row.active,
      specialty: specialties[0]?.name ?? "General",
    };
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connection();
  const supabase = await createClient();
  const [patients, calls, completed, review, appointments, ratings] =
    await Promise.all([
      supabase.from("patients").select("id", { count: "exact", head: true }),
      supabase
        .from("followup_calls")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("followup_calls")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed"),
      supabase
        .from("call_results")
        .select("id", { count: "exact", head: true })
        .eq("needs_human_review", true)
        .is("reviewed_at", null),
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("call_results")
        .select("doctor_rating")
        .not("doctor_rating", "is", null),
    ]);
  const ratingValues = (ratings.data ?? [])
    .map((item) => item.doctor_rating)
    .filter((value): value is number => typeof value === "number");
  return {
    patients: patients.count ?? 0,
    calls: calls.count ?? 0,
    completed: completed.count ?? 0,
    needsReview: review.count ?? 0,
    appointments: appointments.count ?? 0,
    rating: ratingValues.length
      ? ratingValues.reduce((sum, value) => sum + value, 0) /
        ratingValues.length
      : 0,
  };
}

export async function getFollowups(): Promise<FollowupItem[]> {
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("followups")
    .select(
      "id, scheduled_for, status, attempt_count, consultation:consultations(patient:patients(id, full_name, consent_to_automated_calls), doctor:doctors(full_name)), calls:followup_calls(status, created_at, result:call_results(summary, needs_human_review, reviewed_at))",
    )
    .order("scheduled_for", { ascending: false });
  if (error) {
    console.error("Unable to load follow-ups", error);
    return [];
  }
  return (data ?? []).map((raw) => {
    const row = raw as unknown as {
      id: string;
      scheduled_for: string;
      status: string;
      attempt_count: number;
      consultation:
        | {
            patient:
              | {
                  id: string;
                  full_name: string;
                  consent_to_automated_calls: boolean;
                }
              | {
                  id: string;
                  full_name: string;
                  consent_to_automated_calls: boolean;
                }[];
            doctor: { full_name: string } | { full_name: string }[];
          }
        | {
            patient: {
              id: string;
              full_name: string;
              consent_to_automated_calls: boolean;
            }[];
            doctor: { full_name: string }[];
          }[];
      calls: {
        status: string;
        created_at: string;
        result:
          | {
              summary: string | null;
              needs_human_review: boolean;
              reviewed_at: string | null;
            }
          | {
              summary: string | null;
              needs_human_review: boolean;
              reviewed_at: string | null;
            }[];
      }[];
    };
    const consultation = Array.isArray(row.consultation)
      ? row.consultation[0]
      : row.consultation;
    const patient = Array.isArray(consultation?.patient)
      ? consultation.patient[0]
      : consultation?.patient;
    const doctor = Array.isArray(consultation?.doctor)
      ? consultation.doctor[0]
      : consultation?.doctor;
    const call = [...(row.calls ?? [])].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    )[0];
    const result = Array.isArray(call?.result) ? call.result[0] : call?.result;
    return {
      id: row.id,
      patientId: patient?.id ?? "",
      patient: patient?.full_name ?? "Unknown patient",
      doctor: doctor?.full_name ?? "Unassigned",
      scheduledFor: row.scheduled_for,
      status: row.status,
      attemptCount: row.attempt_count,
      consent: patient?.consent_to_automated_calls ?? false,
      callStatus: call?.status ?? null,
      summary: result?.summary ?? null,
      needsReview: Boolean(result?.needs_human_review && !result.reviewed_at),
    };
  });
}

export async function getPatientTimeline(patientId: string) {
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("consultations")
    .select(
      "id, occurred_at, reason, followup_notes, doctor:doctors(full_name), recommendations:consultation_recommendations(recommendation, position), followups(id, scheduled_for, calls:followup_calls(id, status, created_at, started_at, completed_at, failure_reason, result:call_results(id, recommendations_followed, outcome, new_symptoms, needs_human_review, reviewed_at, appointment_requested, doctor_rating, summary, transcript, created_at)))",
    )
    .eq("patient_id", patientId)
    .order("occurred_at", { ascending: false });
  if (error) {
    console.error("Unable to load patient timeline", error);
    return {
      events: [] as TimelineEvent[],
      latestResult: null as CallResultItem | null,
    };
  }
  const events: TimelineEvent[] = [];
  for (const raw of data ?? []) {
    const row = raw as unknown as Record<string, unknown>;
    const doctorRaw = Array.isArray(row.doctor) ? row.doctor[0] : row.doctor;
    const doctor =
      (doctorRaw as { full_name?: string } | null)?.full_name ?? "Unassigned";
    const recommendations = (
      (row.recommendations as
        { recommendation: string; position: number }[] | null) ?? []
    )
      .sort((a, b) => a.position - b.position)
      .map((item) => item.recommendation);
    events.push({
      id: String(row.id),
      kind: "consultation",
      date: String(row.occurred_at),
      title: `Consultation with ${doctor}`,
      detail: String(row.reason),
      recommendations,
      result: null,
    });
    const followups =
      (row.followups as
        | {
            id: string;
            scheduled_for: string;
            calls: {
              id: string;
              status: string;
              created_at: string;
              started_at: string | null;
              completed_at: string | null;
              failure_reason: string | null;
              result: Record<string, unknown> | Record<string, unknown>[];
            }[];
          }[]
        | null) ?? [];
    for (const followup of followups) {
      for (const call of followup.calls ?? []) {
        const resultRaw = Array.isArray(call.result)
          ? call.result[0]
          : call.result;
        if (!resultRaw) {
          const failed = call.status === "failed";
          events.push({
            id: call.id,
            kind: "call",
            date:
              call.completed_at ??
              call.started_at ??
              call.created_at ??
              followup.scheduled_for,
            title: failed
              ? "Automated follow-up failed"
              : "Automated follow-up in progress",
            detail: failed
              ? call.failure_reason ?? "CALL-E did not complete this attempt."
              : "CALL-E accepted this attempt. Its current status can be refreshed from Follow-ups.",
            recommendations: [],
            result: null,
          });
          continue;
        }
        const result: CallResultItem = {
          id: String(resultRaw.id),
          outcome: String(resultRaw.outcome),
          recommendationsFollowed:
            typeof resultRaw.recommendations_followed === "boolean"
              ? resultRaw.recommendations_followed
              : null,
          newSymptoms: resultRaw.new_symptoms
            ? String(resultRaw.new_symptoms)
            : null,
          needsReview: Boolean(resultRaw.needs_human_review),
          reviewedAt: resultRaw.reviewed_at
            ? String(resultRaw.reviewed_at)
            : null,
          appointmentRequested: Boolean(resultRaw.appointment_requested),
          doctorRating:
            typeof resultRaw.doctor_rating === "number"
              ? resultRaw.doctor_rating
              : null,
          summary: resultRaw.summary ? String(resultRaw.summary) : null,
          transcript: resultRaw.transcript
            ? String(resultRaw.transcript)
            : null,
        };
        events.push({
          id: call.id,
          kind: "call",
          date: call.completed_at ?? String(resultRaw.created_at),
          title: "Automated follow-up completed",
          detail: result.summary,
          recommendations: [],
          result,
        });
      }
    }
  }
  events.sort((a, b) => b.date.localeCompare(a.date));
  return {
    events,
    latestResult: events.find((event) => event.result)?.result ?? null,
  };
}

export async function getCurrentProfile() {
  await connection();
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return null;
  const { data } = await supabase
    .from("profiles")
    .select("full_name, role, created_at")
    .eq("id", userId)
    .maybeSingle();
  return {
    email:
      typeof claimsData.claims.email === "string"
        ? claimsData.claims.email
        : "",
    name: data?.full_name ?? "Clinic user",
    role: data?.role ?? "coordinator",
    createdAt: data?.created_at ?? "",
  };
}

export function getEnvironmentStatus() {
  return {
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
    provider: process.env.CALL_PROVIDER === "call-e" ? "call-e" : "mock",
    callEKey: Boolean(process.env.CALL_E_API_KEY ?? process.env.CALLE_API_KEY),
    webhookAdmin: Boolean(process.env.SUPABASE_SECRET_KEY),
  } as const;
}

export async function getPatientOptions() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase
    .from("patients")
    .select("id, full_name")
    .order("full_name");
  return (data ?? []).map((item) => ({ id: item.id, name: item.full_name }));
}

export async function getPatientFormRecord(
  id: string,
): Promise<PatientFormRecord | null> {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase
    .from("patients")
    .select(
      "id, full_name, birth_date, phone, primary_doctor_id, consent_to_automated_calls",
    )
    .eq("id", id)
    .maybeSingle();
  return data
    ? {
        id: data.id,
        fullName: data.full_name,
        birthDate: data.birth_date ?? "",
        phone: data.phone,
        doctorId: data.primary_doctor_id ?? "",
        consent: data.consent_to_automated_calls,
      }
    : null;
}
