/** سلوكيات عامة: القائمة الجانبية على الجوال، تأكيد النماذج، تعطيل الزر أثناء الإرسال */
const side = document.getElementById('side')
const backdrop = document.getElementById('backdrop')
const toggle = (open) => {
  side?.classList.toggle('open', open)
  backdrop?.classList.toggle('show', open)
}
document.getElementById('menuBtn')?.addEventListener('click', () => toggle(!side.classList.contains('open')))
backdrop?.addEventListener('click', () => toggle(false))

document.addEventListener('submit', (e) => {
  const f = e.target
  if (f.dataset.confirm && !confirm(f.dataset.confirm)) {
    e.preventDefault()
    return
  }
  const btn = f.querySelector('button[type=submit], button:not([type])')
  if (btn) setTimeout(() => (btn.disabled = true), 0)
})

// الرسائل: التمرير لآخر رسالة + إرسال بـ Enter
const msgs = document.getElementById('msgs')
if (msgs) msgs.scrollTop = msgs.scrollHeight
document.querySelectorAll('textarea[data-enter-submit]').forEach((t) =>
  t.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && window.innerWidth > 760) {
      e.preventDefault()
      t.form.requestSubmit()
    }
  }),
)

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
