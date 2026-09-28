/**
 * نموذج التنقل (Information Architecture)
 *
 * المبدأ: أقسام رئيسية قليلة (≤ 6) في القائمة الجانبية / شريط التنقل السفلي،
 * وصفحات كل قسم تظهر كتبويبات أعلى المحتوى فقط عند الدخول للقسم.
 * بهذا تبقى القائمة قصيرة وواضحة بدل 16 رابطاً في قائمة واحدة.
 * (Material 3 Navigation: ≤ 5 وجهات في الشريط السفلي، و Fluent 2 Nav: تجميع هرمي)
 *
 * الوحدة صافية (بدون JSX) لتُختبر مباشرة: tests/nav.test.ts
 */
import type { Role } from '../lib/types'
import type { IconName } from './icons'

export interface NavTab {
  href: string
  label: string
  /** مسارات إضافية تُعتبر ضمن هذا التبويب (بادئات) */
  also?: string[]
}

export interface NavSection {
  id: string
  label: string
  /** اسم أقصر للشريط السفلي في الجوال */
  short?: string
  icon: IconName
  href: string
  /** بادئات المسارات التابعة لهذا القسم */
  match: string[]
  tabs?: NavTab[]
  count?: number
  /** يظهر في الشريط السفلي للجوال */
  mobile?: boolean
}

export function sectionsFor(role: Role, unread = 0): NavSection[] {
  if (role === 'admin')
    return [
      { id: 'home', label: 'الرئيسية', icon: 'layout-dashboard', href: '/admin', match: ['=/admin'], mobile: true },
      {
        id: 'lessons',
        label: 'الحصص',
        icon: 'radio',
        href: '/admin/live',
        match: ['/admin/live', '/lessons', '/admin/recordings', '/recordings', '/admin/rooms'],
        mobile: true,
        tabs: [
          { href: '/admin/live', label: 'الآن' },
          { href: '/lessons', label: 'الجدول', also: ['/lessons/'] },
          { href: '/admin/recordings', label: 'التسجيلات', also: ['/recordings/'] },
          { href: '/admin/rooms', label: 'قاعات الزوم' },
        ],
      },
      {
        id: 'academic',
        label: 'التعليم',
        icon: 'book-open',
        href: '/admin/courses',
        match: ['/admin/courses', '/admin/assignments', '/assignments'],
        mobile: true,
        tabs: [
          { href: '/admin/courses', label: 'الدورات' },
          { href: '/admin/assignments', label: 'الواجبات', also: ['/assignments/'] },
        ],
      },
      {
        id: 'people',
        label: 'الأشخاص',
        icon: 'users',
        href: '/admin/users?role=student',
        match: ['/admin/users', '/admin/leads'],
        mobile: true,
        tabs: [
          { href: '/admin/users?role=student', label: 'الطلاب' },
          { href: '/admin/users?role=teacher', label: 'المعلمات' },
          { href: '/admin/users?role=admin', label: 'المشرفون' },
          { href: '/admin/leads', label: 'طلبات التسجيل' },
        ],
      },
      {
        id: 'finance',
        label: 'المالية',
        icon: 'wallet',
        href: '/admin/finance',
        match: ['/admin/finance', '/admin/enrollments', '/admin/partners'],
        mobile: true,
        tabs: [
          { href: '/admin/finance', label: 'نظرة عامة', also: ['/admin/finance/course/'] },
          { href: '/admin/finance/installments', label: 'الأقساط', also: ['/admin/enrollments/'] },
          { href: '/admin/finance/payouts', label: 'المستحقات' },
          { href: '/admin/finance/expenses', label: 'المصروفات' },
          { href: '/admin/partners', label: 'الجهات' },
        ],
      },
      { id: 'messages', label: 'الرسائل', icon: 'messages-square', href: '/messages', match: ['/messages'], count: unread },
    ]
  if (role === 'teacher')
    return [
      { id: 'home', label: 'الرئيسية', icon: 'layout-dashboard', href: '/teacher', match: ['=/teacher'], mobile: true },
      {
        id: 'lessons',
        label: 'حصصي',
        icon: 'calendar-days',
        href: '/lessons',
        match: ['/lessons', '/teacher/recordings', '/recordings'],
        mobile: true,
        tabs: [
          { href: '/lessons', label: 'الجدول', also: ['/lessons/'] },
          { href: '/teacher/recordings', label: 'التسجيلات', also: ['/recordings/'] },
        ],
      },
      { id: 'assignments', label: 'الواجبات', icon: 'notebook-pen', href: '/teacher/assignments', match: ['/teacher/assignments', '/assignments'], mobile: true },
      { id: 'earnings', label: 'مستحقاتي', icon: 'banknote', href: '/teacher/earnings', match: ['/teacher/earnings'], mobile: true },
      { id: 'messages', label: 'الرسائل', icon: 'messages-square', href: '/messages', match: ['/messages'], count: unread, mobile: true },
    ]
  return [
    { id: 'home', label: 'الرئيسية', icon: 'house', href: '/student', match: ['=/student', '/lessons'], mobile: true },
    { id: 'recordings', label: 'التسجيلات', icon: 'circle-play', href: '/student/recordings', match: ['/student/recordings', '/recordings'], mobile: true },
    { id: 'assignments', label: 'الواجبات', icon: 'notebook-pen', href: '/student/assignments', match: ['/student/assignments', '/assignments'], mobile: true },
    { id: 'payments', label: 'مدفوعاتي', short: 'المدفوعات', icon: 'credit-card', href: '/student/payments', match: ['/student/payments'], mobile: true },
    { id: 'messages', label: 'الرسائل', icon: 'messages-square', href: '/messages', match: ['/messages'], count: unread, mobile: true },
  ]
}

/** مطابقة مسار مع بادئة: '=/x' مطابقة تامة، و'/x' تطابق '/x' و'/x/...' */
function matchPrefix(prefix: string, path: string): boolean {
  if (prefix.startsWith('=')) return path === prefix.slice(1)
  if (prefix.endsWith('/')) return path.startsWith(prefix)
  return path === prefix || path.startsWith(prefix + '/')
}

/** يطابق رابط التبويب مع المسار والاستعلام الحاليين (مثل ?role=teacher) */
function tabMatches(tab: NavTab, path: string, search: string): boolean {
  const [p, q] = tab.href.split('?')
  if (q) {
    if (path !== p) return false
    const want = new URLSearchParams(q)
    const have = new URLSearchParams(search)
    for (const [k, v] of want) if (have.get(k) !== v && !(k === 'role' && v === 'student' && !have.get(k))) return false
    return true
  }
  if (path === p) return true
  return (tab.also ?? []).some((a) => matchPrefix(a, path))
}

export interface ResolvedNav {
  sections: NavSection[]
  section: NavSection | undefined
  tab: NavTab | undefined
}

/** يحدد القسم والتبويب النشطين لمسار معين */
export function resolveNav(role: Role, path: string, search = '', unread = 0): ResolvedNav {
  const sections = sectionsFor(role, unread)
  // الأطول مطابقةً يفوز (مثلاً /recordings/5 للطالب ⇐ التسجيلات وليس الرئيسية)
  let section: NavSection | undefined
  let best = -1
  for (const s of sections) {
    for (const m of s.match) {
      if (matchPrefix(m, path) && m.length > best) {
        best = m.length
        section = s
      }
    }
  }
  const tab = section?.tabs?.find((t) => tabMatches(t, path, search))
  return { sections, section, tab }
}
