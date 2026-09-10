import Link from "next/link";
import { FormLayout, FieldLabel, fieldClass } from "@/components/form-layout";
import { SubmitButton } from "@/components/submit-button";
import { scheduleFollowup } from "@/lib/actions/workspace";
import { getPatientOptions } from "@/lib/data/workspace";

export default async function NewFollowupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; patient?: string }>;
}) {
  const [patients, query] = await Promise.all([
    getPatientOptions(),
    searchParams,
  ]);
  return (
    <FormLayout
      active="Follow-ups"
      backHref="/followups"
      eyebrow="Automated outreach"
      title="Schedule follow-up"
      description="Plan a consented post-care call for a patient with an existing consultation."
      error={query.error}
    >
      <form action={scheduleFollowup} className="space-y-6">
        <label>
          <FieldLabel>Patient *</FieldLabel>
          <select name="patient_id" required className={fieldClass} defaultValue={query.patient ?? ""}>
            <option value="">Select patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <FieldLabel>Call date and time *</FieldLabel>
          <input
            name="scheduled_for"
            type="datetime-local"
            required
            className={fieldClass}
          />
          <small className="mt-2 block text-[#7a8984]">
            Times are interpreted in Argentina time (UTC−3).
          </small>
        </label>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900/75">
          Only schedule a real call after confirming consent and the destination
          number. CALL-E remains in mock mode, so this action creates the queue
          record without placing a phone call.
        </div>
        <div className="flex justify-end gap-3 border-t border-[#e5ece9] pt-5">
          <Link
            href="/followups"
            className="rounded-xl border border-[#dce6e2] px-5 py-2.5 text-sm font-semibold text-[#60736b]"
          >
            Cancel
          </Link>
          <SubmitButton>Schedule follow-up</SubmitButton>
        </div>
      </form>
    </FormLayout>
  );
}
