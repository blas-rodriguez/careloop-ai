import { FormLayout } from "@/components/form-layout";
import { PatientForm } from "@/components/patient-form";
import { createPatient } from "@/lib/actions/workspace";
import { getDoctors } from "@/lib/data/workspace";

export default async function NewPatientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [doctors, query] = await Promise.all([getDoctors(), searchParams]);
  return (
    <FormLayout
      active="Patients"
      backHref="/patients"
      eyebrow="Care coordination"
      title="Add patient"
      description="Create a fictional or consented patient record for follow-up."
      error={query.error}
    >
      <PatientForm
        action={createPatient}
        doctors={doctors}
        cancelHref="/patients"
      />
    </FormLayout>
  );
}
