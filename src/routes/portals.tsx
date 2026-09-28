/** لوحات المعلمة والطالب */
import { Hono } from 'hono'
import { requireRole } from '../lib/auth'
import { lessonPhase } from '../lib/domain'
import { courseFinances, installmentStates } from '../lib/finance'
import { formatSAR } from '../lib/money'
import { lessonsFor, recordingsFor } from '../lib/queries'
import { page } from '../lib/render'
import { fmtDate, fmtDateTime, fmtRemaining, fmtTime, nowSec } from '../lib/time'
import type { AppEnv } from '../lib/types'
import { Empty, firstName, Money, PageHead, Pager, Stat } from '../views/layout'
import { paginate } from '../lib/paging'
import { Icon } from '../views/icons'
import { assignmentsPage } from './assignments'
import { LessonCard, LessonItem } from './lessons'
import { recordingsPage } from './recordings'

export const portalRoutes = new Hono<AppEnv>()

/** تحية حسب ساعة الرياض */
const greeting = (now: number) => (Math.floor(((now + 3 * 3600) % 86400) / 3600) < 12 ? 'صباح الخير' : 'مساء الخير')
const hm = (sec: number) => fmtTime(sec).replace(/\s?[صم]$/, '')

// ============ المعلمة ============
portalRoutes.get('/teacher', requireRole('teacher'), async (c) => {
  const user = c.get('user')!
  const now = nowSec()
  const [lessons, pendingGrading, fins] = await Promise.all([
    lessonsFor(c.env.DB, user, now - 3 * 3600, now + 7 * 86400),
    c.env.DB.prepare(
      `SELECT COUNT(*) AS n FROM submissions s JOIN assignments a ON a.id = s.assignment_id JOIN courses c ON c.id = a.course_id WHERE c.teacher_id = ? AND s.grade IS NULL`,
    )
      .bind(user.id)
      .first<{ n: number }>(),
    courseFinances(c.env.DB, { teacherId: user.id }),
  ])
  const active = lessons.filter((l) => !['ended', 'cancelled'].includes(lessonPhase(l, now)))
  const today = active.filter((l) => l.starts_at < now + 18 * 3600)
  const students = fins.reduce((s, f) => s + f.students, 0)
  const balance = fins.reduce((s, f) => s + f.teacher_balance, 0)
  const liveNow = active.find((l) => ['live', 'open'].includes(lessonPhase(l, now)))
  return page(
    c,
    'الرئيسية',
    <>
      <div class="hello">
        <div>
          <h1>
            {greeting(now)}، <br class="m-br" />
            <b>أ. {firstName(user.name)}</b>
          </h1>
          <p>
            {today.length ? `عندك ${today.length} حصص اليوم` : 'لا حصص متبقية اليوم'}
            {pendingGrading?.n ? `، و${pendingGrading.n} تسليمات بانتظار التصحيح.` : '.'}
          </p>
        </div>
        <div class="actions btns">
          <a class="btn btn-ghost" href="/teacher/assignments#new">
            <Icon name="plus" /> واجب جديد
          </a>
          <a class="btn" href="/lessons#new">
            <Icon name="calendar-days" /> جدولة حصة
          </a>
        </div>
      </div>
      {liveNow && (
        <section class="panel card-live mt" aria-labelledby="tLive">
          <h2 id="tLive">
            <span class="live-dot" aria-hidden="true"></span>
            {lessonPhase(liveNow, now) === 'live' ? 'حصتك جارية الآن' : 'حصتك تبدأ خلال دقائق'}
          </h2>
          <a class="ls" href={`/lessons/${liveNow.id}`}>
            <span class="tm num">{hm(liveNow.starts_at)}</span>
            <div class="grow">
              <b>{liveNow.title}</b>
              <small>
                {liveNow.course_title} · {liveNow.provider === 'zoom' ? liveNow.room_name : 'بث المنصة'} · {liveNow.students} طالب
              </small>
            </div>
            <span class="btn btn-sm on-panel">{lessonPhase(liveNow, now) === 'live' ? 'العودة' : 'ابدأ'}</span>
          </a>
        </section>
      )}
      <div class="stats mt">
        <Stat href="/lessons" label="حصص اليوم" value={<span class="num">{today.length}</span>} sub={`${active.length} هذا الأسبوع`} />
        <Stat href="/teacher/assignments" label="بانتظار التصحيح" value={<span class="num">{pendingGrading?.n ?? 0}</span>} tone={pendingGrading?.n ? 'warn' : undefined} />
        <Stat label="طلابي" value={<span class="num">{students}</span>} sub={`${fins.length} دورة`} />
        <Stat href="/teacher/earnings" label="مستحقاتي المتبقية" value={<Money v={balance} whole />} />
      </div>
      <div class="sec-title">
        <h2><Icon name="calendar-days" /> حصصي القادمة</h2>
        <a href="/lessons">الجدول الكامل</a>
      </div>
      <div class="lcards">
        {active.filter((l) => l !== liveNow).length ? (
          active
            .filter((l) => l !== liveNow)
            .slice(0, 6)
            .map((l) => <LessonCard l={l} now={now} user={user} />)
        ) : (
          <div class="card">
            <Empty icon="calendar-days" text="لا توجد حصص مجدولة هذا الأسبوع.">
              <a class="btn btn-soft" href="/lessons#new">
                جدولة حصة
              </a>
            </Empty>
          </div>
        )}
      </div>
      {active.length > 7 && (
        <a class="btn btn-ghost btn-block" href="/lessons">
          عرض كل حصص الأسبوع ({active.length})
        </a>
      )}
      <details class="drop faq mt">
        <summary>طريقة تسجيل الحصة</summary>
        <div class="muted" style="font-size:.88rem">
          في غرفة الحصة اضغطي «ابدأ التسجيل» واختاري «هذا التبويب» مع تفعيل «مشاركة صوت التبويب». التسجيل يُرفع تلقائياً أثناء الحصة ويظهر للطلاب 48 ساعة. لحصص الزوم: سجّلي على الجهاز ثم ارفعي الملف من صفحة الحصة.
        </div>
      </details>
    </>,
  )
})

portalRoutes.get('/teacher/lessons', requireRole('teacher'), (c) => c.redirect('/lessons'))
portalRoutes.get('/teacher/assignments', requireRole('teacher'), (c) => assignmentsPage(c))
portalRoutes.get('/teacher/recordings', requireRole('teacher'), (c) => recordingsPage(c))

portalRoutes.get('/teacher/earnings', requireRole('teacher'), async (c) => {
  const user = c.get('user')!
  const fins = await courseFinances(c.env.DB, { teacherId: user.id })
  const payouts = (
    await c.env.DB.prepare(
      `SELECT o.amount, o.paid_on, o.note, c.title FROM payouts o JOIN courses c ON c.id = o.course_id WHERE o.payee_type = 'teacher' AND o.payee_id = ? ORDER BY o.paid_on DESC LIMIT 50`,
    )
      .bind(user.id)
      .all<{ amount: number; paid_on: string; note: string | null; title: string }>()
  ).results
  const due = fins.reduce((s, f) => s + f.teacher_due, 0)
  const paid = fins.reduce((s, f) => s + f.teacher_paid, 0)
  return page(
    c,
    'مستحقاتي',
    <>
      <PageHead title="مستحقاتي" sub="تُحسب تلقائياً من المبالغ المحصّلة فعلياً من طلابك حسب اتفاق كل دورة" />
      <div class="stats">
        <Stat label="إجمالي المستحق" value={<Money v={due} />} />
        <Stat label="تم صرفه" value={<Money v={paid} />} tone="ok" />
        <Stat label="المتبقي لي" value={<Money v={due - paid} />} tone="teal" />
      </div>
      <div class="card">
        <h2>حسب الدورة</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الدورة</th>
                <th>الطلاب</th>
                <th class="money">المستحق</th>
                <th class="money">المصروف</th>
                <th class="money">المتبقي</th>
              </tr>
            </thead>
            <tbody>
              {fins.map((f) => (
                <tr>
                  <td>{f.title}</td>
                  <td>{f.students}</td>
                  <td class="money">
                    <Money v={f.teacher_due} />
                  </td>
                  <td class="money">
                    <Money v={f.teacher_paid} />
                  </td>
                  <td class="money">
                    <b>
                      <Money v={f.teacher_balance} />
                    </b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div class="card">
        <h2>سجل الصرف</h2>
        {payouts.length ? (
          <div class="table-wrap">
            <table>
              <tbody>
                {payouts.map((p) => (
                  <tr>
                    <td>{fmtDate(p.paid_on)}</td>
                    <td>{p.title}</td>
                    <td class="money">
                      <Money v={p.amount} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon="banknote" text="لا توجد عمليات صرف بعد." />
        )}
      </div>
    </>,
  )
})

// ============ الطالب ============
portalRoutes.get('/student', requireRole('student'), async (c) => {
  const user = c.get('user')!
  const now = nowSec()
  const [lessons, recs, asg, insts] = await Promise.all([
    lessonsFor(c.env.DB, user, now - 3 * 3600, now + 7 * 86400),
    recordingsFor(c.env.DB, user),
    c.env.DB.prepare(
      `SELECT a.id, a.title, a.due_at, c.title AS course_title FROM assignments a JOIN courses c ON c.id = a.course_id
       JOIN enrollments e ON e.course_id = a.course_id AND e.student_id = ?1 AND e.status = 'active'
       WHERE (a.due_at IS NULL OR a.due_at > unixepoch()) AND NOT EXISTS (SELECT 1 FROM submissions s WHERE s.assignment_id = a.id AND s.student_id = ?1)
       ORDER BY a.due_at LIMIT 5`,
    )
      .bind(user.id)
      .all<{ id: number; title: string; due_at: number | null; course_title: string }>(),
    installmentStates(c.env.DB, { studentId: user.id }),
  ])
  const active = lessons.filter((l) => !['ended', 'cancelled'].includes(lessonPhase(l, now)))
  const live = active.filter((l) => ['live', 'open'].includes(lessonPhase(l, now)))
  const next = active.filter((l) => !live.includes(l))
  const overdue = insts.filter((i) => i.state === 'overdue')
  return page(
    c,
    'الرئيسية',
    <>
      <div class="hello">
        <div>
          <h1>
            {greeting(now)}، <br class="m-br" />
            <b>{firstName(user.name)}</b>
          </h1>
          <p>{live.length ? 'عندك حصة الآن.' : next.length ? `حصتك القادمة ${fmtDateTime(next[0].starts_at)}` : 'لا توجد حصص قادمة هذا الأسبوع'}</p>
        </div>
      </div>
      {overdue.length > 0 && (
        <div class="alert warn flex mt">
          <Icon name="credit-card" />
          <span>
            عليك قسط متأخر بقيمة <b>{formatSAR(overdue.reduce((s, i) => s + i.remaining, 0))}</b>
          </span>
          <a class="btn btn-sm btn-ghost" href="/student/payments">
            التفاصيل
          </a>
        </div>
      )}
      {live.length > 0 && (
        <section class="panel card-live mt" aria-labelledby="sLive">
          <h2 id="sLive">
            <span class="live-dot" aria-hidden="true"></span>حصتك الآن
          </h2>
          {live.map((l) => (
            <a class="ls" href={`/lessons/${l.id}`}>
              <span class="tm num">{hm(l.starts_at)}</span>
              <div class="grow">
                <b>{l.title}</b>
                <small>{[l.teacher_name, l.course_title, l.provider === 'zoom' ? l.room_name : 'بث المنصة'].filter(Boolean).join(' · ')}</small>
              </div>
              <span class="btn btn-sm on-panel">انضمام</span>
            </a>
          ))}
        </section>
      )}
      <div class="stats mt">
        <Stat label="حصص هذا الأسبوع" value={<span class="num">{active.length}</span>} />
        <Stat href="/student/assignments" label="واجبات مطلوبة" value={<span class="num">{asg.results.length}</span>} tone={asg.results.length ? 'warn' : undefined} />
        <Stat href="/student/recordings" label="تسجيلات متاحة" value={<span class="num">{recs.length}</span>} />
        <Stat href="/student/payments" label="المتبقي عليّ" value={<Money v={insts.reduce((s, i) => s + i.remaining, 0)} whole />} tone={overdue.length ? 'bad' : undefined} />
      </div>
      <div class="grid grid-main">
        <section>
          <div class="sec-title">
            <h2><Icon name="calendar-days" /> حصصي القادمة</h2>
          </div>
          <div class="list">
            {next.length ? next.slice(0, 5).map((l) => <LessonItem l={l} now={now} user={user} compact />) : <Empty icon="calendar-days" text="لا توجد حصص قادمة هذا الأسبوع." />}
          </div>
        </section>
        <section>
          <div class="sec-title">
            <h2><Icon name="notebook-pen" /> واجبات مطلوبة</h2>
            <a href="/student/assignments">الكل</a>
          </div>
          <div class="list">
            {asg.results.length ? (
              asg.results.slice(0, 4).map((a) => (
                <a class="item" href={`/assignments/${a.id}`}>
                  <span class="dot"><Icon name="notebook-pen" /></span>
                  <div class="grow">
                    <div class="title">{a.title}</div>
                    <div class="meta">
                      <span>{a.course_title}</span>
                      {a.due_at && <span>حتى {fmtDateTime(a.due_at)}</span>}
                    </div>
                  </div>
                  <Icon name="chevron-left" class="chev" />
                </a>
              ))
            ) : (
              <Empty icon="party-popper" text="ما عليك واجبات حالياً." />
            )}
          </div>
          <div class="sec-title">
            <h2><Icon name="clapperboard" /> فاتتك حصة؟</h2>
            <a href="/student/recordings">الكل</a>
          </div>
          <div class="list">
            {recs.length ? (
              recs.slice(0, 3).map((r) => (
                <a class="item" href={`/recordings/${r.id}`}>
                  <span class="dot"><Icon name="play" /></span>
                  <div class="grow">
                    <div class="title">{r.lesson_title}</div>
                    <div class="meta">
                      <span>{r.course_title}</span>
                      <span><Icon name="hourglass" /> متاح {fmtRemaining(r.expires_at - now)}</span>
                    </div>
                  </div>
                  <Icon name="chevron-left" class="chev" />
                </a>
              ))
            ) : (
              <Empty icon="clapperboard" text="لا توجد تسجيلات متاحة." />
            )}
          </div>
        </section>
      </div>
    </>,
  )
})

portalRoutes.get('/student/recordings', requireRole('student'), (c) => recordingsPage(c))
portalRoutes.get('/student/assignments', requireRole('student'), (c) => assignmentsPage(c))

const stateLabel = { paid: ['مدفوع', 'ok'], partial: ['مدفوع جزئياً', 'warn'], overdue: ['متأخر', 'bad'], due_soon: ['يستحق قريباً', 'warn'], upcoming: ['قادم', 'gray'] } as const

portalRoutes.get('/student/payments', requireRole('student'), async (c) => {
  const user = c.get('user')!
  const insts = await installmentStates(c.env.DB, { studentId: user.id })
  const pays = (
    await c.env.DB.prepare(
      `SELECT y.amount, y.paid_on, c.title FROM payments y JOIN enrollments e ON e.id = y.enrollment_id JOIN courses c ON c.id = e.course_id WHERE e.student_id = ? ORDER BY y.paid_on DESC`,
    )
      .bind(user.id)
      .all<{ amount: number; paid_on: string; title: string }>()
  ).results
  const remaining = insts.reduce((s, i) => s + i.remaining, 0)
  const { items: payPage, info: payInfo } = paginate(pays, c.req.url, 10)
  return page(
    c,
    'مدفوعاتي',
    <>
      <PageHead title="مدفوعاتي" sub="جدول الأقساط والتحويلات المسجلة" />
      <div class="stats">
        <Stat label="المدفوع" value={<Money v={pays.reduce((s, p) => s + p.amount, 0)} />} tone="ok" />
        <Stat label="المتبقي" value={<Money v={remaining} />} tone={remaining ? 'warn' : 'ok'} />
      </div>
      <div class="card">
        <h2>الأقساط</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الدورة</th>
                <th>الاستحقاق</th>
                <th class="money">المبلغ</th>
                <th class="money">المتبقي</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {insts.map((i) => (
                <tr>
                  <td>{i.course_title}</td>
                  <td>{fmtDate(i.due_date)}</td>
                  <td class="money">
                    <Money v={i.amount} />
                  </td>
                  <td class="money">
                    <Money v={i.remaining} />
                  </td>
                  <td>
                    <span class={`badge ${stateLabel[i.state][1]}`}>{stateLabel[i.state][0]}</span>
                  </td>
                </tr>
              ))}
              {!insts.length && (
                <tr>
                  <td colspan={5} class="muted">
                    لا توجد أقساط.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p class="muted mt" style="font-size:.85rem">
          بعد التحويل أرسل صورة الإيصال للإدارة من صفحة <a href="/messages">الرسائل</a>.
        </p>
      </div>
      <div class="card">
        <h2>التحويلات المسجلة</h2>
        {pays.length ? (
          <div class="table-wrap">
            <table>
              <tbody>
                {payPage.map((p) => (
                  <tr>
                    <td>{fmtDate(p.paid_on)}</td>
                    <td>{p.title}</td>
                    <td class="money">
                      <Money v={p.amount} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon="credit-card" text="لا توجد تحويلات." />
        )}
        {pays.length > 0 && <Pager info={payInfo} url={c.req.url} />}
      </div>
    </>,
  )
})
