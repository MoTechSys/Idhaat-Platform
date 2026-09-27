import { Hono } from 'hono'
import { homeFor, isValidPhone, login, logout, normalizePhone } from '../lib/auth'
import { form, isDemo, str } from '../lib/http'
import type { AppEnv } from '../lib/types'
import { Head } from '../views/layout'
import { Landing } from '../views/landing'

export const publicRoutes = new Hono<AppEnv>()

publicRoutes.get('/', (c) => {
  const sent = c.req.query('sent')
  return c.html(<Landing sent={sent === 'ok' || sent === 'bad' ? sent : undefined} />)
})

publicRoutes.post('/lead', async (c) => {
  const f = await form(c)
  if (str(f.website)) return c.redirect('/?sent=ok#book', 303) // فخ للروبوتات
  const name = str(f.name, 80)
  const phone = normalizePhone(f.phone)
  if (name.length < 2 || !isValidPhone(phone)) return c.redirect('/?sent=bad#book', 303)
  // حد بسيط: طلب واحد لكل رقم كل 10 دقائق
  const recent = await c.env.DB.prepare('SELECT 1 FROM leads WHERE phone = ? AND created_at > unixepoch() - 600').bind(phone).first()
  if (!recent) {
    await c.env.DB.prepare('INSERT INTO leads (name, phone, grade, subject) VALUES (?, ?, ?, ?)')
      .bind(name, phone, str(f.grade, 40), str(f.subject, 60))
      .run()
  }
  return c.redirect('/?sent=ok#book', 303)
})

function LoginPage({ error, next, demo, phone }: { error?: string; next: string; demo: boolean; phone?: string }) {
  return (
    <html lang="ar" dir="rtl">
      <Head title="تسجيل الدخول — إضاءات" />
      <body>
        <div class="auth">
          <div class="box">
            <a href="/" class="flex" style="justify-content:center;margin-bottom:1.25rem;text-decoration:none;color:var(--ink)">
              <span class="logo">إ</span>
              <b style="font-size:1.4rem">إضاءات</b>
            </a>
            <div class="card">
              <h1 style="font-size:1.3rem;text-align:center">أهلاً بك 👋</h1>
              <p class="muted" style="text-align:center">سجّل دخولك برقم الجوال</p>
              {error && <div class="alert bad">{error}</div>}
              <form method="post" action="/login" id="loginForm">
                <input type="hidden" name="next" value={next} />
                <div class="field">
                  <label for="phone">رقم الجوال</label>
                  <input id="phone" name="phone" required inputmode="tel" dir="ltr" placeholder="05xxxxxxxx" autocomplete="username" value={phone ?? ''} />
                </div>
                <div class="field">
                  <label for="password">كلمة المرور</label>
                  <input id="password" name="password" type="password" required autocomplete="current-password" />
                </div>
                <button class="btn btn-lg btn-block">دخول</button>
              </form>
              {demo && (
                <>
                  <hr />
                  <p class="muted" style="text-align:center;font-size:.85rem;margin-bottom:.6rem">
                    حسابات تجريبية للمعاينة (كلمة المرور: <b class="num">demo1234</b>)
                  </p>
                  <div class="demo-users">
                    <button type="button" data-phone="0500000001">🛡️ الإدارة</button>
                    <button type="button" data-phone="0510000001">👩‍🏫 معلمة</button>
                    <button type="button" data-phone="0550000001">🎒 طالب</button>
                  </div>
                  <script
                    dangerouslySetInnerHTML={{
                      __html: `document.querySelectorAll('.demo-users button').forEach(b=>b.onclick=()=>{phone.value=b.dataset.phone;password.value='demo1234';loginForm.submit()})`,
                    }}
                  />
                </>
              )}
            </div>
            <p class="muted" style="text-align:center;font-size:.85rem">نسيت كلمة المرور؟ تواصل مع إدارة المنصة.</p>
          </div>
        </div>
      </body>
    </html>
  )
}

const safeNext = (n: unknown) => {
  const s = String(n ?? '')
  return s.startsWith('/') && !s.startsWith('//') && !s.startsWith('/\\') ? s : ''
}

publicRoutes.get('/login', (c) => {
  const user = c.get('user')
  if (user) return c.redirect(homeFor(user.role))
  return c.html(<LoginPage next={safeNext(c.req.query('next'))} demo={isDemo(c)} />)
})

publicRoutes.post('/login', async (c) => {
  const f = await form(c)
  const res = await login(c, f.phone, f.password)
  if (!res.ok) return c.html(<LoginPage error={res.error} next={safeNext(f.next)} demo={isDemo(c)} phone={str(f.phone, 20)} />, 401)
  return c.redirect(safeNext(f.next) || homeFor(res.user.role), 303)
})

publicRoutes.post('/logout', async (c) => {
  await logout(c)
  return c.redirect('/login', 303)
})

publicRoutes.get('/manifest.webmanifest', (c) =>
  c.json(
    {
      name: 'منصة إضاءات التعليمية',
      short_name: 'إضاءات',
      start_url: '/login',
      display: 'standalone',
      dir: 'rtl',
      lang: 'ar',
      background_color: '#f7f7fc',
      theme_color: '#5b3df5',
      icons: [
        { src: '/static/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/static/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/static/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    200,
    { 'content-type': 'application/manifest+json' },
  ),
)

publicRoutes.get('/robots.txt', (c) => c.text('User-agent: *\nAllow: /$\nDisallow: /admin\nDisallow: /teacher\nDisallow: /student\nDisallow: /api\n'))
