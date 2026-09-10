import Link from "next/link";
import { FormLayout, FieldLabel, fieldClass } from "@/components/form-layout";
import { SubmitButton } from "@/components/submit-button";
import { createAppointment } from "@/lib/actions/workspace";
import { getDoctors, getPatientOptions } from "@/lib/data/workspace";

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [patients, doctors, query] = await Promise.all([
    getPatientOptions(),
    getDoctors(),
    searchParams,
  ]);
  return (
    <FormLayout
      active="Appointments"
      backHref="/appointments"
      eyebrow="Care coordination"
      title="New appointment"
      description="Create or confirm a visit for a patient."
      error={query.error}
    >
      <form action={createAppointment} className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label>
            <FieldLabel>Patient *</FieldLabel>
            <select name="patient_id" required className={fieldClass}>
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <FieldLabel>Doctor *</FieldLabel>
            <select name="doctor_id" required className={fieldClass}>
              <option value="">Select doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} · {doctor.specialty}
                </option>
              ))}
            </select>
          </label>
          <label>
            <FieldLabel>Date and time *</FieldLabel>
            <input
              name="starts_at"
              type="datetime-local"
              required
              className={fieldClass}
            />
          </label>
          <label>
            <FieldLabel>Status *</FieldLabel>
            <select
              name="status"
              defaultValue="scheduled"
              className={fieldClass}
            >
              <option value="scheduled">Scheduled</option>
              <option value="requested">Requested</option>
            </select>
          </label>
        </div>
        <p className="text-xs text-[#7a8984]">
          Times are interpreted in Argentina time (UTC−3).
        </p>
        <div className="flex justify-end gap-3 border-t border-[#e5ece9] pt-5">
          <Link
            href="/appointments"
            className="rounded-xl border border-[#dce6e2] px-5 py-2.5 text-sm font-semibold text-[#60736b]"
          >
            Cancel
          </Link>
          <SubmitButton>Create appointment</SubmitButton>
        </div>
      </form>
    </FormLayout>
  );
}
