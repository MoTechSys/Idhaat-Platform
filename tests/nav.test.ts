import { describe, expect, test } from 'vitest'
import { resolveNav, sectionsFor } from '../src/views/nav'

describe('التنقل: أقسام قليلة وتبويبات', () => {
  test('كل دور ≤ 6 أقسام رئيسية، والشريط السفلي ≤ 5', () => {
    for (const r of ['admin', 'teacher', 'student'] as const) {
      const s = sectionsFor(r)
      expect(s.length).toBeLessThanOrEqual(6)
      expect(s.filter((x) => x.mobile).length).toBeLessThanOrEqual(5)
      expect(new Set(s.map((x) => x.id)).size).toBe(s.length)
    }
  })

  test('كل صفحات الإدارة القديمة لها قسم (لا صفحة يتيمة)', () => {
    const paths = [
      '/admin', '/admin/live', '/lessons', '/lessons/5', '/admin/recordings', '/recordings/3', '/admin/rooms',
      '/admin/courses', '/admin/courses/1', '/admin/assignments', '/assignments/2',
      '/admin/users', '/admin/users/17', '/admin/leads',
      '/admin/finance', '/admin/finance/installments', '/admin/finance/payouts', '/admin/finance/expenses', '/admin/finance/course/1', '/admin/enrollments/4', '/admin/partners',
      '/messages',
    ]
    for (const p of paths) expect(resolveNav('admin', p).section, p).toBeDefined()
  })

  test('القسم والتبويب الصحيحان', () => {
    expect(resolveNav('admin', '/admin').section?.id).toBe('home')
    expect(resolveNav('admin', '/admin/finance/course/2').tab?.label).toBe('نظرة عامة')
    expect(resolveNav('admin', '/admin/enrollments/2').tab?.label).toBe('الأقساط')
    expect(resolveNav('admin', '/admin/users', '?role=teacher').tab?.label).toBe('المعلمات')
    expect(resolveNav('admin', '/admin/users', '').tab?.label).toBe('الطلاب')
    expect(resolveNav('admin', '/lessons/9').tab?.label).toBe('الجدول')
    expect(resolveNav('admin', '/recordings/9').section?.id).toBe('lessons')
    expect(resolveNav('student', '/recordings/9').section?.id).toBe('recordings')
    expect(resolveNav('student', '/lessons/9').section?.id).toBe('home')
    expect(resolveNav('teacher', '/assignments/3').section?.id).toBe('assignments')
    expect(resolveNav('teacher', '/teacher').section?.id).toBe('home')
    // «/teacher» لا تطابق «/teacher/earnings» كرئيسية
    expect(resolveNav('teacher', '/teacher/earnings').section?.id).toBe('earnings')
  })

  test('عدد الرسائل غير المقروءة يصل للقسم', () => {
    expect(sectionsFor('student', 3).find((s) => s.id === 'messages')?.count).toBe(3)
  })
})
