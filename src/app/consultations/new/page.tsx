import Link from "next/link";
import { FormLayout, FieldLabel, fieldClass } from "@/components/form-layout";
import { SubmitButton } from "@/components/submit-button";
import { createConsultation } from "@/lib/actions/workspace";
import { getDoctors, getPatientOptions } from "@/lib/data/workspace";

export default async function NewConsultationPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string; error?: string }>;
}) {
  const [patients, doctors, query] = await Promise.all([
    getPatientOptions(),
    getDoctors(),
    searchParams,
  ]);
  return (
    <FormLayout
      active="Patients"
      backHref={query.patient ? `/patients/${query.patient}` : "/patients"}
      eyebrow="Clinical record"
      title="New consultation"
      description="Record the visit and the recommendations that a follow-up will check."
      error={query.error}
    >
      <form action={createConsultation} className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label>
            <FieldLabel>Patient *</FieldLabel>
            <select name="patient_id" required defaultValue={query.patient ?? ""} className={fieldClass}>
              <option value="">Select patient</option>
              {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}
            </select>
          </label>
          <label>
            <FieldLabel>Doctor *</FieldLabel>
            <select name="doctor_id" required className={fieldClass}>
              <option value="">Select doctor</option>
              {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name} · {doctor.specialty}</option>)}
            </select>
          </label>
          <label>
            <FieldLabel>Date and time *</FieldLabel>
            <input name="occurred_at" type="datetime-local" required className={fieldClass} />
          </label>
          <label>
            <FieldLabel>Reason *</FieldLabel>
            <input name="reason" required minLength={3} maxLength={240} placeholder="e.g. Post-viral fatigue" className={fieldClass} />
          </label>
        </div>
        <label className="block">
          <FieldLabel>Follow-up notes</FieldLabel>
          <textarea name="followup_notes" rows={3} maxLength={2000} placeholder="Context for the care team" className={fieldClass} />
        </label>
        <label className="block">
          <FieldLabel>Recommendations (one per line)</FieldLabel>
          <textarea name="recommendations" rows={5} maxLength={3000} placeholder={"Rest and hydrate\nResume activity gradually\nCall the clinic if symptoms worsen"} className={fieldClass} />
        </label>
        <p className="text-xs text-[#7a8984]">This records clinician-authored guidance. CareLoop only asks whether it was followed; it does not create medical advice.</p>
        <div className="flex justify-end gap-3 border-t border-[#e5ece9] pt-5">
          <Link href={query.patient ? `/patients/${query.patient}` : "/patients"} className="rounded-xl border border-[#dce6e2] px-5 py-2.5 text-sm font-semibold text-[#60736b]">Cancel</Link>
          <SubmitButton>Save consultation</SubmitButton>
        </div>
      </form>
    </FormLayout>
  );
}
