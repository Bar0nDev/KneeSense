"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ActiveBadge } from "@/components/admin/AdminBadge";
import PatientDetailPanel from "@/components/admin/PatientDetailPanel";
import { useAdminPatients } from "@/hooks/useAdminPatients";
import { formatDate } from "@/lib/adminFormat";

export default function AdminPatientsPage() {
  const { patients, isLoading } = useAdminPatients();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectId = searchParams.get("select");

  function select(id: string) {
    router.push(`/admin/patients?select=${id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1C2121]">Patients</h1>
        <p className="text-sm text-[#455858]">All registered patients across the platform</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 w-full">
          <Card padding="none" className="overflow-hidden">
            {isLoading ? (
              <div className="p-10">
                <LoadingSpinner />
              </div>
            ) : patients.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-400">No patients found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wider text-[#455858]">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Assigned Practitioner</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => select(p.id)}
                        className={`cursor-pointer border-b border-gray-50 transition-colors hover:bg-[#12606A]/5 ${
                          selectId === p.id ? "bg-[#12606A]/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-semibold text-[#1C2121]">
                          {p.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-[#455858]">{p.email ?? "—"}</td>
                        <td className="px-4 py-3 text-[#455858]">
                          {p.practitioner_name ?? (
                            <span className="text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <ActiveBadge active={p.is_active} />
                        </td>
                        <td className="px-4 py-3 text-[#455858] whitespace-nowrap">
                          {formatDate(p.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <aside className="w-full xl:w-96 shrink-0">
          {selectId ? (
            <PatientDetailPanel patientId={selectId} />
          ) : (
            <Card className="flex h-40 items-center justify-center">
              <p className="text-sm text-gray-400">Select a patient to view details</p>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
