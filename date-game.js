/* CityStoryLove 💘 Sweet Date: AI dating visual novel.
   Routes: male (date Mya) · female (date Leo) · gay (date Ren). Pick an avatar, build affection,
   and unlock hug / kiss moments that play as short video clips. The backend (/api/date/*) keeps
   the AI keys and a signed affection token, so the thresholds cannot be skipped. */
(() => {
  "use strict";
  const cfg = window.VIDEOSPACE_CONFIG || {};
  const API = (cfg.VIP_API_URL || "").replace(/\/$/, "");
  const tg = window.Telegram?.WebApp;
  const SAVE_KEY = "csl_date_v1_" + String(tg?.initDataUnsafe?.user?.id || "guest");
  const A = "date-assets/";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ROUTES = {
    male: { partner: "mya", name: "Mya", avatars: [1, 2, 3], icon: "👨" },
    female: { partner: "leo", name: "Leo", avatars: [4, 5, 6], icon: "👩" },
    gay: { partner: "ren", name: "Ren", avatars: [1, 2, 3], icon: "🏳️‍🌈" }
  };
  const SCENES = { sakura: "bg_sakura.webp", sunset: "bg_sunset.webp", rooftop: "bg_rooftop.webp", home: "bg_rainy_home.webp" };
  const KIND_ICON = { sweet: "💗", fun: "😄", bold: "🔥" };

  const TX = {
    en: {
      card: ["💘 Sweet Date", "Date, hug, kiss · your love story"], eyebrow: "AI DATING GAME", h: '💘 Sweet <span class="gold-text">Date</span>',
      route: "Who are you?", routes: { male: ["👨 Male", "Date Mya"], female: ["👩 Female", "Date Leo"], gay: ["🏳️‍🌈 Gay", "Date Ren"] },
      avatar: "Pick your avatar", name: "Your name", namePh: "e.g. Alex", lang: "Language",
      mature: "💋 Romantic kiss scenes. I confirm I am 18 or older.",
      start: "💘 Start dating", cont: "▶ Continue date", newGame: "↺ New story", confirmNew: "Delete this love story and start again?",
      pickRoute: "Choose who you are first.", writing: (n) => `${n} is thinking…`, tapNext: "Tap to continue ▸",
      love: "Affection", hugAt: "🤗 Hug", kissAt: "💋 Kiss", locked: "Locked", memories: "🎞 Memories", noMem: "No memories yet. Raise affection to unlock hugs and kisses!",
      firstHug: "🤗 First hug!", firstKiss: "💋 First kiss!", hugM: "🤗 A warm hug", kissM: "💋 A sweet kiss", replay: "↻ Replay", close: "Continue ▶", skip: "Skip ▸",
      up: (d) => `💗 +${d}`, down: (d) => `💔 ${d}`,
      vip: "👑 VIP · Unlimited", left: (r) => `${r} turns left`, soon: "Coming soon", more: "⚡ More turns", retry: "↻ Try again",
      LIMIT: "You've used today's free turns. 👑 Get VIP or ⚡ energy to keep dating.", BUSY: "The AI is busy. Try again in a moment.",
      BLOCKED: "The AI can't write that choice. Try another one.", NOTG: "Open this from the Telegram Mini App to play.",
      SETUP: "Coming soon.", FAILED: "Something went wrong. Please try again.", SAVE: "Your save is no longer valid. Please start a new story."
    },
    my: {
      card: ["💘 Sweet Date", "ချိန်းတွေ့၊ ဖက်၊ နမ်း · ကိုယ့်အချစ်ဇာတ်လမ်း"], eyebrow: "AI ချိန်းတွေ့ဂိမ်း", h: '💘 Sweet <span class="gold-text">Date</span>',
      route: "သင် ဘယ်သူလဲ?", routes: { male: ["👨 ယောက်ျား", "Mya နဲ့ ချိန်းတွေ့"], female: ["👩 မိန်းမ", "Leo နဲ့ ချိန်းတွေ့"], gay: ["🏳️‍🌈 Gay", "Ren နဲ့ ချိန်းတွေ့"] },
      avatar: "ကိုယ့် Avatar ရွေးပါ", name: "ကိုယ့်နာမည်", namePh: "ဥပမာ - မောင်မောင်", lang: "ဘာသာစကား",
      mature: "💋 နမ်းတဲ့ ရင်ခုန်ဇာတ်ဝင်ခန်းများ ပါမယ်။ ကျွန်ုပ်အသက် ၁၈ နှစ်ပြည့်ပါပြီ။",
      start: "💘 ချိန်းတွေ့မယ်", cont: "▶ ဆက်ချိန်းမယ်", newGame: "↺ အသစ်စမယ်", confirmNew: "ဒီအချစ်ဇာတ်လမ်းကို ဖျက်ပြီး အသစ်စမလား?",
      pickRoute: "သင် ဘယ်သူလဲ ဆိုတာ အရင်ရွေးပါ။", writing: (n) => `${n} စဉ်းစားနေတယ်…`, tapNext: "ဆက်ဖတ်ရန် နှိပ်ပါ ▸",
      love: "ချစ်ခြင်း", hugAt: "🤗 ဖက်", kissAt: "💋 နမ်း", locked: "မဖွင့်ရသေး", memories: "🎞 အမှတ်တရ", noMem: "အမှတ်တရ မရှိသေးပါ။ ချစ်ခြင်းတိုးရင် ဖက်တာ၊ နမ်းတာ ဖွင့်ပါမယ်!",
      firstHug: "🤗 ပထမဆုံး ဖက်လိုက်ပြီ!", firstKiss: "💋 ပထမဆုံး အနမ်း!", hugM: "🤗 နွေးထွေးတဲ့ အဖက်", kissM: "💋 ချိုမြိန်တဲ့ အနမ်း", replay: "↻ ပြန်ကြည့်", close: "ဆက်မယ် ▶", skip: "ကျော်မယ် ▸",
      up: (d) => `💗 +${d}`, down: (d) => `💔 ${d}`,
      vip: "👑 VIP · အကန့်အသတ်မရှိ", left: (r) => `${r} ကြိမ်ကျန်`, soon: "မကြာခင်ဖွင့်ပါမယ်", more: "⚡ ဆော့ခွင့်ထပ်ယူ", retry: "↻ ထပ်စမ်းမယ်",
      LIMIT: "ဒီနေ့ အခမဲ့အကြိမ် ကုန်ပါပြီ။ 👑 VIP (သို့) ⚡ ယူပြီး ဆက်ချိန်းပါ။", BUSY: "AI အလုပ်များနေပါတယ်။ ခဏနေ ထပ်နှိပ်ပါ။",
      BLOCKED: "ဒီရွေးချယ်မှုကို AI က မရေးပေးနိုင်ပါ။ တခြားတစ်ခု ရွေးပါ။", NOTG: "Telegram Mini App ကနေ ဖွင့်မှ ဆော့လို့ရပါတယ်။",
      SETUP: "မကြာခင်ဖွင့်ပါမယ်။", FAILED: "တစ်ခုခုမှားသွားပါတယ်။ ထပ်နှိပ်ကြည့်ပါ။", SAVE: "Save မမှန်တော့ပါ။ အသစ်ပြန်စပါ။"
    },
    ru: {
      card: ["💘 Sweet Date", "Свидания, объятия, поцелуи"], eyebrow: "ИИ-СВИДАНИЯ", h: '💘 Sweet <span class="gold-text">Date</span>',
      route: "Кто вы?", routes: { male: ["👨 Парень", "Свидание с Мьей"], female: ["👩 Девушка", "Свидание с Лео"], gay: ["🏳️‍🌈 Гей", "Свидание с Реном"] },
      avatar: "Выберите аватар", name: "Ваше имя", namePh: "например, Саша", lang: "Язык",
      mature: "💋 Романтические поцелуи. Подтверждаю, что мне есть 18 лет.",
      start: "💘 Начать", cont: "▶ Продолжить", newGame: "↺ Заново", confirmNew: "Удалить эту историю и начать заново?",
      pickRoute: "Сначала выберите, кто вы.", writing: (n) => `${n} думает…`, tapNext: "Нажмите, чтобы продолжить ▸",
      love: "Симпатия", hugAt: "🤗 Объятие", kissAt: "💋 Поцелуй", locked: "Закрыто", memories: "🎞 Воспоминания", noMem: "Пока пусто. Повышайте симпатию!",
      firstHug: "🤗 Первое объятие!", firstKiss: "💋 Первый поцелуй!", hugM: "🤗 Тёплое объятие", kissM: "💋 Нежный поцелуй", replay: "↻ Повтор", close: "Дальше ▶", skip: "Пропустить ▸",
      up: (d) => `💗 +${d}`, down: (d) => `💔 ${d}`,
      vip: "👑 VIP · Без ограничений", left: (r) => `Осталось ${r}`, soon: "Скоро", more: "⚡ Ещё ходы", retry: "↻ Ещё раз",
      LIMIT: "Бесплатные ходы закончились. 👑 VIP или ⚡ энергия — и продолжайте.", BUSY: "ИИ занят. Попробуйте позже.",
      BLOCKED: "ИИ не может написать этот вариант.", NOTG: "Откройте через Telegram Mini App.", SETUP: "Скоро.", FAILED: "Ошибка. Попробуйте ещё раз.", SAVE: "Сохранение устарело. Начните заново."
    },
    es: {
      card: ["💘 Sweet Date", "Citas, abrazos, besos"], eyebrow: "JUEGO DE CITAS IA", h: '💘 Sweet <span class="gold-text">Date</span>',
      route: "¿Quién eres?", routes: { male: ["👨 Chico", "Cita con Mya"], female: ["👩 Chica", "Cita con Leo"], gay: ["🏳️‍🌈 Gay", "Cita con Ren"] },
      avatar: "Elige tu avatar", name: "Tu nombre", namePh: "p. ej. Alex", lang: "Idioma",
      mature: "💋 Escenas de besos románticos. Confirmo que tengo 18 años o más.",
      start: "💘 Empezar", cont: "▶ Continuar", newGame: "↺ Nueva historia", confirmNew: "¿Borrar esta historia y empezar otra?",
      pickRoute: "Primero elige quién eres.", writing: (n) => `${n} está pensando…`, tapNext: "Toca para continuar ▸",
      love: "Cariño", hugAt: "🤗 Abrazo", kissAt: "💋 Beso", locked: "Bloqueado", memories: "🎞 Recuerdos", noMem: "Aún no hay recuerdos. ¡Sube el cariño!",
      firstHug: "🤗 ¡Primer abrazo!", firstKiss: "💋 ¡Primer beso!", hugM: "🤗 Un abrazo cálido", kissM: "💋 Un beso dulce", replay: "↻ Repetir", close: "Seguir ▶", skip: "Saltar ▸",
      up: (d) => `💗 +${d}`, down: (d) => `💔 ${d}`,
      vip: "👑 VIP · Sin límites", left: (r) => `Quedan ${r}`, soon: "Pronto", more: "⚡ Más turnos", retry: "↻ Reintentar",
      LIMIT: "Usaste los turnos gratis. 👑 VIP o ⚡ energía para seguir.", BUSY: "La IA está ocupada. Inténtalo luego.",
      BLOCKED: "La IA no puede escribir esa opción.", NOTG: "Ábrelo desde la Mini App de Telegram.", SETUP: "Pronto.", FAILED: "Algo salió mal. Inténtalo de nuevo.", SAVE: "Partida no válida. Empieza de nuevo."
    }
  };
  const LANGS = [["en", "🇬🇧 English"], ["my", "🇲🇲 မြန်မာ"], ["ru", "🇷🇺 Русский"], ["es", "🇪🇸 Español"]];
  const hubLang = () => { try { return localStorage.getItem("hub_lang") || "en"; } catch { return "en"; } };
  const T = () => TX[(state && state.lang) || setup.lang] || TX.en;

  let state = load();
  let setup = { route: "", avatar: 0, name: "", mature: false, lang: hubLang() };
  let quota = null, busy = false, pages = [], page = 0, typing = null;

  function load() { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch { return null; } }
  function save() { try { state ? localStorage.setItem(SAVE_KEY, JSON.stringify(state)) : localStorage.removeItem(SAVE_KEY); } catch {} }

  // ---------- mount: hidden tab button + section (the Story Games hub opens it) ----------
  function mount() {
    const nav = document.querySelector(".game-tabs"), main = document.querySelector("main");
    if (!nav || !main || $("date-tab-btn")) return;
    const b = document.createElement("button");
    b.type = "button"; b.id = "date-tab-btn"; b.className = "game-tabs-btn hidden"; b.textContent = "💘 Sweet Date";
    nav.appendChild(b);
    const s = document.createElement("section");
    s.id = "date-section"; s.className = "story-section date-section hidden";
    s.innerHTML = `<div class="section-heading"><div><span class="eyebrow" id="sd-eyebrow"></span><h2 id="sd-h"></h2></div><span id="sd-quota" class="result-count"></span></div><div id="sd-body"></div>`;
    main.appendChild(s);
    b.addEventListener("click", () => show(true));
    ["games-tab-btn", "city-tab-btn", "story-tab-btn", "detective-tab-btn"].forEach((id) =>
      document.addEventListener("click", (e) => { if (e.target?.id === id) show(false); }, true));
    document.addEventListener("csl-lang", (e) => { setup.lang = e.detail || setup.lang; if (!s.classList.contains("hidden")) paintSetup(); });
    document.addEventListener("csl-ad-reward", (e) => { if (!e.detail || e.detail.game === "date") refreshStatus(); });
  }
  function show(on) {
    const s = $("date-section"); if (!s) return;
    s.classList.toggle("hidden", !on);
    if (!on) return;
    $("vip-hero")?.classList.add("hidden");
    $("story-section")?.classList.add("hidden");
    $("detective-section")?.classList.add("hidden");
    paintSetup(); refreshStatus();
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    try { const { ok, data } = await api("/api/date/status", { cache: "no-store" }); quota = ok ? data : null; } catch { quota = null; }
    paintQuota();
  }
  function quotaText() {
    if (!quota) return "";
    return !quota.enabled ? T().soon : quota.vip ? T().vip : T().left(quota.remaining ?? 0);
  }
  function paintQuota() {
    const q = quotaText();
    if ($("sd-quota")) $("sd-quota").textContent = q;
    if ($("sd-vq")) $("sd-vq").textContent = q;
  }

  // ---------- setup screen ----------
  function paintSetup() {
    const t = T(), body = $("sd-body"); if (!body) return;
    $("sd-eyebrow").textContent = t.eyebrow; $("sd-h").innerHTML = t.h;
    const r = setup.route && ROUTES[setup.route];
    const resume = state ? `<div class="sd-resume"><img src="${A}${ROUTES[state.route].partner}_smile.webp" alt=""><div><b>${esc(state.title || ROUTES[state.route].name)}</b><small>💗 ${state.love}/100 · ${esc(state.name)}</small></div>
      <button type="button" class="button button-gold" data-x="cont">${t.cont}</button><button type="button" class="sd-link" data-x="new">${t.newGame}</button></div>` : "";
    body.innerHTML = `${resume}
      <div class="sd-setup">
        <h3>${t.route}</h3>
        <div class="sd-routes">${Object.keys(ROUTES).map((k) => `<button type="button" class="sd-route ${setup.route === k ? "on" : ""}" data-route="${k}">
          <span class="sd-route-img" style="background-image:url('${A}${k === "male" ? "bg_sakura" : k === "female" ? "bg_sunset" : "bg_rooftop"}.webp')"><img src="${A}${ROUTES[k].partner}_smile.webp" alt=""></span>
          <b>${t.routes[k][0]}</b><small>${t.routes[k][1]}</small></button>`).join("")}</div>
        ${r ? `<h3>${t.avatar}</h3><div class="sd-avatars">${r.avatars.map((n) => `<button type="button" class="sd-av ${setup.avatar === n ? "on" : ""}" data-av="${n}"><img src="${A}av${n}.webp" alt=""></button>`).join("")}</div>` : ""}
        <label class="sd-field"><span>${t.name}</span><input id="sd-name" maxlength="30" placeholder="${esc(t.namePh)}" value="${esc(setup.name)}"></label>
        <label class="sd-field"><span>${t.lang}</span><select id="sd-lang">${LANGS.map(([id, l]) => `<option value="${id}" ${setup.lang === id ? "selected" : ""}>${l}</option>`).join("")}</select></label>
        <label class="sd-check"><input type="checkbox" id="sd-mature" ${setup.mature ? "checked" : ""}><span>${t.mature}</span></label>
        <button type="button" class="button button-gold sd-start" data-x="start">${t.start}</button>
        <p class="sd-err" id="sd-err"></p>
      </div>`;
    body.querySelectorAll("[data-route]").forEach((b) => b.addEventListener("click", () => {
      readInputs(); setup.route = b.dataset.route; setup.avatar = ROUTES[setup.route].avatars[0]; paintSetup();
    }));
    body.querySelectorAll("[data-av]").forEach((b) => b.addEventListener("click", () => { readInputs(); setup.avatar = Number(b.dataset.av); paintSetup(); }));
    $("sd-lang").addEventListener("change", () => { readInputs(); paintSetup(); });
    body.querySelector('[data-x="start"]').addEventListener("click", startGame);
    body.querySelector('[data-x="cont"]')?.addEventListener("click", () => openVN(true));
    body.querySelector('[data-x="new"]')?.addEventListener("click", () => { if (confirm(t.confirmNew)) { state = null; save(); paintSetup(); } });
    paintQuota();
  }
  function readInputs() {
    if ($("sd-name")) setup.name = $("sd-name").value.trim();
    if ($("sd-lang")) setup.lang = $("sd-lang").value;
    if ($("sd-mature")) setup.mature = $("sd-mature").checked;
  }

  // ---------- visual novel overlay ----------
  function openVN(resume) {
    closeVN();
    const t = T(), r = ROUTES[state.route];
    document.documentElement.classList.add("vn-open");
    const el = document.createElement("div");
    el.id = "sd-vn"; el.className = "sd-vn";
    el.innerHTML = `
      <div class="sd-bg" id="sd-bg"></div><div class="sd-bg sd-bg2" id="sd-bg2"></div>
      <img class="sd-partner" id="sd-partner" alt="">
      <div class="sd-top">
        <button type="button" class="sd-x" data-x="close">✕</button>
        <div class="sd-me"><img src="${A}av${state.avatar}.webp" alt=""><span>${esc(state.name)}</span></div>
        <div class="sd-meter"><div class="sd-meter-row"><span>💗 ${t.love}</span><b id="sd-love">${state.love}</b></div>
          <div class="sd-bar"><i id="sd-fill"></i><em style="left:${state.hugAt || 30}%" title="${t.hugAt}">🤗</em><em style="left:${state.kissAt || 60}%" title="${t.kissAt}">💋</em></div></div>
        <button type="button" class="sd-mem-btn" data-x="mem">🎞</button>
      </div>
      <div class="sd-float" id="sd-float"></div>
      <div class="sd-box" id="sd-box">
        <div class="sd-name-tag" id="sd-speaker">${esc(r.name)}</div>
        <div class="sd-title" id="sd-title"></div>
        <div class="sd-text" id="sd-text"></div>
        <div class="sd-choices" id="sd-choices"></div>
        <div class="sd-foot"><span id="sd-vq"></span><button type="button" class="sd-link" data-x="more">${t.more}</button></div>
      </div>`;
    document.body.appendChild(el);
    el.querySelector('[data-x="close"]').addEventListener("click", () => { closeVN(); paintSetup(); });
    el.querySelector('[data-x="mem"]').addEventListener("click", openMemories);
    el.querySelector('[data-x="more"]').addEventListener("click", () => window.CSLAds?.openShop?.("date", state.lang));
    $("sd-box").addEventListener("click", onTapBox);
    paintLove(); paintQuota();
    try { tg?.BackButton?.show(); tg?.BackButton?.onClick(backBtn); } catch {}
    if (resume && state.last) showTurn(state.last, true);
  }
  function backBtn() { closeVN(); paintSetup(); }
  function closeVN() {
    $("sd-vn")?.remove(); $("sd-video")?.remove(); $("sd-memo")?.remove();
    document.documentElement.classList.remove("vn-open");
    try { tg?.BackButton?.offClick(backBtn); tg?.BackButton?.hide(); } catch {}
  }
  function setScene(scene) {
    const url = `url('${A}${SCENES[scene] || SCENES.sakura}')`, a = $("sd-bg"), b = $("sd-bg2");
    if (!a || a.style.backgroundImage === url) return;
    b.style.backgroundImage = url; b.classList.add("on");
    setTimeout(() => { a.style.backgroundImage = url; b.classList.remove("on"); }, 650);
  }
  function setPartner(expr) {
    const p = $("sd-partner"); if (!p) return;
    const src = `${A}${ROUTES[state.route].partner}_${expr === "shy" ? "shy" : "smile"}.webp`;
    if (!p.src.endsWith(src)) { p.classList.remove("in"); void p.offsetWidth; p.src = src; p.classList.add("in"); }
  }
  function paintLove() {
    if ($("sd-love")) $("sd-love").textContent = state.love;
    if ($("sd-fill")) $("sd-fill").style.width = Math.max(2, state.love) + "%";
  }
  function floatDelta(d) {
    if (!d) return;
    const f = $("sd-float"); if (!f) return;
    const s = document.createElement("span");
    s.className = "sd-delta " + (d > 0 ? "up" : "down"); s.textContent = d > 0 ? T().up(d) : T().down(d);
    f.appendChild(s); setTimeout(() => s.remove(), 1800);
  }

  // story text paging + typewriter
  function paginate(text) {
    const parts = String(text).split(/\n+/).map((x) => x.trim()).filter(Boolean), out = [];
    for (const p of parts) {
      if (p.length <= 260) { out.push(p); continue; }
      const sents = p.match(/[^.!?။]+[.!?။]*\s*/g) || [p];
      let cur = "";
      for (const s of sents) { if ((cur + s).length > 260 && cur) { out.push(cur.trim()); cur = ""; } cur += s; }
      if (cur.trim()) out.push(cur.trim());
    }
    return out.length ? out : [String(text)];
  }
  function showTurn(turn, instant) {
    setScene(turn.scene); setPartner(turn.expression);
    $("sd-title").textContent = turn.title || "";
    $("sd-choices").innerHTML = "";
    pages = paginate(turn.story); page = 0;
    showPage(instant);
  }
  function showPage(instant) {
    const el = $("sd-text"); if (!el) return;
    clearInterval(typing); typing = null;
    const txt = pages[page] || "";
    const last = page >= pages.length - 1;
    const hint = last ? "" : `<span class="sd-hint">${T().tapNext}</span>`;
    if (instant) { el.innerHTML = esc(txt) + hint; afterPage(); return; }
    let i = 0; el.textContent = "";
    typing = setInterval(() => {
      i += 2; el.textContent = txt.slice(0, i);
      if (i >= txt.length) { clearInterval(typing); typing = null; el.innerHTML = esc(txt) + hint; afterPage(); }
    }, 18);
  }
  function afterPage() {
    if (page < pages.length - 1) return;
    const turn = state.last; if (!turn) return;
    if (turn.moment && turn.moment !== "none" && !turn.played) {
      turn.played = true; save();
      setTimeout(() => playMoment(turn.moment, turn.firstTime, renderChoices), 350);
    } else renderChoices();
  }
  function onTapBox(e) {
    if (e.target.closest("button")) return;
    if (typing) { clearInterval(typing); typing = null; $("sd-text").innerHTML = esc(pages[page]) + (page < pages.length - 1 ? `<span class="sd-hint">${T().tapNext}</span>` : ""); afterPage(); return; }
    if (page < pages.length - 1) { page++; showPage(); }
  }
  function renderChoices() {
    const box = $("sd-choices"), turn = state.last; if (!box || !turn) return;
    box.innerHTML = (turn.choices || []).map((c, i) => `<button type="button" class="sd-choice k-${c.kind}" data-i="${i}">${KIND_ICON[c.kind] || "💗"} ${esc(c.text)}</button>`).join("");
    box.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => choose(turn.choices[Number(b.dataset.i)].text)));
  }

  // ---------- video moments ----------
  function clipFor(kind) { return `${A}v_${ROUTES[state.route].partner}_${kind}`; }
  function playMoment(kind, first, done) {
    const t = T();
    $("sd-video")?.remove();
    const label = kind === "kiss" ? (first ? t.firstKiss : t.kissM) : (first ? t.firstHug : t.hugM);
    const v = document.createElement("div");
    v.id = "sd-video"; v.className = "sd-video";
    v.innerHTML = `<video playsinline webkit-playsinline muted autoplay preload="auto" poster="${clipFor(kind)}.webp" src="${clipFor(kind)}.mp4"></video>
      <div class="sd-video-label">${label}</div>
      <div class="sd-video-btns"><button type="button" data-x="replay">${t.replay}</button><button type="button" class="on" data-x="ok">${t.skip}</button></div>`;
    document.body.appendChild(v);
    const video = v.querySelector("video"), ok = v.querySelector('[data-x="ok"]');
    const finish = () => { v.remove(); done && done(); };
    video.addEventListener("ended", () => { ok.textContent = t.close; v.classList.add("ended"); });
    video.play().catch(() => {});
    v.querySelector('[data-x="replay"]').addEventListener("click", () => { video.currentTime = 0; v.classList.remove("ended"); ok.textContent = t.skip; video.play().catch(() => {}); });
    ok.addEventListener("click", finish);
    try { tg?.HapticFeedback?.notificationOccurred?.("success"); } catch {}
    state.memories = state.memories || {}; state.memories[kind] = true; save();
  }
  function openMemories() {
    const t = T(); $("sd-memo")?.remove();
    const m = state.memories || {};
    const el = document.createElement("div");
    el.id = "sd-memo"; el.className = "csl-shop";
    const items = ["hug", "kiss"].map((k) => m[k]
      ? `<button type="button" class="sd-mem" data-k="${k}" style="background-image:url('${clipFor(k)}.webp')"><span>▶ ${k === "kiss" ? t.kissM : t.hugM}</span></button>`
      : `<div class="sd-mem locked"><span>🔒 ${k === "kiss" ? t.kissAt : t.hugAt} · ${t.locked}</span></div>`).join("");
    el.innerHTML = `<div class="csl-shop-card"><h3>${t.memories}</h3>${m.hug || m.kiss ? "" : `<p>${t.noMem}</p>`}<div class="sd-mems">${items}</div><button type="button" class="csl-shop-close" data-x="c">${t.close}</button></div>`;
    document.body.appendChild(el);
    el.addEventListener("click", (e) => { if (e.target === el) el.remove(); });
    el.querySelector('[data-x="c"]').addEventListener("click", () => el.remove());
    el.querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { el.remove(); playMoment(b.dataset.k, false); }));
  }

  // ---------- turns ----------
  function waiting(on) {
    const box = $("sd-choices"); if (!box) return;
    if (on) box.innerHTML = `<div class="sd-wait"><span class="vn-dots3"><i></i><i></i><i></i></span> ${esc(T().writing(ROUTES[state.route].name))}</div>`;
  }
  function failed(code, retry) {
    const t = T(), box = $("sd-choices"); if (!box) return;
    box.innerHTML = `<div class="sd-errbox">${esc(t[code] || t.FAILED)}</div>` +
      (code === "LIMIT" ? `<button type="button" class="sd-choice" data-x="shop">${t.more}</button><button type="button" class="sd-choice" data-x="vip">👑 VIP</button>`
        : code === "SAVE" ? "" : `<button type="button" class="sd-choice" data-x="retry">${t.retry}</button>`);
    box.querySelector('[data-x="retry"]')?.addEventListener("click", retry);
    box.querySelector('[data-x="shop"]')?.addEventListener("click", () => window.CSLAds?.openShop?.("date", state.lang));
    box.querySelector('[data-x="vip"]')?.addEventListener("click", () => document.dispatchEvent(new CustomEvent("videospace:open-vip-plans")));
  }
  async function call(payload) {
    const { ok, status, data } = await api("/api/date/turn", { method: "POST", body: JSON.stringify(payload) });
    if (!ok) throw new Error(status === 402 ? "LIMIT" : status === 429 ? "BUSY" : status === 422 ? "BLOCKED" : data.error === "SAVE" ? "SAVE" : status === 401 ? "NOTG" : status === 503 ? "SETUP" : "FAILED");
    if (quota) { quota.vip = data.vip; if (data.remaining !== null && data.remaining !== undefined) quota.remaining = data.remaining; }
    paintQuota();
    return data;
  }
  function applyTurn(d, choice) {
    const delta = d.love - state.love;
    state.love = d.love; state.token = d.token; state.hugAt = d.hugAt; state.kissAt = d.kissAt;
    state.title = d.title || state.title;
    state.history = state.history || [];
    if (choice) state.history.push({ role: "user", text: "The player chooses: " + choice });
    state.history.push({ role: "model", text: JSON.stringify({ title: d.title, story: d.story, love: d.love }) });
    state.history = state.history.slice(-12);
    state.last = { title: d.title, story: d.story, scene: d.scene, expression: d.expression, choices: d.choices, moment: d.moment, firstTime: d.firstTime, played: false };
    save(); paintLove(); floatDelta(delta);
    showTurn(state.last);
  }
  async function startGame() {
    readInputs();
    const t = T();
    if (!setup.route) { $("sd-err").textContent = t.pickRoute; return; }
    if (busy) return; busy = true;
    state = { route: setup.route, avatar: setup.avatar || ROUTES[setup.route].avatars[0], name: setup.name || "Player", lang: setup.lang, mature: setup.mature, love: 0, history: [], memories: {} };
    openVN(false); waiting(true);
    const go = async () => {
      waiting(true);
      try { const d = await call({ action: "start", route: state.route, name: state.name, lang: state.lang, mature: state.mature }); applyTurn(d); window.CSLAds?.afterTurn?.(d.vip); }
      catch (e) { failed(e.message, go); }
    };
    await go(); busy = false;
  }
  async function choose(choice) {
    if (busy) return; busy = true;
    const go = async () => {
      waiting(true);
      try {
        const d = await call({ action: "turn", route: state.route, name: state.name, lang: state.lang, mature: state.mature, token: state.token, history: state.history, choice });
        applyTurn(d, choice); window.CSLAds?.afterTurn?.(d.vip);
      } catch (e) { failed(e.message, go); }
    };
    await go(); busy = false;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
  window.SweetDate = { open: () => show(true), T: () => TX[hubLang()] || TX.en };
})();
