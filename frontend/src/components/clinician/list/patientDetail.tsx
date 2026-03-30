"use client";

import PrimaryButton from "@/components/ui/PrimaryButton";
import Card from "@/components/ui/Card";
import ZoneMap from "@/components/patient/progress/ZoneMap";
import MuscleSmoothnessCard from "@/components/patient/progress/MuscleSmoothnessCard";
import BenchmarkComparisonCard from "@/components/patient/progress/BenchmarkComparisonCard";
import MetricCard from "@/components/patient/progress/MetricCard";
import Avatar from "@/components/ui/Avatar";
import { useProgress } from "@/hooks/useProgress";
import { FiEdit2, FiActivity } from "react-icons/fi";
import EditProgramModal from "@/components/clinician/modals/EditProgramModal";
import { useState } from "react";

// Type extracted from patientList.tsx
export type Patient = {
  id: string;
  name: string;
  daysIn: number;
  status: string;
  compliance: number;
  forceAvg: number;
  nextSession: string;
};

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  improving:  { bg: "#E6FAF5", text: "#00AC8F", icon: "↑" },
  stable:     { bg: "#FFF7E6", text: "#FF8C00", icon: "→" },
  declining:  { bg: "#FFF0F3", text: "#FF2D55", icon: "↓" },
};

// Default static fallback values if full session details omit props
type Props = {
  patient: Patient;
};

export default function PatientDetail({ patient }: Props) {
  const { sessionData, metrics: hookMetrics } = useProgress();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const isUnassigned = patient.status === "unassigned";
  const s = isUnassigned ? { bg: "#FFFBF2", text: "#FF8C00", icon: "?" } : (STATUS_COLORS[patient.status] || STATUS_COLORS.stable);

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
                  {`65 yrs${!isUnassigned ? ` • Week ${Math.ceil(patient.daysIn / 7)}` : ""}`}
                </span>
              </div>
            </div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: s.text, background: s.bg, borderRadius: "999px", padding: "4px 12px", whiteSpace: "nowrap", flexShrink: 0 }}>
              {s.icon} {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <PrimaryButton
            onClick={() => console.log(isUnassigned ? "Add Patient" : "View Patient Details")}
          >
            {isUnassigned ? "Add Patient" : "View Patient Details"}
          </PrimaryButton>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        
        {/* Left Column: Top Metrics, Benchmark, Muscle Smoothness */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard 
              type="rehabConsistency" 
              value={isUnassigned ? "—" : `${patient.compliance}%`} 
            />
            <MetricCard 
              type="angleBenchmarkGap" 
              value={isUnassigned ? "—" : (hookMetrics.find(m => m.type === 'angleBenchmarkGap')?.value || '-15°')} 
            />
            <MetricCard 
              type="zoneBalanceScore" 
              value={isUnassigned ? "—" : (hookMetrics.find(m => m.type === 'zoneBalanceScore')?.value || 'Stable')} 
            />
          </div>

          <BenchmarkComparisonCard 
            data={isUnassigned ? [] : sessionData.benchmarkData} 
            userName={patient.name}
            ageGroup="Elderly Benchmark"
          />

          <MuscleSmoothnessCard 
            data={isUnassigned ? [] : sessionData.smoothnessData} 
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
                >
                  <FiEdit2 size={16} color="#12606A" />
                </button>
              )}
            </div>
            {isUnassigned ? (
              <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-500">No active program.</p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Post-Op Knee Replacement</p>
                  <p className="text-xs text-gray-500 mt-1">Week 3 of 6 • 5x per week</p>
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
                  <span className="text-2xl font-bold text-gray-900">{sessionData.stats[0]?.value || '67°'}</span>
                  {!isUnassigned && <p className="text-xs text-green-600 font-medium">{sessionData.stats[0]?.benchmark || '+12% above elderly avg'}</p>}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(parseInt(sessionData.stats[0]?.value) || 67) / 120 * 100}%` }}></div>
              </div>
            </div>

            {/* Force Estimate Stat from Patient Object */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-gray-500 uppercase">Min Angle</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{sessionData.stats[1]?.value || '—'}</span>
                  {!isUnassigned && <p className="text-xs text-green-600 font-medium">{sessionData.stats[1]?.benchmark || '+5% above average'}</p>}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${(patient.forceAvg / 100) * 100}%` }}></div>
              </div>
            </div>
          </Card>

          {/* The 3 Zones Map */}
          <div className="w-full shrink-0">
            <ZoneMap
              videoSrc={sessionData.video.videoSrc}
              avgAngle={isUnassigned ? undefined : sessionData.video.avgAngle}
              medialPct={isUnassigned ? "0" : String(sessionData.video.medialPct)}
              centralPct={isUnassigned ? "0" : String(sessionData.video.centralPct)}
              lateralPct={isUnassigned ? "0" : String(sessionData.video.lateralPct)}
            />
          </div>

        </div>

      </div>

      <EditProgramModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </div>
  );
}
