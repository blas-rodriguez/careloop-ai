import { notFound } from "next/navigation";
import { FormLayout } from "@/components/form-layout";
import { PatientForm } from "@/components/patient-form";
import { updatePatient } from "@/lib/actions/workspace";
import { getDoctors, getPatientFormRecord } from "@/lib/data/workspace";

export default async function EditPatientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [doctors, patient] = await Promise.all([
    getDoctors(),
    getPatientFormRecord(id),
  ]);
  if (!patient) notFound();
  const action = updatePatient.bind(null, id);
  return (
    <FormLayout
      active="Patients"
      backHref={`/patients/${id}`}
      eyebrow="Patient record"
      title="Edit patient"
      description="Update contact, care assignment, and call consent."
      error={query.error}
    >
      <PatientForm
        action={action}
        doctors={doctors}
        patient={patient}
        cancelHref={`/patients/${id}`}
      />
    </FormLayout>
  );
}
