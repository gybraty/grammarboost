export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]

export const LEVEL_LABELS = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
  C1: "Advanced",
  C2: "Proficiency",
}

/**
 * Returns a Tailwind color class name for the level badge bg/text.
 * Uses the design system level-* tokens.
 */
export const getLevelColor = (level) => {
  if (["A1", "A2"].includes(level)) return { bg: "bg-level-beginner/10", text: "text-level-beginner", border: "border-level-beginner/30" }
  if (["B1", "B2"].includes(level)) return { bg: "bg-level-intermediate/10", text: "text-level-intermediate", border: "border-level-intermediate/30" }
  return { bg: "bg-level-advanced/10", text: "text-level-advanced", border: "border-level-advanced/30" }
}

/**
 * Returns a shadcn Badge variant string for the level.
 */
export const getLevelVariant = (level) => {
  if (["A1", "A2"].includes(level)) return "default"
  if (["B1", "B2"].includes(level)) return "secondary"
  return "outline"
}
