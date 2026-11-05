/* VideoSpace AI Story Game. Talks only to the VideoSpace backend (the Gemini key stays on the server). */
(() => {
  "use strict";
  const cfg = window.VIDEOSPACE_CONFIG || {};
  const API = (cfg.VIP_API_URL || "").replace(/\/$/, "");
  const tg = window.Telegram?.WebApp;
  const SAVE_KEY = "videospace_story_v1";
  const $ = (id) => document.getElementById(id);

  const TEXT = {
    my: {
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
  let setup = { identity: "", genre: "romance", name: "", mature: false, lang: "en" };
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
    $("library")?.classList.toggle("hidden", on);
    if (on) $("vip-hero")?.classList.add("hidden");
    $("story-tab-btn")?.classList.toggle("active", on);
    if (on) {
      $("regular-videos-btn")?.classList.remove("active");
      $("vip-videos-btn")?.classList.remove("active");
      render();
      refreshStatus();
    }
  }
  $("story-tab-btn")?.addEventListener("click", () => showStory(true));
  ["regular-videos-btn", "vip-videos-btn"].forEach((id) =>
    $(id)?.addEventListener("click", () => showStory(false), true)
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
    if (!el) return;
    try {
      const { ok, data } = await api("/api/story/status");
      if (!ok) { lastQuota = null; el.textContent = ""; return; }
      lastQuota = data;
      paintQuota();
    } catch { el.textContent = ""; }
  }

  function paintQuota() {
    const el = $("story-quota"), d = lastQuota;
    if (!el || !d) return;
    el.textContent = !d.enabled ? T().soon : d.vip ? T().vip : T().left(d.remaining, d.limit);
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
        <h3>🌐 ${T().lang}</h3>
        <div class="story-chips">
          ${LANGS.map(([k, l]) => `<button type="button" class="story-chip${setup.lang === k ? " active" : ""}" data-lang="${k}">${l}</button>`).join("")}
        </div>
        <h3>${T().who}</h3>
        <div class="story-chips" id="story-identities">
          ${IDENTITY_KEYS.map((k) => `<button type="button" class="story-chip${setup.identity === k ? " active" : ""}" data-identity="${k}">${T().identities[k]}</button>`).join("")}
        </div>
        <h3>${T().genre}</h3>
        <div class="story-chips" id="story-genres">
          ${GENRE_KEYS.map((k) => `<button type="button" class="story-chip${setup.genre === k ? " active" : ""}" data-genre="${k}">${T().genres[k]}</button>`).join("")}
        </div>
        <label class="story-label">${T().name}
          <input id="story-name" maxlength="30" placeholder="${esc(T().namePh)}" value="${esc(setup.name)}">
        </label>
        <label class="story-check"><input type="checkbox" id="story-mature"${setup.mature ? " checked" : ""}> ${T().mature}</label>
        <button type="button" id="story-start" class="button button-gold full-width">${T().start}</button>
        <p id="story-error" class="story-error"></p>
      </div>`;
    body.querySelectorAll("[data-identity]").forEach((b) => b.addEventListener("click", () => { setup.identity = b.dataset.identity; readInputs(); render(); }));
    body.querySelectorAll("[data-genre]").forEach((b) => b.addEventListener("click", () => { setup.genre = b.dataset.genre; readInputs(); render(); }));
    body.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => { setup.lang = b.dataset.lang; readInputs(); render(); }));
    $("story-start")?.addEventListener("click", startStory);
  }
  function readInputs() {
    setup.name = ($("story-name")?.value || "").trim();
    setup.mature = !!$("story-mature")?.checked;
  }

  // ── Visual stage: animated anime background + character with expressions ──
  const ASSET = "story-assets/";
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

  function renderStory(body) {
    const last = state.turns[state.turns.length - 1];
    const past = state.turns.slice(0, -1);
    body.innerHTML = `
      <div class="story-toolbar">
        <span class="story-who">${esc(state.name)} · ${esc(T().identities[state.identity] || "")}</span>
        <button type="button" id="story-new" class="button button-quiet story-small">${T().newStory}</button>
      </div>
      ${past.length ? `<details class="story-past"><summary>${T().past} (${past.length})</summary>${past.map((t) => `<div class="story-past-item">${t.title ? `<b>${esc(t.title)}</b>` : ""}<p>${esc(t.story)}</p>${t.picked ? `<em>➜ ${esc(t.picked)}</em>` : ""}</div>`).join("")}</details>` : ""}
      ${stageHTML(last)}
      <article class="story-card story-current">
        ${last?.title ? `<span class="eyebrow">${esc(last.title)}</span>` : ""}
        <p class="story-text">${esc(last?.story || "")}</p>
        <div class="story-choices">
          ${(last?.choices || []).map((c, i) => `<button type="button" class="story-choice" data-choice="${i}">${["A", "B", "C"][i]}. ${esc(c)}</button>`).join("")}
        </div>
        <p id="story-error" class="story-error"></p>
      </article>`;
    $("story-new")?.addEventListener("click", () => {
      if (!confirm(T().confirmNew)) return;
      setup = { identity: state.identity, genre: state.genre, name: state.name, mature: state.mature, lang: state.lang };
      state = null; save(); render();
    });
    body.querySelectorAll("[data-choice]").forEach((b) => b.addEventListener("click", () => choose(Number(b.dataset.choice))));
    startStageLife();
    preloadPartner();
  }

  function setLoading(on) {
    busy = on;
    document.querySelectorAll("#story-section button").forEach((b) => { b.disabled = on; });
    const err = $("story-error");
    if (err) err.innerHTML = on ? `<span class="spinner"></span> ${T().writing}` : "";
  }
  function showError(code) {
    const err = $("story-error");
    if (!err) return;
    const t = T();
    err.innerHTML = esc(t[code] || t.FAILED) + (code === "LIMIT" ? ' <button type="button" id="story-get-vip" class="button button-gold story-small">👑 Get VIP</button>' : "");
    $("story-get-vip")?.addEventListener("click", () => $("vip-page-buy")?.click());
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
    setLoading(true);
    try {
      const turn = await requestTurn(settings, [], "");
      state = { ...settings, turns: [{ title: turn.title, story: turn.story, choices: turn.choices, scene: turn.scene, character: turn.character, expression: turn.expression }] };
      save(); setLoading(false); render(); refreshStatus();
    } catch (e) {
      setLoading(false); showError(e.message);
    }
  }

  async function choose(index) {
    if (busy || !state) return;
    const last = state.turns[state.turns.length - 1];
    const picked = last?.choices?.[index];
    if (!picked) return;
    const settings = { identity: state.identity, genre: state.genre, name: state.name, mature: state.mature, lang: state.lang };
    const draft = state.turns.map((t, i) => (i === state.turns.length - 1 ? { ...t, picked } : t));
    setLoading(true);
    try {
      const turn = await requestTurn(settings, historyFor(state.turns), picked);
      state.turns = [...draft, { title: turn.title, story: turn.story, choices: turn.choices, scene: turn.scene, character: turn.character, expression: turn.expression }].slice(-30);
      save(); setLoading(false); render(); refreshStatus();
      $("story-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      setLoading(false); showError(e.message);
    }
  }
})();
