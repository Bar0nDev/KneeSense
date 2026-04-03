import { AgeGroup } from "./ageGroups";

export const KNEE_BENCHMARKS: Record<AgeGroup, { avg_angle: number; zone1: number; zone2: number; zone3: number }> = {
  "Teen":        { avg_angle: 132, zone1: 35, zone2: 28, zone3: 37 },
  "Young Adult": { avg_angle: 135, zone1: 38, zone2: 27, zone3: 35 },
  "Adult":       { avg_angle: 125, zone1: 34, zone2: 27, zone3: 39 },
  "Elderly":     { avg_angle: 117, zone1: 30, zone2: 25, zone3: 45 },
}
