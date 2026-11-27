export type Axis = "A" | "B"
export type Question = { id: number; axis: Axis; reverse: boolean; text: string }
export type Answer = 1 | 2 | 3 | 4 | 5
export type Quadrant = "mimar" | "dusunur" | "kasif" | "gozlemci"
export type Tier = "uc" | "A" | "B" | "dengeli"

export function scoreAnswers(
  answers: Record<number, Answer>,
  questions: Question[],
  mergeSet: Set<Quadrant>,
) {
  let A = 0
  let B = 0

  for (const question of questions) {
    const answer = answers[question.id]
    if (answer === undefined) continue
    const value = question.reverse ? 6 - answer : answer
    if (question.axis === "A") A += value
    else B += value
  }

  A -= 30
  B -= 30

  const quadrant: Quadrant = B < 0
    ? (A < 0 ? "mimar" : "dusunur")
    : (A < 0 ? "kasif" : "gozlemci")

  const a = Math.abs(A)
  const b = Math.abs(B)
  let tier: Tier = a >= 10 && b >= 10
    ? "uc"
    : a - b >= 5
      ? "A"
      : b - a >= 5
        ? "B"
        : "dengeli"

  if (tier === "B" && mergeSet.has(quadrant)) tier = "dengeli"

  return { A, B, quadrant, tier }
}

export function getTierLabel(tier: Tier, lang: "tr" | "en") {
  const labels = {
    uc: { tr: "Uç", en: "Extreme" },
    A: { tr: "A baskın", en: "Theory-dominant" },
    B: { tr: "B baskın", en: "Usage-dominant" },
    dengeli: { tr: "Dengeli", en: "Balanced" },
  }
  return labels[tier][lang]
}
