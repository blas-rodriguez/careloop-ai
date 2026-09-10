import Link from "next/link";
import { ArrowUpRight, Filter, Plus, Search, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { getPatients } from "@/lib/data/patients";
import { maskPhoneNumber } from "@/lib/validation";

export default async function PatientsPage() {
  const patients = await getPatients();
  return (
    <AppShell active="Patients">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-sm font-medium text-[#167d63]">
              Care coordination
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#17362d] md:text-[30px]">
              Patients
            </h1>
            <p className="mt-1 text-sm text-[#70817b]">
              Monitor post-care progress and upcoming follow-ups.
            </p>
          </div>
          <Link
            href="/patients/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#167d63] px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus size={17} />
            Add patient
          </Link>
        </div>
        <section className="overflow-hidden rounded-2xl border border-[#dfe8e4] bg-white shadow-[0_2px_10px_rgba(23,54,45,.035)]">
          <div className="flex flex-col gap-3 border-b border-[#e5ece9] p-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div className="relative w-full max-w-sm">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#81918b]"
                size={16}
              />
              <input
                placeholder="Search by patient or doctor"
                className="w-full rounded-xl border border-[#dfe8e4] bg-[#f8faf9] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#67aa96]"
              />
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe8e4] px-3.5 py-2.5 text-sm font-medium text-[#52645e]">
              <Filter size={16} />
              Filter
            </button>
          </div>
          {patients.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left">
                <thead className="bg-[#f8faf9] text-[11px] font-bold uppercase tracking-wider text-[#7c8c86]">
                  <tr>
                    <th className="px-6 py-3">Patient</th>
                    <th className="px-5 py-3">Care team</th>
                    <th className="px-5 py-3">Last consultation</th>
                    <th className="px-5 py-3">Next follow-up</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf1ef]">
                  {patients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="transition hover:bg-[#f9fbfa]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e4f2ed] text-xs font-bold text-[#176b55]">
                            {patient.initials}
                          </span>
                          <span>
                            <Link
                              href={`/patients/${patient.id}`}
                              className="block text-sm font-semibold text-[#24433a] hover:text-[#167d63]"
                            >
                              {patient.name}
                            </Link>
                            <small className="text-[#84928d]">
                              {patient.age === null
                                ? "Age unavailable"
                                : `${patient.age} years`} {" "}
                              · {maskPhoneNumber(patient.phone)}
                            </small>
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#40564f]">
                          {patient.doctor}
                        </p>
                        <small className="text-[#84928d]">
                          {patient.specialty}
                        </small>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#64766f]">
                        {patient.lastConsultation}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-[#40564f]">
                        {patient.nextFollowup}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={patient.status} />
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          aria-label={`Open ${patient.name}`}
                          href={`/patients/${patient.id}`}
                          className="grid h-8 w-8 place-items-center rounded-lg border border-[#dfe8e4] text-[#63756e] hover:border-[#90bcae] hover:text-[#167d63]"
                        >
                          <ArrowUpRight size={15} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No patients in this workspace"
              description="Create a patient manually or restore the fictional presentation scenario from Settings."
              actionHref="/patients/new"
              actionLabel="Add first patient"
            />
          )}
          <div className="flex items-center justify-between border-t border-[#e5ece9] px-6 py-4 text-xs text-[#7b8b85]">
            <span>Showing {patients.length} patients</span>
            <span>Connected workspace</span>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
