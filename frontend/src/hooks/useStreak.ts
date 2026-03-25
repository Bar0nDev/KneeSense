// hooks/use-streak.ts
export function useStreak(streak: number, bestStreak: number, weekProgress: boolean[]) {
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Create the array for the UI
  const weekData = DAYS.map((day, i) => ({
    label: day,
    // Ensure we handle cases where weekProgress might be shorter than 7 days
    isCompleted: !!weekProgress[i], 
  }));

  return {
    currentStreak: streak,
    bestStreak,
    weekData, // This is the key the component needs
  };
}