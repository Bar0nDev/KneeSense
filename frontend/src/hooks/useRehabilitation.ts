// hooks/useRehabilitation.ts
import { useState, useMemo } from "react";
import { useStreak } from "./useStreak";

export function useRehabilitation() {
  // 1. Exercise State
  const [exercises, setExercises] = useState([
    { id: 1, name: "Plantar Flexion", reps: 10, sets: 2, hold: 3, image: "/assets/exercises/plantar_flexion.png", done: true },
    { id: 2, name: "Dorsiflexion", reps: 10, sets: 2, hold: 3, image: "/assets/exercises/dorsi_flexion.png", done: false },
    { id: 3, name: "Seated Knee F/E", reps: 10, sets: 2, hold: 3, image: "/assets/exercises/seatedknee_flexion_and_extension.png", done: false },
    { id: 4, name: "Squat", reps: 8, sets: 2, hold: 3, image: "/assets/exercises/squat.png", done: false },
  ]);

  // 2. Derived Stats & Metadata
  const stats = useMemo(() => {
    const completedToday = exercises.filter(ex => ex.done).length;
    const total = exercises.length;
    
    return {
      completedToday,
      total,
      progressPct: (completedToday / total) * 100,
      // Metadata for the PageHeader
      programName: "4-Step Anti-Frailty Program",
      lastLog: "Yesterday, 4:30 PM",
    };
  }, [exercises]);

  // 3. Streak Data (via your custom hook)
  const streakInfo = useStreak(
    7, 
    14, 
    [true, true, true, true, true, false, false]
  );

  // 4. Monthly Progress Mock Data
  const monthlyStats = useMemo(() => [
    { name: "Plantar Flexion", count: 18, max: 20 },
    { name: "Dorsiflexion", count: 15, max: 20 },
    { name: "Seated Knee F/E", count: 20, max: 20 },
    { name: "Squat", count: 12, max: 20 },
  ], []);

  // 5. Actions
  const completeExercise = (id: number) => {
    setExercises(prev => 
      prev.map(ex => ex.id === id ? { ...ex, done: true } : ex)
    );
  };

  return {
    exercises,
    ...stats,       // Spreads: completedToday, total, progressPct, programName, lastLog
    ...streakInfo,  // Spreads: currentStreak, bestStreak, weekData
    monthlyStats,
    completeExercise,
  };
}