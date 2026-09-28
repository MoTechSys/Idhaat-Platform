import { describe, expect, test } from 'vitest'
import { AppLayout } from '../src/views/layout'
import type { SessionUser } from '../src/lib/types'

const users: Record<string, SessionUser> = {
  admin: { id: 1, role: 'admin', name: 'أ. سامية الراشد', phone: '0500000001', avatar_v: null },
  teacher: { id: 3, role: 'teacher', name: 'نورة القحطاني', phone: '0510000001', avatar_v: null },
  student: { id: 17, role: 'student', name: 'ريماس', phone: '0550000001', avatar_v: null },
}

async function render(role: keyof typeof users, path: string, search = '', unread = 0) {
  return String(
    await (
      <AppLayout title="اختبار" user={users[role]} path={path} search={search} unread={unread}>
        <h1>محتوى</h1>
      </AppLayout>
    ).toString(),
  )
}

describe('هيكل التطبيق (App Shell)', () => {
  test('معالم الصفحة الأساسية لقارئ الشاشة', async () => {
    const html = await render('admin', '/admin')
    expect(html.match(/<main/g)?.length).toBe(1)
    expect(html).toContain('id="main"')
    expect(html).toContain('href="#main"') // تخطي إلى المحتوى
    expect(html).toContain('aria-label="القائمة الرئيسية"')
    expect(html).toContain('aria-label="التنقل السريع"')
    expect(html).toContain('dir="rtl"')
  })

  test('لا تكرار في المعرّفات (id)', async () => {
    for (const [role, path] of [['admin', '/admin/finance'], ['teacher', '/lessons'], ['student', '/student']] as const) {
      const ids = [...(await render(role, path)).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])
      expect(new Set(ids).size, `${role} ${path}: ${ids}`).toBe(ids.length)
    }
  })

  test('القسم النشط والتبويب النشط معلَّمان aria-current', async () => {
    const html = await render('admin', '/admin/finance/installments')
    expect(html).toMatch(/class="nav-item on" aria-current="page"[^>]*title="المالية"/)
    expect(html).toContain('صفحات المالية')
    expect(html).toMatch(/class="on" aria-current="page">الأقساط</)
  })

  test('الطالب: بلا زر جدولة وبلا تبويبات فرعية، والرسائل غير المقروءة تظهر', async () => {
    const html = await render('student', '/student', '', 4)
    expect(html).not.toContain('nav-cta')
    expect(html).not.toContain('class="subnav"')
    expect(html).toContain('tb-count num">4')
  })

  test('الإدارة والمعلمة: زر جدولة حصة يفتح النموذج مباشرة', async () => {
    expect(await render('admin', '/admin')).toContain('href="/lessons#new"')
    expect(await render('teacher', '/teacher')).toContain('href="/lessons#new"')
  })

  test('قائمة الحساب مخفية افتراضياً ومرتبطة بزرها', async () => {
    const html = await render('teacher', '/teacher')
    expect(html).toContain('aria-controls="acctMenu"')
    expect(html).toMatch(/id="acctMenu" role="menu"[^>]*hidden/)
    expect(html).toContain('action="/logout"')
  })
})
