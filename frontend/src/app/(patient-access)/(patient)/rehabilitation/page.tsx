"use client";

import PageHeader from "@/components/ui/PageHeader";
import { ProgressHero } from "@/components/patient/rehabilitation/ProgressHero";
import { ExerciseCard } from "@/components/patient/rehabilitation/ExerciseCard";
import StreakTracker from "@/components/patient/rehabilitation/StreakTracker"; // Default import
import { MonthlyStats } from "@/components/patient/rehabilitation/MonthlyStats";
import { useRehabilitation } from "@/hooks/useRehabilitation";

export default function RehabilitationPage() {
  const { 
    exercises, 
    progressPct, 
    completedToday, 
    total, 
    completeExercise, 
    currentStreak, 
    bestStreak, 
    weekData,
    monthlyStats,
    programName, // Now being pulled from the hook
    lastLog      // Now being pulled from the hook
  } = useRehabilitation();

  return (
    <div className="space-y-6">
      {/* 1. Header with dynamic program info */}
      <PageHeader
        title={programName || "Rehabilitation Program"}
        subtitle={`Last session logged: ${lastLog || "No sessions yet"}`}
      />

      {/* 2. Main Progress Overview */}
      <ProgressHero 
        current={completedToday} 
        total={total} 
        percentage={progressPct} 
      />

      {/* 3. Exercise Grid */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest px-1">
          Today's Exercises
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {exercises.map(ex => (
            <ExerciseCard 
              key={ex.id} 
              exercise={ex} 
              onStart={() => completeExercise(ex.id)} 
            />
          ))}
        </div>
      </div>

      {/* 4. Analytics & Consistency */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="flex-1">
          <StreakTracker 
            currentStreak={currentStreak}
            bestStreak={bestStreak}
            weekData={weekData}
          />
        </div>
        <div className="flex-1">
          <MonthlyStats stats={monthlyStats} />
        </div>
      </div>
    </div>
  );
}