import { compile, evaluate } from 'mathjs'

export type FormulaFn = (x: number, y: number) => number

export function parseFormula(formulaText: string): FormulaFn {
  const lines = formulaText
    .trim()
    .split('\n')
    .filter((l) => l.trim())

  if (lines.length === 0) return () => 0

  const defLines = lines.slice(0, -1)
  const exprLine = lines[lines.length - 1]

  const baseScope: Record<string, unknown> = {}
  for (const line of defLines) {
    evaluate(line, baseScope)
  }

  const compiled = compile(exprLine)

  return (x: number, y: number) => {
    try {
      const result = compiled.evaluate({ ...baseScope, x, y }) as unknown
      if (typeof result !== 'number' || !isFinite(result)) return 0
      return result
    } catch {
      return 0
    }
  }
}

export function validateFormula(formulaText: string): string | null {
  try {
    parseFormula(formulaText)
    return null
  } catch (e) {
    return e instanceof Error ? e.message : 'Parse error'
  }
}
