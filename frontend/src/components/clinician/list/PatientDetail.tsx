"use client";

import PrimaryButton from "@/components/ui/PrimaryButton";
import Card from "@/components/ui/Card";
import ZoneMap from "@/components/patient/progress/ZoneMap";
import MuscleSmoothnessCard from "@/components/patient/progress/MuscleSmoothnessCard";
import BenchmarkComparisonCard from "@/components/patient/progress/BenchmarkComparisonCard";
import MetricCard from "@/components/patient/progress/MetricCard";
import Avatar from "@/components/ui/Avatar";
import { FiEdit2, FiActivity } from "react-icons/fi";
import EditProgramModal from "@/components/clinician/modals/EditProgramModal";
import PatientInfoModal from "@/components/clinician/modals/PatientInfoModal";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { patientService, PatientListItem } from "@/services/patientService";
import { sessionService } from "@/services/sessionService";
import { SessionRecord } from "@/hooks/useSessionQueries";
import { getStatusConfig } from "@/lib/patientStatus";
import { useUser } from "@/context/UserContext";
import { getAgeGroup } from "@/lib/ageGroups";
import { KNEE_BENCHMARKS } from "@/lib/benchmarks";
import { libraryService, Template } from "@/services/libraryService";

type Props = {
  patient: PatientListItem;
  onAssigned?: () => void;
};

function calculateAge(birthday: string | null): string {
  if (!birthday) return "—";
  const birth = new Date(birthday);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear() -
    (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
  return `${age} yrs`;
}

export default function PatientDetail({ patient, onAssigned }: Props) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const { userProfile } = useUser();

  const patientId = parseInt(patient.id);
  const practitionerId = userProfile?.profile_id ?? null;

  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["templates", practitionerId],
    queryFn: () => libraryService.getTemplates(practitionerId!),
    enabled: !!practitionerId,
  });

  const { data: sessions } = useQuery<SessionRecord[]>({
    queryKey: ["sessions", patientId],
    queryFn: () => sessionService.getPatientSessions(String(patientId)),
    enabled: !!patientId,
  });

  const latestSession = sessions
    ? [...sessions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ?? null
    : null;

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const videoFilename = latestSession?.video_path?.split(/[\\/]/).pop();
  const videoSrc = videoFilename ? `${apiBase}/data/videos/${videoFilename}` : undefined;

  const dominantZoneLabel = latestSession?.dominant_zone
    ? ({ zone1: "Medial", zone2: "Central", zone3: "Lateral" }[latestSession.dominant_zone] ?? latestSession.dominant_zone)
    : "—";

  const metrics = [
    { type: "metric1", value: latestSession?.avg_angle != null ? `${latestSession.avg_angle.toFixed(2)}°` : "—" },
    { type: "metric2", value: dominantZoneLabel },
    { type: "metric3", value: latestSession?.rom_arc != null ? `${latestSession.rom_arc.toFixed(2)}°` : "—" },
  ];

  const isUnassigned = patient.status === "unassigned";

  const assignedTemplate = patient.template_id
    ? templates.find(t => t.id === patient.template_id) ?? null
    : null;

  const programStartDate = patient.program_start_date ? new Date(patient.program_start_date) : null;
  const programEndDate = programStartDate && patient.program_duration_weeks
    ? new Date(programStartDate.getTime() + patient.program_duration_weeks * 7 * 24 * 60 * 60 * 1000)
    : null;
  const formatProgramDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const s = getStatusConfig(patient.status);

  const ageGroup = getAgeGroup(patient.birthday);
  const bm = ageGroup ? KNEE_BENCHMARKS[ageGroup] : null;
  const benchmarkData = [
    { label: "Knee Angle", you: latestSession?.avg_angle ?? 0, benchmark: bm?.avg_angle ?? 0 },
    { label: "Central",    you: latestSession?.zone2_avg ?? 0, benchmark: bm?.zone2 ?? 0 },
    { label: "Medial",     you: latestSession?.zone1_avg ?? 0, benchmark: bm?.zone1 ?? 0 },
    { label: "Lateral",    you: latestSession?.zone3_avg ?? 0, benchmark: bm?.zone3 ?? 0 },
  ];

  async function handleAddPatient() {
    const practitionerId = userProfile?.profile_id;
    if (!practitionerId) return;
    setIsAssigning(true);
    try {
      await patientService.assignPatient(patient.id, practitionerId);
      onAssigned?.();
    } catch (err) {
      console.error("Failed to assign patient", err);
    } finally {
      setIsAssigning(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Section: Profile, View Button */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={patient.name} size={56} />
              <div className="flex flex-col justify-center">
                <span className="text-sm font-semibold text-gray-900 leading-tight">{patient.name}</span>
                <span className="text-xs text-gray-500 leading-tight">
                  {`${calculateAge(patient.birthday)}${!isUnassigned ? ` • Week ${Math.ceil(patient.daysIn / 7)}` : ""}`}
                </span>
              </div>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: s.text, background: s.bg, borderRadius: "999px", padding: "4px 12px", whiteSpace: "nowrap", flexShrink: 0 }}>
              {s.icon} {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {isUnassigned ? (
            <>
              <PrimaryButton onClick={() => setIsInfoModalOpen(true)}>
                View Patient Details
              </PrimaryButton>
              <PrimaryButton onClick={handleAddPatient} disabled={isAssigning}>
                {isAssigning ? "Adding..." : "Add Patient"}
              </PrimaryButton>
            </>
          ) : (
            <PrimaryButton onClick={() => setIsInfoModalOpen(true)}>
              View Patient Details
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        
        {/* Left Column: Top Metrics, Benchmark, Muscle Smoothness */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <MetricCard
                key={metric.type}
                type={metric.type as any}
                value={metric.value}
              />
            ))}
          </div>

          <BenchmarkComparisonCard
            data={benchmarkData}
            userName={patient.name}
            ageGroup={`${ageGroup ?? "General"} Benchmark`}
          />

          <MuscleSmoothnessCard
            data={[]}
            benchmark={0.6}
          />
        </div>

        {/* Right Column: Program, Metrics, Video */}
        <div className="flex flex-col gap-4 w-full lg:w-96 shrink-0">
          
          {/* Current Program Card */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md" style={{ backgroundColor: '#EFF1FE' }}>
                  <FiActivity size={16} color="#12606A" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Current Program</h3>
              </div>
              {!isUnassigned && (
                <button
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => setIsEditModalOpen(true)}
                  title={assignedTemplate ? "Edit Program" : "Add Program"}
                >
                  <FiEdit2 size={16} color="#12606A" />
                </button>
              )}
            </div>
            {isUnassigned || !assignedTemplate ? (
              <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">No active program.</p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{assignedTemplate.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {programStartDate && programEndDate
                      ? `${formatProgramDate(programStartDate)} – ${formatProgramDate(programEndDate)}`
                      : programStartDate
                      ? `From ${formatProgramDate(programStartDate)}`
                      : "—"}
                    {patient.program_frequency ? ` • ${patient.program_frequency}x per week` : ""}
                  </p>
                </div>
                <div className="mt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1.5" style={{ color: '#12606A' }}>
                    <span>0</span>
                    <span>50%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#12606A] h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Metrics Card */}
          <Card className="flex flex-col gap-6 justify-center">
            {/* Knee Angle Stat */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-gray-500 uppercase">Max Angle</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{latestSession?.max_angle != null ? `${latestSession.max_angle.toFixed(1)}°` : '—'}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(((latestSession?.max_angle ?? 0) / 180) * 100, 100)}%` }}></div>
              </div>
            </div>

            {/* Min Angle */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-gray-500 uppercase">Min Angle</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{latestSession?.min_angle != null ? `${latestSession.min_angle.toFixed(1)}°` : '—'}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.min(((latestSession?.min_angle ?? 0) / 180) * 100, 100)}%` }}></div>
              </div>
            </div>
          </Card>

          {/* The 3 Zones Map */}
          <div className="w-full shrink-0">
            <ZoneMap
              videoSrc={videoSrc}
              avgAngle={latestSession?.avg_angle != null ? `${Math.round(latestSession.avg_angle)}°` : "—"}
              medialPct={latestSession?.zone1_avg != null ? `${latestSession.zone1_avg.toFixed(2)}%` : "0"}
              centralPct={latestSession?.zone2_avg != null ? `${latestSession.zone2_avg.toFixed(2)}%` : "0"}
              lateralPct={latestSession?.zone3_avg != null ? `${latestSession.zone3_avg.toFixed(2)}%` : "0"}
            />
          </div>

        </div>

      </div>

      <EditProgramModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        patientId={patient.id}
        practitionerId={userProfile?.profile_id ?? null}
        existingTemplateId={patient.template_id}
      />
      <PatientInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        patientId={patient.id}
      />
    </div>
  );
}
