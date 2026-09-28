# وثيقة التسليم (Handoff) — منصة إضاءات

> آخر تحديث: 2026-09-28 · الفرع: `genspark_ai_developer` · PR مفتوح: https://github.com/MoTechSys/Idhaat-Platform/pull/2
> اقرأ هذا الملف أولاً ثم `README.md` و`docs/07-design-system.md`.

## 1. المشروع باختصار
- **التقنية**: Hono (TSX SSR) على Cloudflare Pages Functions + D1 (SQLite) + R2. البناء Vite ⇐ `dist/_worker.js`.
- **التشغيل محلياً**:
  ```bash
  npm install
  npm run db:reset        # ينشئ قاعدة محلية + بيانات تجريبية (زمنية نسبية لليوم)
  npm run build
  npx wrangler pages dev dist --port 3000   # أو: pm2 start ecosystem.config.cjs
  ```
- **حسابات التجربة** (كلمة المرور `demo1234`): إدارة `0500000001` · معلمة `0510000001` · طالب `0550000001`.
- **الاختبارات**: `npm test` (48) · `npm run typecheck` · `bash tests/e2e.sh` (120 فحص، يحتاج الخادم على 3000)
  · `python3 tests/visual/shoot.py /tmp/shots [--dark] [--only=admin,messages]` · `tests/visual/crawl.py` · `tests/visual/contrast.py`.
- **ثوابت لا تُمس**: `csrfGuard`، `requireRole`، كوكي الجلسة `edaat_sid`، المال بالهللات (`Money({v})`)، توقيت الرياض UTC+3، توزيع الأقساط FIFO.

## 2. خريطة الملفات المهمة
| الملف | الدور |
|---|---|
| `src/views/layout.tsx` | الهيكل `AppLayout` (شريط علوي، تبويبات فرعية، `main.content`، شريط سفلي للجوال، قائمة الحساب، نافذة البحث) + مكونات `Stat`, `Money`, `AreaChart`, `Avatar`, `PageHead`, `Pager`… و`ASSET_V` (ارفعه عند تغيير CSS/JS) |
| `src/views/nav.ts` | الأقسام لكل دور (`sectionsFor`, `resolveNav`) — ≤6 أقسام، ≤5 في الجوال (مختبر) |
| `public/static/app.css` | نظام التصميم v4 كاملاً (توكنز، هيكل، مكونات) — بلا تدرجات (مختبر في `tests/design.test.ts`) |
| `public/static/app.js` | سلوكيات عامة: قائمة الحساب، البحث Ctrl+K، الثيم، `#new`، الجداول ⇐ بطاقات على الجوال |
| `src/routes/admin.tsx` | لوحة الإدارة `/admin` (`div.dash`) |
| `src/routes/portals.tsx` | لوحتا المعلمة `/teacher` والطالب `/student` |
| `src/routes/finance.tsx` | `/admin/finance` (`.fin-top`, `.fin-hero`, `.dues-grid`, جدول الربح) |
| `src/routes/messages.tsx` | `/messages` (`.chat` > `.people` + `.thread`) |
| `src/views/landing.tsx` + `public/static/landing.css` | الموقع التعريفي (بطل «دروس تقوية مباشرة…») |
| `desktop_reference.html`, `mobile_reference.html` | المراجع البصرية لتصميم v4 |

## 3. ما أُنجز
- v3 (PR #1، مدموج) ثم v4 «دافئ تحريري» (PR #2، مفتوح).
- **في هذه الجلسة (طلب الرسائل الصوتية للعميل) — بدأ التنفيذ:**
  1. ✅ **الخط**: استبدال Alexandria + IBM Plex بخط واحد **Readex Pro** متغيّر (160–700)، مستضاف ذاتياً
     (`public/static/fonts/readex-pro-{arabic,latin}-wght-normal.woff2`). السبب: قورن بصرياً مع Noto Kufi وAlmarai وTajawal وCairo وEl Messiri وPlex؛
     Readex أوضح وأفخم للواجهات وملف واحد لكل الأوزان.
  2. ✅ **سلّم خطوط موحّد** كتوكنز `--fs-xs 12 … --fs-3xl 34` في `:root`، وتحويل كل الأحجام الصغيرة (10–11.5px ⇐ 12px، 12.5 ⇐ 13، 13.5 ⇐ 14).
  3. ✅ إزالة كل `letter-spacing` السالب (يكسر اتصال الحروف العربية).
  4. ✅ تحديث preload الخط في `Head` و`ASSET_V = '7'`. كل الاختبارات خضراء.

## 4. المطلوب المتبقي (من رسائل العميل الصوتية) — بالترتيب المقترح
متطلبات العميل حرفياً: «الشاشة الرئيسية متكاملة فاخرة، ما في داعي ينزل تحت أبداً» · «البيانات تكون في لستة scroll والأشياء الثابتة ما تختفي» ·
«الخط بعضه صغير وغير متناسق» · «الصفحات كأنها موقع إداري داخلي، أبغاها كتطبيق/لوحة تحكم» · «فراغات وأزرار فيها مساحات فاضية كبيرة» ·
«صفحة المالية والرسائل تكون منظمة ومتكاملة» · «في الهاتف ما فيه زر تغيير الوضع فوق، وكذلك تغيير اللغة» · «وثّق كل شيء، أعلى معايير ونظافة كود».

1. **هيكل تطبيق ثابت (لا تمرير للصفحة كاملة)** — `app.css`:
   - `html:has(body.app-body), body.app-body { height:100dvh; overflow:hidden }`، والـbody عمود flex: `.topbar` و`.subnav` ثابتان (`flex:none`)،
     `main.content { flex:1; min-height:0; overflow-y:auto; overscroll-behavior:contain }`، و`.tabbar` في الجوال يصبح جزءاً من العمود بدل `position:fixed`
     (واحذف `padding-bottom` الكبير في `.content`).
   - انتبه: `app.js` يستخدم `scrollIntoView` لـ`#new` (يعمل داخل الحاوية)، و`th { position: sticky }` سيعمل داخل `.content`.
   - الرسائل: `.chat { height:100% }` بدل حسابات `calc(100dvh - …)`.
2. **الرئيسية بلا تمرير نهائياً (سطح المكتب والجوال)**:
   - `body.is-home .content { overflow:hidden; display:flex }`، و`.dash` يملأ الارتفاع (`grid-template-rows: auto 1fr …`)، واللوحات (على الهواء، الأقساط المتأخرة، لاحقاً اليوم)
     تأخذ `min-height:0; overflow-y:auto` داخلياً، والرسم البياني يتمدد بـ`flex:1` (اجعل `AreaChart` يقبل `height="100%"`).
   - **الجوال**: ترحيب مختصر في سطر واحد، شبكة 2×2 من المؤشرات الصغيرة (المحصّل، المتأخرات، الحصص المباشرة، الطلاب) مع عدّاد متحرك (`data-count` موجود في app.js)،
     ثم بطاقة واحدة بتبويبات (مباشر الآن / لاحقاً / متأخرات) قائمتها تتمرر داخلياً، بحيث يكفي كل شيء شاشة 390×844 مع الشريط السفلي.
   - نفس الفكرة للمعلمة والطالب (`portals.tsx`): الترحيب + المؤشرات + لوحة الحصة الجارية + قائمة واحدة قابلة للتمرير.
3. **رأس الجوال: زر الثيم + زر اللغة ظاهران دائماً** — في `layout.tsx` أزل `m-hide` من `#themeBtn`، وأضف زر لغة `#langBtn` (أيقونة `languages` موجودة
   في `icons.gen.ts`؛ لإضافة أيقونات: عدّل `scripts/gen-icons.mjs` ثم `node scripts/gen-icons.mjs`). قلّص الأزرار في الجوال إلى 36px لتتسع.
4. **تعدد اللغات (ع/En)**:
   - كوكي `lang=ar|en` (سنة) + مسار `GET /lang/:code?next=` يضبطه ويعيد التوجيه (تحقق أن `next` مسار داخلي يبدأ بـ`/` لتجنب open redirect).
   - وسيط يقرأ الكوكي ويضعه في `c.set('lang')` (أضفه لـ`AppEnv.Variables` في `src/lib/types.ts`)، واستخدم `contextStorage()` من `hono/context-storage`
     لتقرأ المكونات اللغة عبر `tryGetContext()` بدون تمرير props.
   - `src/lib/i18n.ts`: قاموس `{ ar: {...}, en: {...} }` + `t(key)`؛ ابدأ بالهيكل (nav.ts labels، القوائم، البحث، الأزرار العامة)، ثم الرئيسيات، المالية، الرسائل، الدخول.
   - `<html lang dir>` حسب اللغة؛ CSS مبني بخصائص منطقية أصلاً (inline-start/end). راجع الأماكن التي فيها `text-align:right/left` و`scaleX(-1)` (`.chev`, `[dir=rtl] .flip`).
   - التواريخ: `src/lib/time.ts` يستخدم `ar-SA-u-ca-gregory-nu-latn`؛ أضف مُنسّقات `en-GB` حسب اللغة.
   - حدّث `tests/e2e.sh` فقط بإضافات (يبحث عن نصوص عربية مثل 'حصتك الآن'، 'مباشر الآن'، 'قاعة 4'، 'متأخر' — الافتراضي يبقى عربي).
5. **الرسائل** (`messages.tsx` + `.chat`): عنوان قائمة المحادثات مع عدد غير المقروء، معاينة آخر رسالة + وقتها النسبي، تجميع الفقاعات حسب اليوم (فاصل تاريخ)،
   وقت مختصر داخل الفقاعة (بدل التاريخ الكامل الطويل)، حالة فارغة أجمل على سطح المكتب، وحقل كتابة بارتفاع 44px بلا فراغ أسفل (مشكلة ظاهرة في لقطة الجوال).
6. **المالية**: على سطح المكتب أبقِ الأعلى في شاشة واحدة، وجدول الربح داخل بطاقة بارتفاع محدود وتمرير داخلي مع رأس ثابت؛ على الجوال مؤشرات 2×2 ثم قائمة المتأخرات.
7. **تدقيق بكسل بكسل لكل الصفحات** (شغّل `shoot.py` لكل الصفحات، فاتح + داكن، 1440 و390): أزل الفراغات الكبيرة، الأزرار العريضة الفارغة
   (`.page-head > .actions > .btn { flex:1 }` في الجوال، و`.hello .btns .btn { flex:1 }`)، ووحّد الهوامش على شبكة 4px.
8. **الموقع التعريفي**: `landing.css` يرث `--font-display` الآن = Readex؛ غيّر وزن `.hero h1` من 800 إلى 700 (Readex أقصاه 700) وراجع البطل ليكون فخماً واضحاً
   (سطرين، حجم clamp(2.2rem…3.4rem)، line-height 1.35)، ونفس الشيء لـ`.sec-head h2`, `.num-card b`, `.book h2`, `.step-n` (كلها 800).
9. **التوثيق**: حدّث `docs/07-design-system.md` (الخط، سلّم الأحجام، الهيكل الثابت، i18n) وهذا الملف.
10. **التحقق والتسليم**: `npm test` · `npm run typecheck` · `bash tests/e2e.sh` · `crawl.py` · `contrast.py` · لقطات في `docs/screens/` ⇐ commit ⇐ `git fetch origin main && git rebase origin/main`
    ⇐ squash ⇐ `git push -f origin genspark_ai_developer` ⇐ تحديث PR #2 ومشاركة الرابط.

## 5. ملاحظات فنية
- الجوال < 700px (`.m-only`, `.m-hide`, `.hide-sm`)، اللوحي ≤ 1023px، `.dash` على سطح المكتب `repeat(3,1fr) 380px`.
- `.d-part` يُخفى على الجوال و`.m-br` يظهر فيه فقط.
- بيانات البذر نسبية للوقت؛ إن بدت قديمة: `npm run db:reset` ثم أعد تشغيل الخادم.
- مجلد `.tmp/` ملفات مؤقتة قديمة يمكن تجاهلها.
