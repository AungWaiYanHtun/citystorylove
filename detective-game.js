/* CityStoryLove AI Detective game (Fix 20; Fix 37 = portrait visual-novel UI). Story Games.
   Talks only to the game backend; the AI keys and the case culprit stay on the server. */
(() => {
  "use strict";
  const cfg = window.VIDEOSPACE_CONFIG || {};
  const API = (cfg.VIP_API_URL || "").replace(/\/$/, "");
  const tg = window.Telegram?.WebApp;
  const SAVE_KEY = "videospace_detective_v1_" + String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "guest"); // per Telegram account
  const $ = (id) => document.getElementById(id);
  const MIN_ASKS = 4;   // questions before an accusation is allowed
  const MAX_ASKS = 14;  // after this only the accusation is left

  const TEXT = {
    my: {
      tab: "🕵️ AI စုံထောက်", heading: '🕵️ AI <span class="gold-text">စုံထောက်</span>',
      intro: "မှုခင်းတစ်ခုစီမှာ သံသယတရားခံ ၃ ယောက်။ စကားမေး၊ သဲလွန်စရှာ၊ ချစ်ရသူနဲ့ ရင်ခုန်ပြီး တရားခံကို ဖော်ထုတ်ပါ။ မှုခင်းပြီးတိုင်း နောက်အခန်း ဆက်ကစားလို့ရပါတယ်။",
      lang: "ဘာသာစကား", who: "သင် ဘယ်သူလဲ?", name: "စုံထောက်နာမည်", namePh: "ဥပမာ - မောင်မောင်",
      mature: "💋 ရင်ခုန်ဇာတ်ဝင်ခန်းများ (နမ်းတာ၊ ဖက်တာ) ပါမယ်။ ကျွန်ုပ်အသက် ၁၈ နှစ်ပြည့်ပါပြီ။",
      start: "🔍 မှုခင်းစမယ်", pickWho: "သင် ဘယ်သူလဲ ဆိုတာ အရင်ရွေးပါ။", writing: "AI က မှုခင်းကို ရေးနေပါတယ်…",
      chapter: (n) => `အခန်း ${n}`, clues: "သဲလွန်စ", love: (n) => `${n} နဲ့ ချစ်မီတာ`, notebook: "📒 သဲလွန်စမှတ်စု", noClues: "သဲလွန်စ မတွေ့ရသေးပါ။",
      past: "ယခင်အပိုင်းများ", newClue: "📸 သဲလွန်စအသစ်", accuse: "⚖️ တရားခံကို ဖော်ထုတ်မယ်",
      accuseLocked: (n) => `⚖️ နောက်ထပ် ${n} ခု မေးပြီးမှ ဖော်ထုတ်လို့ရမယ်`, pickCulprit: "ဘယ်သူက တရားခံလဲ?", cancel: "မလုပ်တော့ဘူး",
      lastChance: "မေးခွန်းတွေ ကုန်ပါပြီ။ တရားခံကို ရွေးပါ။", asks: (a, m) => `မေးခွန်း ${a}/${m}`,
      right: "✅ မှန်ပါတယ်! မှုခင်းဖြေရှင်းပြီးပါပြီ", wrong: (n) => `❌ မှားသွားတယ်… တရားခံအစစ်က ${n}`,
      next: (n) => `▶ အခန်း ${n} ဆက်ကစားမယ်`, newGame: "↺ အစကနေ ပြန်စမယ်", confirmNew: "ဒီဂိမ်းကို ဖျက်ပြီး အစကပြန်စမလား?",
      solved: (s, t) => `ဖြေရှင်းခဲ့တာ ${s}/${t} မှုခင်း`, kinds: { clue: "🔍", love: "💘", talk: "💬" },
      vip: "👑 VIP · အကန့်အသတ်မရှိ", left: (r, l) => `ဒီနေ့ ${r}/${l} ကြိမ်ကျန်`, soon: "မကြာခင်ဖွင့်ပါမယ်",
      LIMIT: "ဒီနေ့ အခမဲ့အကြိမ် ကုန်သွားပါပြီ။ 👑 VIP ယူရင် အကန့်အသတ်မရှိ ဆော့လို့ရပါတယ်။",
      BUSY: "AI အလုပ်များနေပါတယ်။ ခဏနေ ထပ်နှိပ်ပါ။", BLOCKED: "ဒီရွေးချယ်မှုကို AI ကမရေးပေးနိုင်ပါ။ တခြားတစ်ခု ရွေးကြည့်ပါ။",
      NOTG: "Telegram Mini App ကနေ ဖွင့်မှ ဆော့လို့ရပါတယ်။", SETUP: "မကြာခင်ဖွင့်ပါမယ်။", FAILED: "တစ်ခုခုမှားသွားပါတယ်။ ထပ်နှိပ်ကြည့်ပါ။",
      CASE: "မှုခင်းဒေတာ မမှန်တော့ပါ။ အစကနေ ပြန်စပါ။",
      identities: { boy: "👦 ယောက်ျားလေး", girl: "👧 မိန်းကလေး", gay: "🏳️‍🌈 Gay", lesbian: "🏳️‍🌈 Lesbian", transwoman: "🏳️‍⚧️ Trans (မိန်းမ)", transman: "🏳️‍⚧️ Trans (ယောက်ျား)" }
    },
    en: {
      tab: "🕵️ AI Detective", heading: '🕵️ AI <span class="gold-text">Detective</span>',
      intro: "Every case has three suspects. Question them, find clues, fall for your crush and expose the culprit. After each case, the story continues in a new chapter.",
      lang: "Language", who: "Who are you?", name: "Detective name", namePh: "e.g. Alex",
      mature: "💋 Include romantic scenes (kissing, hugging). I confirm I am 18 or older.",
      start: "🔍 Start the case", pickWho: "Please choose who you are first.", writing: "The AI is writing the case…",
      chapter: (n) => `Chapter ${n}`, clues: "Clues", love: (n) => `Love with ${n}`, notebook: "📒 Clue notebook", noClues: "No clues yet.",
      past: "Earlier in this case", newClue: "📸 New clue", accuse: "⚖️ Name the culprit",
      accuseLocked: (n) => `⚖️ Ask ${n} more before accusing`, pickCulprit: "Who is the culprit?", cancel: "Not yet",
      lastChance: "You're out of questions. Choose the culprit.", asks: (a, m) => `Question ${a}/${m}`,
      right: "✅ Correct! Case solved", wrong: (n) => `❌ Wrong… the real culprit was ${n}`,
      next: (n) => `▶ Continue to chapter ${n}`, newGame: "↺ Start over", confirmNew: "Delete this game and start over?",
      solved: (s, t) => `Solved ${s}/${t} cases`, kinds: { clue: "🔍", love: "💘", talk: "💬" },
      vip: "👑 VIP · Unlimited", left: (r, l) => `${r}/${l} free turns left today`, soon: "Coming soon",
      LIMIT: "You've used today's free turns. 👑 Get VIP to play without limits.",
      BUSY: "The AI is busy. Please try again in a moment.", BLOCKED: "The AI can't write that choice. Try another one.",
      NOTG: "Open this from the Telegram Mini App to play.", SETUP: "Coming soon.", FAILED: "Something went wrong. Please try again.",
      CASE: "This case data is no longer valid. Please start over.",
      identities: { boy: "👦 Boy", girl: "👧 Girl", gay: "🏳️‍🌈 Gay", lesbian: "🏳️‍🌈 Lesbian", transwoman: "🏳️‍⚧️ Trans woman", transman: "🏳️‍⚧️ Trans man" }
    },
    ru: {
      tab: "🕵️ ИИ-детектив", heading: '🕵️ ИИ-<span class="gold-text">детектив</span>',
      intro: "В каждом деле три подозреваемых. Допрашивайте, ищите улики, влюбляйтесь и разоблачите преступника. После дела история продолжается в новой главе.",
      lang: "Язык", who: "Кто вы?", name: "Имя детектива", namePh: "например, Саша",
      mature: "💋 Романтические сцены (поцелуи, объятия). Подтверждаю, что мне есть 18 лет.",
      start: "🔍 Начать дело", pickWho: "Сначала выберите, кто вы.", writing: "ИИ пишет дело…",
      chapter: (n) => `Глава ${n}`, clues: "Улики", love: (n) => `Любовь: ${n}`, notebook: "📒 Блокнот улик", noClues: "Улик пока нет.",
      past: "Ранее в этом деле", newClue: "📸 Новая улика", accuse: "⚖️ Назвать преступника",
      accuseLocked: (n) => `⚖️ Задайте ещё ${n} вопроса`, pickCulprit: "Кто преступник?", cancel: "Пока нет",
      lastChance: "Вопросы закончились. Выберите преступника.", asks: (a, m) => `Вопрос ${a}/${m}`,
      right: "✅ Верно! Дело раскрыто", wrong: (n) => `❌ Ошибка… настоящий преступник — ${n}`,
      next: (n) => `▶ Глава ${n}`, newGame: "↺ Начать заново", confirmNew: "Удалить игру и начать заново?",
      solved: (s, t) => `Раскрыто ${s}/${t} дел`, kinds: { clue: "🔍", love: "💘", talk: "💬" },
      vip: "👑 VIP · Без ограничений", left: (r, l) => `Сегодня осталось: ${r}/${l}`, soon: "Скоро",
      LIMIT: "Бесплатные ходы на сегодня закончились. 👑 Оформите VIP.",
      BUSY: "ИИ занят. Попробуйте чуть позже.", BLOCKED: "ИИ не может написать этот вариант. Выберите другой.",
      NOTG: "Откройте игру через Telegram Mini App.", SETUP: "Скоро.", FAILED: "Что-то пошло не так. Попробуйте ещё раз.",
      CASE: "Данные дела устарели. Начните заново.",
      identities: { boy: "👦 Парень", girl: "👧 Девушка", gay: "🏳️‍🌈 Гей", lesbian: "🏳️‍🌈 Лесбиянка", transwoman: "🏳️‍⚧️ Транс-женщина", transman: "🏳️‍⚧️ Транс-мужчина" }
    },
    es: {
      tab: "🕵️ Detective IA", heading: '🕵️ Detective <span class="gold-text">IA</span>',
      intro: "Cada caso tiene tres sospechosos. Interrógalos, busca pistas, enamórate y descubre al culpable. Tras cada caso, la historia sigue en un nuevo capítulo.",
      lang: "Idioma", who: "¿Quién eres?", name: "Nombre del detective", namePh: "p. ej. Alex",
      mature: "💋 Incluir escenas románticas (besos, abrazos). Confirmo que tengo 18 años o más.",
      start: "🔍 Empezar el caso", pickWho: "Primero elige quién eres.", writing: "La IA está escribiendo el caso…",
      chapter: (n) => `Capítulo ${n}`, clues: "Pistas", love: (n) => `Amor con ${n}`, notebook: "📒 Libreta de pistas", noClues: "Aún no hay pistas.",
      past: "Antes en este caso", newClue: "📸 Nueva pista", accuse: "⚖️ Señalar al culpable",
      accuseLocked: (n) => `⚖️ Pregunta ${n} más antes de acusar`, pickCulprit: "¿Quién es el culpable?", cancel: "Todavía no",
      lastChance: "No quedan preguntas. Elige al culpable.", asks: (a, m) => `Pregunta ${a}/${m}`,
      right: "✅ ¡Correcto! Caso resuelto", wrong: (n) => `❌ Fallaste… el culpable era ${n}`,
      next: (n) => `▶ Seguir al capítulo ${n}`, newGame: "↺ Empezar de nuevo", confirmNew: "¿Borrar esta partida y empezar de nuevo?",
      solved: (s, t) => `Resueltos ${s}/${t} casos`, kinds: { clue: "🔍", love: "💘", talk: "💬" },
      vip: "👑 VIP · Sin límites", left: (r, l) => `Te quedan ${r}/${l} turnos hoy`, soon: "Muy pronto",
      LIMIT: "Has usado los turnos gratis de hoy. 👑 Hazte VIP para jugar sin límites.",
      BUSY: "La IA está ocupada. Inténtalo en un momento.", BLOCKED: "La IA no puede escribir esa opción. Prueba otra.",
      NOTG: "Abre el juego desde la Mini App de Telegram.", SETUP: "Muy pronto.", FAILED: "Algo salió mal. Inténtalo de nuevo.",
      CASE: "Los datos del caso ya no son válidos. Empieza de nuevo.",
      identities: { boy: "👦 Chico", girl: "👧 Chica", gay: "🏳️‍🌈 Gay", lesbian: "🏳️‍🌈 Lesbiana", transwoman: "🏳️‍⚧️ Mujer trans", transman: "🏳️‍⚧️ Hombre trans" }
    }
  };
  const LANGS = [["en", "🇬🇧 English"], ["ru", "🇷🇺 Русский"], ["es", "🇪🇸 Español"], ["my", "🇲🇲 မြန်မာ"]];
  const IDENTITY_KEYS = ["boy", "girl", "gay", "lesbian", "transwoman", "transman"];
  const CRUSH = { boy: "lin", girl: "kai", gay: "kai", lesbian: "lin", transwoman: "kai", transman: "lin" };
  const NAMES = { lin: "Lin", kai: "Kai", ray: "Ray", mira: "Mira" };
  const SPRITE = {
    lin: (e) => `story-assets/lin_${e}.webp`, kai: (e) => `story-assets/kai_${e}.webp`,
    ray: () => "detective-assets/ray.webp", mira: () => "detective-assets/mira.webp"
  };
  const BG = (s) => s === "party" ? "detective-assets/bg_party.webp" : `story-assets/bg_${s}.webp`;
  const SCENES = ["party", "cafe", "night", "rain", "mansion", "room", "beach", "campus", "forest"];
  const FX = { party: "bokeh", cafe: "bokeh", room: "bokeh", campus: "petals", rain: "rain", night: "stars", beach: "sparkle", forest: "fireflies", mansion: "fog" };

  let state = load();
  let setup = { identity: "", name: "", mature: false, lang: (state && state.lang) || "en", avatar: 0 };
  let quota = null, busy = false, picking = false;
  const T = () => TEXT[state ? state.lang : setup.lang] || TEXT.en;
  function load() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch { return null; } }
  function save() { try { state ? localStorage.setItem(SAVE_KEY, JSON.stringify(state)) : localStorage.removeItem(SAVE_KEY); } catch {} }
  function esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  // ---------- Tab wiring: the detective tab ----------
  function mount() {
    const nav = document.querySelector(".game-tabs");
    if (!nav || $("detective-tab-btn")) return;
    const btn = document.createElement("button");
    btn.type = "button"; btn.id = "detective-tab-btn"; btn.className = "game-tabs-btn";
    btn.textContent = T().tab;
    nav.insertBefore(btn, nav.firstChild);
    const section = document.createElement("section");
    section.id = "detective-section"; section.className = "story-section detective-section hidden";
    section.innerHTML = `<div class="section-heading"><div><span class="eyebrow">AI DETECTIVE GAME</span><h2></h2></div><span id="det-quota" class="result-count"></span></div><div id="det-body"></div>`;
    const anchor = $("story-section");
    anchor?.parentNode?.insertBefore(section, anchor);
    btn.addEventListener("click", () => show(true));
    ["story-tab-btn"].forEach((id) => $(id)?.addEventListener("click", () => show(false), true));
    show(true); // open the game first
  }
  function show(on) {
    const section = $("detective-section");
    if (!section) return;
    section.classList.toggle("hidden", !on);
    $("detective-tab-btn")?.classList.toggle("active", on);
    if (!on) return;
    $("story-section")?.classList.add("hidden");
    $("vip-hero")?.classList.add("hidden");
    ["story-tab-btn"].forEach((id) => $(id)?.classList.remove("active"));
    render(); refreshStatus();
  }

  // ---------- API ----------
  async function api(path, options = {}) {
    if (!API) throw new Error("SETUP");
    if (!tg?.initData) throw new Error("NOTG");
    const resp = await fetch(API + path, { ...options, headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": tg.initData } });
    const data = await resp.json().catch(() => ({}));
    return { ok: resp.ok, status: resp.status, data };
  }
  async function refreshStatus() {
    try {
      const { ok, data } = await api("/api/detective/status");
      quota = ok ? data : null; paintQuota(); paintAd();
    } catch { quota = null; paintQuota(); paintAd(); }
  }
  function paintQuota() {
    const el = $("det-quota"); if (!el) return;
    el.textContent = !quota ? "" : !quota.enabled ? T().soon : quota.vip ? T().vip : T().left(quota.remaining, Math.max(quota.limit, quota.remaining || 0));
    if (vn) hud();
  }


  // ---------- Fix 37: VN extras ----------
  const AV_SET = { boy: [1, 2, 3], girl: [4, 5, 6], gay: [7, 8], lesbian: [9, 10], transwoman: [11, 12], transman: [13, 14] };
  const AV_FOR = { boy: 1, girl: 4, gay: 7, lesbian: 9, transwoman: 11, transman: 13 };
  const ASSET = "story-assets/";
  const VX = {
    my: { avatar: "ကိုယ့် Avatar", next: "ရှေ့ဆက် ▶", back: "◀ နောက်သို့", cont: "▶ ဆက်ဆော့မယ်", pickSay: "ဘာမေးမလဲ? ရွေးပါ 👆", retry: "↻ ထပ်စမ်းမယ်", log: "ယခင်စကားများ", partner: "💘 သင့်ရဲ့ ရင်ခုန်သူ", suspects: "သံသယတရားခံများ" },
    en: { avatar: "Your avatar", next: "Next ▶", back: "◀ Back", cont: "▶ Continue", pickSay: "What will you ask? Pick one 👆", retry: "↻ Try again", log: "History", partner: "💘 Your crush", suspects: "Suspects" },
    ru: { avatar: "Ваш аватар", next: "Далее ▶", back: "◀ Назад", cont: "▶ Продолжить", pickSay: "Что спросите? Выберите 👆", retry: "↻ Ещё раз", log: "История", partner: "💘 Ваша симпатия", suspects: "Подозреваемые" },
    es: { avatar: "Tu avatar", next: "Siguiente ▶", back: "◀ Atrás", cont: "▶ Continuar", pickSay: "¿Qué preguntarás? Elige 👆", retry: "↻ Reintentar", log: "Historial", partner: "💘 Tu flechazo", suspects: "Sospechosos" }
  };
  const X = () => VX[state ? state.lang : setup.lang] || VX.en;
  const avSet = () => AV_SET[setup.identity] || AV_SET.boy;
  const myAv = () => (state && state.avatar) || AV_FOR[state?.identity] || 1;
  const sprite = (who, e) => SPRITE[who] ? SPRITE[who](e || "neutral") : "";
  const haptic = (k) => { try { k ? tg?.HapticFeedback?.impactOccurred?.(k) : tg?.HapticFeedback?.selectionChanged?.(); } catch {} };

  function fx(kind) {
    const n = { rain: 60, stars: 36, petals: 16, fireflies: 20, bokeh: 14, sparkle: 18, fog: 3 }[kind] || 0;
    let html = "";
    for (let i = 0; i < n; i++) {
      const sz = kind === "bokeh" ? 20 + Math.random() * 50 : kind === "petals" ? 8 + Math.random() * 8 : 2 + Math.random() * 4;
      const dur = kind === "rain" ? 0.5 + Math.random() * 0.5 : kind === "fog" ? 18 + i * 6 : 4 + Math.random() * 6;
      html += `<i style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${sz}px;height:${kind === "rain" ? 14 + Math.random() * 16 : sz}px;animation-delay:-${(Math.random() * 5).toFixed(2)}s;animation-duration:${dur}s"></i>`;
    }
    return html;
  }

  // ---------- Section card (inside the app) ----------
  function render() {
    const h = document.querySelector("#detective-section .section-heading h2");
    if (h) h.innerHTML = T().heading;
    const btn = $("detective-tab-btn"); if (btn) btn.textContent = T().tab;
    paintQuota();
    const body = $("det-body"); if (!body) return;
    const t = T(), crush = state ? state.crush : (CRUSH[setup.identity] || "lin");
    body.innerHTML = `
      <div class="story-card">
        <p class="det-intro">${t.intro}</p>
        <div class="det-suspects">${[crush, "ray", "mira"].map((s, i) => `<div class="det-sus${i === 0 ? " crush" : ""}"><div class="ph"><img src="${sprite(s, "smile")}" alt=""></div><b>${NAMES[s]}</b><span>${i === 0 ? "💘" : "❔"}</span></div>`).join("")}</div>
        ${state ? `<p class="story-who" style="margin:12px 0 8px"><img class="vn-mini" src="${ASSET}av${myAv()}.webp" alt=""> ${esc(state.name)} · ${t.chapter(state.chapter)}${state.caseTitle ? ` · ${esc(state.caseTitle)}` : ""}</p>
          <button type="button" id="det-cont" class="button button-gold full-width">${X().cont}</button>
          <button type="button" id="det-new" class="button button-quiet full-width" style="margin-top:8px">${t.newGame}</button>`
        : `<button type="button" id="det-open" class="button button-gold full-width">${t.start}</button>`}
      </div>`;
    $("det-open")?.addEventListener("click", openSetup);
    $("det-cont")?.addEventListener("click", openVN);
    $("det-new")?.addEventListener("click", () => {
      if (!confirm(t.confirmNew)) return;
      setup = { identity: state.identity, name: state.name, mature: state.mature, lang: state.lang, avatar: state.avatar || 0 };
      state = null; picking = false; save(); render(); openSetup();
    });
  }
  function suspectsFor(identity) { const c = CRUSH[identity] || "lin"; return [c, "ray", "mira"]; }

  // ---------- Step-by-step setup (full screen) ----------
  let wiz = 0;
  function openSetup() {
    $("dvs")?.remove(); wiz = 0;
    const el = document.createElement("div");
    el.id = "dvs"; el.className = "vn vns dvn";
    el.innerHTML = `<img class="vn-bg" src="${BG("party")}" alt=""><div class="vn-fx stage-fx fx-bokeh">${fx("bokeh")}</div>
      <img class="vn-partner vns-me hidden" data-r="me" alt="">
      <div class="vn-hud"><span class="vns-dots" data-r="dots"></span><button type="button" class="vn-x" data-r="x">✕</button></div>
      <div class="vn-box vns-box" data-r="box"></div>`;
    document.body.appendChild(el);
    document.documentElement.classList.add("vn-open");
    el.querySelector('[data-r="x"]').addEventListener("click", closeSetup);
    paintSetup();
  }
  function closeSetup() { $("dvs")?.remove(); if (!$("dvn") && !$("vn") && !$("vns")) document.documentElement.classList.remove("vn-open"); }
  function readInputs() { const n = $("det-name"), m = $("det-mature"); if (n) setup.name = (n.value || "").trim(); if (m) setup.mature = !!m.checked; }
  function paintSetup() {
    const root = $("dvs"); if (!root) return;
    const box = root.querySelector('[data-r="box"]'), t = T(), x = X();
    const me = root.querySelector('[data-r="me"]');
    const showMe = wiz >= 2 && setup.identity;
    me.classList.toggle("hidden", !showMe);
    if (showMe) { if (!avSet().includes(setup.avatar)) setup.avatar = avSet()[0]; me.src = `${ASSET}p${setup.avatar}.webp`; }
    root.querySelector('[data-r="dots"]').innerHTML = [0, 1, 2, 3].map((i) => `<i class="${i === wiz ? "on" : i < wiz ? "done" : ""}"></i>`).join("");
    const chip = (a, k, l, on) => `<button type="button" class="vns-chip${on ? " on" : ""}" data-${a}="${k}">${l}</button>`;
    let html = "";
    if (wiz === 0) html = `<h3>🌐 ${t.lang}</h3><div class="vns-chips">${LANGS.map(([k, l]) => chip("lang", k, l, setup.lang === k)).join("")}</div>`;
    if (wiz === 1) {
      const c = CRUSH[setup.identity] || "";
      html = `<h3>${t.who}</h3><div class="vns-chips">${IDENTITY_KEYS.map((k) => chip("identity", k, t.identities[k], setup.identity === k)).join("")}</div>
        <p class="dvn-sub">${x.suspects}</p><div class="dvn-sus">${(c ? [c, "ray", "mira"] : ["lin", "kai", "ray", "mira"]).map((s) => `<span class="${s === c ? "crush" : ""}"><img src="${sprite(s, "smile")}" alt="">${NAMES[s]}${s === c ? " 💘" : ""}</span>`).join("")}</div>`;
    }
    if (wiz === 2) html = `<h3>${x.avatar}</h3><div class="vn-avs vns-avs">${avSet().map((n) => `<button type="button" class="vn-av${setup.avatar === n ? " on" : ""}" data-av="${n}"><img src="${ASSET}av${n}.webp" alt=""></button>`).join("")}</div>`;
    if (wiz === 3) html = `<h3>${t.name}</h3><input id="det-name" class="vns-input" maxlength="30" placeholder="${esc(t.namePh)}" value="${esc(setup.name)}">
        <label class="vns-check"><input type="checkbox" id="det-mature"${setup.mature ? " checked" : ""}> <span>${t.mature}</span></label>`;
    const canNext = wiz !== 1 || !!setup.identity;
    html += `<p id="det-error" class="story-error vns-err"></p><div class="vns-nav">
      ${wiz > 0 ? `<button type="button" class="vn-btn" data-r="back">${x.back}</button>` : "<span></span>"}
      ${wiz < 3 ? `<button type="button" class="vn-btn gold" data-r="next"${canNext ? "" : " disabled"}>${x.next}</button>` : `<button type="button" class="vn-btn gold" data-r="start">${t.start}</button>`}</div>`;
    box.innerHTML = html;
    box.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => { setup.lang = b.dataset.lang; paintSetup(); render(); }));
    box.querySelectorAll("[data-identity]").forEach((b) => b.addEventListener("click", () => { setup.identity = b.dataset.identity; if (!avSet().includes(setup.avatar)) setup.avatar = AV_FOR[setup.identity]; paintSetup(); render(); }));
    box.querySelectorAll("[data-av]").forEach((b) => b.addEventListener("click", () => { setup.avatar = Number(b.dataset.av); paintSetup(); }));
    box.querySelector('[data-r="back"]')?.addEventListener("click", () => { readInputs(); wiz = Math.max(0, wiz - 1); paintSetup(); });
    box.querySelector('[data-r="next"]')?.addEventListener("click", () => { if (wiz === 1 && !setup.identity) return; wiz = Math.min(3, wiz + 1); paintSetup(); });
    box.querySelector('[data-r="start"]')?.addEventListener("click", () => { readInputs(); startGame(); });
    haptic();
  }

  // ---------- Portrait visual-novel player ----------
  function pagesOf(text) {
    const parts = String(text || "").replace(/\r/g, "").split(/\n+|(?<=[.!?။…”"」])\s+/).map((z) => z.trim()).filter(Boolean);
    const out = []; let cur = "";
    parts.forEach((p) => { if (cur && (cur + " " + p).length > 150) { out.push(cur); cur = p; } else cur = cur ? cur + " " + p : p; });
    if (cur) out.push(cur);
    return out.length ? out : [""];
  }
  const QUOTE = /["“”「」«»]/;
  let vn = null, typeTimer = null, autoTimer = null;
  const R = (k) => $("dvn")?.querySelector(`[data-r="${k}"]`);

  function openVN() {
    if (!state) return;
    closeVN(true);
    const el = document.createElement("div");
    el.id = "dvn"; el.className = "vn dvn";
    el.innerHTML = `<img class="vn-bg" data-r="bg" alt=""><div class="vn-fx" data-r="fx"></div>
      <img class="vn-partner" data-r="partner" alt=""><img class="vn-me" data-r="me" alt="">
      <div class="vn-hud"><span class="vn-pill" data-r="clues"></span><span class="vn-pill" data-r="love"></span><span class="vn-pill" data-r="asks"></span><span class="vn-pill vn-q" data-r="quota"></span><button type="button" class="vn-pill vn-ad hidden" data-r="ad"></button><button type="button" class="vn-x" data-r="x">✕</button></div>
      <div class="vn-choices" data-r="choices"></div>
      <div class="vn-box" data-r="box">
        <div class="vn-name hidden" data-r="name"><img data-r="nav" alt=""><span data-r="nt"></span></div>
        <div class="vn-tools"><button type="button" data-t="log">📜</button><button type="button" data-t="notes">📒</button><button type="button" data-t="skip">⏩</button><button type="button" data-t="auto">▶</button></div>
        <div class="vn-txt" data-r="txt"></div><div class="vn-extra" data-r="extra"></div><span class="vn-next" data-r="nx">▼</span>
      </div>
      <div class="vn-log hidden" data-r="log"></div>`;
    document.body.appendChild(el);
    document.documentElement.classList.add("vn-open");
    R("x").addEventListener("click", (e) => { e.stopPropagation(); closeVN(); });
    R("ad").addEventListener("click", (e) => { e.stopPropagation(); window.CSLAds?.reward("detective", state?.lang); });
    el.addEventListener("click", onTap);
    el.querySelectorAll(".vn-tools button").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); tool(b.dataset.t, b); }));
    R("log").addEventListener("click", (e) => { e.stopPropagation(); R("log").classList.add("hidden"); });
    haptic("light");
    vn = { auto: false };
    loadTurn(state.turns[state.turns.length - 1]);
  }
  function closeVN(silent) {
    clearInterval(typeTimer); clearTimeout(autoTimer);
    $("dvn")?.remove(); if (!$("dvs") && !$("vn") && !$("vns")) document.documentElement.classList.remove("vn-open");
    vn = null; picking = false;
    if (!silent) render();
  }
  function hud() {
    if (!vn) return;
    const t = T();
    R("clues").textContent = `🔍 ${state.clues.length}`;
    R("love").textContent = `💘 ${NAMES[state.crush]} ${state.love}%`;
    R("asks").textContent = state.ended ? `📖 ${t.chapter(state.chapter)}` : `❓ ${state.asks || 0}/${MAX_ASKS}`;
    R("quota").textContent = quota ? (quota.vip ? "👑 VIP" : `⚡ ${quota.remaining}/${Math.max(quota.limit, quota.remaining || 0)}`) : "";
    paintAd();
  }
  // Fix 38: Adsgram reward button (free players only)
  function paintAd() {
    if (!vn) return;
    const b = R("ad"); if (!b) return;
    const on = !!(window.CSLAds && quota && quota.enabled && !quota.vip);
    b.classList.toggle("hidden", !on);
    if (on) b.textContent = window.CSLAds.label(state?.lang, true);
  }
  let lastRetry = null;
  document.addEventListener("csl-ad-reward", async (e) => {
    if (e.detail?.game !== "detective") return;
    await refreshStatus();
    if (vn && vn.mode === "err" && lastRetry) lastRetry();
  });
  function setScene(turn) {
    const scene = SCENES.includes(turn?.scene) ? turn.scene : "party";
    const bg = R("bg"); if (bg && !bg.src.endsWith(BG(scene))) bg.src = BG(scene);
    const f = R("fx"); if (f && f.dataset.k !== scene) { f.dataset.k = scene; f.className = `vn-fx stage-fx fx-${FX[scene]}`; f.innerHTML = fx(FX[scene]); }
    const who = SPRITE[turn?.speaker] ? turn.speaker : "";
    const expr = ["neutral", "smile", "shy", "sad", "surprised"].includes(turn?.expression) ? turn.expression : "neutral";
    const pt = R("partner"); if (pt) { pt.classList.toggle("hidden", !who); if (who) pt.src = sprite(who, expr); }
    vn.partner = who ? NAMES[who] + (who === state.crush ? " 💘" : "") : "";
    hud();
  }
  function loadTurn(turn) {
    if (!vn) return;
    setScene(turn);
    vn.turn = turn;
    const t = T();
    const pre = state.ended && turn === state.turns[state.turns.length - 1] ? [state.correct ? t.right : t.wrong(NAMES[state.culprit] || "?")] : [];
    vn.pages = [...pre, ...pagesOf(turn?.story || "")];
    vn.i = 0;
    showPage();
  }
  function speaker(mode, name) {
    const n = R("name"), av = R("nav"); if (!n) return;
    n.classList.toggle("hidden", !name); n.classList.toggle("me", mode === "me");
    R("nt").textContent = name || "";
    av.classList.toggle("hidden", mode !== "me");
    if (mode === "me") av.src = `${ASSET}av${myAv()}.webp`;
  }
  function meVisible(on) {
    const me = R("me"); if (!me) return;
    if (on) me.src = `${ASSET}p${myAv()}.webp`;
    me.classList.toggle("on", on);
    $("dvn")?.classList.toggle("dim", on);
  }
  function typeText(txt, done) {
    clearInterval(typeTimer);
    const box = R("txt"); if (!box) return;
    const chars = Array.from(txt); let k = 0;
    vn.typing = true; vn.full = txt; vn.onDone = done;
    box.textContent = ""; R("nx").classList.add("hidden");
    typeTimer = setInterval(() => { k += 2; box.textContent = chars.slice(0, k).join(""); if (k >= chars.length) finishType(); }, 28);
  }
  function finishType() {
    clearInterval(typeTimer); if (!vn) return;
    R("txt").textContent = vn.full; vn.typing = false; R("nx").classList.remove("hidden");
    const d = vn.onDone; vn.onDone = null; d && d();
  }
  function showPage() {
    vn.mode = "read";
    meVisible(false); R("choices").innerHTML = ""; R("extra").innerHTML = "";
    const page = vn.pages[vn.i] || "";
    const talk = vn.partner && QUOTE.test(page);
    speaker("partner", talk ? vn.partner : "");
    R("txt").classList.toggle("narr", !talk);
    const lastPage = vn.i === vn.pages.length - 1;
    typeText(page, () => {
      if (lastPage && vn.turn?.clue) R("extra").innerHTML = `<span class="dvn-clue">${esc(T().newClue)} – ${esc(vn.turn.clue)}</span>`;
      if (vn?.auto) autoTimer = setTimeout(() => advance(), 1600);
    });
  }
  function advance() {
    clearTimeout(autoTimer);
    if (!vn || vn.mode !== "read") return;
    if (vn.typing) return finishType();
    if (vn.i < vn.pages.length - 1) { vn.i++; showPage(); return; }
    state.ended ? showEnd() : showChoices();
  }
  function showChoices() {
    vn.mode = "choice"; picking = false;
    const t = T(), asks = state.asks || 0, left = MIN_ASKS - asks;
    meVisible(true); speaker("me", state.name);
    R("txt").classList.remove("narr"); R("nx").classList.add("hidden"); R("extra").innerHTML = "";
    R("txt").textContent = asks >= MAX_ASKS ? t.lastChance : X().pickSay;
    const ch = asks >= MAX_ASKS ? [] : (vn.turn?.choices || []);
    R("choices").innerHTML = ch.map((c, i) => `<button type="button" data-c="${i}"><b>${"ABC"[i]}</b>${esc(c.text)} <span class="dvn-k">${t.kinds[c.kind] || "💬"}</span></button>`).join("") +
      `<button type="button" class="dvn-acc" data-acc="1"${left > 0 ? " disabled" : ""}>${left > 0 ? t.accuseLocked(left) : t.accuse}</button>`;
    R("choices").querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); vnAsk(Number(b.dataset.c)); }));
    R("choices").querySelector("[data-acc]")?.addEventListener("click", (e) => { e.stopPropagation(); if (left <= 0) showPicker(); });
  }
  function showPicker() {
    vn.mode = "pick"; picking = true; haptic("medium");
    const t = T(), roles = state.roles || {};
    R("txt").textContent = t.pickCulprit;
    R("choices").innerHTML = `<div class="dvn-pick">${suspectsFor(state.identity).map((s) => `<button type="button" data-s="${s}" class="${s === state.crush ? "crush" : ""}"><img src="${sprite(s, "neutral")}" alt=""><b>${NAMES[s]}</b><small>${esc(roles[s === state.crush ? "crush" : s] || "")}</small></button>`).join("")}</div>
      <button type="button" class="dvn-cancel" data-r="cancel">${t.cancel}</button>`;
    R("choices").querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); vnAccuse(b.dataset.s); }));
    R("cancel").addEventListener("click", (e) => { e.stopPropagation(); showChoices(); });
  }
  function showEnd() {
    vn.mode = "end";
    const t = T(), last = state.turns[state.turns.length - 1] || {};
    meVisible(true); speaker("me", state.name); R("choices").innerHTML = "";
    R("txt").classList.remove("narr"); R("nx").classList.add("hidden");
    R("txt").textContent = (last.hook ? "🔮 " + last.hook + "\n" : "") + "🏅 " + t.solved(state.solved || 0, state.total || 0);
    R("extra").innerHTML = `<button type="button" class="vn-btn gold" data-r="nextch">${t.next(state.chapter + 1)}</button>`;
    R("nextch").addEventListener("click", (e) => { e.stopPropagation(); vnNext(); });
  }
  function waiting(text) {
    R("choices").innerHTML = "";
    speaker("me", state.name);
    typeText(text, () => { R("nx").classList.add("hidden"); R("extra").innerHTML = `<span class="vn-dots3"><i></i><i></i><i></i></span>`; });
  }
  function failed(err, retry) {
    if (!vn) return;
    if (vn.typing) finishType();
    vn.mode = "err";
    R("extra").innerHTML = `<span class="vn-err">${esc(T()[err] || T().FAILED)}</span>` +
      (err === "LIMIT" ? (window.CSLAds ? `<button type="button" class="vn-btn" data-r="adr">${window.CSLAds.label(state?.lang)}</button>` : "") + `<button type="button" class="vn-btn gold" data-r="vip">👑 Get VIP</button>` : `<button type="button" class="vn-btn" data-r="retry">${X().retry}</button>`);
    lastRetry = retry;
    R("vip")?.addEventListener("click", (e) => { e.stopPropagation(); closeVN(); $("vip-page-buy")?.click(); });
    R("adr")?.addEventListener("click", (e) => { e.stopPropagation(); window.CSLAds?.reward("detective", state?.lang); });
    R("retry")?.addEventListener("click", (e) => { e.stopPropagation(); retry(); });
  }
  async function vnAsk(i) {
    const picked = vn?.turn?.choices?.[i]?.text;
    if (!picked || vn.mode !== "choice") return;
    vn.mode = "say"; haptic(); waiting(picked);
    const err = await ask(i);
    if (!vn) return;
    if (err) return failed(err, showChoices);
    await window.CSLAds?.afterTurn(!!quota?.vip);
    if (!vn) return;
    loadTurn(state.turns[state.turns.length - 1]);
  }
  async function vnAccuse(s) {
    if (!vn || vn.mode !== "pick") return;
    vn.mode = "say"; haptic("heavy"); waiting(`⚖️ ${NAMES[s]}!`);
    const err = await accuse(s);
    if (!vn) return;
    if (err) return failed(err, showPicker);
    loadTurn(state.turns[state.turns.length - 1]);
  }
  async function vnNext() {
    if (!vn || vn.mode !== "end") return;
    vn.mode = "say"; R("extra").innerHTML = `<span class="vn-dots3"><i></i><i></i><i></i></span>`;
    const err = await nextChapter();
    if (!vn) return;
    if (err) return failed(err, showEnd);
    loadTurn(state.turns[state.turns.length - 1]);
  }
  function tool(k, btn) {
    if (!vn) return;
    if (k === "skip") { if (vn.mode === "read") { finishType(); vn.i = vn.pages.length - 1; showPage(); finishType(); } return; }
    if (k === "auto") { vn.auto = !vn.auto; btn.classList.toggle("on", vn.auto); if (vn.auto && vn.mode === "read" && !vn.typing) advance(); return; }
    const lg = R("log"), t = T();
    if (k === "log") lg.innerHTML = `<h3>📜 ${esc(X().log)}</h3>` + state.turns.map((z) => `<div class="vn-log-i">${z.title ? `<b>${esc(z.title)}</b>` : ""}<p>${esc(z.story)}</p>${z.picked ? `<em>➜ ${esc(state.name)}: ${esc(z.picked)}</em>` : ""}</div>`).join("");
    if (k === "notes") lg.innerHTML = `<h3>${t.notebook} (${state.clues.length})</h3>` + (state.clues.length ? `<ol class="dvn-notes">${state.clues.map((c) => `<li>${esc(c)}</li>`).join("")}</ol>` : `<p>${t.noClues}</p>`);
    lg.classList.remove("hidden"); lg.scrollTop = k === "log" ? lg.scrollHeight : 0;
  }
  function onTap(e) {
    if (!vn || e.target.closest(".vn-choices,.vn-hud,.vn-tools,.vn-btn,.vn-extra button")) return;
    if (vn.mode === "read") advance();
  }

  function setLoading(on) {
    busy = on;
    document.querySelectorAll("#detective-section button, #dvs button").forEach((b) => { b.disabled = on; });
    const err = $("det-error"); if (err) err.innerHTML = on ? `<span class="vn-dots3"><i></i><i></i><i></i></span>` : "";
  }
  function showError(code) {
    const err = $("det-error"); if (!err) return;
    const t = T();
    const adBtn = (code === "LIMIT" && window.CSLAds) ? ` <button type="button" id="det-ad-limit" class="vn-btn">${esc(window.CSLAds.label(state ? state.lang : setup.lang))}</button>` : "";
    err.innerHTML = esc(t[code] || t.FAILED) + (code === "LIMIT" ? adBtn + ' <button type="button" id="det-get-vip" class="vn-btn gold">👑 Get VIP</button>' : "");
    $("det-get-vip")?.addEventListener("click", () => { closeSetup(); $("vip-page-buy")?.click(); });
    // Fix 40: watch a Reward ad from the setup screen, then tap Start again.
    $("det-ad-limit")?.addEventListener("click", async () => { if (await window.CSLAds?.reward("detective", state ? state.lang : setup.lang)) err.innerHTML = ""; });
  }
  function history() {
    const h = [];
    state.turns.forEach((p) => {
      h.push({ role: "model", text: JSON.stringify({ title: p.title, story: p.story, clue: p.clue, choices: p.choices }) });
      if (p.picked) h.push({ role: "user", text: `The player chooses: ${p.picked}` });
    });
    return h.slice(-14);
  }
  async function call(payload) {
    const { ok, status, data } = await api("/api/detective/turn", { method: "POST", body: JSON.stringify(payload) });
    if (ok) return data;
    if (status === 402) throw new Error("LIMIT");
    if (status === 429) throw new Error("BUSY");
    if (status === 422) throw new Error("BLOCKED");
    if (status === 503) throw new Error("SETUP");
    if (status === 400 && data?.error === "CASE") throw new Error("CASE");
    throw new Error("FAILED");
  }
  const base = () => ({ identity: state.identity, name: state.name, mature: state.mature, lang: state.lang, love: state.love, chapter: state.chapter, prev: state.prev || "" });
  const turnOf = (d) => ({ title: d.title, story: d.story, scene: d.scene, speaker: d.speaker, expression: d.expression, choices: d.choices || [], clue: d.clue || "", hook: d.hook || "" });
  function caseFrom(d, keep) {
    return {
      ...keep, chapter: d.chapter, token: d.token, caseTitle: d.caseTitle || d.title || "", roles: d.roles || {},
      turns: [turnOf(d)], clues: d.clue ? [d.clue] : [], asks: 0, ended: false, correct: null, culprit: ""
    };
  }


  async function startGame() {
    if (busy) return;
    if (!setup.identity) { const e = $("det-error"); if (e) e.textContent = T().pickWho; return; }
    const avatar = avSet().includes(setup.avatar) ? setup.avatar : AV_FOR[setup.identity] || 1;
    const keep = { identity: setup.identity, name: setup.name || "Detective", mature: setup.mature, lang: setup.lang, avatar, crush: CRUSH[setup.identity], love: 20, prev: "", solved: 0, total: 0 };
    setLoading(true);
    try {
      const d = await call({ identity: keep.identity, name: keep.name, mature: keep.mature, lang: keep.lang, love: keep.love, chapter: 1, action: "start" });
      state = caseFrom(d, keep); save(); setLoading(false); closeSetup(); render(); refreshStatus(); openVN();
    } catch (e) { setLoading(false); showError(e.message); }
  }
  // These return null on success, or an error code.
  async function ask(i) {
    if (busy || !state) return "BUSY";
    const last = state.turns[state.turns.length - 1];
    const picked = last?.choices?.[i]?.text; if (!picked) return "FAILED";
    busy = true;
    try {
      const d = await call({ ...base(), action: "ask", choice: picked, token: state.token, history: history(), clues: state.clues });
      last.picked = picked;
      state.turns = [...state.turns, turnOf(d)].slice(-40);
      if (d.clue && !state.clues.includes(d.clue)) state.clues.push(d.clue);
      state.love = Math.max(0, Math.min(100, state.love + (Number(d.love) || 0)));
      state.asks = (state.asks || 0) + 1;
      save(); refreshStatus(); return null;
    } catch (e) { return e.message || "FAILED"; } finally { busy = false; }
  }
  async function accuse(suspect) {
    if (busy || !state) return "BUSY";
    busy = true;
    try {
      const d = await call({ ...base(), action: "accuse", suspect, token: state.token, history: history(), clues: state.clues });
      state.turns = [...state.turns, turnOf(d)].slice(-40);
      state.love = Math.max(0, Math.min(100, state.love + (Number(d.love) || 0)));
      state.ended = true; state.correct = !!d.correct; state.culprit = d.culprit || "";
      state.total = (state.total || 0) + 1; if (d.correct) state.solved = (state.solved || 0) + 1;
      state.prev = [state.prev, `Chapter ${state.chapter}: ${d.summary || ""}`].filter(Boolean).join(" ").slice(-1700);
      picking = false; save(); refreshStatus(); return null;
    } catch (e) { return e.message || "FAILED"; } finally { busy = false; }
  }
  async function nextChapter() {
    if (busy || !state) return "BUSY";
    busy = true;
    try {
      const d = await call({ ...base(), action: "next" });
      const keep = { identity: state.identity, name: state.name, mature: state.mature, lang: state.lang, avatar: state.avatar, crush: state.crush, love: state.love, prev: state.prev, solved: state.solved, total: state.total };
      state = caseFrom(d, keep); save(); refreshStatus(); return null;
    } catch (e) { return e.message || "FAILED"; } finally { busy = false; }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
