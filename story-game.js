/* CityStoryLove AI Story Game. Talks only to the game backend (the Gemini key stays on the server). */
(() => {
  "use strict";
  const cfg = window.VIDEOSPACE_CONFIG || {};
  const API = (cfg.VIP_API_URL || "").replace(/\/$/, "");
  const tg = window.Telegram?.WebApp;
  const SAVE_KEY = "videospace_story_v1_" + String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "guest"); // per Telegram account
  const $ = (id) => document.getElementById(id);

  const TEXT = {
    my: {
      avatar: "ကိုယ့် Avatar", next: "ရှေ့ဆက် ▶", back: "◀ နောက်သို့", cont: "▶ ဆက်ဆော့မယ်", pickSay: "ဘာပြန်ပြောမလဲ? ရွေးပါ 👆", retry: "↻ ထပ်စမ်းမယ်", log: "ယခင်စကားများ", ch: "အပိုင်း",
      heading: '🎮 ကိုယ်တိုင်ဆော့ရတဲ့ <span class="gold-text">ဇာတ်လမ်း</span>',
      who: "သင် ဘယ်သူလဲ?", genre: "ဇာတ်လမ်းအမျိုးအစား", name: "ဇာတ်ကောင်နာမည်", namePh: "ဥပမာ - မောင်မောင်",
      lang: "ဘာသာစကား",
      mature: "💋 ရင်ခုန်ဇာတ်ဝင်ခန်းများ (နမ်းတာ၊ ဖက်တာ) ပါမယ်။ ကျွန်ုပ်အသက် ၁၈ နှစ်ပြည့်ပါပြီ။",
      start: "▶ ဇာတ်လမ်းစမယ်", newStory: "↺ အသစ်စမယ်", confirmNew: "ဒီဇာတ်လမ်းကို ဖျက်ပြီး အသစ်စမလား?",
      past: "ယခင်အပိုင်းများ", writing: "AI က ဇာတ်လမ်းရေးနေပါတယ်…", pickWho: "သင် ဘယ်သူလဲ ဆိုတာ အရင်ရွေးပါ။",
      vip: "👑 VIP · အကန့်အသတ်မရှိ", left: (r, l) => `ဒီနေ့ အခမဲ့ ${r}/${l} ကြိမ်ကျန်`, soon: "Story game မကြာခင်ဖွင့်ပါမယ်",
      LIMIT: "ဒီနေ့ အခမဲ့အကြိမ် ကုန်သွားပါပြီ။ 👑 VIP ယူရင် အကန့်အသတ်မရှိ ဆော့လို့ရပါတယ်။",
      BUSY: "AI အလုပ်များနေပါတယ်။ ခဏနေ ထပ်နှိပ်ပါ။", BLOCKED: "ဒီရွေးချယ်မှုကို AI ကမရေးပေးနိုင်ပါ။ တခြားတစ်ခု ရွေးကြည့်ပါ။",
      NOTG: "Telegram Mini App ကနေ ဖွင့်မှ ဆော့လို့ရပါတယ်။", SETUP: "Story game မကြာခင်ဖွင့်ပါမယ်။", FAILED: "တစ်ခုခုမှားသွားပါတယ်။ ထပ်နှိပ်ကြည့်ပါ။",
      identities: { boy: "👦 ယောက်ျားလေး", girl: "👧 မိန်းကလေး", gay: "🏳️‍🌈 Gay", lesbian: "🏳️‍🌈 Lesbian", transwoman: "🏳️‍⚧️ Trans (မိန်းမ)", transman: "🏳️‍⚧️ Trans (ယောက်ျား)" },
      genres: { romance: "💕 အချစ်", school: "🎓 တက္ကသိုလ်", mystery: "🕵️ လျှို့ဝှက်", horror: "👻 သရဲ", fantasy: "🐉 Fantasy", drama: "🎭 ဘဝဒရာမာ" }
    },
    en: {
      avatar: "Your avatar", next: "Next ▶", back: "◀ Back", cont: "▶ Continue", pickSay: "What will you say? Pick one 👆", retry: "↻ Try again", log: "History", ch: "Ch.",
      heading: '🎮 Play Your Own <span class="gold-text">Story</span>',
      who: "Who are you?", genre: "Story type", name: "Character name", namePh: "e.g. Alex",
      lang: "Language",
      mature: "💋 Include romantic scenes (kissing, hugging). I confirm I am 18 or older.",
      start: "▶ Start story", newStory: "↺ New story", confirmNew: "Delete this story and start a new one?",
      past: "Previous chapters", writing: "AI is writing your story…", pickWho: "Please choose who you are first.",
      vip: "👑 VIP · Unlimited", left: (r, l) => `${r}/${l} free turns left today`, soon: "Story game coming soon",
      LIMIT: "You've used today's free turns. 👑 Get VIP to play without limits.",
      BUSY: "The AI is busy. Please try again in a moment.", BLOCKED: "The AI can't write that choice. Try another one.",
      NOTG: "Open this from the Telegram Mini App to play.", SETUP: "Story game coming soon.", FAILED: "Something went wrong. Please try again.",
      identities: { boy: "👦 Boy", girl: "👧 Girl", gay: "🏳️‍🌈 Gay", lesbian: "🏳️‍🌈 Lesbian", transwoman: "🏳️‍⚧️ Trans woman", transman: "🏳️‍⚧️ Trans man" },
      genres: { romance: "💕 Romance", school: "🎓 Campus", mystery: "🕵️ Mystery", horror: "👻 Horror", fantasy: "🐉 Fantasy", drama: "🎭 Life drama" }
    }
  };
  TEXT.ru = {
    avatar: "Ваш аватар", next: "Далее ▶", back: "◀ Назад", cont: "▶ Продолжить", pickSay: "Что ответите? Выберите 👆", retry: "↻ Ещё раз", log: "История", ch: "Гл.",
      heading: '🎮 Сыграй свою <span class="gold-text">историю</span>',
    who: "Кто вы?", genre: "Жанр истории", name: "Имя персонажа", namePh: "например, Саша",
    lang: "Язык",
    mature: "💋 Романтические сцены (поцелуи, объятия). Подтверждаю, что мне есть 18 лет.",
    start: "▶ Начать историю", newStory: "↺ Новая история", confirmNew: "Удалить эту историю и начать новую?",
    past: "Предыдущие главы", writing: "ИИ пишет вашу историю…", pickWho: "Сначала выберите, кто вы.",
    vip: "👑 VIP · Без ограничений", left: (r, l) => `Сегодня осталось бесплатно: ${r}/${l}`, soon: "Игра скоро появится",
    LIMIT: "Бесплатные ходы на сегодня закончились. 👑 Оформите VIP, чтобы играть без ограничений.",
    BUSY: "ИИ сейчас занят. Попробуйте чуть позже.", BLOCKED: "ИИ не может написать этот вариант. Выберите другой.",
    NOTG: "Откройте игру через Telegram Mini App.", SETUP: "Игра скоро появится.", FAILED: "Что-то пошло не так. Попробуйте ещё раз.",
    identities: { boy: "👦 Парень", girl: "👧 Девушка", gay: "🏳️‍🌈 Гей", lesbian: "🏳️‍🌈 Лесбиянка", transwoman: "🏳️‍⚧️ Транс-женщина", transman: "🏳️‍⚧️ Транс-мужчина" },
    genres: { romance: "💕 Романтика", school: "🎓 Студенчество", mystery: "🕵️ Детектив", horror: "👻 Ужасы", fantasy: "🐉 Фэнтези", drama: "🎭 Драма" }
  };
  TEXT.es = {
    avatar: "Tu avatar", next: "Siguiente ▶", back: "◀ Atrás", cont: "▶ Continuar", pickSay: "¿Qué dirás? Elige 👆", retry: "↻ Reintentar", log: "Historial", ch: "Cap.",
      heading: '🎮 Juega tu propia <span class="gold-text">historia</span>',
    who: "¿Quién eres?", genre: "Tipo de historia", name: "Nombre del personaje", namePh: "p. ej. Alex",
    lang: "Idioma",
    mature: "💋 Incluir escenas románticas (besos, abrazos). Confirmo que tengo 18 años o más.",
    start: "▶ Empezar historia", newStory: "↺ Nueva historia", confirmNew: "¿Borrar esta historia y empezar otra?",
    past: "Capítulos anteriores", writing: "La IA está escribiendo tu historia…", pickWho: "Primero elige quién eres.",
    vip: "👑 VIP · Sin límites", left: (r, l) => `Te quedan ${r}/${l} turnos gratis hoy`, soon: "El juego llegará pronto",
    LIMIT: "Has usado los turnos gratis de hoy. 👑 Hazte VIP para jugar sin límites.",
    BUSY: "La IA está ocupada. Inténtalo de nuevo en un momento.", BLOCKED: "La IA no puede escribir esa opción. Prueba otra.",
    NOTG: "Abre el juego desde la Mini App de Telegram.", SETUP: "El juego llegará pronto.", FAILED: "Algo salió mal. Inténtalo de nuevo.",
    identities: { boy: "👦 Chico", girl: "👧 Chica", gay: "🏳️‍🌈 Gay", lesbian: "🏳️‍🌈 Lesbiana", transwoman: "🏳️‍⚧️ Mujer trans", transman: "🏳️‍⚧️ Hombre trans" },
    genres: { romance: "💕 Romance", school: "🎓 Universidad", mystery: "🕵️ Misterio", horror: "👻 Terror", fantasy: "🐉 Fantasía", drama: "🎭 Drama" }
  };
  const LANGS = [["en", "🇬🇧 English"], ["ru", "🇷🇺 Русский"], ["es", "🇪🇸 Español"], ["my", "🇲🇲 မြန်မာ"]];
  const IDENTITY_KEYS = ["boy", "girl", "gay", "lesbian", "transwoman", "transman"];
  const GENRE_KEYS = ["romance", "school", "mystery", "horror", "fantasy", "drama"];
  const T = () => TEXT[state ? state.lang : setup.lang] || TEXT.en;

  let state = load() || null;
  let setup = { identity: "", genre: "romance", name: "", mature: false, lang: "en", avatar: 0 };
  const AV_SET = { boy: [1, 2, 3], girl: [4, 5, 6], gay: [7, 8], lesbian: [9, 10], transwoman: [11, 12], transman: [13, 14] };
  const AV_FOR = { boy: 1, girl: 4, gay: 7, lesbian: 9, transwoman: 11, transman: 13 };
  const ASSET = "story-assets/";
  let lastQuota = null;
  let busy = false;

  function load() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch { return null; }
  }
  function save() {
    try { state ? localStorage.setItem(SAVE_KEY, JSON.stringify(state)) : localStorage.removeItem(SAVE_KEY); } catch {}
  }
  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // ---------- Tab wiring ----------
  function showStory(on) {
    const section = $("story-section");
    if (!section) return;
    section.classList.toggle("hidden", !on);
    if (on) $("vip-hero")?.classList.add("hidden");
    $("story-tab-btn")?.classList.toggle("active", on);
    if (on) {
      render();
      refreshStatus();
      if (!state) openSetup();
    }
  }
  $("story-tab-btn")?.addEventListener("click", () => showStory(true));
  ["games-tab-btn", "city-tab-btn", "detective-tab-btn"].forEach((id) =>
    document.addEventListener("click", (e) => { if (e.target?.id === id) showStory(false); }, true)
  );

  // ---------- API ----------
  async function api(path, options = {}) {
    if (!API) throw new Error("NOAPI");
    if (!tg?.initData) throw new Error("NOTG");
    const resp = await fetch(API + path, {
      ...options,
      headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": tg.initData, ...(options.headers || {}) }
    });
    const data = await resp.json().catch(() => ({}));
    return { ok: resp.ok, status: resp.status, data };
  }
  async function refreshStatus() {
    const el = $("story-quota");
    try {
      const { ok, data } = await api("/api/story/status", { cache: "no-store" });
      if (!ok) { lastQuota = null; if (el) el.textContent = ""; paintAd(); return false; }
      lastQuota = data;
      paintQuota(); paintAd();
      return true;
    } catch { if (el && !lastQuota) el.textContent = ""; return false; }
  }

  function paintQuota() {
    const el = $("story-quota"), d = lastQuota;
    if (!el || !d) return;
    el.textContent = !d.enabled ? T().soon : d.vip ? T().vip : T().left(d.remaining, Math.max(d.limit, d.remaining || 0));
  }

  // ---------- Rendering ----------
  function render() {
    const heading = document.querySelector("#story-section .section-heading h2");
    if (heading) heading.innerHTML = T().heading;
    paintQuota();
    const body = $("story-body");
    if (!body) return;
    if (!state) return renderSetup(body);
    renderStory(body);
  }

  function renderSetup(body) {
    body.innerHTML = `
      <div class="story-card">
        <button type="button" id="story-open-setup" class="button button-gold full-width">${T().start}</button>
      </div>`;
    $("story-open-setup")?.addEventListener("click", openSetup);
  }
  function readInputs() {
    const n = $("story-name"), m = $("story-mature");
    if (n) setup.name = (n.value || "").trim();
    if (m) setup.mature = !!m.checked;
  }

  // ── Step-by-step setup wizard (full-screen, VN style) ──
  let wiz = 0;
  function avSet() { return AV_SET[setup.identity] || AV_SET.boy; }
  function openSetup() {
    $("vns")?.remove();
    wiz = 0;
    const el = document.createElement("div");
    el.id = "vns"; el.className = "vn vns";
    el.innerHTML = `
      <img class="vn-bg" id="vns-bg" alt=""><div class="vn-fx" id="vns-fx"></div>
      <img class="vn-partner vns-me" id="vns-me" alt="">
      <div class="vn-hud"><span class="vns-dots" id="vns-dots"></span><button type="button" class="vn-x" id="vns-x">✕</button></div>
      <div class="vn-box vns-box" id="vns-box"></div>`;
    document.body.appendChild(el);
    document.documentElement.classList.add("vn-open");
    $("vns-x").addEventListener("click", closeSetup);
    paintSetup();
  }
  function closeSetup() {
    $("vns")?.remove();
    if (!$("vn")) document.documentElement.classList.remove("vn-open");
  }
  function paintSetup() {
    const box = $("vns-box");
    if (!box) return;
    const t = T();
    const scene = wiz >= 3 ? (GENRE_SCENE[setup.genre] || "cafe") : "cafe";
    const bg = $("vns-bg"); if (bg && !bg.src.endsWith(`bg_${scene}.webp`)) bg.src = `${ASSET}bg_${scene}.webp`;
    const fx = $("vns-fx"); if (fx) { fx.className = "vn-fx stage-fx fx-" + (FX[scene] || "bokeh"); fx.innerHTML = fxParticles(FX[scene] || "bokeh"); }
    const me = $("vns-me");
    if (me) {
      const show = wiz >= 2 && setup.identity;
      me.classList.toggle("hidden", !show);
      if (show) { if (!avSet().includes(setup.avatar)) setup.avatar = avSet()[0]; me.src = `${ASSET}p${setup.avatar}.webp`; }
    }
    $("vns-dots").innerHTML = [0, 1, 2, 3, 4].map((i) => `<i class="${i === wiz ? "on" : i < wiz ? "done" : ""}"></i>`).join("");
    const chip = (attr, k, label, on) => `<button type="button" class="vns-chip${on ? " on" : ""}" data-${attr}="${k}">${label}</button>`;
    let html = "";
    if (wiz === 0) html = `<h3>🌐 ${t.lang}</h3><div class="vns-chips">${LANGS.map(([k, l]) => chip("lang", k, l, setup.lang === k)).join("")}</div>`;
    if (wiz === 1) html = `<h3>${t.who}</h3><div class="vns-chips">${IDENTITY_KEYS.map((k) => chip("identity", k, t.identities[k], setup.identity === k)).join("")}</div>`;
    if (wiz === 2) html = `<h3>${t.avatar}</h3><div class="vn-avs vns-avs">${avSet().map((n) => `<button type="button" class="vn-av${setup.avatar === n ? " on" : ""}" data-av="${n}"><img src="${ASSET}av${n}.webp" alt=""></button>`).join("")}</div>`;
    if (wiz === 3) html = `<h3>${t.genre}</h3><div class="vns-chips">${GENRE_KEYS.map((k) => chip("genre", k, t.genres[k], setup.genre === k)).join("")}</div>`;
    if (wiz === 4) html = `<h3>${t.name}</h3>
        <input id="story-name" class="vns-input" maxlength="30" placeholder="${esc(t.namePh)}" value="${esc(setup.name)}">
        <label class="vns-check"><input type="checkbox" id="story-mature"${setup.mature ? " checked" : ""}> <span>${t.mature}</span></label>`;
    const canNext = wiz !== 1 || !!setup.identity;
    html += `<p id="story-error" class="story-error vns-err"></p>
      <div class="vns-nav">
        ${wiz > 0 ? `<button type="button" class="vn-btn" id="vns-back">${t.back}</button>` : "<span></span>"}
        ${wiz < 4 ? `<button type="button" class="vn-btn gold" id="vns-next"${canNext ? "" : " disabled"}>${t.next}</button>` : `<button type="button" class="vn-btn gold" id="vns-start">${t.start}</button>`}
      </div>`;
    box.innerHTML = html;
    box.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => { setup.lang = b.dataset.lang; paintSetup(); render(); }));
    box.querySelectorAll("[data-identity]").forEach((b) => b.addEventListener("click", () => {
      setup.identity = b.dataset.identity;
      if (!avSet().includes(setup.avatar)) setup.avatar = AV_FOR[setup.identity];
      paintSetup();
    }));
    box.querySelectorAll("[data-av]").forEach((b) => b.addEventListener("click", () => { setup.avatar = Number(b.dataset.av); paintSetup(); }));
    box.querySelectorAll("[data-genre]").forEach((b) => b.addEventListener("click", () => { setup.genre = b.dataset.genre; paintSetup(); }));
    $("vns-back")?.addEventListener("click", () => { readInputs(); wiz = Math.max(0, wiz - 1); paintSetup(); });
    $("vns-next")?.addEventListener("click", () => { if (wiz === 1 && !setup.identity) return; wiz = Math.min(4, wiz + 1); paintSetup(); });
    $("vns-start")?.addEventListener("click", startStory);
    try { tg?.HapticFeedback?.selectionChanged?.(); } catch {}
  }

  // ── Visual stage: animated anime background + character with expressions ──
  const SCENES = ["cafe", "campus", "rain", "night", "beach", "room", "forest", "mansion"];
  const GENRE_SCENE = { romance: "cafe", school: "campus", mystery: "rain", horror: "mansion", fantasy: "forest", drama: "room" };
  const FX = { cafe: "bokeh", room: "bokeh", campus: "petals", rain: "rain", night: "stars", beach: "sparkle", forest: "fireflies", mansion: "fog" };
  let blinkTimer = null;
  const preloaded = new Set();
  function preload(src) { if (preloaded.has(src)) return; preloaded.add(src); const i = new Image(); i.src = src; }
  function fxParticles(kind) {
    const count = { rain: 70, stars: 40, petals: 18, fireflies: 22, bokeh: 14, sparkle: 20, fog: 3 }[kind] || 0;
    let html = "";
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 100, y = Math.random() * 100, d = (Math.random() * 5).toFixed(2);
      const sz = kind === "bokeh" ? 20 + Math.random() * 50 : kind === "petals" ? 8 + Math.random() * 8 : 2 + Math.random() * 4;
      const dur = kind === "rain" ? 0.5 + Math.random() * 0.5 : kind === "fog" ? 18 + i * 6 : 4 + Math.random() * 6;
      html += `<i style="left:${x}%;top:${y}%;width:${sz}px;height:${kind === "rain" ? 14 + Math.random() * 16 : sz}px;animation-delay:-${d}s;animation-duration:${dur}s"></i>`;
    }
    return html;
  }
  function stageHTML(turn) {
    const scene = SCENES.includes(turn?.scene) ? turn.scene : (GENRE_SCENE[state.genre] || "cafe");
    const who = turn?.character === "lin" || turn?.character === "kai" ? turn.character : "";
    const expr = ["neutral", "smile", "shy", "sad", "surprised"].includes(turn?.expression) ? turn.expression : "neutral";
    const name = who === "lin" ? "Lin" : who === "kai" ? "Kai" : "";
    return `
      <div class="story-stage scene-${scene}" id="story-stage">
        <img class="stage-bg" src="${ASSET}bg_${scene}.webp" alt="">
        <div class="stage-fx fx-${FX[scene]}">${fxParticles(FX[scene])}</div>
        ${who ? `<div class="stage-char" data-who="${who}" data-expr="${expr}">
          <img class="char-img" src="${ASSET}${who}_${expr}.webp" alt="${name}">
          ${expr === "neutral" ? `<img class="char-blink" src="${ASSET}${who}_blink.webp" alt="">` : ""}
        </div>
        <span class="stage-name">${name}</span>` : ""}
        <div class="stage-shade"></div>
      </div>`;
  }
  function startStageLife() {
    clearInterval(blinkTimer);
    const blink = document.querySelector("#story-stage .char-blink");
    if (!blink) return;
    blinkTimer = setInterval(() => {
      if (!document.body.contains(blink)) return clearInterval(blinkTimer);
      blink.classList.add("on");
      setTimeout(() => blink.classList.remove("on"), 140);
    }, 3200 + Math.random() * 1500);
  }
  function preloadPartner() {
    const who = { boy: "lin", girl: "kai", gay: "kai", lesbian: "lin", transwoman: "kai", transman: "lin" }[state?.identity];
    if (!who) return;
    ["neutral", "blink", "smile", "shy", "sad", "surprised"].forEach((e) => preload(`${ASSET}${who}_${e}.webp`));
  }

  // ── Fix 33: portrait visual-novel player ──
  function renderStory(body) {
    const last = state.turns[state.turns.length - 1];
    const av = state.avatar || AV_FOR[state.identity] || 1;
    body.innerHTML = `
      <div class="story-toolbar">
        <span class="story-who"><img class="vn-mini" src="${ASSET}av${av}.webp" alt=""> ${esc(state.name)} · ${T().ch} ${state.turns.length}</span>
        <button type="button" id="story-new" class="button button-quiet story-small">${T().newStory}</button>
      </div>
      ${stageHTML(last)}
      <article class="story-card story-current">
        ${last?.title ? `<span class="eyebrow">${esc(last.title)}</span>` : ""}
        <button type="button" id="story-cont" class="button button-gold full-width">${T().cont}</button>
        <p id="story-error" class="story-error"></p>
      </article>`;
    $("story-new")?.addEventListener("click", () => {
      if (!confirm(T().confirmNew)) return;
      setup = { identity: state.identity, genre: state.genre, name: state.name, mature: state.mature, lang: state.lang, avatar: state.avatar || 0 };
      state = null; save(); render(); openSetup();
    });
    $("story-cont")?.addEventListener("click", openVN);
    startStageLife();
    preloadPartner();
  }

  // Split the AI's story into short pages for the dialogue box.
  function pagesOf(text) {
    const parts = String(text || "").replace(/\r/g, "").split(/\n+|(?<=[.!?။…”"」])\s+/).map((x) => x.trim()).filter(Boolean);
    const out = []; let cur = "";
    parts.forEach((p) => {
      if (cur && (cur + " " + p).length > 150) { out.push(cur); cur = p; } else cur = cur ? cur + " " + p : p;
    });
    if (cur) out.push(cur);
    return out.length ? out : [""];
  }
  const QUOTE = /["“”「」«»]/;
  let vn = null, typeTimer = null, autoTimer = null;

  function openVN() {
    if (!state) return;
    closeVN(true);
    const el = document.createElement("div");
    el.id = "vn"; el.className = "vn";
    el.innerHTML = `
      <img class="vn-bg" alt=""><div class="vn-fx"></div>
      <img class="vn-partner" alt="">
      <img class="vn-me" alt="">
      <div class="vn-hud"><span class="vn-pill" id="vn-scene"></span><span class="vn-pill" id="vn-ch"></span><span class="vn-pill vn-q" id="vn-quota"></span><button type="button" class="vn-pill vn-ad hidden" id="vn-ad"></button><button type="button" class="vn-x" id="vn-x">✕</button></div>
      <div class="vn-choices" id="vn-choices"></div>
      <div class="vn-box" id="vn-box">
        <div class="vn-name hidden" id="vn-name"><img id="vn-name-av" alt=""><span id="vn-name-t"></span></div>
        <div class="vn-tools"><button type="button" data-t="log">📜</button><button type="button" data-t="skip">⏩</button><button type="button" data-t="auto">▶</button></div>
        <div class="vn-txt" id="vn-txt"></div>
        <div class="vn-extra" id="vn-extra"></div>
        <span class="vn-next" id="vn-next">▼</span>
      </div>
      <div class="vn-log hidden" id="vn-log"></div>`;
    document.body.appendChild(el);
    document.documentElement.classList.add("vn-open");
    $("vn-x").addEventListener("click", (e) => { e.stopPropagation(); closeVN(); });
    $("vn-ad").addEventListener("click", (e) => { e.stopPropagation(); window.CSLAds?.openShop("story", state?.lang); });
    $("vn-quota").addEventListener("click", (e) => { if (!e.currentTarget.classList.contains("joined")) return; e.stopPropagation(); window.CSLAds?.openShop("story", state?.lang); });
    el.addEventListener("click", onTap);
    el.querySelectorAll(".vn-tools button").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); tool(b.dataset.t, b); }));
    $("vn-log").addEventListener("click", (e) => { e.stopPropagation(); $("vn-log").classList.add("hidden"); });
    try { tg?.HapticFeedback?.impactOccurred?.("light"); } catch {}
    vn = { auto: false };
    loadTurn(state.turns[state.turns.length - 1]);
  }
  function closeVN(silent) {
    clearInterval(typeTimer); clearTimeout(autoTimer);
    $("vn")?.remove(); document.documentElement.classList.remove("vn-open");
    vn = null;
    if (!silent) render();
  }
  function setScene(turn) {
    const scene = SCENES.includes(turn?.scene) ? turn.scene : (GENRE_SCENE[state.genre] || "cafe");
    const bg = document.querySelector("#vn .vn-bg");
    if (bg && !bg.src.endsWith(`bg_${scene}.webp`)) bg.src = `${ASSET}bg_${scene}.webp`;
    const fx = document.querySelector("#vn .vn-fx");
    if (fx && fx.dataset.k !== FX[scene]) { fx.dataset.k = FX[scene]; fx.className = `vn-fx stage-fx fx-${FX[scene]}`; fx.innerHTML = fxParticles(FX[scene]); }
    const who = turn?.character === "lin" || turn?.character === "kai" ? turn.character : "";
    const expr = ["neutral", "smile", "shy", "sad", "surprised"].includes(turn?.expression) ? turn.expression : "neutral";
    const pt = document.querySelector("#vn .vn-partner");
    if (pt) { pt.classList.toggle("hidden", !who); if (who) pt.src = `${ASSET}${who}_${expr}.webp`; }
    vn.partner = who === "lin" ? "Lin" : who === "kai" ? "Kai" : "";
    $("vn-scene").textContent = "📍 " + scene.charAt(0).toUpperCase() + scene.slice(1);
    $("vn-ch").textContent = `📖 ${T().ch} ${state.turns.length}`;
    $("vn-quota").textContent = lastQuota ? (lastQuota.vip ? "👑 VIP" : `⚡ ${lastQuota.remaining}`) : "";
    paintAd();
  }
  // Fix 38: Adsgram reward button (free players only)
  function paintAd() {
    const qp = $("vn-quota"); // Fix 46: the HUD ⚡ updates right after an ad / purchase
    if (qp) qp.textContent = lastQuota ? (lastQuota.vip ? "👑 VIP" : `⚡ ${lastQuota.remaining}`) : "";
    const b = $("vn-ad"); if (!b) return;
    const on = !!(window.CSLAds && lastQuota && lastQuota.enabled && !lastQuota.vip);
    b.classList.toggle("hidden", !on);
    if (on) b.textContent = window.CSLAds.label(state?.lang, true);
    $("vn-quota")?.classList.toggle("joined", on); // Fix 45: ⚡ N and + drawn as one pill
  }
  document.addEventListener("csl-ad-reward", async (e) => {
    if (e.detail?.game !== "story") return;
    const before = lastQuota?.remaining;
    const fresh = await refreshStatus();
    // Fix 46: if the status call failed or is stale, still show the bonus at once
    if (e.detail?.bonus && lastQuota && !lastQuota.vip && (!fresh || lastQuota.remaining === before)) {
      lastQuota = { ...lastQuota, remaining: (Number(before) || 0) + Number(e.detail.bonus) }; paintQuota(); paintAd();
    }
    if (vn && vn.mode === "err") showChoices();
  });
  function loadTurn(turn) {
    if (!vn) return;
    setScene(turn);
    vn.turn = turn;
    vn.pages = pagesOf((turn?.title ? "" : "") + (turn?.story || ""));
    vn.i = 0;
    showPage();
  }
  function speaker(mode, name) {
    const n = $("vn-name"), av = $("vn-name-av");
    if (!n) return;
    n.classList.toggle("hidden", !name);
    n.classList.toggle("me", mode === "me");
    $("vn-name-t").textContent = name || "";
    av.classList.toggle("hidden", mode !== "me");
    if (mode === "me") av.src = `${ASSET}av${state.avatar || AV_FOR[state.identity] || 1}.webp`;
  }
  function meVisible(on) {
    const me = document.querySelector("#vn .vn-me");
    if (!me) return;
    if (on) me.src = `${ASSET}p${state.avatar || AV_FOR[state.identity] || 1}.webp`;
    me.classList.toggle("on", on);
    document.getElementById("vn")?.classList.toggle("dim", on);
  }
  function typeText(txt, done) {
    clearInterval(typeTimer);
    const box = $("vn-txt"); if (!box) return;
    const chars = Array.from(txt); let k = 0;
    vn.typing = true; vn.full = txt; vn.onDone = done;
    box.textContent = ""; $("vn-next").classList.add("hidden");
    typeTimer = setInterval(() => {
      k += 2; box.textContent = chars.slice(0, k).join("");
      if (k >= chars.length) finishType();
    }, 28);
  }
  function finishType() {
    clearInterval(typeTimer);
    if (!vn) return;
    $("vn-txt").textContent = vn.full; vn.typing = false;
    $("vn-next").classList.remove("hidden");
    const d = vn.onDone; vn.onDone = null; d && d();
  }
  function showPage() {
    vn.mode = "read";
    meVisible(false); $("vn-choices").innerHTML = ""; $("vn-extra").innerHTML = "";
    const page = vn.pages[vn.i] || "";
    const talk = vn.partner && QUOTE.test(page);
    speaker("partner", talk ? vn.partner : "");
    $("vn-txt").classList.toggle("narr", !talk);
    typeText(page, () => { if (vn?.auto) autoTimer = setTimeout(() => advance(), 1600); });
  }
  function advance() {
    clearTimeout(autoTimer);
    if (!vn || vn.mode !== "read") return;
    if (vn.typing) return finishType();
    if (vn.i < vn.pages.length - 1) { vn.i++; showPage(); return; }
    showChoices();
  }
  const CONT_FB = { en: "Continue the story", my: "ဇာတ်လမ်း ဆက်မယ်", ru: "Продолжить историю", es: "Continuar la historia" };
  function showChoices() {
    vn.mode = "choice";
    const t = T();
    meVisible(true);
    speaker("me", state.name);
    $("vn-txt").classList.remove("narr");
    $("vn-txt").textContent = t.pickSay; $("vn-next").classList.add("hidden");
    // Fix 43: never leave the player stuck. If a turn has no choices, offer "Continue".
    if (!Array.isArray(vn.turn?.choices) || vn.turn.choices.filter(Boolean).length === 0) {
      const fb = [CONT_FB[state.lang] || CONT_FB.en];
      if (vn.turn) vn.turn.choices = fb;
      const last = state.turns[state.turns.length - 1];
      if (last) { last.choices = fb; save(); }
    }
    const ch = (vn.turn?.choices || []).filter(Boolean);
    $("vn-choices").innerHTML = ch.map((c, i) => `<button type="button" data-c="${i}"><b>${"ABC"[i]}</b>${esc(c)}</button>`).join("");
    $("vn-choices").querySelectorAll("[data-c]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); vnPick(Number(b.dataset.c)); }));
  }
  async function vnPick(i) {
    const picked = vn?.turn?.choices?.[i];
    if (!picked || vn.mode !== "choice") return;
    vn.mode = "say";
    try { tg?.HapticFeedback?.selectionChanged?.(); } catch {}
    $("vn-choices").innerHTML = "";
    speaker("me", state.name);
    typeText(picked, () => { $("vn-next").classList.add("hidden"); $("vn-extra").innerHTML = `<span class="vn-dots3"><i></i><i></i><i></i></span>`; });
    const err = await choose(i);
    if (!vn) return;
    if (vn.typing) finishType();
    if (err) {
      vn.mode = "err";
      $("vn-extra").innerHTML = `<span class="vn-err">${esc(T()[err] || T().FAILED)}</span>` +
        (err === "LIMIT" ? (window.CSLAds ? `<button type="button" class="vn-btn" id="vn-adr">${window.CSLAds.label(state?.lang)}</button>` : "") + `<button type="button" class="vn-btn gold" id="vn-vip">👑 Get VIP</button>` : `<button type="button" class="vn-btn" id="vn-retry">${T().retry}</button>`);
      $("vn-vip")?.addEventListener("click", (e) => { e.stopPropagation(); closeVN(); $("vip-page-buy")?.click(); });
      $("vn-adr")?.addEventListener("click", (e) => { e.stopPropagation(); window.CSLAds?.openShop("story", state?.lang); });
      $("vn-retry")?.addEventListener("click", (e) => { e.stopPropagation(); showChoices(); });
      return;
    }
    await window.CSLAds?.afterTurn(!!lastQuota?.vip);
    if (!vn) return;
    loadTurn(state.turns[state.turns.length - 1]);
  }
  function tool(t, btn) {
    if (!vn) return;
    if (t === "skip") { if (vn.mode === "read") { finishType(); vn.i = vn.pages.length - 1; showPage(); finishType(); } return; }
    if (t === "auto") { vn.auto = !vn.auto; btn.classList.toggle("on", vn.auto); if (vn.auto && vn.mode === "read" && !vn.typing) advance(); return; }
    if (t === "log") {
      const lg = $("vn-log");
      lg.innerHTML = `<h3>📜 ${esc(T().log)}</h3>` + state.turns.map((x) => `<div class="vn-log-i">${x.title ? `<b>${esc(x.title)}</b>` : ""}<p>${esc(x.story)}</p>${x.picked ? `<em>➜ ${esc(state.name)}: ${esc(x.picked)}</em>` : ""}</div>`).join("");
      lg.classList.remove("hidden"); lg.scrollTop = lg.scrollHeight;
    }
  }
  function onTap(e) {
    if (!vn || e.target.closest(".vn-choices,.vn-hud,.vn-tools,.vn-btn")) return;
    if (vn.mode === "read") advance();
  }

  function setLoading(on) {
    busy = on;
    document.querySelectorAll("#story-section button, #vns button").forEach((b) => { b.disabled = on; });
    const err = $("story-error");
    if (err) err.innerHTML = on ? `<span class="vn-dots3"><i></i><i></i><i></i></span>` : "";
  }
  function showError(code) {
    const err = $("story-error");
    if (!err) return;
    const t = T();
    const adBtn = (code === "LIMIT" && window.CSLAds) ? ` <button type="button" id="story-ad-limit" class="vn-btn">${esc(window.CSLAds.label(state ? state.lang : setup.lang))}</button>` : "";
    err.innerHTML = esc(t[code] || t.FAILED) + (code === "LIMIT" ? adBtn + ' <button type="button" id="story-get-vip" class="button button-gold story-small">👑 Get VIP</button>' : "");
    $("story-get-vip")?.addEventListener("click", () => $("vip-page-buy")?.click());
    // Fix 40: watch a Reward ad from the setup screen, then tap Start again.
    $("story-ad-limit")?.addEventListener("click", async () => { window.CSLAds?.openShop("story", state ? state.lang : setup.lang); });
  }

  function historyFor(turns) {
    const h = [];
    turns.forEach((t, i) => {
      if (i === 0) h.push({ role: "user", text: "Start the story with an engaging opening scene." });
      h.push({ role: "model", text: JSON.stringify({ title: t.title, story: t.story, choices: t.choices }) });
      if (t.picked) h.push({ role: "user", text: `The player chooses: ${t.picked}` });
    });
    return h.slice(-12);
  }

  async function requestTurn(settings, history, choice) {
    const { ok, status, data } = await api("/api/story/turn", {
      method: "POST",
      body: JSON.stringify({ ...settings, history, choice })
    });
    if (ok) return data;
    if (status === 402) throw new Error("LIMIT");
    if (status === 429) throw new Error("BUSY");
    if (status === 422) throw new Error("BLOCKED");
    if (status === 503) throw new Error("SETUP");
    throw new Error("FAILED");
  }

  async function startStory() {
    if (busy) return;
    readInputs();
    if (!setup.identity) { const err = $("story-error"); if (err) err.textContent = T().pickWho; return; }
    const settings = { identity: setup.identity, genre: setup.genre, name: setup.name || "Player", mature: setup.mature, lang: setup.lang };
    const avatar = avSet().includes(setup.avatar) ? setup.avatar : AV_FOR[setup.identity] || 1;
    setLoading(true);
    try {
      const turn = await requestTurn(settings, [], "");
      state = { ...settings, avatar, turns: [{ title: turn.title, story: turn.story, choices: turn.choices, scene: turn.scene, character: turn.character, expression: turn.expression }] };
      save(); setLoading(false); closeSetup(); render(); refreshStatus(); openVN();
    } catch (e) {
      setLoading(false); showError(e.message);
    }
  }

  // Returns null on success, or an error code (LIMIT, BUSY, ...).
  async function choose(index) {
    if (busy || !state) return "BUSY";
    const last = state.turns[state.turns.length - 1];
    const picked = last?.choices?.[index];
    if (!picked) return "FAILED";
    const settings = { identity: state.identity, genre: state.genre, name: state.name, mature: state.mature, lang: state.lang };
    const draft = state.turns.map((t, i) => (i === state.turns.length - 1 ? { ...t, picked } : t));
    setLoading(true);
    try {
      const turn = await requestTurn(settings, historyFor(state.turns), picked);
      state.turns = [...draft, { title: turn.title, story: turn.story, choices: turn.choices, scene: turn.scene, character: turn.character, expression: turn.expression }].slice(-30);
      save(); setLoading(false); render(); refreshStatus();
      return null;
    } catch (e) {
      setLoading(false); showError(e.message);
      return e.message || "FAILED";
    }
  }
})();
