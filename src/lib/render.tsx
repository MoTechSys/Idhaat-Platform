import type { Context } from 'hono'
import type { Child } from 'hono/jsx'
import { AppLayout } from '../views/layout'
import { isDemo, takeFlash, unreadCount } from './http'
import type { AppEnv } from './types'

/** يعرض صفحة داخل لوحة التحكم مع القائمة وعدد الرسائل غير المقروءة والتنبيه */
export async function page(c: Context<AppEnv>, title: string, body: Child, opts: { scripts?: string[]; status?: number } = {}) {
  const user = c.get('user')!
  const unread = await unreadCount(c.env.DB, user)
  const url = new URL(c.req.url)
  return c.html(
    <AppLayout title={title} user={user} path={url.pathname} unread={unread} flash={takeFlash(c)} scripts={opts.scripts} demo={isDemo(c)}>
      {body}
    </AppLayout>,
    (opts.status ?? 200) as 200,
  )
}

export async function notFound(c: Context<AppEnv>, text = 'العنصر غير موجود أو ليس لديك صلاحية الوصول إليه.') {
  if (!c.get('user')) return c.text(text, 404)
  return page(
    c,
    'غير موجود',
    <div class="card empty">
      <div class="big">🔍</div>
      <p>{text}</p>
      <a class="btn btn-soft" href="/">العودة</a>
    </div>,
    { status: 404 },
  )
}
