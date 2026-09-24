/* lyubchak.com — behaviour. All strings are author-controlled constants; markup is built with
   Range.createContextualFragment / cloneNode, never from user input. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const frag = html => document.createRange().createContextualFragment(html);
const setHTML = (el, html) => el.replaceChildren(frag(html));

/* ---------- springs → CSS linear() (Apple damping/response) ---------- */
function spring(damping = 1, response = .4) {
  const w = 2 * Math.PI / response;
  const x = t => { if (damping >= 1) return 1 - (1 + w * t) * Math.exp(-w * t);
    const wd = w * Math.sqrt(1 - damping * damping);
    return 1 - Math.exp(-damping * w * t) * (Math.cos(wd * t) + (damping * w / wd) * Math.sin(wd * t)); };
  let T = 0; for (let t = 0; t < 4; t += .004) if (Math.abs(1 - x(t)) > .0015) T = t;
  const n = 48, pts = []; for (let i = 0; i <= n; i++) pts.push(+x(T * i / n).toFixed(4));
  pts[n] = 1; return { ease: `linear(${pts.join(',')})`, ms: Math.round(T * 1000) };
}
const S_OPEN = spring(1, .42), S_BACK = spring(.8, .34), S_UI = spring(1, .5);
document.documentElement.style.setProperty('--spring', S_UI.ease);
document.documentElement.style.setProperty('--spring-b', S_BACK.ease);

/* ---------- i18n ---------- */
const T = {
 en:{hdr_cta:"Message me",me_cta:"Message me on Telegram",role:"<b>AI Platform Architect.</b> I build production AI systems and run Telegram products used by millions of people.",
  cp_tag:"Give it the work. Get the finished files.",fs_mau:"monthly users",fs_sub:"The largest sticker platform on Telegram",fs_packs:"sticker packs",fs_inst:"Android installs",fs_surf:'<span><b>Bot</b> · create stickers</span><span><b>Catalog</b> · browse & search</span><span><b>Android app</b></span>',
  cp_sub:"agent harness I wrote from scratch",cp_att:"📎 3 exports",cp_ask:"Merge June sales into one report",cp_done:"Done — three exports merged. Revenue ↑ 18% vs May.",cp_meta:"ready to open",cp_chips:'<span class="chip">Open source</span><span class="chip">Self-hosted</span><span class="chip">Your models</span>',q_groups:"groups",q_peak:"msg/min at peak",q_1:"Reply with /q to any message",q_2:"It becomes a sticker. Like this one.",path_lab:"Path",
  path_list:'<li><span>age 12</span>uCoz sites</li><li><span>then</span>PHP → VK bots → Telegram</li><li><span>2023</span>Mini App Contest, 1st</li><li><span>then</span>KNESS: bots → backend → AI lead</li><li class="now"><span>now</span>AI Platform Architect</li>',
  rl_now:"Now",rl_sub:"Designing a corporate AI platform, from pilot to production.",rl_prev:"Previously at KNESS · bot dev → backend → AI lead",kn_chips:'<span class="chip">Document analysis</span><span class="chip">Internal search</span><span class="chip">HR · Legal · Accounting agents</span>',
  aw_big:"1st",ho_sub:"Telegram channels as one feed",wk_lab:"How I work",wk_t:"I orchestrate AI agents",wk_s:"I set the tasks, bring the results together and decide what ships.",
  gh_sub:"open-source stars",bt_lab:"More bots",st_lab:"Stack",st_t:"The stack matters less now",st_s:"With AI, a new tool takes days to pick up. These are just the ones I reach for most.",op_lab:"Open for",op_t:"AI & automation for companies",op_s:"Systems that run on real data and existing infrastructure.",op_btn:'Write me<i class="ic ic-go" aria-hidden="true"></i>',
  ai_lab:"Ask an AI about me",ct_lab:"Contact",ct_t:"Let's talk",ct_s:"Telegram is the fastest. Email for anything formal.",copied:'Copied<i class="ic ic-check" aria-hidden="true"></i>',ai_copy:"Copy prompt",ai_copied:"Copied — paste it into any AI",bl_lab:"Blog",bl_btn:"Blog",
  prompt:"Who is Yuri Lyubchak? Read https://lyubchak.com/llms-full.txt and check other public sources. What has he built, and what does he work on now?"},
 uk:{hdr_cta:"Написати",me_cta:"Написати в Telegram",role:"<b>AI Platform Architect.</b> Будую AI-системи для продакшну і розвиваю Telegram-продукти, якими користуються мільйони людей.",
  cp_tag:"Дай йому роботу — отримай готові файли.",fs_mau:"користувачів на місяць",fs_sub:"Найбільша платформа стікерів у Telegram",fs_packs:"стікерпаків",fs_inst:"встановлень Android",fs_surf:'<span><b>Бот</b> · створення паків</span><span><b>Каталог</b> · пошук</span><span><b>Android</b>-застосунок</span>',
  cp_sub:"agent harness, написаний з нуля",cp_att:"📎 3 вивантаження",cp_ask:"Зведи червневі продажі в один звіт",cp_done:"Готово — три вивантаження зведено. Виторг ↑ 18% до травня.",cp_meta:"можна відкривати",cp_chips:'<span class="chip">Відкритий код</span><span class="chip">Self-hosted</span><span class="chip">Твої моделі</span>',q_groups:"груп",q_peak:"повідомл./хв у пік",q_1:"Відповідай /q на будь-яке повідомлення",q_2:"Воно стане стікером. Як цей.",path_lab:"Шлях",
  path_list:'<li><span>у 12 років</span>сайти на uCoz</li><li><span>далі</span>PHP → боти VK → Telegram</li><li><span>2023</span>Mini App Contest, 1 місце</li><li><span>далі</span>KNESS: боти → бекенд → AI lead</li><li class="now"><span>зараз</span>AI Platform Architect</li>',
  rl_now:"Зараз",rl_sub:"Проєктую корпоративну AI-платформу: від пілота до продакшну.",rl_prev:"Раніше в KNESS · боти → бекенд → AI lead",kn_chips:'<span class="chip">Аналіз документів</span><span class="chip">Внутрішній пошук</span><span class="chip">Агенти HR · юристи · бухгалтерія</span>',
  aw_big:"1 місце",ho_sub:"Telegram-канали однією стрічкою",wk_lab:"Як я працюю",wk_t:"Оркеструю AI-агентів",wk_s:"Ставлю задачі, збираю результати й вирішую, що йде в прод.",
  gh_sub:"зірок на відкритому коді",bt_lab:"Інші боти",st_lab:"Стек",st_t:"Стек тепер важить менше",st_s:"З AI новий інструмент освоюється за дні. Тут лише те, що під рукою найчастіше.",op_lab:"Відкритий до",op_t:"AI та автоматизація для компаній",op_s:"Системи, що працюють на реальних даних і наявній інфраструктурі.",op_btn:'Написати<i class="ic ic-go" aria-hidden="true"></i>',
  ai_lab:"Спитай про мене в AI",ct_lab:"Контакти",ct_t:"Напиши мені",ct_s:"Найшвидше в Telegram. Для офіційного — email.",copied:'Скопійовано<i class="ic ic-check" aria-hidden="true"></i>',ai_copy:"Скопіювати промпт",ai_copied:"Скопійовано — встав у будь-який AI",bl_lab:"Блог",bl_btn:"Блог",
  prompt:"Хто такий Юрій Любчак? Прочитай https://lyubchak.com/llms-full.txt і перевір інші відкриті джерела. Що він створив і чим займається зараз?"}
};
const QUOTES = { en: ['/images/quotes/en-1.webp', '/images/quotes/en-2.webp'], uk: ['/images/quotes/uk-1.webp', '/images/quotes/uk-2.webp'] };
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } },
                set(k, v) { try { localStorage.setItem(k, v); } catch {} } };
let lang = 'en';

function applyAI() {
  const p = T[lang].prompt, q = encodeURIComponent(p);
  const U = 'https://lyubchak.com/llms-full.txt', [a, b] = p.split(U), el = $('#prompt'), url = document.createElement('span');
  url.className = 'url'; url.textContent = U;
  el.replaceChildren('“' + a, url, b + '”');   // keep the URL on one line
  $('#ai-chatgpt').href = 'https://chatgpt.com/?q=' + q;
  $('#ai-claude').href = 'https://claude.ai/new?q=' + q;
  $('#ai-perplexity').href = 'https://www.perplexity.ai/search?q=' + q;
}
function paint() {
  document.documentElement.lang = lang;
  $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
  $$('[data-i]').forEach(el => { const v = T[lang][el.dataset.i]; if (v != null) setHTML(el, v); });
  $$('img[data-q]').forEach(im => { im.src = QUOTES[lang][im.dataset.q - 1]; });
  applyAI();
}
function setLang(l, animate = true) {
  if (!T[l] || (l === lang && animate)) return;
  store.set('lang', l);
  lang = l;                      // state first, so a sheet opened mid-animation uses the new language
  const swap = () => paint();
  if (!animate || reduce) { swap(); return; }
  document.body.classList.add('swapping');
  setTimeout(() => { swap(); requestAnimationFrame(() => document.body.classList.remove('swapping')); }, 170);
}
$$('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
const initial = store.get('lang') || ((navigator.language || '').toLowerCase().startsWith('uk') ? 'uk' : 'en');
lang = initial === 'uk' ? 'uk' : 'en'; paint();

/* ---------- theme ---------- */
$('#theme').addEventListener('click', () => {
  const r = document.documentElement;
  const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  r.dataset.theme = dark ? 'light' : 'dark';
});

/* ---------- intro: biggest cards first ---------- */
(() => { const b = $('#bento');
  if (reduce) { b.classList.remove('intro'); return; }
  [...b.querySelectorAll('.card')].map(c => { const r = c.getBoundingClientRect(); return { c, a: r.width * r.height, y: r.top }; })
    .sort((p, q) => q.a - p.a || p.y - q.y).forEach((o, i) => o.c.style.setProperty('--d', Math.min(i * 45, 540) + 'ms'));
  setTimeout(() => b.classList.remove('intro'), 1400);
})();
{ const settle = () => requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('settled')));
  document.readyState === 'complete' ? settle() : addEventListener('load', settle); }

/* ---------- glass header ---------- */
new IntersectionObserver(([e]) => { const h = $('#hdr'); h.classList.toggle('show', !e.isIntersecting); h.setAttribute('aria-hidden', e.isIntersecting); h.inert = e.isIntersecting; },
  { rootMargin: '-40px 0px 0px 0px' }).observe($('#me'));

/* ---------- copy ---------- */
$$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(b.dataset.copy); }
  catch { location.href = 'mailto:' + b.dataset.copy; return; }   // no clipboard: open the mail app instead of lying
  b.classList.add('done'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('done'), 1600);
}));

/* ---------- the Ask-AI prompt copies itself, for any agent the visitor uses ---------- */
{ const b = $('#ai-copy'), hint = b.querySelector('.hint');
  b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(T[lang].prompt); }
    catch { const r = document.createRange(); r.selectNodeContents($('#prompt')); getSelection().removeAllRanges(); getSelection().addRange(r); return; } // no clipboard: select it for Ctrl+C
    hint.textContent = T[lang].ai_copied; b.classList.add('done');
    clearTimeout(b._t); b._t = setTimeout(() => { hint.textContent = T[lang].ai_copy; b.classList.remove('done'); }, 2200);
  }); }

/* ---------- Capka demo plays only while visible ---------- */
(() => { const v = $('.capka .win video'); if (!v || reduce) return;
  new IntersectionObserver(([e]) => { e.isIntersecting ? v.play().catch(() => {}) : v.pause(); }, { threshold: .35 }).observe(v);
})();

/* ---------- fStik stickers: curated list from /api/stickers, static fallback stays on failure ---------- */
/* static fallback: 8 hand-picked stickers from fStik's verified packs, stored locally so they
   survive even when fStik itself is down (the card shows the first 3) */
const FALLBACK = [1, 2, 3, 4, 5, 6, 7, 8].map(n => `/images/stickers/${n}.webp`);
const setSticker = (im, src, i) => {       // any broken remote image quietly falls back to its local twin
  im.onerror = () => { im.onerror = null; im.src = FALLBACK[i % FALLBACK.length]; };
  im.src = src;
};
let STICKERS = FALLBACK;
fetch('/api/stickers').then(r => r.ok ? r.json() : null).then(d => {
  const list = d && Array.isArray(d.stickers) ? d.stickers.filter(u => /^https:\/\/api\.fstik\.app\/file\//.test(u)) : [];
  if (list.length < 3) return;
  STICKERS = list; $$('.fs .stk img').forEach((im, i) => setSticker(im, list[i], i));
}).catch(() => {});
function fillStickers(root) {
  $$('[data-stickers]', root).forEach(box => {
    const n = +box.dataset.stickers;
    box.replaceChildren(...Array.from({ length: Math.min(n, STICKERS.length) }, (_, i) => {
      const im = document.createElement('img'); im.alt = ''; im.decoding = 'async'; setSticker(im, STICKERS[i], i); return im; }));  // no lazy: the sheet is already on screen
  });
}

/* ---------- sheet: grows out of the card, spring, focus trap, drag to dismiss ---------- */
const sheet = $('#sheet'), body = $('#sheet-body'), scrim = $('#scrim');
let origin = null, isOpen = false, closeTimer = 0;
const mobile = () => matchMedia('(max-width:640px)').matches;
const endClip = () => mobile() ? 'inset(0px 0px 0px 0px round 30px 30px 0px 0px)' : 'inset(0px 0px 0px 0px round 32px)';
function coverCard(card) {
  const t = sheet.style.transform, c = sheet.style.clipPath;
  sheet.style.transform = 'none'; sheet.style.clipPath = 'none';
  const s = sheet.getBoundingClientRect();
  sheet.style.transform = t; sheet.style.clipPath = c;
  const r = card.getBoundingClientRect(), w = Math.min(r.width, s.width), h = Math.min(r.height, s.height);
  return { t: `translate(${r.left - s.left}px,${r.top - s.top}px)`, c: `inset(0px ${s.width - w}px ${s.height - h}px 0px round 28px)` };
}
function fillSheet(id) {
  const src = $(`#sheet-src article[data-sheet-src="${id}"][lang="${lang}"]`) || $(`#sheet-src article[data-sheet-src="${id}"]`);
  const clone = src.cloneNode(true);
  const h2 = clone.querySelector('h2'); if (h2) h2.id = 'sheet-title';
  sheet.dataset.kind = id;
  $('#sh-bar').textContent = h2 ? h2.textContent : '';
  body.replaceChildren(...clone.childNodes); body.scrollTop = 0; sheet.classList.remove('scrolled'); fillStickers(body);
}
function openSheet(card) {
  clearTimeout(closeTimer);
  origin = card; fillSheet(card.dataset.sheet);
  sheet.classList.add('open'); isOpen = true; scrim.classList.add('on');
  document.documentElement.classList.add('sheet-open');   // freeze the page behind
  $('#x').focus({ preventScroll: true });
  if (reduce) { sheet.style.opacity = 1; sheet.classList.add('content-on'); return; }
  const g = coverCard(card), d = S_OPEN.ms;
  sheet.style.transition = 'none'; sheet.style.transform = g.t; sheet.style.clipPath = g.c; sheet.style.opacity = 0;
  sheet.getBoundingClientRect();
  sheet.style.transition = `transform ${d}ms ${S_OPEN.ease},clip-path ${d}ms ${S_OPEN.ease},opacity ${Math.round(d * .3)}ms ease`;
  sheet.style.transform = 'none'; sheet.style.clipPath = endClip(); sheet.style.opacity = 1;
  setTimeout(() => isOpen && sheet.classList.add('content-on'), d * .22);
}
function closeSheet() {
  if (!isOpen) return; isOpen = false;
  scrim.classList.remove('on'); sheet.classList.remove('content-on');
  $$('video', body).forEach(v => v.pause());
  document.documentElement.classList.remove('sheet-open');
  const done = () => { sheet.classList.remove('open'); sheet.style.cssText = ''; origin && origin.focus({ preventScroll: true }); };
  if (reduce) { done(); return; }
  const cs = getComputedStyle(sheet);
  sheet.style.transition = 'none'; sheet.style.transform = cs.transform; sheet.style.clipPath = cs.clipPath;
  const g = coverCard(origin), d = Math.round(S_OPEN.ms * .8);
  sheet.getBoundingClientRect();
  sheet.style.transition = `transform ${d}ms ${S_OPEN.ease},clip-path ${d}ms ${S_OPEN.ease},opacity ${Math.round(d * .45)}ms ease ${Math.round(d * .5)}ms`;
  sheet.style.transform = g.t; sheet.style.clipPath = g.c; sheet.style.opacity = 0;
  closeTimer = setTimeout(done, d + 20);
}
$$('[data-sheet]').forEach(c => c.addEventListener('click', () => openSheet(c)));
/* how I work: tasks travel out to each agent and results come back — once on screen, again on hover */
{ const w = $('.work');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const run = () => { w.classList.remove('run'); void w.offsetWidth; w.classList.add('run'); };
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); run(); } }, { threshold: .6 }).observe(w);
    let last = 0; w.addEventListener('pointerenter', () => { if (Date.now() - last > 2600) { last = Date.now(); run(); } });
  } }

/* compact title once the hero has scrolled away (iOS large-title behaviour) */
body.addEventListener('scroll', () => { sheet.classList.toggle('scrolled', body.scrollTop > 72); }, { passive: true });

/* overlay scroll indicator: the native scrollbar would eat a strip next to the coloured hero */
const thumb = document.createElement('i'); thumb.className = 'sh-thumb'; thumb.setAttribute('aria-hidden', 'true'); sheet.append(thumb);
let thumbIdle;
body.addEventListener('scroll', () => {
  const ch = body.clientHeight, sh = body.scrollHeight;
  if (sh <= ch) return;
  const inset = 8, track = ch - inset * 2, h = Math.max(36, track * ch / sh);
  thumb.style.height = h + 'px';
  thumb.style.transform = `translateY(${body.offsetTop + inset + (track - h) * body.scrollTop / (sh - ch)}px)`;
  thumb.classList.add('on'); clearTimeout(thumbIdle);
  thumbIdle = setTimeout(() => thumb.classList.remove('on'), 900);
}, { passive: true });
$('#x').addEventListener('click', closeSheet); scrim.addEventListener('click', closeSheet);
addEventListener('keydown', e => {
  if (!isOpen) return;
  if (e.key === 'Escape') { closeSheet(); return; }
  if (e.key !== 'Tab') return;
  const f = $$('a[href],button:not([disabled]),video[controls],[tabindex]:not([tabindex="-1"])', sheet).filter(el => el.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  else if (!sheet.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
});
(() => { let y0 = 0, dy = 0, hist = [], drag = false;
  const rubber = (o, d = 500, c = .55) => (o * d * c) / (d + c * Math.abs(o));
  let armed = false, pid = 0;
  sheet.addEventListener('pointerdown', e => {
    if (!isOpen || e.target.closest('a,button,video')) return;
    // mouse: drag only by the handle/hero/title bar so text selection keeps working
    if (e.pointerType === 'mouse' && !e.target.closest('.grab,.sh-hero,.sh-bar')) return;
    if (e.target.closest('.body') && body.scrollTop > 0) return;
    armed = true; drag = false; pid = e.pointerId; y0 = e.clientY; dy = 0; hist = [{ y: e.clientY, t: e.timeStamp }];
  });
  sheet.addEventListener('pointermove', e => {
    if (armed && !drag) {                  // hysteresis: a tap or a tiny jitter never interrupts the opening spring
      if (Math.abs(e.clientY - y0) < 6) return;
      drag = true; sheet.setPointerCapture(pid); sheet.style.transition = 'none';
    }
    if (!drag) return;
    dy = e.clientY - y0; hist.push({ y: e.clientY, t: e.timeStamp }); if (hist.length > 6) hist.shift();
    sheet.style.transform = `translateY(${dy < 0 ? rubber(dy) : dy}px)`; scrim.style.opacity = Math.max(0, 1 - dy / 500);
  });
  const end = () => { armed = false; if (!drag) return; drag = false; scrim.style.opacity = '';
    const a = hist[0], b = hist[hist.length - 1], v = (b.y - a.y) / Math.max(1, b.t - a.t) * 1000;
    if (dy > 140 || v > 700) closeSheet();
    else { sheet.style.transition = `transform ${S_BACK.ms}ms ${S_BACK.ease}`; sheet.style.transform = 'none'; }
  };
  sheet.addEventListener('pointerup', end); sheet.addEventListener('pointercancel', end);
})();

window.__site = { setLang, openSheet, closeSheet };
})();
