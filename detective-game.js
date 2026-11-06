/* CityStoryLove AI Detective game (Fix 20). Story Games.
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
  let setup = { identity: "", name: "", mature: false, lang: (state && state.lang) || "en" };
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
      quota = ok ? data : null; paintQuota();
    } catch { quota = null; paintQuota(); }
  }
  function paintQuota() {
    const el = $("det-quota"); if (!el) return;
    el.textContent = !quota ? "" : !quota.enabled ? T().soon : quota.vip ? T().vip : T().left(quota.remaining, quota.limit);
  }

  // ---------- Rendering ----------
  function render() {
    const h = document.querySelector("#detective-section .section-heading h2");
    if (h) h.innerHTML = T().heading;
    const btn = $("detective-tab-btn"); if (btn) btn.textContent = T().tab;
    paintQuota();
    const body = $("det-body"); if (!body) return;
    if (!state) return renderSetup(body);
    renderCase(body);
  }
  function suspectsFor(identity) { const c = CRUSH[identity] || "lin"; return [c, "ray", "mira"]; }

  function renderSetup(body) {
    const t = T();
    const crush = CRUSH[setup.identity] || "lin";
    body.innerHTML = `
      <div class="story-card">
        <p class="det-intro">${t.intro}</p>
        <div class="det-suspects">${[crush, "ray", "mira"].map((s, i) => `<div class="det-sus${i === 0 ? " crush" : ""}"><div class="ph"><img src="${SPRITE[s]("smile")}" alt=""></div><b>${NAMES[s]}</b>${i === 0 ? "<span>💘</span>" : "<span>❔</span>"}</div>`).join("")}</div>
        <h3>🌐 ${t.lang}</h3>
        <div class="story-chips">${LANGS.map(([k, l]) => `<button type="button" class="story-chip${setup.lang === k ? " active" : ""}" data-lang="${k}">${l}</button>`).join("")}</div>
        <h3>${t.who}</h3>
        <div class="story-chips">${IDENTITY_KEYS.map((k) => `<button type="button" class="story-chip${setup.identity === k ? " active" : ""}" data-identity="${k}">${t.identities[k]}</button>`).join("")}</div>
        <label class="story-label">${t.name}<input id="det-name" maxlength="30" placeholder="${esc(t.namePh)}" value="${esc(setup.name)}"></label>
        <label class="story-check"><input type="checkbox" id="det-mature"${setup.mature ? " checked" : ""}> ${t.mature}</label>
        <button type="button" id="det-start" class="button button-gold full-width">${t.start}</button>
        <p id="det-error" class="story-error"></p>
      </div>`;
    const read = () => { setup.name = ($("det-name")?.value || "").trim(); setup.mature = !!$("det-mature")?.checked; };
    body.querySelectorAll("[data-identity]").forEach((b) => b.addEventListener("click", () => { read(); setup.identity = b.dataset.identity; render(); }));
    body.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => { read(); setup.lang = b.dataset.lang; render(); }));
    $("det-start")?.addEventListener("click", () => { read(); startGame(); });
  }

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
  function stage(turn) {
    const scene = SCENES.includes(turn?.scene) ? turn.scene : "party";
    const who = SPRITE[turn?.speaker] ? turn.speaker : "";
    const expr = ["neutral", "smile", "shy", "sad", "surprised"].includes(turn?.expression) ? turn.expression : "neutral";
    return `<div class="story-stage det-stage" id="det-stage">
      <img class="stage-bg" src="${BG(scene)}" alt="">
      <div class="stage-fx fx-${FX[scene]}">${fx(FX[scene])}</div>
      ${who ? `<div class="stage-char" data-who="${who}" data-expr="${expr}"><img class="char-img" src="${SPRITE[who](expr)}" alt="${NAMES[who]}"></div><span class="stage-name">${NAMES[who]}${who === state.crush ? " 💘" : ""}</span>` : ""}
      <div class="stage-shade"></div></div>`;
  }

  function renderCase(body) {
    const t = T(), last = state.turns[state.turns.length - 1] || {};
    const past = state.turns.slice(0, -1);
    const asks = state.asks || 0, left = MIN_ASKS - asks;
    const crushName = NAMES[state.crush];
    const roles = state.roles || {};
    const ended = !!state.ended;
    const choices = ended ? "" : (asks >= MAX_ASKS
      ? `<p class="det-last">${t.lastChance}</p>`
      : (last.choices || []).map((c, i) => `<button type="button" class="story-choice det-choice" data-choice="${i}">${esc(c.text)}<span>${t.kinds[c.kind] || "💬"}</span></button>`).join(""));
    const accuseBtn = ended ? "" : `<button type="button" id="det-accuse" class="det-accuse"${left > 0 ? " disabled" : ""}>${left > 0 ? t.accuseLocked(left) : t.accuse}</button>`;
    const picker = picking ? `<div class="det-picker"><h3>${t.pickCulprit}</h3><div class="det-suspects">${suspectsFor(state.identity).map((s) => `<button type="button" class="det-sus pick${s === state.crush ? " crush" : ""}" data-suspect="${s}"><div class="ph"><img src="${SPRITE[s]("neutral")}" alt=""></div><b>${NAMES[s]}</b><span>${esc(roles[s === state.crush ? "crush" : s] || "")}</span></button>`).join("")}</div><button type="button" id="det-cancel" class="button button-quiet story-small">${t.cancel}</button></div>` : "";
    const verdict = ended ? `<div class="det-verdict ${state.correct ? "ok" : "bad"}">${state.correct ? t.right : t.wrong(NAMES[state.culprit] || "?")}</div>` : "";
    const after = ended ? `${last.hook ? `<p class="det-hook">🔮 ${esc(last.hook)}</p>` : ""}<p class="det-score">🏅 ${t.solved(state.solved || 0, state.total || 0)}</p>
      <button type="button" id="det-next" class="button button-gold full-width">${t.next(state.chapter + 1)}</button>` : "";
    body.innerHTML = `
      <div class="story-toolbar"><span class="story-who">🕵️ ${esc(state.name)} · ${t.chapter(state.chapter)}${state.caseTitle ? ` · ${esc(state.caseTitle)}` : ""}</span>
        <button type="button" id="det-new" class="button button-quiet story-small">${t.newGame}</button></div>
      <div class="det-meters">
        <div class="det-m">🔍 ${t.clues} ${state.clues.length}<div class="det-bar"><i style="width:${Math.min(100, state.clues.length * 20)}%;background:#ffcf6b"></i></div></div>
        <div class="det-m">💘 ${t.love(crushName)} ${state.love}%<div class="det-bar"><i style="width:${state.love}%;background:#ff5fa2"></i></div></div>
      </div>
      ${past.length ? `<details class="story-past"><summary>${t.past} (${past.length})</summary>${past.map((p) => `<div class="story-past-item">${p.title ? `<b>${esc(p.title)}</b>` : ""}<p>${esc(p.story)}</p>${p.picked ? `<em>➜ ${esc(p.picked)}</em>` : ""}</div>`).join("")}</details>` : ""}
      ${stage(last)}
      <article class="story-card story-current">
        <span class="eyebrow">${esc(last.title || "")}${ended ? "" : ` · ${t.asks(asks, MAX_ASKS)}`}</span>
        ${verdict}
        <p class="story-text">${esc(last.story || "")}</p>
        ${last.clue ? `<div class="det-clue">${t.newClue} – ${esc(last.clue)}</div>` : ""}
        <div class="story-choices">${choices}</div>
        ${accuseBtn}${picker}${after}
        <p id="det-error" class="story-error"></p>
      </article>
      <details class="story-past det-notebook"><summary>${t.notebook} (${state.clues.length})</summary>${state.clues.length ? `<ol>${state.clues.map((c) => `<li>${esc(c)}</li>`).join("")}</ol>` : `<p>${t.noClues}</p>`}</details>`;
    $("det-new")?.addEventListener("click", () => { if (!confirm(t.confirmNew)) return; setup = { identity: state.identity, name: state.name, mature: state.mature, lang: state.lang }; state = null; picking = false; save(); render(); });
    body.querySelectorAll("[data-choice]").forEach((b) => b.addEventListener("click", () => ask(Number(b.dataset.choice))));
    $("det-accuse")?.addEventListener("click", () => { picking = true; render(); document.querySelector(".det-picker")?.scrollIntoView({ behavior: "smooth", block: "center" }); });
    $("det-cancel")?.addEventListener("click", () => { picking = false; render(); });
    body.querySelectorAll("[data-suspect]").forEach((b) => b.addEventListener("click", () => accuse(b.dataset.suspect)));
    $("det-next")?.addEventListener("click", nextChapter);
  }

  function setLoading(on) {
    busy = on;
    document.querySelectorAll("#detective-section button").forEach((b) => { b.disabled = on || (b.id === "det-accuse" && (state?.asks || 0) < MIN_ASKS); });
    const err = $("det-error"); if (err) err.innerHTML = on ? `<span class="vn-dots3"><i></i><i></i><i></i></span>` : "";
  }
  function showError(code) {
    const err = $("det-error"); if (!err) return;
    const t = T();
    err.innerHTML = esc(t[code] || t.FAILED) + (code === "LIMIT" ? ' <button type="button" id="det-get-vip" class="button button-gold story-small">👑 Get VIP</button>' : "");
    $("det-get-vip")?.addEventListener("click", () => $("vip-page-buy")?.click());
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
    const keep = { identity: setup.identity, name: setup.name || "Detective", mature: setup.mature, lang: setup.lang, crush: CRUSH[setup.identity], love: 20, prev: "", solved: 0, total: 0 };
    setLoading(true);
    try {
      const d = await call({ identity: keep.identity, name: keep.name, mature: keep.mature, lang: keep.lang, love: keep.love, chapter: 1, action: "start" });
      state = caseFrom(d, keep); save(); setLoading(false); render(); refreshStatus();
    } catch (e) { setLoading(false); showError(e.message); }
  }
  async function ask(i) {
    if (busy || !state) return;
    const last = state.turns[state.turns.length - 1];
    const picked = last?.choices?.[i]?.text; if (!picked) return;
    setLoading(true);
    try {
      const d = await call({ ...base(), action: "ask", choice: picked, token: state.token, history: history(), clues: state.clues });
      last.picked = picked;
      state.turns = [...state.turns, turnOf(d)].slice(-40);
      if (d.clue && !state.clues.includes(d.clue)) state.clues.push(d.clue);
      state.love = Math.max(0, Math.min(100, state.love + (Number(d.love) || 0)));
      state.asks = (state.asks || 0) + 1;
      save(); setLoading(false); render(); refreshStatus();
      $("detective-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) { setLoading(false); showError(e.message === "CASE" ? "CASE" : e.message); }
  }
  async function accuse(suspect) {
    if (busy || !state) return;
    setLoading(true);
    try {
      const d = await call({ ...base(), action: "accuse", suspect, token: state.token, history: history(), clues: state.clues });
      state.turns = [...state.turns, turnOf(d)].slice(-40);
      state.love = Math.max(0, Math.min(100, state.love + (Number(d.love) || 0)));
      state.ended = true; state.correct = !!d.correct; state.culprit = d.culprit || "";
      state.total = (state.total || 0) + 1; if (d.correct) state.solved = (state.solved || 0) + 1;
      state.prev = [state.prev, `Chapter ${state.chapter}: ${d.summary || ""}`].filter(Boolean).join(" ").slice(-1700);
      picking = false; save(); setLoading(false); render(); refreshStatus();
      $("detective-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) { setLoading(false); showError(e.message); }
  }
  async function nextChapter() {
    if (busy || !state) return;
    setLoading(true);
    try {
      const d = await call({ ...base(), action: "next" });
      const keep = { identity: state.identity, name: state.name, mature: state.mature, lang: state.lang, crush: state.crush, love: state.love, prev: state.prev, solved: state.solved, total: state.total };
      state = caseFrom(d, keep); save(); setLoading(false); render(); refreshStatus();
      $("detective-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) { setLoading(false); showError(e.message); }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
