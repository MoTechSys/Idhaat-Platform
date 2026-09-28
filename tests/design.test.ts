import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'

// نظام «دافئ تحريري»: أسطح مسطحة بلا تدرجات في واجهة اللوحات، والتوكنز الأساسية موجودة
const css = readFileSync(new URL('../public/static/app.css', import.meta.url), 'utf8')

describe('نظام التصميم', () => {
  test('لا تدرجات لونية في واجهة اللوحات', () => {
    expect(css).not.toMatch(/linear-gradient|radial-gradient|conic-gradient/)
  })
  test('التوكنز الأساسية بقيم المرجع', () => {
    for (const t of ['--bg: #f4efe6', '--surface: #fffdf8', '--ink: #1f1b16', '--brand: #e9793f', '--panel: #1f1b16', '--live: #ff6b4a']) expect(css).toContain(t)
    expect(css).toMatch(/:root\[data-theme='dark'\][^}]*--bg: #15120e/)
  })
  test('احترام تقليل الحركة', () => {
    expect(css).toContain('prefers-reduced-motion: reduce')
  })
})
