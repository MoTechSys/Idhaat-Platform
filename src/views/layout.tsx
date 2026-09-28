import type { Child } from 'hono/jsx'
import type { SessionUser } from '../lib/types'
import { pageHref, pageWindow, type PageInfo } from '../lib/paging'
import { Icon, IconTile, type IconName, type Tone } from './icons'
import { resolveNav } from './nav'

export const ASSET_V = '7'

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
      <meta name="theme-color" content="#f4efe6" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#15120e" media="(prefers-color-scheme: dark)" />
      <meta name="color-scheme" content="light dark" />
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      <link rel="manifest" href="/manifest.webmanifest" />
      <link rel="icon" href="/static/icon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/static/icon-192.png" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <link rel="preload" href="/static/fonts/readex-pro-arabic-wght-normal.woff2" as="font" type="font/woff2" crossorigin="" />
      <link rel="stylesheet" href={`/static/app.css?v=${ASSET_V}`} />
    </head>
  )
}

/** شعار إضاءات: مصباح داخل دائرة داكنة */
export const Logo = ({ size = 32 }: { size?: number }) => (
  <span class="logo" style={size !== 32 ? `width:${size}px;height:${size}px` : undefined}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
    </svg>
  </span>
)

export const roleLabel = { admin: 'الإدارة', teacher: 'معلمة', student: 'طالب' } as const

/** عائلة لونية ثابتة للصورة الرمزية حسب الاسم (1–5 ⇐ --av-N) — خلفية فاتحة ونص داكن من نفس العائلة */
export function avatarTone(name: string) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return (h % 5) + 1
}
export const initials = (name: string) => {
  const parts = name.replace(/^أ\.\s*/, '').trim().split(/\s+/)
  // «الراشد» ⇐ «ر» (تجاهل أداة التعريف كما في المرجع: سامية الراشد ⇐ سر)
  const second = (parts[1] ?? '').replace(/^ال(?=.{2,})/, '')
  return (parts[0]?.charAt(0) ?? '') + second.charAt(0)
}
/** الاسم الأول بدون اللقب (للترحيب) */
export const firstName = (name: string) => name.replace(/^أ\.\s*/, '').trim().split(/\s+/)[0] ?? name
/** رابط صورة الملف الشخصي (مع رقم النسخة لكسر التخزين المؤقت) */
export const avatarUrl = (id: number, v?: number | null) => (v ? `/avatars/${id}?v=${v}` : null)

/**
 * الصورة الرمزية: صورة المستخدم إن وجدت، وإلا أول حرفين من الاسم بعائلة لونية ثابتة.
 * المقاسات: xs 24 • sm 32 • افتراضي 36 • lg 48 • xl 96. me = لون الهوية (للمستخدم الحالي).
 */
export const Avatar = ({ name, size, id, v, ring, me }: { name: string; size?: 'xs' | 'sm' | 'lg' | 'xl'; id?: number; v?: number | null; ring?: boolean; me?: boolean }) => {
  const src = id ? avatarUrl(id, v) : null
  return (
    <span class={`avatar ${me ? 'av-me' : `av-${avatarTone(name)}`}${size ? ` ${size}` : ''}${ring ? ' ring-on' : ''}`} aria-hidden="true">
      {src ? <img src={src} alt="" loading="lazy" decoding="async" width={96} height={96} /> : initials(name)}
    </span>
  )
}

/** خلية جدول لشخص: صورة + اسم + سطر فرعي */
export const Person = ({ id, name, v, sub, href }: { id: number; name: string; v?: number | null; sub?: Child; href?: string }) => (
  <div class="cell-user">
    <Avatar name={name} id={id} v={v} />
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

/** إجراءات سريعة لكل دور (تظهر في نافذة البحث/الانتقال السريع) */
const quickActions = (role: SessionUser['role']): { href: string; label: string; icon: IconName }[] =>
  role === 'admin'
    ? [
        { href: '/lessons#new', label: 'جدولة حصة', icon: 'calendar-plus' },
        { href: '/admin/finance/installments', label: 'تسجيل دفعة', icon: 'wallet-cards' },
        { href: '/admin/users?role=student#new', label: 'طالب جديد', icon: 'user-plus' },
        { href: '/admin/courses#new', label: 'دورة جديدة', icon: 'book-open' },
        { href: '/admin/finance/expenses#new', label: 'تسجيل مصروف', icon: 'receipt-text' },
      ]
    : role === 'teacher'
      ? [
          { href: '/lessons#new', label: 'جدولة حصة', icon: 'calendar-plus' },
          { href: '/teacher/assignments#new', label: 'واجب جديد', icon: 'file-plus' },
        ]
      : []

/**
 * هيكل التطبيق (App Shell) — «دافئ تحريري»:
 *  - سطح المكتب ≥ 1024px: شريط علوي 68px على خلفية الصفحة مباشرة — الشعار، تبويبات كبسولية للأقسام،
 *    ثم البحث والإشعارات وكبسولة المستخدم. تبويبات القسم الفرعية كبسولات صغيرة تحت الشريط.
 *  - الجوال < 700px: رأس بسيط (الشعار أو زر رجوع + العنوان) + شريط تنقل سفلي ثابت 84px بخمسة عناصر.
 * لا قائمة جانبية. الشريط العلوي ثابت (sticky) والمحتوى يتمرر تحته.
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
  /** أزرار أيقونية تظهر في رأس الجوال (مثل: إضافة، تصدير) */
  actions?: Child
}) {
  const { sections, section, tab } = resolveNav(props.user.role, props.path, props.search ?? '', props.unread ?? 0)
  const home = sections[0]
  const isHome = section?.id === 'home' && props.path === home.href
  const mobileDest = sections.some((s) => s.mobile && s.href.split('?')[0] === props.path)
  const backHref = !isHome && !mobileDest ? (section && section.href.split('?')[0] !== props.path ? section.href : home.href) : null
  const mTitle = tab && section && tab !== section.tabs?.[0] ? tab.label : section && section.id !== 'home' ? section.label : props.title
  const others = sections.filter((s) => !s.mobile)
  const actions = quickActions(props.user.role)
  const unread = props.unread ?? 0
  return (
    <html lang="ar" dir="rtl">
      <Head title={`${props.title} — إضاءات`} noindex />
      <body class={`app-body${isHome ? ' is-home' : ''}`}>
        <a href="#main" class="skip">
          تخطَّ إلى المحتوى
        </a>
        <header class="topbar">
          {backHref && (
            <a href={backHref} class="icon-btn m-only m-back" aria-label="رجوع">
              <Icon name="chevron-right" />
            </a>
          )}
          <a href={home.href} class={`brand${isHome ? '' : ' m-hide'}`} aria-label="إضاءات — الرئيسية">
            <Logo />
            <span class="brand-t">إضاءات</span>
          </a>
          {!isHome && <span class="m-title m-only">{mTitle}</span>}
          <nav class="toptabs" aria-label="القائمة الرئيسية">
            {sections.map((s) => {
              const on = s.id === section?.id
              return (
                <a href={s.href} class={`nav-item${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined} title={s.label}>
                  {s.label}
                  {!!s.count && <span class="nav-count num" aria-label={`${s.count} غير مقروءة`}>{s.count}</span>}
                </a>
              )
            })}
          </nav>
          <span class="sp"></span>
          {props.actions && <div class="m-actions m-only">{props.actions}</div>}
          {props.demo && (
            <a href="/" class="chip chip-demo m-hide" title="الموقع التعريفي">
              نسخة تجريبية
            </a>
          )}
          <button class="icon-btn m-hide" id="searchBtn" type="button" aria-label="بحث وانتقال سريع" title="بحث (Ctrl+K)" aria-haspopup="dialog" aria-controls="searchDlg">
            <Icon name="search" />
          </button>
          <button class="icon-btn m-hide" id="themeBtn" type="button" aria-label="تبديل الوضع الليلي" title="الوضع الليلي">
            <Icon name="moon" class="theme-dark" />
            <Icon name="sun" class="theme-light" />
          </button>
          <a class={`icon-btn${props.actions && !isHome ? ' m-hide' : ''}`} href="/messages" aria-label={`الإشعارات والرسائل${unread ? ` (${unread} غير مقروءة)` : ''}`} title="الإشعارات">
            <Icon name="bell" />
            {!!unread && <span class="dot-new" aria-hidden="true"></span>}
          </a>
          <button class={`acct-btn${props.actions && !isHome ? ' m-hide' : ''}`} id="acctBtn" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="acctMenu" aria-label="حسابي">
            <span class="acct-name">{props.user.name.replace(/^أ\.\s*/, '')}</span>
            <Avatar name={props.user.name} id={props.user.id} v={props.user.avatar_v} size="sm" me />
          </button>
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

        <nav class="tabbar" aria-label="التنقل السريع">
          {sections
            .filter((s) => s.mobile)
            .map((s) => {
              const on = s.id === section?.id
              return (
                <a href={s.href} class={on ? 'on' : ''} aria-current={on ? 'page' : undefined} aria-label={s.count ? `${s.short ?? s.label} (${s.count} غير مقروءة)` : undefined}>
                  <span class="tb-ico">
                    <Icon name={s.icon} />
                    {!!s.count && <span class="tb-dot" aria-hidden="true"></span>}
                  </span>
                  <span class="tb-label">{s.short ?? s.label}</span>
                </a>
              )
            })}
        </nav>
        <div class="scrim" id="backdrop"></div>
        <div class="menu" id="acctMenu" role="menu" aria-label="قائمة الحساب" hidden>
          <div class="menu-head">
            <Avatar name={props.user.name} id={props.user.id} v={props.user.avatar_v} size="lg" me />
            <div>
              <b>{props.user.name}</b>
              <small class="num">{props.user.phone}</small>
              <span class="badge gray">{roleLabel[props.user.role]}</span>
            </div>
          </div>
          {others.map((s) => (
            <a href={s.href} role="menuitem" class="menu-item m-only-flex">
              <Icon name={s.icon} /> {s.label}
            </a>
          ))}
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

        <dialog class="search-dlg" id="searchDlg" aria-label="بحث وانتقال سريع">
          <div class="search-box">
            <div class="input-icon">
              <Icon name="search" />
              <input type="search" id="searchInput" placeholder="اكتب اسم صفحة أو إجراء…" aria-label="بحث في الصفحات والإجراءات" autocomplete="off" />
            </div>
            <div class="search-list" id="searchList">
              {actions.length > 0 && <div class="search-sec">إجراءات سريعة</div>}
              {actions.map((a) => (
                <a href={a.href} class="search-item">
                  <Icon name={a.icon} /> {a.label}
                </a>
              ))}
              <div class="search-sec">الصفحات</div>
              {sections.flatMap((s) =>
                s.tabs?.length
                  ? s.tabs.map((t) => (
                      <a href={t.href} class="search-item">
                        <Icon name={s.icon} /> {s.label}
                        <small>{t.label}</small>
                      </a>
                    ))
                  : [
                      <a href={s.href} class="search-item">
                        <Icon name={s.icon} /> {s.label}
                      </a>,
                    ],
              )}
              <a href="/me" class="search-item">
                <Icon name="user" /> ملفي الشخصي
              </a>
            </div>
            <p class="search-empty muted" id="searchEmpty" hidden>
              لا توجد نتائج.
            </p>
          </div>
        </dialog>

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
export const Money = ({ v, color, whole }: { v: number; color?: boolean; whole?: boolean }) => {
  const abs = Math.abs(Math.round(v))
  const w = whole ? Math.round(abs / 100) : Math.floor(abs / 100)
  const frac = whole ? 0 : abs % 100
  const s = `${v < 0 ? '−' : ''}${frac ? `${w.toLocaleString('en-US')}.${String(frac).padStart(2, '0')}` : w.toLocaleString('en-US')}`
  return (
    <span class={`num ${color ? (v < 0 ? 'neg' : v > 0 ? 'pos' : '') : ''}`}>
      {s} <small>ر.س</small>
    </span>
  )
}

/** مؤشر (KPI): تسمية صغيرة + رقم كبير (Readex Pro) + سطر فرعي. مع href يصبح رابطاً للتفاصيل. */
export const Stat = (p: { label: string; value: Child; sub?: Child; tone?: 'ok' | 'bad' | 'warn' | 'teal' | 'info'; icon?: IconName; href?: string; class?: string }) => {
  const inner = (
    <>
      <div class="stat-top">
        <span class="label">{p.label}</span>
        {p.icon && <Icon name={p.icon} />}
      </div>
      <div class="value">{p.value}</div>
      {p.sub && <div class="sub">{p.sub}</div>}
    </>
  )
  const cls = `stat ${p.tone ?? ''}${p.class ? ` ${p.class}` : ''}`
  return p.href ? (
    <a class={cls} href={p.href}>
      {inner}
    </a>
  ) : (
    <div class={cls}>{inner}</div>
  )
}

/**
 * رسم بياني مساحي (SVG) بلا محاور ثقيلة: خط برتقالي + تعبئة فاتحة + نقطة نهاية.
 * يُرسم من الخادم؛ النقطة عنصر HTML حتى تبقى دائرية مع تمدد الرسم أفقياً.
 */
export const AreaChart = ({ values, height = 300, label, class: cls }: { values: number[]; height?: number; label: string; class?: string }) => {
  const W = 560
  const H = 300
  const top = 20
  const bottom = 12
  const max = Math.max(1, ...values)
  const n = Math.max(values.length, 2)
  const pts = (values.length ? values : [0, 0]).map((v, i) => [(i / (n - 1)) * W, H - bottom - (v / max) * (H - top - bottom)] as const)
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const [ex, ey] = pts[pts.length - 1]
  return (
    <div class={`area${cls ? ` ${cls}` : ''}`}>
      <div class="plot" role="img" aria-label={label}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={`height:${height}px`} aria-hidden="true" focusable="false">
          <path d={`${line} L${W} ${H} L0 ${H}Z`} class="area-fill" />
          <path d={line} class="area-line" vector-effect="non-scaling-stroke" />
        </svg>
        <span class="end" style={`left:${((ex / W) * 100).toFixed(2)}%;top:${((ey / H) * 100).toFixed(2)}%`}></span>
      </div>
    </div>
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
