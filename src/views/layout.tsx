import type { Child } from 'hono/jsx'
import type { SessionUser } from '../lib/types'

const ASSET_V = '1'

export function Head({ title, description }: { title: string; description?: string }) {
  return (
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <meta name="theme-color" content="#5b3df5" />
      <link rel="manifest" href="/manifest.webmanifest" />
      <link rel="icon" href="/static/icon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/static/icon-192.png" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href={`/static/app.css?v=${ASSET_V}`} />
    </head>
  )
}

export interface NavItem {
  href: string
  label: string
  icon: string
  count?: number
  sep?: string
  mobile?: boolean
}

export function navFor(user: SessionUser, unread = 0): NavItem[] {
  if (user.role === 'admin')
    return [
      { href: '/admin', label: 'الرئيسية', icon: '🏠', mobile: true },
      { href: '/admin/live', label: 'الحصص الآن', icon: '🔴', mobile: true },
      { href: '/admin/lessons', label: 'جدول الحصص', icon: '🗓️' },
      { sep: 'التعليم', href: '/admin/courses', label: 'الدورات', icon: '📚' },
      { href: '/admin/users?role=teacher', label: 'المعلمات', icon: '👩‍🏫' },
      { href: '/admin/users?role=student', label: 'الطلاب', icon: '🎒' },
      { href: '/admin/rooms', label: 'قاعات الزوم', icon: '🎥' },
      { href: '/admin/leads', label: 'طلبات التسجيل', icon: '📥' },
      { sep: 'المالية', href: '/admin/finance', label: 'لوحة المالية', icon: '💰', mobile: true },
      { href: '/admin/finance/installments', label: 'الأقساط والمتابعة', icon: '⏰' },
      { href: '/admin/finance/payouts', label: 'المستحقات', icon: '🤝' },
      { href: '/admin/finance/expenses', label: 'المصروفات', icon: '🧾' },
      { href: '/admin/partners', label: 'الجهات', icon: '🏢' },
      { sep: 'التواصل', href: '/messages', label: 'الرسائل', icon: '💬', count: unread, mobile: true },
    ]
  if (user.role === 'teacher')
    return [
      { href: '/teacher', label: 'الرئيسية', icon: '🏠', mobile: true },
      { href: '/teacher/lessons', label: 'حصصي', icon: '🗓️', mobile: true },
      { href: '/teacher/assignments', label: 'الواجبات', icon: '📝', mobile: true },
      { href: '/teacher/recordings', label: 'التسجيلات', icon: '🎬' },
      { href: '/teacher/earnings', label: 'مستحقاتي', icon: '💵' },
      { href: '/messages', label: 'الرسائل', icon: '💬', count: unread, mobile: true },
    ]
  return [
    { href: '/student', label: 'الرئيسية', icon: '🏠', mobile: true },
    { href: '/student/recordings', label: 'التسجيلات', icon: '🎬', mobile: true },
    { href: '/student/assignments', label: 'الواجبات', icon: '📝', mobile: true },
    { href: '/student/payments', label: 'مدفوعاتي', icon: '💳' },
    { href: '/messages', label: 'الرسائل', icon: '💬', count: unread, mobile: true },
  ]
}

const roleLabel = { admin: 'الإدارة', teacher: 'معلمة', student: 'طالب' } as const

function isActive(href: string, path: string) {
  const clean = href.split('?')[0]
  if (['/admin', '/teacher', '/student'].includes(clean)) return path === clean
  return path === clean || path.startsWith(clean + '/')
}

export function AppLayout(props: {
  title: string
  user: SessionUser
  path: string
  unread?: number
  children: Child
  flash?: { type: 'ok' | 'bad' | 'info' | 'warn'; text: string } | null
  scripts?: string[]
  demo?: boolean
}) {
  const nav = navFor(props.user, props.unread ?? 0)
  const fullPath = props.path
  return (
    <html lang="ar" dir="rtl">
      <Head title={`${props.title} — إضاءات`} />
      <body>
        {props.demo && (
          <div class="demo-banner">
            نسخة معاينة تجريبية ببيانات وهمية — <a href="/">الموقع التعريفي</a>
          </div>
        )}
        <div class="shell">
          <aside class="side" id="side">
            <div class="brand">
              <span class="logo">إ</span> إضاءات
            </div>
            <nav>
              {nav.map((n) => (
                <>
                  {n.sep && <div class="sep">{n.sep}</div>}
                  <a href={n.href} class={isActive(n.href, fullPath) ? 'active' : ''}>
                    <span class="ico">{n.icon}</span>
                    {n.label}
                    {!!n.count && <span class="count">{n.count}</span>}
                  </a>
                </>
              ))}
            </nav>
          </aside>
          <div class="backdrop" id="backdrop"></div>
          <div class="main">
            <header class="topbar">
              <div class="flex">
                <button class="menu-btn" id="menuBtn" aria-label="القائمة">☰</button>
                <strong>{props.title}</strong>
              </div>
              <div class="who">
                <div class="hide-sm" style="text-align:left">
                  <div style="font-weight:700;font-size:.9rem">{props.user.name}</div>
                  <div class="muted" style="font-size:.75rem">{roleLabel[props.user.role]}</div>
                </div>
                <span class="avatar">{props.user.name.trim().charAt(0)}</span>
                <form method="post" action="/logout" class="inline-form">
                  <button class="btn btn-ghost btn-sm" title="تسجيل الخروج">خروج</button>
                </form>
              </div>
            </header>
            <main class="content">
              {props.flash && <div class={`alert ${props.flash.type}`}>{props.flash.text}</div>}
              {props.children}
            </main>
          </div>
        </div>
        <nav class="bottom-nav">
          {nav
            .filter((n) => n.mobile)
            .map((n) => (
              <a href={n.href} class={isActive(n.href, fullPath) ? 'active' : ''}>
                <span class="ico">{n.icon}</span>
                {n.label}
              </a>
            ))}
        </nav>
        <script src={`/static/app.js?v=${ASSET_V}`} defer></script>
        {(props.scripts ?? []).map((s) => (
          <script type="module" src={`${s}?v=${ASSET_V}`}></script>
        ))}
      </body>
    </html>
  )
}

// ============ مكونات مشتركة ============
export const Money = ({ v, color }: { v: number; color?: boolean }) => {
  const abs = Math.abs(Math.round(v))
  const whole = Math.floor(abs / 100).toLocaleString('en-US')
  const frac = abs % 100
  const s = `${v < 0 ? '−' : ''}${frac ? `${whole}.${String(frac).padStart(2, '0')}` : whole}`
  return (
    <span class={`num ${color ? (v < 0 ? 'neg' : v > 0 ? 'pos' : '') : ''}`}>
      {s} <small>ر.س</small>
    </span>
  )
}

export const Stat = (p: { label: string; value: Child; sub?: Child; tone?: 'ok' | 'bad' | 'warn' | 'teal' }) => (
  <div class={`stat ${p.tone ?? ''}`}>
    <div class="label">{p.label}</div>
    <div class="value">{p.value}</div>
    {p.sub && <div class="sub">{p.sub}</div>}
  </div>
)

export const Empty = ({ icon, text, children }: { icon: string; text: string; children?: Child }) => (
  <div class="empty">
    <div class="big">{icon}</div>
    <p>{text}</p>
    {children}
  </div>
)

export const PageHead = ({ title, sub, children }: { title: string; sub?: Child; children?: Child }) => (
  <div class="page-head">
    <div>
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </div>
    {children && <div class="actions">{children}</div>}
  </div>
)
