import test from "node:test"
import assert from "node:assert/strict"
import questionsTr from "./questions-tr.json"
import { scoreAnswers, type Answer, type Quadrant } from "./score.ts"

const mainMerge = new Set<Quadrant>(["kasif", "gozlemci"])
const turkishMerge = new Set<Quadrant>(["dusunur", "gozlemci"])

function constantAnswer(answer: Answer) {
  return Object.fromEntries(questionsTr.map((question) => [question.id, answer])) as Record<number, Answer>
}

test("all 1, 3 and 5 answers center both axes", () => {
  for (const answer of [1, 3, 5] as Answer[]) {
    const result = scoreAnswers(constantAnswer(answer), questionsTr, mainMerge)
    assert.equal(result.A, 0)
    assert.equal(result.B, 0)
  }
})

test("reverse questions produce 6 minus answer", () => {
  const result = scoreAnswers(constantAnswer(1), questionsTr, mainMerge)
  assert.deepEqual({ A: result.A, B: result.B }, { A: 0, B: 0 })
})

test("main merge changes B-dominant kasif and gozlemci to balanced", () => {
  const answers = Object.fromEntries(questionsTr.map((question) => {
    if (question.axis === "A") return [question.id, 1]
    return [question.id, 5]
  })) as Record<number, Answer>
  const result = scoreAnswers(answers, questionsTr, mainMerge)
  assert.equal(result.tier, "dengeli")
})

test("turkish merge is applied to dusunur and gozlemci", () => {
  const answers = Object.fromEntries(questionsTr.map((question) => {
    if (question.axis === "A") return [question.id, 1]
    return [question.id, 5]
  })) as Record<number, Answer>
  const result = scoreAnswers(answers, questionsTr, turkishMerge)
  assert.equal(result.quadrant, "dusunur")
  assert.equal(result.tier, "dengeli")
})
