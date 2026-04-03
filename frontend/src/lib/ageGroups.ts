export type AgeGroup = "Teen" | "Young Adult" | "Adult" | "Elderly"

export function getAgeGroup(birthday: string | null): AgeGroup | null {
  if (!birthday) return null
  const age = new Date().getFullYear() - new Date(birthday).getFullYear()

  if (age < 18) return "Teen"
  if (age <= 35) return "Young Adult"
  if (age <= 59) return "Adult"
  return "Elderly"
}
