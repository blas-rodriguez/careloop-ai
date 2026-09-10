import Link from "next/link";
import { FieldLabel, fieldClass } from "@/components/form-layout";
import { SubmitButton } from "@/components/submit-button";
import type { DoctorItem, PatientFormRecord } from "@/lib/data/workspace";

export function PatientForm({
  action,
  doctors,
  patient,
  cancelHref,
}: {
  action: (formData: FormData) => void | Promise<void>;
  doctors: DoctorItem[];
  patient?: PatientFormRecord;
  cancelHref: string;
}) {
  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <FieldLabel>Full name *</FieldLabel>
          <input
            className={fieldClass}
            name="full_name"
            defaultValue={patient?.fullName}
            required
            minLength={3}
            maxLength={120}
            placeholder="Patient full name"
          />
        </label>
        <label>
          <FieldLabel>Birth date *</FieldLabel>
          <input
            className={fieldClass}
            name="birth_date"
            type="date"
            defaultValue={patient?.birthDate}
            min="1900-01-01"
            max={new Date().toISOString().slice(0, 10)}
            required
          />
        </label>
        <label>
          <FieldLabel>Phone number *</FieldLabel>
          <input
            className={fieldClass}
            name="phone"
            type="tel"
            defaultValue={patient?.phone}
            required
            pattern="\+[1-9][0-9]{7,14}"
            maxLength={16}
            placeholder="+12025550100"
          />
          <small className="mt-2 block text-[#7a8984]">
            International E.164 format, without spaces or punctuation.
          </small>
        </label>
        <label className="sm:col-span-2">
          <FieldLabel>Primary doctor</FieldLabel>
          <select
            className={fieldClass}
            name="doctor_id"
            defaultValue={patient?.doctorId}
          >
            <option value="">Unassigned</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} · {doctor.specialty}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex items-start gap-3 rounded-xl border border-[#dce6e2] bg-[#f7faf9] p-4">
        <input
          name="consent"
          type="checkbox"
          defaultChecked={patient?.consent}
          className="mt-0.5 h-4 w-4 accent-[#167d63]"
        />
        <span>
          <strong className="block text-sm text-[#3e554d]">
            Consent to automated follow-up calls
          </strong>
          <small className="mt-1 block leading-5 text-[#7a8984]">
            Confirm that the patient explicitly authorized automated calls.
            Consent can be withdrawn at any time.
          </small>
        </span>
      </label>
      <div className="flex justify-end gap-3 border-t border-[#e5ece9] pt-5">
        <Link
          href={cancelHref}
          className="rounded-xl border border-[#dce6e2] px-5 py-2.5 text-sm font-semibold text-[#60736b]"
        >
          Cancel
        </Link>
        <SubmitButton>
          {patient ? "Save patient" : "Create patient"}
        </SubmitButton>
      </div>
    </form>
  );
}
