"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { PractitionerStatusBadge } from "@/components/admin/AdminBadge";
import PractitionerDetailPanel from "@/components/admin/PractitionerDetailPanel";
import { useAdminPractitioners } from "@/hooks/useAdminPractitioners";
import { formatDate } from "@/lib/adminFormat";

export default function AdminPractitionersPage() {
  const { practitioners, isLoading } = useAdminPractitioners();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectId = searchParams.get("select");

  function select(id: string) {
    router.push(`/admin/practitioners?select=${id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1C2121]">Practitioners</h1>
        <p className="text-sm text-[#455858]">Manage practitioner accounts and approvals</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 w-full">
          <Card padding="none" className="overflow-hidden">
            {isLoading ? (
              <div className="p-10">
                <LoadingSpinner />
              </div>
            ) : practitioners.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-400">No practitioners found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-semibold uppercase tracking-wider text-[#455858]">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Clinic</th>
                      <th className="px-4 py-3">Specialization</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-center">Patients</th>
                      <th className="px-4 py-3">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {practitioners.map((p) => (
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
                        <td className="px-4 py-3 text-[#455858]">{p.clinic_name ?? "—"}</td>
                        <td className="px-4 py-3 text-[#455858]">{p.specialization ?? "—"}</td>
                        <td className="px-4 py-3">
                          <PractitionerStatusBadge status={p.status} />
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-[#1C2121]">
                          {p.patient_count}
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
            <PractitionerDetailPanel practitionerId={selectId} />
          ) : (
            <Card className="flex h-40 items-center justify-center">
              <p className="text-sm text-gray-400">Select a practitioner to view details</p>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
