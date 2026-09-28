/** سلوكيات عامة: قائمة الحساب، البحث السريع، الثيم، الإشعارات، تأكيد النماذج، حالة التحميل، الرسائل، PWA */
const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]

const scrim = $('#backdrop')
scrim?.addEventListener('click', () => closeAcct())

// ---- قائمة الحساب (منبثقة على سطح المكتب، ورقة سفلية على الجوال) ----
const acctBtn = $('#acctBtn'), acctMenu = $('#acctMenu')
const isSheet = () => matchMedia('(max-width: 699px)').matches
function openAcct() {
  if (!acctMenu) return
  acctMenu.hidden = false
  acctBtn?.setAttribute('aria-expanded', 'true')
  if (isSheet()) scrim?.classList.add('show')
  $('[role=menuitem]', acctMenu)?.focus({ preventScroll: true })
}
function closeAcct() {
  if (!acctMenu || acctMenu.hidden) return
  acctMenu.hidden = true
  acctBtn?.setAttribute('aria-expanded', 'false')
  scrim?.classList.remove('show')
}
acctBtn?.addEventListener('click', (e) => { e.stopPropagation(); acctMenu.hidden ? openAcct() : closeAcct() })
document.addEventListener('click', (e) => { if (acctMenu && !acctMenu.hidden && !acctMenu.contains(e.target)) closeAcct() })
acctMenu?.addEventListener('keydown', (e) => {
  const items = $$('[role=menuitem]', acctMenu)
  const i = items.indexOf(document.activeElement)
  if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length]?.focus() }
  if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length]?.focus() }
})
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && acctMenu && !acctMenu.hidden) { closeAcct(); acctBtn?.focus() } })

// ---- البحث والانتقال السريع (Ctrl/⌘+K أو زر البحث) ----
const sDlg = $('#searchDlg'), sIn = $('#searchInput'), sEmpty = $('#searchEmpty')
const sItems = () => $$('.search-item', sDlg).filter((a) => !a.hidden)
const openSearch = () => { if (!sDlg) return; sIn.value = ''; filterSearch(); sDlg.showModal(); sIn.focus() }
function filterSearch() {
  const q = sIn.value.trim()
  let n = 0
  $$('.search-item', sDlg).forEach((a) => { const hit = !q || a.textContent.includes(q); a.hidden = !hit; a.classList.remove('sel'); if (hit) n++ })
  $$('.search-sec', sDlg).forEach((h) => { h.hidden = !!q })
  sEmpty.hidden = n > 0
  sItems()[0]?.classList.add('sel')
}
$('#searchBtn')?.addEventListener('click', openSearch)
sIn?.addEventListener('input', filterSearch)
sIn?.addEventListener('keydown', (e) => {
  const items = sItems(), i = items.findIndex((a) => a.classList.contains('sel'))
  const move = (d) => { e.preventDefault(); items[i]?.classList.remove('sel'); const n = items[(i + d + items.length) % items.length]; n?.classList.add('sel'); n?.scrollIntoView({ block: 'nearest' }) }
  if (e.key === 'ArrowDown') move(1)
  if (e.key === 'ArrowUp') move(-1)
  if (e.key === 'Enter' && items[i]) { e.preventDefault(); location.href = items[i].href }
})
sDlg?.addEventListener('click', (e) => { if (e.target === sDlg) sDlg.close() })
document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && sDlg) { e.preventDefault(); sDlg.open ? sDlg.close() : openSearch() } })

// ---- الوضع الليلي ----
const toggleTheme = () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  const apply = () => {
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('theme', next) } catch {}
  }
  document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches ? document.startViewTransition(apply) : apply()
}
$('#themeBtn')?.addEventListener('click', toggleTheme)
$$('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => { toggleTheme(); closeAcct() }))

// ---- فتح نموذج الإضافة عبر الرابط (#new) — مثل زر «جدولة حصة» ----
const openNew = () => {
  if (location.hash !== '#new') return
  const d = document.getElementById('new')
  if (d?.tagName === 'DETAILS') { d.open = true; d.scrollIntoView({ block: 'start' }); d.querySelector('input:not([type=hidden]), select, textarea')?.focus({ preventScroll: true }) }
}
openNew()
addEventListener('hashchange', openNew)

// ---- صفوف قابلة للنقر بالكامل (data-href) مع بقاء الأزرار الداخلية تعمل ----
document.addEventListener('click', (e) => {
  const row = e.target.closest('[data-href]')
  if (!row || e.target.closest('a, button, input, select, textarea, label, form')) return
  location.href = row.dataset.href
})

// ---- إخفاء العنوان المكرر على الجوال (الرأس يعرض اسم الصفحة) ----
const leaf = $('.m-title')?.textContent.trim()
const h1 = $('.page-head h1')
if (leaf && h1 && h1.textContent.trim() === leaf) h1.closest('.page-head').classList.add('dup')

// ---- الإشعارات المنبثقة ----
const dismiss = (t) => { t.classList.add('out'); setTimeout(() => t.remove(), 250) }
$$('[data-toast]').forEach((t) => {
  t.querySelector('[data-close]')?.addEventListener('click', () => dismiss(t))
  setTimeout(() => t.isConnected && dismiss(t), 5500)
})

// ---- النماذج: تأكيد + حالة تحميل (يمنع الإرسال المزدوج) ----
document.addEventListener('submit', (e) => {
  const f = e.target
  if (f.dataset.confirm && !confirm(f.dataset.confirm)) { e.preventDefault(); return }
  const btn = e.submitter || f.querySelector('button:not([type=button])')
  if (btn && !f.hasAttribute('data-no-loading')) setTimeout(() => { btn.disabled = true; btn.classList.add('loading') }, 0)
})
// إعادة تفعيل الأزرار عند الرجوع للصفحة من ذاكرة المتصفح
addEventListener('pageshow', (e) => e.persisted && $$('.btn.loading').forEach((b) => { b.disabled = false; b.classList.remove('loading') }))

// ---- الرسائل ----
const msgs = $('#msgs')
if (msgs) msgs.scrollTop = msgs.scrollHeight
$$('textarea[data-enter-submit]').forEach((t) => {
  const grow = () => { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 140) + 'px' }
  t.addEventListener('input', grow)
  t.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && innerWidth > 760) { e.preventDefault(); t.value.trim() && t.form.requestSubmit() }
  })
})

// ---- إظهار كلمة المرور ----
$$('[data-pw-toggle]').forEach((b) => b.addEventListener('click', () => {
  const i = document.getElementById(b.dataset.pwToggle)
  i.type = i.type === 'password' ? 'text' : 'password'
  b.setAttribute('aria-pressed', String(i.type === 'text'))
}))

// ---- عدّاد الأرقام (للمؤشرات) ----
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
if (!reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (!en.isIntersecting) return
    io.unobserve(en.target)
    const el = en.target, end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length, t0 = performance.now(), d = 1100
    const step = (t) => {
      const p = Math.min(1, (t - t0) / d), v = end * (1 - Math.pow(1 - p, 3))
      el.textContent = v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
      p < 1 && requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }), { threshold: .4 })
  $$('[data-count]').forEach((el) => io.observe(el))
}

// ---- الجداول ⇐ بطاقات على الجوال ----
// ينسخ عنوان كل عمود إلى خلاياه (data-label) لتعرضها CSS كبطاقة «العنوان: القيمة».
// تحسين تدريجي: بدون JS يبقى الجدول قابلاً للتمرير أفقياً. استثناء: .keep-table
$$('.table-wrap > table:not(.keep-table)').forEach((t) => {
  const heads = $$('thead th', t).map((th) => th.textContent.trim())
  if (!heads.length) return
  t.classList.add('rt')
  $$('tbody tr', t).forEach((tr) => {
    const cells = [...tr.children]
    if (cells.length === 1) { tr.classList.add('rt-full'); return }
    cells.forEach((td, i) => {
      const h = heads[i] ?? ''
      if (h) td.dataset.label = h
      else td.classList.add(i === 0 ? 'rt-title' : 'rt-actions')
    })
    cells[0]?.classList.add('rt-title')
  })
  // صف الإجمالي: نطابق كل خلية مع عمودها مع احتساب colspan
  $$('tfoot tr', t).forEach((tr) => {
    let col = 0
    ;[...tr.children].forEach((td, i) => {
      if (i === 0) td.classList.add('rt-title')
      else if (heads[col]) td.dataset.label = heads[col]
      col += td.colSpan || 1
    })
  })
})

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
