import { Head } from './layout'

const features = [
  { i: '🎥', t: 'حصص مباشرة داخل المنصة', d: 'المعلمة تشرح والطالب يتفاعل صوت وصورة، من الجوال أو الآيباد أو اللابتوب بدون تطبيقات.' },
  { i: '⏪', t: 'فاتك الدرس؟ ارجع له', d: 'كل حصة تتسجل وتبقى متاحة 48 ساعة للطلاب المسجلين فقط، محمية باسم الطالب.' },
  { i: '📝', t: 'واجبات ومتابعة', d: 'واجبات بعد كل درس، تسليم إلكتروني، وتصحيح وملاحظات من المعلمة مباشرة.' },
  { i: '💬', t: 'تواصل آمن داخل المنصة', d: 'كل التواصل بين الطالب والمعلمة والإدارة داخل المنصة. خصوصية كاملة بدون أرقام شخصية.' },
  { i: '👩‍🏫', t: 'معلمات متميزات', d: 'نخبة من المعلمات المتخصصات بخبرة في التدريس وأساليب تفاعلية ممتعة.' },
  { i: '👨‍👩‍👧', t: 'ولي الأمر في الصورة', d: 'متابعة الحضور والواجبات والمستوى أولاً بأول، وتقارير واضحة.' },
]

const subjects = ['الرياضيات', 'اللغة الإنجليزية', 'العلوم', 'الفيزياء', 'الكيمياء', 'اللغة العربية', 'القدرات والتحصيلي', 'التأسيس والقراءة']

const faqs = [
  { q: 'كيف تتم الحصص؟', a: 'الحصص مباشرة (بث حي) داخل المنصة. يدخل الطالب بحسابه ويضغط «دخول الحصة» في وقتها، ويتفاعل مع المعلمة صوت وصورة.' },
  { q: 'إذا فاتت الطالب حصة؟', a: 'تتسجل الحصة وتبقى متاحة 48 ساعة في حساب الطالب، يشاهدها من أي جهاز. التسجيل محمي ولا يمكن تحميله.' },
  { q: 'كم عدد الطلاب في الفصل؟', a: 'فصولنا صغيرة من 2 إلى 7 طلاب، عشان كل طالب ياخذ حقه من الاهتمام والمشاركة.' },
  { q: 'هل أحتاج تطبيق؟', a: 'لا، المنصة تعمل من المتصفح مباشرة، وتقدر تثبتها على شاشة الجوال كتطبيق بضغطة واحدة.' },
  { q: 'كيف الدفع؟', a: 'بالتحويل البنكي، ومتاح التقسيط حسب الدورة. تواصل معنا لمعرفة الأسعار والعروض الحالية.' },
]

export function Landing({ sent }: { sent?: 'ok' | 'bad' }) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'منصة إضاءات التعليمية',
    description: 'دروس تقوية مباشرة أونلاين بفصول صغيرة، مع تسجيلات وواجبات ومتابعة.',
    areaServed: 'SA',
  }
  return (
    <html lang="ar" dir="rtl">
      <Head title="إضاءات | دروس تقوية مباشرة أونلاين بفصول صغيرة" description="منصة إضاءات التعليمية: حصص تقوية مباشرة مع معلمات متميزات، فصول صغيرة من 2 إلى 7 طلاب، تسجيل الحصص، واجبات، ومتابعة لولي الأمر." />
      <body class="landing">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />
        <header class="l-nav">
          <div class="wrap flex between">
            <a href="/" class="l-brand">
              <span class="logo">إ</span> إضاءات
            </a>
            <nav class="l-links hide-sm">
              <a href="#features">المميزات</a>
              <a href="#how">كيف نعمل</a>
              <a href="#subjects">المواد</a>
              <a href="#faq">الأسئلة</a>
            </nav>
            <div class="flex">
              <a href="/login" class="btn btn-ghost">دخول</a>
              <a href="#book" class="btn btn-accent hide-sm">احجز حصة مجانية</a>
            </div>
          </div>
        </header>

        <section class="hero">
          <div class="wrap hero-grid">
            <div>
              <span class="pill">✨ فصول صغيرة • متابعة حقيقية</span>
              <h1>
                دروس تقوية <span class="hl">مباشرة</span>
                <br />
                تصنع الفرق في مستوى ابنك
              </h1>
              <p class="lead">حصص حيّة مع معلمات متميزات، فصول من 2 إلى 7 طلاب، تسجيل لكل حصة، وواجبات ومتابعة — كل شيء في منصة واحدة وبدون واتساب.</p>
              <div class="flex">
                <a href="#book" class="btn btn-accent btn-lg">احجز حصة تجريبية مجانية</a>
                <a href="/login" class="btn btn-ghost btn-lg" style="background:#fff">دخول المنصة</a>
              </div>
              <div class="trust">
                <div><b>14+</b><span>معلمة متخصصة</span></div>
                <div><b>2–7</b><span>طلاب في الفصل</span></div>
                <div><b>48h</b><span>تسجيل لكل حصة</span></div>
              </div>
            </div>
            <div class="mock" aria-hidden="true">
              <div class="mock-top">
                <span class="badge live">مباشر</span>
                <b>الرياضيات — الصف الثالث المتوسط</b>
              </div>
              <div class="mock-stage">
                <div class="board">
                  <div class="eq">س² + ٥س + ٦ = ٠</div>
                  <div class="eq sm">(س + ٢)(س + ٣) = ٠</div>
                </div>
                <div class="tiles">
                  {['أ. نورة', 'ريم', 'سارة', 'جود'].map((n, i) => (
                    <div class={`tile t${i}`}>
                      <span>{n.replace('أ. ', '').charAt(0)}</span>
                      <small>{n}</small>
                    </div>
                  ))}
                </div>
              </div>
              <div class="mock-bar">
                <span>🎙️</span>
                <span>📷</span>
                <span>✋</span>
                <span>💬</span>
                <span class="end">إنهاء</span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" class="sec">
          <div class="wrap">
            <h2 class="sec-title">كل اللي يحتاجه الطالب في مكان واحد</h2>
            <p class="sec-sub">صممنا المنصة عشان يركز الطالب على التعلم، والمعلمة على الشرح، وولي الأمر يطمئن.</p>
            <div class="f-grid">
              {features.map((f) => (
                <div class="f-card">
                  <div class="f-ico">{f.i}</div>
                  <h3>{f.t}</h3>
                  <p>{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" class="sec alt">
          <div class="wrap">
            <h2 class="sec-title">كيف نبدأ؟</h2>
            <div class="steps">
              {[
                ['1', 'احجز حصة تجريبية', 'عبّي النموذج ونتواصل معك خلال يوم عمل.'],
                ['2', 'نحدد المستوى', 'نقيّم مستوى الطالب ونختار الفصل المناسب له.'],
                ['3', 'ابدأ الحصص', 'تستلم حسابك وتدخل حصصك المباشرة من أي جهاز.'],
                ['4', 'تابع التقدم', 'تسجيلات وواجبات وتقارير مستمرة لولي الأمر.'],
              ].map(([n, t, d]) => (
                <div class="step">
                  <span class="n">{n}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="subjects" class="sec">
          <div class="wrap">
            <h2 class="sec-title">المواد والمسارات</h2>
            <div class="chips">
              {subjects.map((s) => (
                <span class="chip">{s}</span>
              ))}
            </div>
          </div>
        </section>

        <section id="book" class="sec book">
          <div class="wrap book-grid">
            <div>
              <h2>احجز حصتك التجريبية المجانية</h2>
              <p>اترك بياناتك وتتواصل معك الإدارة لتحديد موعد الحصة التجريبية ومستوى الطالب.</p>
              <ul class="checks">
                <li>بدون أي التزام</li>
                <li>تقييم مستوى مجاني</li>
                <li>تجربة المنصة كاملة</li>
              </ul>
            </div>
            <form method="post" action="/lead" class="card book-form">
              {sent === 'ok' && <div class="alert ok">تم استلام طلبك ✅ بنتواصل معك قريباً بإذن الله.</div>}
              {sent === 'bad' && <div class="alert bad">تأكد من الاسم ورقم الجوال (05xxxxxxxx).</div>}
              <div class="field">
                <label for="l-name">اسم الطالب</label>
                <input id="l-name" name="name" required maxlength={80} autocomplete="name" />
              </div>
              <div class="field">
                <label for="l-phone">جوال ولي الأمر</label>
                <input id="l-phone" name="phone" required inputmode="tel" dir="ltr" placeholder="05xxxxxxxx" autocomplete="tel" />
              </div>
              <div class="form-grid">
                <div class="field">
                  <label for="l-grade">الصف</label>
                  <select id="l-grade" name="grade">
                    {['ابتدائي', 'متوسط', 'ثانوي', 'جامعي', 'أخرى'].map((g) => (
                      <option>{g}</option>
                    ))}
                  </select>
                </div>
                <div class="field">
                  <label for="l-sub">المادة</label>
                  <select id="l-sub" name="subject">
                    {subjects.map((s) => (
                      <option>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <input type="text" name="website" class="sr-only" tabindex={-1} autocomplete="off" aria-hidden="true" />
              <button class="btn btn-accent btn-lg btn-block">أرسل الطلب</button>
            </form>
          </div>
        </section>

        <section id="faq" class="sec">
          <div class="wrap narrow">
            <h2 class="sec-title">أسئلة شائعة</h2>
            {faqs.map((f) => (
              <details class="drop">
                <summary>{f.q}</summary>
                <div>{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        <footer class="l-foot">
          <div class="wrap flex between">
            <div class="l-brand">
              <span class="logo">إ</span> إضاءات
            </div>
            <small>© {new Date().getFullYear()} منصة إضاءات التعليمية — جميع الحقوق محفوظة</small>
          </div>
        </footer>
        <a href="#book" class="float-cta">احجز حصة مجانية</a>
      </body>
    </html>
  )
}

const LANDING_CSS = `
.landing{background:#fff}
.wrap{max-width:1180px;margin:0 auto;padding:0 1.25rem}.narrow{max-width:780px}
.l-nav{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.9);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);padding:.7rem 0}
.l-brand{display:flex;align-items:center;gap:.55rem;font-weight:800;font-size:1.25rem;color:var(--ink);text-decoration:none!important}
.l-links{display:flex;gap:1.6rem}.l-links a{color:var(--ink-2);font-weight:600}
.hero{background:radial-gradient(900px 500px at 90% -10%,#e7e1ff,transparent),radial-gradient(700px 420px at 0% 110%,#fff0d2,transparent);padding:3.5rem 0 4rem;overflow:hidden}
.hero-grid{display:grid;grid-template-columns:1.05fr 1fr;gap:3rem;align-items:center}
.pill{display:inline-block;background:#fff;border:1px solid #e3ddff;color:var(--brand);font-weight:700;font-size:.85rem;padding:.3rem .9rem;border-radius:99px;margin-bottom:1rem}
.hero h1{font-size:clamp(2rem,4.4vw,3.2rem);font-weight:800;line-height:1.3;margin-bottom:1rem}
.hl{background:linear-gradient(90deg,var(--brand),#9b5cff);-webkit-background-clip:text;background-clip:text;color:transparent}
.lead{font-size:1.12rem;color:var(--ink-2);max-width:560px;margin-bottom:1.6rem}
.trust{display:flex;gap:2rem;margin-top:2rem;flex-wrap:wrap}.trust div{display:flex;flex-direction:column}.trust b{font-size:1.6rem;color:var(--brand);direction:ltr;text-align:right}.trust span{color:var(--muted);font-size:.88rem}
.mock{background:#14173a;border-radius:22px;box-shadow:var(--shadow-lg);padding:1rem;color:#fff;transform:rotate(-1.5deg)}
.mock-top{display:flex;gap:.7rem;align-items:center;padding:.2rem .3rem .8rem;font-size:.9rem}
.mock-stage{display:grid;grid-template-columns:1fr 120px;gap:.7rem}
.board{background:linear-gradient(160deg,#1f5a4a,#17443a);border-radius:14px;min-height:230px;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:.6rem;border:6px solid #6b4a2b}
.eq{font-size:1.5rem;font-weight:700;color:#f3f7e9}.eq.sm{font-size:1.1rem;color:#ffe08a}
.tiles{display:grid;gap:.5rem}.tile{border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:.4rem;min-height:52px}
.tile span{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.2);display:grid;place-items:center;font-weight:800}.tile small{font-size:.68rem;opacity:.85}
.t0{background:#5b3df5}.t1{background:#10b3a3}.t2{background:#e5484d}.t3{background:#d98b00}
.mock-bar{display:flex;gap:.6rem;justify-content:center;padding-top:.8rem}.mock-bar span{background:rgba(255,255,255,.1);border-radius:10px;padding:.35rem .7rem}.mock-bar .end{background:#e5484d}
.sec{padding:4.5rem 0}.sec.alt{background:var(--bg)}
.sec-title{text-align:center;font-size:clamp(1.5rem,3vw,2.1rem);font-weight:800}
.sec-sub{text-align:center;color:var(--muted);max-width:620px;margin:0 auto 2.5rem}
.f-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.25rem}
.f-card{border:1px solid var(--line);border-radius:18px;padding:1.5rem;transition:.2s;background:#fff}.f-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg);border-color:#dcd4ff}
.f-ico{width:54px;height:54px;border-radius:14px;background:var(--brand-50);display:grid;place-items:center;font-size:1.6rem;margin-bottom:1rem}
.f-card p{color:var(--ink-2);margin:0}
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:1.25rem;margin-top:2rem}
.step{background:#fff;border-radius:18px;padding:1.5rem;border:1px solid var(--line)}.step .n{width:40px;height:40px;border-radius:50%;background:var(--brand);color:#fff;display:grid;place-items:center;font-weight:800;margin-bottom:.8rem}.step p{color:var(--ink-2);margin:0}
.chips{display:flex;flex-wrap:wrap;gap:.7rem;justify-content:center;margin-top:1.5rem}.chip{padding:.6rem 1.2rem;border-radius:99px;background:var(--brand-50);color:var(--brand);font-weight:700}
.book{background:linear-gradient(135deg,#2a1d8f,#5b3df5);color:#fff}
.book-grid{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center}.book h2{font-size:2rem}.book p{color:#dcd6ff;font-size:1.05rem}
.checks{list-style:none;padding:0}.checks li{padding:.3rem 0}.checks li::before{content:'✓';background:var(--accent);color:#2b1a00;border-radius:50%;width:22px;height:22px;display:inline-grid;place-items:center;margin-left:.6rem;font-weight:800;font-size:.8rem}
.book-form{color:var(--ink);margin:0;box-shadow:var(--shadow-lg)}
.l-foot{padding:2rem 0;border-top:1px solid var(--line)}
.float-cta{display:none}
@media(max-width:900px){.hero-grid,.book-grid{grid-template-columns:1fr}.mock{transform:none}.hero{padding:2rem 0 3rem}.sec{padding:3rem 0}
.float-cta{display:block;position:fixed;bottom:1rem;inset-inline:1rem;z-index:40;text-align:center;background:var(--accent);color:#2b1a00;font-weight:800;padding:.9rem;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.2);text-decoration:none!important}
.l-foot{padding-bottom:5rem}}
`
