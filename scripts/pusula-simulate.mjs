import { readFileSync } from 'node:fs'

const questions = JSON.parse(readFileSync(new URL('../lib/pusula/questions-tr.json', import.meta.url), 'utf8'))

function scorePattern(answerFor) {
  let a = 0
  let b = 0
  for (const question of questions) {
    const answer = answerFor(question)
    const value = question.reverse ? 6 - answer : answer
    if (question.axis === 'A') a += value
    else b += value
  }
  a -= 30
  b -= 30
  const quadrant = a < 0 ? (b < 0 ? 'mimar' : 'dusunur') : (b < 0 ? 'kasif' : 'gozlemci')
  const absA = Math.abs(a)
  const absB = Math.abs(b)
  let tier = absA >= 10 && absB >= 10 ? 'uc' : absA - absB >= 5 ? 'A' : absB - absA >= 5 ? 'B' : 'dengeli'
  if (tier === 'B' && new Set(['kasif', 'gozlemci']).has(quadrant)) tier = 'dengeli'
  return { a, b, quadrant, tier }
}

const patterns = [
  ['hep 1', () => 1],
  ['hep 3', () => 3],
  ['hep 5', () => 5],
]

const quadrants = { mimar: 0, dusunur: 0, kasif: 0, gozlemci: 0 }
const tiers = { uc: 0, A: 0, B: 0, dengeli: 0 }

for (const pattern of patterns) {
  const result = scorePattern(pattern[1])
  console.log(`${pattern[0]}: A=${result.a}, B=${result.b}, ${result.quadrant}, ${result.tier}`)
}

for (let run = 0; run < 10000; run += 1) {
  const result = scorePattern(() => Math.floor(Math.random() * 5) + 1)
  quadrants[result.quadrant] += 1
  tiers[result.tier] += 1
}

console.log('quadrants', Object.fromEntries(Object.entries(quadrants).map(([key, value]) => [key, `${(value / 100).toFixed(2)}%`])))
console.log('tiers', Object.fromEntries(Object.entries(tiers).map(([key, value]) => [key, `${(value / 100).toFixed(2)}%`])))
