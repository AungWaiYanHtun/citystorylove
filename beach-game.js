/*
  🏖️ Summer Love — beach resort romance (visual novel). Story in beach-story.js.
  Routes: male player → Mya · female player → Leo · gay (male) → Ren.
  Hugs, kisses and a fade-to-black cuddle night; no nudity. 18+ gate on first open.
  Saves in localStorage + /api/save/beach. Follows hub_lang (en/my/ru/es; story text en/my).
*/
(function () {
  const $ = (id) => document.getElementById(id);
  const A = "beach-assets/", KEY = "csl_beach_v1";
  const tg = window.Telegram?.WebApp, API = window.VIDEOSPACE_CONFIG?.VIP_API_URL;
  const ROUTES = {
    male: { p: "mya", name: "Mya", pr: ["she", "She", "her", "Her", "her"] },
    female: { p: "leo", name: "Leo", pr: ["he", "He", "his", "His", "him"] },
    gay: { p: "ren", name: "Ren", pr: ["he", "He", "his", "His", "him"] }
  };
  const TX = {
    en: { tix: (n) => `🎟️ ${n} free chapters left today`, gateT: "🎟️ Out of free chapters", gateP: "You get 3 free chapters every day (chapters 1–2 are always free). Watch a short ad to unlock 2 more, or get VIP for unlimited play with no ads.", adBtn: "📺 Watch ad: +2 chapters", vipBtn: "👑 VIP: unlimited, no ads", later: "Come back tomorrow", got: "🎟️ +2 chapters unlocked!", vipOn: "👑 VIP · unlimited", title: "🏖️ Summer Love", sub: "Beach, swimsuits & a hotel romance", tag: "NEW · BEACH", back: "‹ Back", gate: "Summer Love has romantic hugs, kisses and a cuddle night at a beach hotel (no nudity). I confirm I am 18 or older.", ok: "Enter 🏖️",
      mature: "Show the 🌙 night scene (fade to black)", pick: "Who do you fall for?", r: { male: "I'm a guy · meet Mya", female: "I'm a girl · meet Leo", gay: "I'm a guy · meet Ren" },
      name: "Your name", start: "▶ Start", cont: "▶ Continue", restart: "↺ New story", tap: "Tap to continue", you: "You", gallery: "🖼 Gallery", locked: "🔒",
      cg: { hug: "🤗 Hug unlocked", kiss: "💋 Kiss unlocked", neck: "💋 Neck kiss unlocked", night: "🌙 Night unlocked" }, again: "↺ Play again", other: "💞 Other routes", ending: "THE END",
      miss: "The moment passes… Maybe next time you'll be a little braver. 💭", night0: "You talk until the sky turns pale pink, wrapped in one blanket. A perfect, quiet night. 🌅", love: "Love" },
    my: { tix: (n) => `🎟️ ဒီနေ့ အခမဲ့ အခန်း ${n} ခန်း ကျန်တယ်`, gateT: "🎟️ အခမဲ့ အခန်း ကုန်သွားပြီ", gateP: "နေ့တိုင်း အခမဲ့ အခန်း ၃ ခန်း ရပါတယ် (အခန်း ၁–၂ က အမြဲအခမဲ့)။ ကြော်ငြာတိုလေး ကြည့်ရင် နောက်ထပ် ၂ ခန်း ဖွင့်ပေးမယ်၊ ဒါမှမဟုတ် VIP ယူရင် ကြော်ငြာမပါဘဲ အကန့်အသတ်မရှိ ဆော့လို့ရတယ်။", adBtn: "📺 ကြော်ငြာကြည့်: +၂ ခန်း", vipBtn: "👑 VIP: အကန့်အသတ်မဲ့၊ ကြော်ငြာမပါ", later: "မနက်ဖြန် ပြန်လာမယ်", got: "🎟️ +၂ ခန်း ဖွင့်ပြီးပါပြီ!", vipOn: "👑 VIP · အကန့်အသတ်မဲ့", title: "🏖️ Summer Love", sub: "ကမ်းခြေ၊ ရေကူးဝတ်စုံနဲ့ ဟော်တယ်အချစ်", tag: "အသစ် · ကမ်းခြေ", back: "‹ ပြန်မယ်", gate: "Summer Love မှာ ကမ်းခြေဟော်တယ်က ဖက်တာ၊ နမ်းတာ၊ ဖက်အိပ်တဲ့ည ရင်ခုန်ခန်းတွေ ပါပါတယ် (ညစ်ညမ်းမှုမပါ)။ ကျွန်ုပ်အသက် ၁၈ နှစ်ပြည့်ပါပြီ။", ok: "ဝင်မယ် 🏖️",
      mature: "🌙 ညအခန်း (fade to black) ပြပါ", pick: "ဘယ်သူနဲ့ ချစ်ကြိုက်မလဲ?", r: { male: "ယောက်ျားလေး · Mya နဲ့တွေ့မယ်", female: "မိန်းကလေး · Leo နဲ့တွေ့မယ်", gay: "ယောက်ျားလေး · Ren နဲ့တွေ့မယ်" },
      name: "ကိုယ့်နာမည်", start: "▶ စမယ်", cont: "▶ ဆက်ဆော့မယ်", restart: "↺ အသစ်ပြန်စမယ်", tap: "နှိပ်ပြီး ဆက်ပါ", you: "ကိုယ်", gallery: "🖼 Gallery", locked: "🔒",
      cg: { hug: "🤗 အဖက် ရပြီ", kiss: "💋 အနမ်း ရပြီ", neck: "💋 လည်ပင်းအနမ်း ရပြီ", night: "🌙 ညအခန်း ရပြီ" }, again: "↺ ပြန်ကစားမယ်", other: "💞 တခြား route", ending: "ပြီးပါပြီ",
      miss: "အခွင့်အရေး လွတ်သွားတယ်… နောက်တစ်ခါ နည်းနည်းပိုရဲရဲလေး ဖြစ်ကြည့်ပါ။ 💭", night0: "စောင်တစ်ထည်တည်းခြုံပြီး ကောင်းကင် ပန်းရောင်ပြောင်းတဲ့အထိ စကားပြောနေကြတယ်။ တိတ်ဆိတ်ပြီး ပြီးပြည့်စုံတဲ့ည။ 🌅", love: "အချစ်" },
    ru: { tix: (n) => `🎟️ Бесплатных глав сегодня: ${n}`, gateT: "🎟️ Бесплатные главы закончились", gateP: "Каждый день 3 бесплатные главы (главы 1–2 всегда бесплатны). Посмотрите рекламу — откроются ещё 2, или возьмите VIP без ограничений и рекламы.", adBtn: "📺 Реклама: +2 главы", vipBtn: "👑 VIP: без лимита и рекламы", later: "Вернуться завтра", got: "🎟️ +2 главы открыты!", vipOn: "👑 VIP · без лимита", title: "🏖️ Summer Love", sub: "Пляж, купальники и роман в отеле", tag: "НОВОЕ · ПЛЯЖ", back: "‹ Назад", gate: "В Summer Love есть объятия, поцелуи и ночь в обнимку в пляжном отеле (без откровенного). Мне есть 18 лет.", ok: "Войти 🏖️",
      mature: "Показывать 🌙 ночную сцену (затемнение)", pick: "В кого вы влюбитесь?", r: { male: "Я парень · Мья", female: "Я девушка · Лео", gay: "Я парень · Рен" },
      name: "Ваше имя", start: "▶ Начать", cont: "▶ Продолжить", restart: "↺ Заново", tap: "Нажмите, чтобы продолжить", you: "Вы", gallery: "🖼 Галерея", locked: "🔒",
      cg: { hug: "🤗 Объятие открыто", kiss: "💋 Поцелуй открыт", neck: "💋 Поцелуй в шею открыт", night: "🌙 Ночь открыта" }, again: "↺ Ещё раз", other: "💞 Другие пути", ending: "КОНЕЦ",
      miss: "Момент упущен… Может, в следующий раз будьте смелее. 💭", night0: "Вы говорите до рассвета под одним пледом. Тихая, идеальная ночь. 🌅", love: "Любовь" },
    es: { tix: (n) => `🎟️ Te quedan ${n} capítulos gratis hoy`, gateT: "🎟️ Sin capítulos gratis", gateP: "Tienes 3 capítulos gratis cada día (los capítulos 1–2 siempre son gratis). Mira un anuncio corto para abrir 2 más, o hazte VIP: ilimitado y sin anuncios.", adBtn: "📺 Ver anuncio: +2 capítulos", vipBtn: "👑 VIP: ilimitado, sin anuncios", later: "Volver mañana", got: "🎟️ ¡+2 capítulos desbloqueados!", vipOn: "👑 VIP · ilimitado", title: "🏖️ Summer Love", sub: "Playa, trajes de baño y romance en el hotel", tag: "NUEVO · PLAYA", back: "‹ Volver", gate: "Summer Love tiene abrazos, besos y una noche abrazados en un hotel de playa (sin desnudos). Confirmo que tengo 18 años o más.", ok: "Entrar 🏖️",
      mature: "Mostrar la escena 🌙 de noche (fundido)", pick: "¿De quién te enamoras?", r: { male: "Soy chico · Mya", female: "Soy chica · Leo", gay: "Soy chico · Ren" },
      name: "Tu nombre", start: "▶ Empezar", cont: "▶ Continuar", restart: "↺ Nueva historia", tap: "Toca para continuar", you: "Tú", gallery: "🖼 Galería", locked: "🔒",
      cg: { hug: "🤗 Abrazo desbloqueado", kiss: "💋 Beso desbloqueado", neck: "💋 Beso en el cuello", night: "🌙 Noche desbloqueada" }, again: "↺ Jugar otra vez", other: "💞 Otras rutas", ending: "FIN",
      miss: "El momento pasa… Quizás la próxima vez seas más valiente. 💭", night0: "Hablan hasta que el cielo se vuelve rosa, bajo una sola manta. Una noche perfecta. 🌅", love: "Amor" }
  };
  const lang = () => { try { return localStorage.getItem("hub_lang") || "en"; } catch { return "en"; } };
  const T = () => TX[lang()] || TX.en;
  const LI = () => (lang() === "my" ? 1 : 0);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const STORY = () => window.CSL_BEACH_STORY || [], ENDS = () => window.CSL_BEACH_ENDINGS || [];

  // Chapters: 1–2 always free, then FREE_PER_DAY chapters a Yangon day; an ad adds AD_CH more; VIP is unlimited with no ads.
  const FREE_FROM = 3, FREE_PER_DAY = 3, AD_CH = 2, GAIN = 0.55, SV = 2;
  const OLD_CH = [0, 9, 17, 24, 32, 38, 45], OLD_TO_NEW = [1, 2, 3, 5, 8, 10, 12];
  let S = load(), busy = false, typing = null, onTap = null, saveT = null, VIP = false;
  migrate();
  function migrate() { // story v1 had 7 chapters: move unfinished runs to the start of the same chapter in v2
    if (S.sv === SV) return;
    Object.values(S.runs || {}).forEach((r) => {
      if (!r || r.done) return;
      let oc = 0; OLD_CH.forEach((st, k) => { if (r.i >= st) oc = k; });
      const nc = OLD_TO_NEW[oc]; const ni = STORY().findIndex((n) => n.ch === nc);
      r.i = Math.max(0, ni); r.unl = nc;
    });
    S.sv = SV; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {}
  }
  const yday = () => new Date(Date.now() + 6.5 * 3600e3).toISOString().slice(0, 10);
  function tix() { if (!S.tix || S.tix.d !== yday()) S.tix = { d: yday(), used: 0, bonus: 0 }; return S.tix; }
  const left = () => { const x = tix(); return Math.max(0, FREE_PER_DAY + x.bonus - x.used); };
  async function checkVip() {
    if (!API || !tg?.initData) return;
    try { const r = await fetch(API + "/api/vip-status", { headers: { "X-Telegram-Init-Data": tg.initData } }); const j = await r.json(); VIP = !!j.active; } catch {}
    const b = $("sl-tix"); if (b) b.textContent = VIP ? T().vipOn : T().tix(left());
  }
  // Called at each chapter title from FREE_FROM on. Resolves true when the chapter may be played.
  function chapterGate(ch) {
    const r = run();
    if (VIP || ch < FREE_FROM || (r.unl || 0) >= ch) return Promise.resolve(true);
    if (left() > 0) { tix().used++; r.unl = ch; save(); return Promise.resolve(true); }
    return new Promise((res) => {
      const t = T(), d = document.createElement("div"); d.className = "sl-sheet sl-adgate";
      d.innerHTML = `<div class="sl-sbox"><div class="sl-gico">🎟️</div><b>${esc(t.gateT)}</b><p>${esc(t.gateP)}</p>
        <button type="button" class="sl-gold" data-a="ad">${esc(t.adBtn)}</button><button type="button" class="sl-ghost" data-a="vip">${esc(t.vipBtn)}</button><button type="button" class="sl-ghost" data-a="x">${esc(t.later)}</button></div>`;
      $("sl-play").appendChild(d);
      d.addEventListener("click", async (e) => {
        e.stopPropagation(); const a = e.target.closest("[data-a]")?.dataset.a; if (!a) return;
        if (a === "x") { d.remove(); res(false); return; }
        if (a === "vip") { document.dispatchEvent(new CustomEvent("videospace:open-vip-plans")); return; }
        const ok = await window.CSLAds?.reward?.("beach", lang());
        if (ok) { tix().bonus += AD_CH; tix().used++; r.unl = ch; save(); d.remove(); toast(t.got); res(true); }
      });
    });
  }
  function toast(msg) { const el = $("toast"); if (!el) return; el.textContent = msg; el.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("show"), 2600); }
  function fresh() { return { v: 1, sv: 2, ts: Date.now(), adult: false, mature: true, cur: null, runs: {}, gallery: {}, endings: {} }; }
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); return s && s.v ? s : fresh(); } catch { return fresh(); } }
  function save() { S.ts = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} clearTimeout(saveT); saveT = setTimeout(push, 1500); }
  async function push() { if (!API || !tg?.initData) return; try { await fetch(API + "/api/save/beach", { method: "POST", headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": tg.initData }, body: JSON.stringify({ data: S }) }); } catch {} }
  async function pull() {
    if (!API || !tg?.initData) return;
    try { const r = await fetch(API + "/api/save/beach", { headers: { "X-Telegram-Init-Data": tg.initData } }); const j = await r.json();
      if (j?.data?.v && Number(j.data.ts || 0) > Number(S.ts || 0)) { S = j.data; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} if ($("sl-root") && !S.cur) menu(); } } catch {}
  }
  const run = () => S.runs[S.cur];
  function tok(str) {
    const R = ROUTES[S.cur] || ROUTES.male, r = run() || {}, p = R.pr;
    return String(str).replace(/\{P\}/g, R.name).replace(/\{me\}/g, r.name || T().you)
      .replace(/\{he\}/g, p[0]).replace(/\{He\}/g, p[1]).replace(/\{his\}/g, p[2]).replace(/\{His\}/g, p[3]).replace(/\{him\}/g, p[4]);
  }
  const line = (arr) => tok((arr && (arr[LI()] || arr[0])) || "");

  // ---------- hub card ----------
  function cardInfo() { const t = T(); return { id: "hub-beach", bg: A + "bg_beach_day.webp", pic: A + "mya_swim_smile.webp", tag: "NEW", txt: [t.title, t.sub] }; }

  // ---------- open / close ----------
  function open() {
    $("sl-root")?.remove();
    const el = document.createElement("div"); el.id = "sl-root"; el.className = "sl-root";
    document.body.appendChild(el); document.body.classList.add("sl-lock");
    try { tg?.BackButton?.show?.(); tg?.BackButton?.onClick?.(back); } catch {}
    S.cur = null; menu(); pull(); checkVip();
  }
  function close() {
    $("sl-root")?.remove(); document.body.classList.remove("sl-lock");
    try { tg?.BackButton?.offClick?.(back); tg?.BackButton?.hide?.(); } catch {}
  }
  function back() { if (S.cur && $("sl-play")) { S.cur = null; save(); menu(); } else close(); }

  // ---------- menu ----------
  function menu() {
    const el = $("sl-root"); if (!el) return; const t = T();
    if (!S.adult) {
      el.innerHTML = `<div class="sl-gate" style="background-image:url('${A}bg_beach_sunset.webp')"><div class="sl-gbox"><h2>${t.title}</h2><p>${esc(t.gate)}</p>
        <label class="sl-chk"><input type="checkbox" id="sl-mat" checked> ${esc(t.mature)}</label>
        <button type="button" class="sl-gold" id="sl-ok">${t.ok}</button><button type="button" class="sl-ghost" id="sl-x">${t.back}</button></div></div>`;
      $("sl-ok").onclick = () => { S.adult = true; S.mature = $("sl-mat").checked; save(); menu(); };
      $("sl-x").onclick = close; return;
    }
    const routes = Object.keys(ROUTES).map((k) => {
      const r = S.runs[k], R = ROUTES[k], pct = r ? Math.round((r.i / STORY().length) * 100) : 0;
      return `<button type="button" class="sl-route" data-r="${k}"><span class="sl-rimg" style="background-image:url('${A}${k === "male" ? "bg_beach_day" : k === "female" ? "bg_beach_sunset" : "bg_hotel_pool_night"}.webp')"><img src="${A}${R.p}_swim_smile.webp" alt=""></span>
        <b>${R.name}</b><small>${esc(t.r[k])}</small>${r ? `<i class="sl-prog"><em style="width:${r.done ? 100 : pct}%"></em></i>` : ""}${S.endings[k] ? `<span class="sl-end">${esc(S.endings[k])}</span>` : ""}</button>`;
    }).join("");
    el.innerHTML = `<div class="sl-menu" style="background-image:url('${A}bg_beach_day.webp')"><div class="sl-top"><button type="button" class="sl-pill" id="sl-x">${t.back}</button><button type="button" class="sl-pill" id="sl-gal">${t.gallery}</button></div>
      <h1>${t.title}</h1><p class="sl-sub">${esc(t.sub)}</p><p class="sl-tix" id="sl-tix">${VIP ? t.vipOn : t.tix(left())}</p><h3>${esc(t.pick)}</h3><div class="sl-routes">${routes}</div>
      <label class="sl-chk light"><input type="checkbox" id="sl-mat" ${S.mature ? "checked" : ""}> ${esc(t.mature)}</label></div>`;
    $("sl-x").onclick = close; $("sl-gal").onclick = gallery;
    $("sl-mat").onchange = (e) => { S.mature = e.target.checked; save(); };
    el.querySelectorAll("[data-r]").forEach((b) => (b.onclick = () => routeSheet(b.dataset.r)));
  }
  function routeSheet(k) {
    const t = T(), r = S.runs[k], R = ROUTES[k];
    let nm = r?.name || tg?.initDataUnsafe?.user?.first_name || "";
    const d = document.createElement("div"); d.className = "sl-sheet";
    d.innerHTML = `<div class="sl-sbox"><img src="${A}${R.p}_swim_shy.webp" alt=""><b>${R.name}</b><input id="sl-name" maxlength="16" placeholder="${esc(t.name)}" value="${esc(nm)}">
      ${r && !r.done ? `<button type="button" class="sl-gold" data-a="c">${t.cont}</button>` : ""}<button type="button" class="${r && !r.done ? "sl-ghost" : "sl-gold"}" data-a="n">${r ? t.restart : t.start}</button><button type="button" class="sl-ghost" data-a="x">${t.back}</button></div>`;
    $("sl-root").appendChild(d);
    d.onclick = (e) => {
      const a = e.target.closest("[data-a]")?.dataset.a; if (!a) { if (e.target === d) d.remove(); return; }
      if (a === "x") return d.remove();
      const name = ($("sl-name").value || "").trim().slice(0, 16) || T().you;
      if (a === "n" || !S.runs[k]) S.runs[k] = { i: 0, love: 10, allow: true, name, done: false, unl: 0 };
      else S.runs[k].name = name;
      S.cur = k; save(); d.remove(); play();
    };
  }

  // ---------- play ----------
  function play() {
    const el = $("sl-root"); const t = T();
    el.innerHTML = `<div class="sl-play" id="sl-play"><div class="sl-bg" id="sl-bg"></div><img class="sl-spr hide" id="sl-spr" alt="">
      <div class="sl-hud"><button type="button" class="sl-pill" id="sl-x">${t.back}</button><span class="sl-chap" id="sl-chap"></span><span class="sl-love"><i>💗</i><span class="sl-lbar"><em id="sl-lv"></em></span></span></div>
      <div class="sl-box" id="sl-box"><span class="sl-who hide" id="sl-who"></span><p id="sl-txt"></p><small class="sl-tap">${t.tap} ▾</small></div><div class="sl-ch" id="sl-chs"></div></div>`;
    $("sl-x").onclick = (e) => { e.stopPropagation(); back(); };
    $("sl-play").addEventListener("click", (e) => { if (e.target.closest(".sl-ch button,.sl-hud")) return; tap(); });
    let ch = 1; for (let i = 0; i <= run().i && i < STORY().length; i++) if (STORY()[i].ch) ch = STORY()[i].ch;
    const chNode = STORY().find((n) => n.ch === ch);
    if (chNode) setBg(chNode.bg), ($("sl-chap").textContent = line(chNode.title).split("·")[0].trim());
    love(0); step();
  }
  function tap() { if (typing) { typing(); return; } if (onTap) { const f = onTap; onTap = null; f(); } }
  function setBg(bg) { const b = $("sl-bg"); if (b && bg) b.style.backgroundImage = `url('${A}${bg}.webp')`; }
  function spr(ex) {
    const im = $("sl-spr"); if (!im) return;
    if (!ex) { im.classList.add("hide"); return; }
    const src = `${A}${ROUTES[S.cur].p}_swim_${ex === "h" ? "shy" : "smile"}.webp`;
    if (!im.src.endsWith(src)) im.src = src; im.classList.remove("hide");
  }
  function love(d) {
    const r = run(); r.love = Math.max(0, Math.min(100, r.love + d)); const lv = $("sl-lv"); if (lv) lv.style.width = r.love + "%";
    if (d) { const f = document.createElement("div"); f.className = "sl-float " + (d > 0 ? "up" : "down"); f.textContent = (d > 0 ? "+" : "") + d + " 💗"; $("sl-play")?.appendChild(f); setTimeout(() => f.remove(), 1300);
      try { tg?.HapticFeedback?.impactOccurred?.(d > 0 ? "light" : "soft"); } catch {} }
  }
  function say(who, text, ex) {
    return new Promise((res) => {
      const w = $("sl-who"), p = $("sl-txt"); if (!p) return;
      if (ex !== undefined) spr(ex);
      if (who === "p") { w.textContent = ROUTES[S.cur].name; w.className = "sl-who"; }
      else if (who === "m") { w.textContent = run().name; w.className = "sl-who me"; }
      else w.className = "sl-who hide";
      p.className = who === "m" ? "thought" : who === "n" ? "narr" : "";
      let i = 0; const full = text; p.textContent = "";
      const iv = setInterval(() => { i += 2; p.textContent = full.slice(0, i); if (i >= full.length) done(); }, 22);
      function done() { clearInterval(iv); p.textContent = full; typing = null; onTap = res; }
      typing = done;
    });
  }
  async function step() {
    const r = run(), N = STORY(); if (!$("sl-play")) return;
    if (r.i >= N.length) return ending();
    const n = N[r.i];
    if (n.end) return ending();
    if (n.ch) {
      setBg(n.bg); $("sl-chap").textContent = line(n.title).split("·")[0].trim(); spr("");
      if (!(await chapterGate(n.ch))) { S.cur = null; save(); return menu(); }
      await titleCard(line(n.title)); return next();
    }
    if (n.bg) setBg(n.bg);
    if (n.cg) {
      const ok = r.love >= (n.need || 0) && r.allow !== false && (!n.mature || S.mature);
      if (ok) await showCg(n.cg, line(n.t));
      else { spr(""); await say("n", n.cg === "night" ? T().night0 : T().miss); }
      r.allow = true; return next();
    }
    if (n.need && r.love < n.need) { r.allow = false; return next(); } // not close enough yet: skip the moment
    await say(n.w, line(n.t), n.ex);
    if (n.c) {
      const i = await choose(n);
      const c = n.c[i], g = Math.round((c[1] || 0) * GAIN); love(g);
      if (n.pick) r.allow = n.pick.includes(i);
      if (c[2]) await say("p", line(c[2]), (c[1] || 0) >= 6 ? "h" : "s");
      try { await window.CSLAds?.afterTurn?.(VIP); } catch {}
    }
    next();
  }
  function next() { run().i++; save(); step(); }
  function choose(n) {
    return new Promise((res) => {
      const box = $("sl-chs"); onTap = null;
      box.innerHTML = n.c.map((c, i) => `<button type="button" data-i="${i}">${esc(LI() && n.cm?.[i] ? tok(n.cm[i][0]) : tok(c[0]))}</button>`).join("");
      box.classList.add("on");
      box.querySelectorAll("button").forEach((b) => (b.onclick = (e) => { e.stopPropagation(); box.classList.remove("on"); box.innerHTML = ""; res(Number(b.dataset.i)); }));
    });
  }
  function titleCard(txt) {
    return new Promise((res) => {
      const d = document.createElement("div"); d.className = "sl-title"; d.innerHTML = `<span>🌊</span><h2>${esc(txt)}</h2>`;
      $("sl-play").appendChild(d); const go = () => { d.classList.add("out"); setTimeout(() => d.remove(), 400); res(); };
      const tm = setTimeout(go, 2200); onTap = () => { clearTimeout(tm); go(); };
    });
  }
  function showCg(kind, text) {
    const id = `${ROUTES[S.cur].p}_${kind}`; S.gallery[id] = 1; save();
    try { tg?.HapticFeedback?.notificationOccurred?.("success"); } catch {}
    return new Promise((res) => {
      const d = document.createElement("div"); d.className = "sl-cg k-" + kind;
      d.innerHTML = `${kind === "night" ? `<img src="${A}cg_${id}.webp" alt="">` : `<video src="${A}v_${id}.mp4" poster="${A}cg_${id}.webp" playsinline webkit-playsinline muted autoplay preload="auto"></video><button type="button" class="sl-replay">▶</button>`}<div class="sl-hearts">${"<i>💗</i>".repeat(10)}</div><span class="sl-badge">${T().cg[kind]}</span><p>${esc(text)}</p><small>${T().tap} ▾</small>`;
      $("sl-play").appendChild(d); requestAnimationFrame(() => d.classList.add("on"));
      const v = d.querySelector("video"); if (v) { v.play().catch(() => {});
      d.querySelector(".sl-replay").onclick = (e) => { e.stopPropagation(); v.currentTime = 0; v.play().catch(() => {}); }; }
      setTimeout(() => (onTap = () => { d.classList.remove("on"); setTimeout(() => d.remove(), 450); res(); }), 2500);
    });
  }
  function ending() {
    const r = run(), t = T(); r.done = true;
    const e = ENDS().find((x) => r.love >= x[0]) || ENDS()[ENDS().length - 1];
    const p = ROUTES[S.cur].p;
    const img = r.love >= 85 && S.gallery[p + "_night"] ? `cg_${p}_night` : r.love >= 60 && S.gallery[p + "_kiss"] ? `cg_${p}_kiss` : r.love >= 30 && S.gallery[p + "_hug"] ? `cg_${p}_hug` : "bg_beach_sunset";
    S.endings[S.cur] = line(e[1]); save();
    const d = document.createElement("div"); d.className = "sl-endc";
    d.innerHTML = `<img src="${A}${img}.webp" alt=""><div class="sl-ebox"><small>${t.ending}</small><h2>${esc(line(e[1]))}</h2><p>${esc(line(e[2]))}</p><div class="sl-elove">💗 ${r.love}/100</div>
      <button type="button" class="sl-gold" data-a="again">${t.again}</button><button type="button" class="sl-ghost" data-a="other">${t.other}</button><button type="button" class="sl-ghost" data-a="gal">${t.gallery}</button></div>`;
    $("sl-play").appendChild(d);
    d.onclick = (ev) => { const a = ev.target.closest("[data-a]")?.dataset.a; if (!a) return;
      if (a === "again") { S.runs[S.cur] = { i: 0, love: 10, allow: true, name: r.name, done: false, unl: 0 }; save(); play(); }
      else if (a === "other") { S.cur = null; save(); menu(); } else gallery(); };
  }
  function gallery() {
    const t = T(), ks = ["hug", "kiss", "neck", "night"];
    const d = document.createElement("div"); d.className = "sl-sheet";
    d.innerHTML = `<div class="sl-gal"><h3>${t.gallery}</h3>${Object.values(ROUTES).map((R) => `<b>${R.name}</b><div class="sl-ggrid">${ks.map((k) => S.gallery[R.p + "_" + k]
      ? `<button type="button" data-g="${R.p}_${k}" style="background-image:url('${A}cg_${R.p}_${k}.webp')"></button>` : `<span>${t.locked}</span>`).join("")}</div>`).join("")}
      <button type="button" class="sl-gold" data-a="x">${t.back}</button></div>`;
    $("sl-root").appendChild(d);
    d.onclick = (e) => {
      const g = e.target.closest("[data-g]")?.dataset.g;
      if (g) { const v = document.createElement("div"); v.className = "sl-view"; v.innerHTML = g.endsWith("_night") ? `<img src="${A}cg_${g}.webp" alt="">` : `<video src="${A}v_${g}.mp4" poster="${A}cg_${g}.webp" playsinline webkit-playsinline muted autoplay loop></video>`; v.querySelector("video")?.play().catch(() => {}); v.onclick = () => v.remove(); document.body.appendChild(v); return; }
      if (e.target.closest("[data-a]") || e.target === d) d.remove();
    };
  }
  document.addEventListener("csl-lang", () => { if ($("sl-root") && !$("sl-play")) menu(); });
  window.CSLBeach = { open, close, cardInfo };
})();
