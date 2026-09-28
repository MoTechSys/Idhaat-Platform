import type { Child } from 'hono/jsx'
import type { SessionUser } from '../lib/types'
import { pageHref, pageWindow, type PageInfo } from '../lib/paging'
import { Icon, IconTile, type IconName, type Tone } from './icons'
import { resolveNav } from './nav'

export const ASSET_V = '5'

/** يمنع وميض الثيم: يُطبَّق قبل رسم الصفحة (مفضّل المستخدم ⇐ إعداد النظام) */
const THEME_BOOT = `(function(){try{var t=localStorage.getItem('theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t}catch(e){}})()`

export function Head({ title, description, noindex }: { title: string; description?: string; noindex?: boolean }) {
  return (
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {noindex && <meta name="robots" content="noindex" />}
      <meta name="theme-color" content="#f6f7f9" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#101114" media="(prefers-color-scheme: dark)" />
      <meta name="color-scheme" content="light dark" />
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      <link rel="manifest" href="/manifest.webmanifest" />
      <link rel="icon" href="/static/icon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/static/icon-192.png" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <link rel="preload" href="/static/fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2" as="font" type="font/woff2" crossorigin="" />
      <link rel="preload" href="/static/fonts/alexandria-arabic-wght-normal.woff2" as="font" type="font/woff2" crossorigin="" />
      <link rel="stylesheet" href={`/static/app.css?v=${ASSET_V}`} />
    </head>
  )
}

/** شعار إضاءات: شعلة/إشراقة فوق كتاب */
export const Logo = ({ size = 38 }: { size?: number }) => (
  <span class="logo" style={size !== 38 ? `width:${size}px;height:${size}px;border-radius:${Math.round(size / 3.2)}px` : undefined}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3v2M5.6 5.6 7 7M18.4 5.6 17 7M3 12h2M19 12h2" />
      <path d="M8 12a4 4 0 0 1 8 0" />
      <path d="M4 17c2.7-1.3 5.3-1.3 8 0 2.7-1.3 5.3-1.3 8 0v3c-2.7-1.3-5.3-1.3-8 0-2.7-1.3-5.3-1.3-8 0z" fill="currentColor" fill-opacity=".25" />
    </svg>
  </span>
)

export const roleLabel = { admin: 'الإدارة', teacher: 'معلمة', student: 'طالب' } as const

/** لون ثابت للصورة الرمزية حسب الاسم (يسهّل التمييز بين الأشخاص) */
const AV_COLORS = ['#3d4db7', '#0b7a75', '#a8326e', '#1f6fb2', '#a35a00', '#5b4bb3', '#2f7d4f', '#b3403a']
export function avatarColor(name: string) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return AV_COLORS[h % AV_COLORS.length]
}
const initials = (name: string) => {
  const parts = name.replace(/^أ\.\s*/, '').trim().split(/\s+/)
  return (parts[0]?.charAt(0) ?? '') + (parts[1]?.charAt(0) ?? '')
}
/** رابط صورة الملف الشخصي (مع رقم النسخة لكسر التخزين المؤقت) */
export const avatarUrl = (id: number, v?: number | null) => (v ? `/avatars/${id}?v=${v}` : null)

/**
 * الصورة الرمزية: صورة المستخدم إن وجدت، وإلا الأحرف الأولى بلون ثابت مشتق من الاسم.
 * مرّر id + v لعرض الصورة. المقاسات: sm 30 • افتراضي 38 • lg 48 • xl 96
 */
export const Avatar = ({ name, size, id, v, ring }: { name: string; size?: 'xs' | 'sm' | 'lg' | 'xl'; id?: number; v?: number | null; ring?: boolean }) => {
  const src = id ? avatarUrl(id, v) : null
  return (
    <span class={`avatar${size ? ` ${size}` : ''}${ring ? ' ring-on' : ''}`} style={`--av:${avatarColor(name)}`} aria-hidden="true">
      {src ? <img src={src} alt="" loading="lazy" decoding="async" width={96} height={96} /> : initials(name)}
    </span>
  )
}

/** خلية جدول لشخص: صورة + اسم + سطر فرعي */
export const Person = ({ id, name, v, sub, href }: { id: number; name: string; v?: number | null; sub?: Child; href?: string }) => (
  <div class="cell-user">
    <Avatar name={name} id={id} v={v} size="sm" />
    <div style="min-width:0">
      {href ? (
        <a href={href}>
          <b>{name}</b>
        </a>
      ) : (
        <b>{name}</b>
      )}
      {sub && <small class="muted">{sub}</small>}
    </div>
  </div>
)

/** الإجراء الأساسي لكل دور (زر بارز أعلى القائمة الجانبية) */
const primaryAction = (role: SessionUser['role']): { href: string; label: string; icon: IconName } | null =>
  role === 'student' ? null : { href: '/lessons#new', label: 'جدولة حصة', icon: 'calendar-plus' }

/** يمنع وميض حالة القائمة (مطوية/كاملة) قبل الرسم */
const NAV_BOOT = `try{if(localStorage.getItem('nav')==='rail')document.documentElement.dataset.nav='rail'}catch(e){}`

/**
 * هيكل التطبيق (App Shell):
 *  - سطح المكتب ≥ 1024px: قائمة جانبية ثابتة قابلة للطي إلى شريط أيقونات (Rail)، وشريط عنوان، وتبويبات القسم.
 *  - اللوحي 600–1023px: شريط أيقونات دائم (Navigation Rail).
 *  - الجوال < 600px: شريط تطبيق علوي + شريط تنقل سفلي (Navigation Bar) + زر إجراء عائم، والقائمة الكاملة كدرج.
 * الإطار ثابت ولا يتحرك؛ المحتوى وحده يتمرر.
 */
export function AppLayout(props: {
  title: string
  user: SessionUser
  path: string
  search?: string
  unread?: number
  children: Child
  flash?: { type: 'ok' | 'bad' | 'info' | 'warn'; text: string } | null
  scripts?: string[]
  demo?: boolean
}) {
  const { sections, section, tab } = resolveNav(props.user.role, props.path, props.search ?? '', props.unread ?? 0)
  const home = sections[0]
  const cta = primaryAction(props.user.role)
  const crumbTail = tab && section && tab.label !== section.label ? tab.label : section?.id === 'home' || !section ? null : props.title !== section.label ? props.title : null
  return (
    <html lang="ar" dir="rtl">
      <Head title={`${props.title} — إضاءات`} noindex />
      <body class="app-body">
        <script dangerouslySetInnerHTML={{ __html: NAV_BOOT }} />
        <a href="#main" class="skip">
          تخطَّ إلى المحتوى
        </a>
        <div class="app">
          <aside class="nav" id="side" aria-label="القائمة الرئيسية">
            <div class="nav-head">
              <a href={home.href} class="brand" aria-label="إضاءات — الرئيسية">
                <Logo size={32} />
                <span class="brand-t">
                  إضاءات
                  <small>منصة التعليم المباشر</small>
                </span>
              </a>
              <button class="icon-btn nav-collapse" id="navToggle" type="button" aria-label="طي القائمة الجانبية" title="طي القائمة" aria-pressed="false">
                <Icon name="panel-right-close" />
              </button>
            </div>
            {cta && (
              <a class="btn btn-primary nav-cta" href={cta.href} title={cta.label}>
                <Icon name={cta.icon} />
                <span class="nav-label">{cta.label}</span>
              </a>
            )}
            <nav class="nav-list">
              {sections.map((s) => {
                const on = s.id === section?.id
                return (
                  <a href={s.href} class={`nav-item${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined} title={s.label}>
                    <span class="nav-ico">
                      <Icon name={s.icon} />
                      {!!s.count && <span class="nav-dot" aria-hidden="true"></span>}
                    </span>
                    <span class="nav-label">{s.label}</span>
                    {!!s.count && <span class="nav-count num">{s.count}</span>}
                  </a>
                )
              })}
            </nav>
            <a href="/me" class="nav-user" title="ملفي الشخصي">
              <Avatar name={props.user.name} id={props.user.id} v={props.user.avatar_v} size="sm" />
              <span class="nav-label">
                <b>{props.user.name}</b>
                <small>{roleLabel[props.user.role]}</small>
              </span>
            </a>
          </aside>
          <div class="scrim" id="backdrop"></div>

          <div class="frame">
            <header class="titlebar">
              <button class="icon-btn menu-btn" id="menuBtn" type="button" aria-label="فتح القائمة" aria-controls="side" aria-expanded="false">
                <Icon name="menu" />
              </button>
              <div class="crumbs">
                {section && section.id !== 'home' ? (
                  <>
                    <a href={section.href} class="crumb-root">
                      {section.label}
                    </a>
                    {crumbTail && (
                      <>
                        <Icon name="chevron-left" class="crumb-sep" />
                        <span class="crumb-leaf">{crumbTail}</span>
                      </>
                    )}
                  </>
                ) : (
                  <span class="crumb-leaf">{section?.id === 'home' ? 'الرئيسية' : props.title}</span>
                )}
              </div>
              <div class="tb-actions">
                {props.demo && (
                  <a href="/" class="chip chip-demo hide-sm" title="الموقع التعريفي">
                    <Icon name="sparkles" /> نسخة تجريبية
                  </a>
                )}
                <button class="icon-btn" id="themeBtn" type="button" aria-label="تبديل الوضع الليلي" title="الوضع الليلي">
                  <Icon name="moon" class="theme-dark" />
                  <Icon name="sun" class="theme-light" />
                </button>
                <a class="icon-btn" href="/messages" aria-label={`الرسائل${props.unread ? ` (${props.unread} غير مقروءة)` : ''}`} title="الرسائل">
                  <Icon name="bell" />
                  {!!props.unread && <span class="dot-badge num">{props.unread}</span>}
                </a>
                <button class="acct-btn" id="acctBtn" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="acctMenu" aria-label="حسابي">
                  <Avatar name={props.user.name} id={props.user.id} v={props.user.avatar_v} size="sm" />
                  <Icon name="chevron-down" class="hide-sm acct-caret" />
                </button>
              </div>
            </header>
            {section?.tabs && (
              <nav class="subnav" aria-label={`صفحات ${section.label}`}>
                <div class="subnav-in">
                  {section.tabs.map((t) => (
                    <a href={t.href} class={t === tab ? 'on' : ''} aria-current={t === tab ? 'page' : undefined}>
                      {t.label}
                    </a>
                  ))}
                </div>
              </nav>
            )}
            <main class="content" id="main">
              {props.children}
            </main>
          </div>
        </div>

        <nav class="tabbar" aria-label="التنقل السريع">
          {sections
            .filter((s) => s.mobile)
            .map((s) => {
              const on = s.id === section?.id
              return (
                <a href={s.href} class={on ? 'on' : ''} aria-current={on ? 'page' : undefined}>
                  <span class="tb-ind">
                    <Icon name={s.icon} />
                    {!!s.count && <span class="tb-count num">{s.count}</span>}
                  </span>
                  <span class="tb-label">{s.short ?? s.label}</span>
                </a>
              )
            })}
        </nav>
        <div class="menu" id="acctMenu" role="menu" aria-label="قائمة الحساب" hidden>
          <div class="menu-head">
            <Avatar name={props.user.name} id={props.user.id} v={props.user.avatar_v} size="lg" />
            <div>
              <b>{props.user.name}</b>
              <small class="num">{props.user.phone}</small>
              <span class="badge gray">{roleLabel[props.user.role]}</span>
            </div>
          </div>
          <a href="/me" role="menuitem" class="menu-item">
            <Icon name="user" /> ملفي الشخصي
          </a>
          <a href="/me#password" role="menuitem" class="menu-item">
            <Icon name="key-round" /> تغيير كلمة المرور
          </a>
          <button type="button" role="menuitem" class="menu-item" data-theme-toggle>
            <Icon name="moon" class="theme-dark" />
            <Icon name="sun" class="theme-light" /> الوضع الليلي
          </button>
          <form method="post" action="/logout">
            <button role="menuitem" class="menu-item danger">
              <Icon name="log-out" class="flip" /> تسجيل الخروج
            </button>
          </form>
        </div>

        <div class="toasts" id="toasts" role="status" aria-live="polite">
          {props.flash && <Toast type={props.flash.type} text={props.flash.text} />}
        </div>
        <script src={`/static/app.js?v=${ASSET_V}`} defer></script>
        {(props.scripts ?? []).map((s) => (
          <script type="module" src={`${s}?v=${ASSET_V}`}></script>
        ))}
      </body>
    </html>
  )
}


const toastIcon = { ok: ['circle-check', 'ok'], bad: ['circle-x', 'bad'], warn: ['triangle-alert', 'warn'], info: ['info', 'info'] } as const
export const Toast = ({ type, text }: { type: keyof typeof toastIcon; text: string }) => (
  <div class="toast" data-toast>
    <IconTile name={toastIcon[type][0]} tone={toastIcon[type][1]} size="sm" />
    <div>{text}</div>
    <button class="icon-btn" style="width:30px;height:30px" data-close aria-label="إغلاق">
      <Icon name="x" size={16} />
    </button>
  </div>
)

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

/** مؤشر (KPI). مع href يصبح رابطاً للتفاصيل. */
export const Stat = (p: { label: string; value: Child; sub?: Child; tone?: 'ok' | 'bad' | 'warn' | 'teal' | 'info'; icon?: IconName; href?: string }) => {
  const inner = (
    <>
      <div class="stat-top">
        <span class="label">{p.label}</span>
        {p.icon && <IconTile name={p.icon} tone={(p.tone ?? 'brand') as Tone} size="sm" />}
      </div>
      <div class="value">{p.value}</div>
      {p.sub && <div class="sub">{p.sub}</div>}
    </>
  )
  return p.href ? (
    <a class={`stat ${p.tone ?? ''}`} href={p.href}>
      {inner}
    </a>
  ) : (
    <div class={`stat ${p.tone ?? ''}`}>{inner}</div>
  )
}

export const Empty = ({ icon, text, children }: { icon: IconName; text: string; children?: Child }) => (
  <div class="empty">
    <div class="big">
      <Icon name={icon} />
    </div>
    <p>{text}</p>
    {children}
  </div>
)

export const PageHead = ({ title, sub, eyebrow, children }: { title: Child; sub?: Child; eyebrow?: Child; children?: Child }) => (
  <div class="page-head">
    <div style="min-width:0">
      {eyebrow && <div class="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {sub && <p>{sub}</p>}
    </div>
    {children && <div class="actions">{children}</div>}
  </div>
)

/** معلومة صغيرة بأيقونة (للأسطر الفرعية) */
export const Meta = ({ icon, children }: { icon: IconName; children: Child }) => (
  <span>
    <Icon name={icon} />
    {children}
  </span>
)

export const Alert = ({ type, icon, children }: { type: 'ok' | 'bad' | 'info' | 'warn'; icon?: IconName; children: Child }) => (
  <div class={`alert ${type}`}>
    <Icon name={icon ?? toastIcon[type][0]} />
    <div>{children}</div>
  </div>
)

/**
 * شريط ترقيم الصفحات: «عرض 21–40 من 143» + أرقام الصفحات.
 * روابط عادية (تعمل بدون JS، وزر الرجوع يعيدك لنفس الصفحة)، وأهداف لمس 40px.
 */
export const Pager = ({ info, url }: { info: PageInfo; url: string }) => {
  if (info.total <= info.size) return info.total ? <div class="pager-sum solo">{info.total} عنصر</div> : null
  return (
    <nav class="pager" aria-label="ترقيم الصفحات">
      <span class="pager-sum">
        عرض <b class="num">{info.from}</b>–<b class="num">{info.to}</b> من <b class="num">{info.total}</b>
      </span>
      <div class="pager-btns">
        {info.page > 1 ? (
          <a class="pg" href={pageHref(url, info.page - 1)} rel="prev" aria-label="الصفحة السابقة">
            <Icon name="chevron-right" />
          </a>
        ) : (
          <span class="pg off" aria-hidden="true">
            <Icon name="chevron-right" />
          </span>
        )}
        {pageWindow(info.page, info.pages).map((n) =>
          n === 0 ? (
            <span class="pg gap">…</span>
          ) : n === info.page ? (
            <span class="pg on num" aria-current="page">
              {n}
            </span>
          ) : (
            <a class="pg num" href={pageHref(url, n)}>
              {n}
            </a>
          ),
        )}
        {info.page < info.pages ? (
          <a class="pg" href={pageHref(url, info.page + 1)} rel="next" aria-label="الصفحة التالية">
            <Icon name="chevron-left" />
          </a>
        ) : (
          <span class="pg off" aria-hidden="true">
            <Icon name="chevron-left" />
          </span>
        )}
      </div>
    </nav>
  )
}

/** شريط أدوات القائمة: بحث + فلاتر، يرسل GET ويعيد للصفحة الأولى */
export const Toolbar = ({ q, placeholder, children, hidden }: { q?: string; placeholder?: string; children?: Child; hidden?: Record<string, string> }) => (
  <form method="get" class="toolbar" role="search">
    {Object.entries(hidden ?? {}).map(([k, v]) => (
      <input type="hidden" name={k} value={v} />
    ))}
    <div class="input-icon grow">
      <Icon name="search" />
      <input type="search" name="q" value={q ?? ''} placeholder={placeholder ?? 'بحث…'} aria-label={placeholder ?? 'بحث'} />
    </div>
    {children}
    <button class="btn btn-soft">
      <Icon name="filter" /> تطبيق
    </button>
  </form>
)
