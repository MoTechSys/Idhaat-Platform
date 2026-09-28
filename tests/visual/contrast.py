"""فحص تباين النص الفعلي (WCAG AA ≥ 4.5:1 للنص العادي، ≥ 3:1 للكبير ≥ 18.66px عريض أو 24px) في الوضعين.
الاستخدام: python3 tests/visual/contrast.py"""
import os, sys
from playwright.sync_api import sync_playwright
BASE = os.environ.get('BASE', 'http://localhost:3000')
PAGES = [('0500000001', ['/admin', '/admin/finance', '/admin/finance/installments', '/admin/live', '/lessons', '/admin/users?role=student', '/admin/courses/1']),
         ('0510000001', ['/teacher', '/lessons/1']), ('0550000001', ['/student', '/student/payments', '/messages?with=3'])]
JS = r'''() => {
  const lum = (c) => { const [r,g,b] = c.map(v => { v /= 255; return v <= .03928 ? v/12.92 : ((v+.055)/1.055)**2.4 }); return .2126*r+.7152*g+.0722*b }
  const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0],p[1],p[2],p[3] ?? 1] }
  const bgOf = (el) => { let layers = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c[3] > 0) { layers.push(c); if (c[3] >= 1) break } }
    let out = [255,255,255]; for (const c of layers.reverse()) out = out.map((v,i) => v*(1-c[3]) + c[i]*c[3]); return out }
  const bad = []
  for (const el of document.querySelectorAll('body *')) {
    if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < .5) continue
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue
    if (el.closest('[aria-hidden=true], .watermark, [hidden], dialog:not([open]), .menu[hidden], .m-only, .toptabs')) { if (!el.closest('.toptabs')) continue }
    if (el.closest('.btn:disabled, .pg.off')) continue
    const fg = parse(cs.color); if (!fg) continue
    const bg = bgOf(el); const f = fg.slice(0,3).map((v,i) => v*fg[3] + bg[i]*(1-fg[3]))
    const L1 = lum(f), L2 = lum(bg); const ratio = (Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05)
    const size = parseFloat(cs.fontSize), w = +cs.fontWeight; const large = size >= 24 || (size >= 18.66 && w >= 600)
    if (ratio < (large ? 3 : 4.5)) bad.push(`${ratio.toFixed(2)} ${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${el.textContent.trim().slice(0,30)}"`)
  }
  return [...new Set(bad)]
}'''
fails = 0
with sync_playwright() as p:
  b = p.chromium.launch()
  for scheme in ['light', 'dark']:
    for vp in [{'width': 1440, 'height': 900}, {'width': 390, 'height': 844}]:
      for phone, paths in PAGES:
        c = b.new_context(viewport=vp, color_scheme=scheme, reduced_motion='reduce', locale='ar-SA')
        pg = c.new_page(); pg.goto(BASE + '/login'); pg.fill('#phone', phone); pg.fill('#password', 'demo1234'); pg.click('button.btn-block'); pg.wait_for_load_state('networkidle')
        for path in paths:
          pg.goto(BASE + path, wait_until='networkidle'); pg.wait_for_timeout(150)
          for x in pg.evaluate(JS): fails += 1; print(scheme, vp['width'], path, x)
        c.close()
  b.close()
print('contrast problems:', fails)
sys.exit(1 if fails else 0)
