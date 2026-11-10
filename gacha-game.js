/*
  💘 Love Gacha (Mya). Spin the reel to collect romantic cards with Mya (hugs and kisses are the rare ones),
  finish missions for 💗 hearts, and fill the album. Non-explicit romance only.
  - 3 free spins a day (Yangon day), +3 spins per reward ad (backend /api/ads/reward, game "gacha").
  - Hearts 💗 buy extra spins. Duplicates turn into hearts. A Mythic is guaranteed within 30 spins.
  - Saved in localStorage and, when inside Telegram, in /api/save/gacha (same as other games).
  - Follows the hub language (hub_lang + "csl-lang" event): en, my, ru, es.
*/
(function () {
  const $ = (id) => document.getElementById(id);
  const A = "gacha-assets/", DA = "date-assets/";
  const SAVE_KEY = "csl_gacha_v1";
  const tg = window.Telegram?.WebApp;
  const API = window.VIDEOSPACE_CONFIG?.VIP_API_URL;
  const FREE_PER_DAY = 3, AD_SPINS = 3, COST = { std: 100, kiss: 200 }, PITY = 30, START_HEARTS = 200;
  const DUPE = { c: 10, r: 20, e: 40, m: 80 };
  const RATES = { std: { c: 50, r: 30, e: 15, m: 5 }, kiss: { c: 0, r: 50, e: 35, m: 15 } };
  const STARS = { c: "⭐", r: "⭐⭐", e: "⭐⭐⭐", m: "⭐⭐⭐⭐" };
  const RNAME = { c: "COMMON", r: "RARE", e: "EPIC", m: "MYTHIC" };

  // id, rarity, image, video (optional), kind (hug/kiss for missions), names [en, my, ru, es]
  const CARDS = [
    ["cafe", "c", A + "cafe.webp", "", "", ["Café hello", "ကော်ဖီဆိုင်က နှုတ်ဆက်", "Привет из кафе", "Hola en el café"]],
    ["summer", "c", A + "summer.webp", "", "", ["Summer breeze", "နွေရာသီ လေညင်း", "Летний бриз", "Brisa de verano"]],
    ["hands", "c", A + "hands.webp", "", "", ["Hand in hand", "လက်ချင်းတွဲ", "Рука в руке", "De la mano"]],
    ["cheek", "r", A + "cheek.webp", "", "kiss", ["Cheek kiss selfie", "ပါးလေးနမ်း selfie", "Поцелуй в щёчку", "Beso en la mejilla"]],
    ["icecream", "r", A + "icecream.webp", "", "", ["Shared ice cream", "ရေခဲမုန့် အတူစား", "Одно мороженое", "Helado compartido"]],
    ["cooking", "r", A + "cooking.webp", "", "", ["Cooking together", "အတူတူ ချက်ပြုတ်", "Готовим вместе", "Cocinando juntos"]],
    ["backhug", "e", A + "backhug.webp", "", "hug", ["Back hug", "နောက်ကနေ ဖက်", "Объятие сзади", "Abrazo por detrás"]],
    ["umbrella", "e", A + "umbrella.webp", "", "hug", ["Rainy umbrella hug", "မိုးထဲ ထီးအောက်ဖက်", "Объятие под зонтом", "Abrazo bajo la lluvia"]],
    ["princess", "e", A + "princess.webp", "", "hug", ["Princess carry", "မင်းသမီးလို ချီ", "На руках", "En brazos"]],
    ["hugv", "e", DA + "v_mya_hug.webp", DA + "v_mya_hug.mp4", "hug", ["🎬 Warm hug", "🎬 နွေးထွေးတဲ့ အဖက်", "🎬 Тёплое объятие", "🎬 Abrazo cálido"]],
    ["forehead", "m", A + "forehead.webp", "", "kiss", ["Forehead kiss", "နဖူးလေး နမ်း", "Поцелуй в лоб", "Beso en la frente"]],
    ["fireworks", "m", A + "fireworks.webp", "", "kiss", ["Fireworks kiss", "မီးပန်းအောက်က အနမ်း", "Поцелуй под салютом", "Beso con fuegos"]],
    ["snow", "m", A + "snow.webp", "", "kiss", ["Snowy kiss", "နှင်းထဲက အနမ်း", "Поцелуй в снегу", "Beso en la nieve"]],
    ["kissv", "m", DA + "v_mya_kiss.webp", DA + "v_mya_kiss.mp4", "kiss", ["🎬 Sweet kiss", "🎬 ချိုမြိန်တဲ့ အနမ်း", "🎬 Нежный поцелуй", "🎬 Beso dulce"]],
    ["nightv", "m", DA + "v_mya_night.webp", DA + "v_mya_night.mp4", "hug", ["🎬 Asleep together", "🎬 ဖက်ပြီး အတူအိပ်", "🎬 Уснули вместе", "🎬 Dormidos juntos"]]
  ].map(([id, r, img, vid, kind, names]) => ({ id, r, img, vid, kind, names }));
  const LI = { en: 0, my: 1, ru: 2, es: 3 };

  const TX = {
    en: {
      tag: "🎰 NEW · SPIN", title: "💘 Love Gacha", sub: "Collect hug & kiss cards with Mya", go: "✨ Spin now",
      back: "‹ Back", std: "Mya's Sweet Wish", kiss: "💋 Kiss Wish", stdSub: "Common · Rare · Epic · Mythic", kissSub: "Only Rare+ · Mythic ×3",
      free: "🎟 Free spin", left: (n) => `${n} left`, none: "0 left", spin: (c) => `💗 ${c} to spin`, ad: "📺 Ad: +3 spins",
      noHearts: "Not enough 💗. Do missions or watch an ad!", kissOnly: "Kiss Wish uses 💗 only.",
      missions: "💌 Mya's missions", daily: "Today", album: "📖 Album", claim: "Claim", done: "✓",
      newC: "NEW!", dupe: (h) => `Duplicate · +💗${h}`, play: "▶ Play", close: "Continue ▶", pity: (n) => `Mythic guaranteed in ${n}`,
      gate: "Love Gacha has romantic hug and kiss scenes (no nudity). I confirm I am 18 or older.", ok: "Enter 💘", got: "+💗",
      adOk: "🎟 +3 spins added!", collected: (a, b) => `${a}/${b} collected`, locked: "Locked",
      m: { d_spin: "Spin 5 times today", d_hug: "Get a hug card today", d_ad: "Watch 1 ad today", c_all_c: "Collect every Common", c_all_r: "Collect every Rare", c_hugs: "Collect every hug card", c_kiss: "Collect every kiss card", c_10: "Collect 10 different cards", c_all: "Complete the album" }
    },
    my: {
      tag: "🎰 အသစ် · SPIN", title: "💘 Love Gacha", sub: "Mya နဲ့ ဖက်/နမ်း ကဒ်တွေ စုမယ်", go: "✨ Spin လှည့်မယ်",
      back: "‹ ပြန်မယ်", std: "Mya's Sweet Wish", kiss: "💋 Kiss Wish", stdSub: "Common · Rare · Epic · Mythic", kissSub: "Rare အထက်ပဲ · Mythic ၃ ဆ",
      free: "🎟 အခမဲ့ Spin", left: (n) => `${n} ကြိမ်ကျန်`, none: "ကုန်ပြီ", spin: (c) => `💗 ${c} နဲ့ Spin`, ad: "📺 ကြော်ငြာ: +၃ Spin",
      noHearts: "💗 မလောက်ပါ။ Mission လုပ် (သို့) ကြော်ငြာကြည့်ပါ!", kissOnly: "Kiss Wish က 💗 နဲ့ပဲ လှည့်ရပါတယ်။",
      missions: "💌 Mya ရဲ့ Mission", daily: "ဒီနေ့", album: "📖 Album", claim: "ယူမယ်", done: "✓",
      newC: "အသစ်!", dupe: (h) => `ရှိပြီးသား · +💗${h}`, play: "▶ ကြည့်မယ်", close: "ဆက်မယ် ▶", pity: (n) => `${n} ကြိမ်အတွင်း Mythic သေချာရမယ်`,
      gate: "Love Gacha မှာ ဖက်တာ၊ နမ်းတာ ရင်ခုန်ခန်းတွေ ပါပါတယ် (ညစ်ညမ်းမှုမပါ)။ ကျွန်ုပ်အသက် ၁၈ နှစ်ပြည့်ပါပြီ။", ok: "ဝင်မယ် 💘", got: "+💗",
      adOk: "🎟 +၃ Spin ရပါပြီ!", collected: (a, b) => `${a}/${b} စုပြီး`, locked: "မရသေး",
      m: { d_spin: "ဒီနေ့ Spin ၅ ကြိမ်လှည့်ပါ", d_hug: "ဒီနေ့ ဖက်တဲ့ကဒ် ၁ ခုရပါ", d_ad: "ဒီနေ့ ကြော်ငြာ ၁ ခုကြည့်ပါ", c_all_c: "Common ကဒ်အားလုံး စုပါ", c_all_r: "Rare ကဒ်အားလုံး စုပါ", c_hugs: "ဖက်တဲ့ကဒ် အားလုံး စုပါ", c_kiss: "နမ်းတဲ့ကဒ် အားလုံး စုပါ", c_10: "မတူတဲ့ကဒ် ၁၀ ခု စုပါ", c_all: "Album အပြည့် စုပါ" }
    },
    ru: {
      tag: "🎰 НОВОЕ · SPIN", title: "💘 Love Gacha", sub: "Собирайте объятия и поцелуи с Мьей", go: "✨ Крутить",
      back: "‹ Назад", std: "Mya's Sweet Wish", kiss: "💋 Kiss Wish", stdSub: "Common · Rare · Epic · Mythic", kissSub: "Только Rare+ · Mythic ×3",
      free: "🎟 Бесплатно", left: (n) => `осталось ${n}`, none: "закончились", spin: (c) => `💗 ${c} за спин`, ad: "📺 Реклама: +3 спина",
      noHearts: "Не хватает 💗. Выполняйте задания или смотрите рекламу!", kissOnly: "Kiss Wish только за 💗.",
      missions: "💌 Задания Мьи", daily: "Сегодня", album: "📖 Альбом", claim: "Забрать", done: "✓",
      newC: "НОВАЯ!", dupe: (h) => `Повтор · +💗${h}`, play: "▶ Смотреть", close: "Дальше ▶", pity: (n) => `Mythic гарантирован через ${n}`,
      gate: "В Love Gacha есть романтические объятия и поцелуи (без откровенного). Подтверждаю, что мне есть 18 лет.", ok: "Войти 💘", got: "+💗",
      adOk: "🎟 +3 спина!", collected: (a, b) => `собрано ${a}/${b}`, locked: "Закрыто",
      m: { d_spin: "Сделайте 5 спинов сегодня", d_hug: "Получите карту объятия сегодня", d_ad: "Посмотрите 1 рекламу сегодня", c_all_c: "Соберите все Common", c_all_r: "Соберите все Rare", c_hugs: "Соберите все объятия", c_kiss: "Соберите все поцелуи", c_10: "Соберите 10 разных карт", c_all: "Заполните альбом" }
    },
    es: {
      tag: "🎰 NUEVO · SPIN", title: "💘 Love Gacha", sub: "Colecciona abrazos y besos con Mya", go: "✨ Girar",
      back: "‹ Volver", std: "Mya's Sweet Wish", kiss: "💋 Kiss Wish", stdSub: "Common · Rare · Epic · Mythic", kissSub: "Solo Rare+ · Mythic ×3",
      free: "🎟 Giro gratis", left: (n) => `quedan ${n}`, none: "agotados", spin: (c) => `💗 ${c} por giro`, ad: "📺 Anuncio: +3 giros",
      noHearts: "No tienes suficientes 💗. ¡Haz misiones o mira un anuncio!", kissOnly: "Kiss Wish solo con 💗.",
      missions: "💌 Misiones de Mya", daily: "Hoy", album: "📖 Álbum", claim: "Cobrar", done: "✓",
      newC: "¡NUEVA!", dupe: (h) => `Repetida · +💗${h}`, play: "▶ Ver", close: "Seguir ▶", pity: (n) => `Mythic garantizado en ${n}`,
      gate: "Love Gacha tiene escenas románticas de abrazos y besos (nada explícito). Confirmo que tengo 18 años o más.", ok: "Entrar 💘", got: "+💗",
      adOk: "🎟 ¡+3 giros!", collected: (a, b) => `${a}/${b} conseguidas`, locked: "Bloqueada",
      m: { d_spin: "Gira 5 veces hoy", d_hug: "Consigue una carta de abrazo hoy", d_ad: "Mira 1 anuncio hoy", c_all_c: "Consigue todas las Common", c_all_r: "Consigue todas las Rare", c_hugs: "Consigue todos los abrazos", c_kiss: "Consigue todos los besos", c_10: "Consigue 10 cartas distintas", c_all: "Completa el álbum" }
    }
  };
  const lang = () => { try { return localStorage.getItem("hub_lang") || "en"; } catch { return "en"; } };
  const T = () => TX[lang()] || TX.en;
  const nameOf = (c) => c.names[LI[lang()] ?? 0];
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const today = () => new Date(Date.now() + 6.5 * 3600e3).toISOString().slice(0, 10); // Asia/Yangon day

  // daily + one-time missions: [id, goal(state)->[have, need], reward]
  const has = (ids) => ids.filter((id) => S.owned[id]).length;
  const ofR = (r) => CARDS.filter((c) => c.r === r).map((c) => c.id);
  const ofK = (k) => CARDS.filter((c) => c.kind === k).map((c) => c.id);
  const MISSIONS = [
    ["d_spin", () => [S.day.spins, 5], 60, true],
    ["d_hug", () => [S.day.hug ? 1 : 0, 1], 80, true],
    ["d_ad", () => [S.day.ads, 1], 50, true],
    ["c_all_c", () => [has(ofR("c")), ofR("c").length], 100],
    ["c_all_r", () => [has(ofR("r")), ofR("r").length], 150],
    ["c_hugs", () => [has(ofK("hug")), ofK("hug").length], 250],
    ["c_10", () => [Object.keys(S.owned).length, 10], 200],
    ["c_kiss", () => [has(ofK("kiss")), ofK("kiss").length], 400],
    ["c_all", () => [Object.keys(S.owned).length, CARDS.length], 800]
  ];

  let S = load(), pool = "std", spinning = false, saveTimer = null;
  function fresh() { return { v: 1, ts: Date.now(), hearts: START_HEARTS, owned: {}, pity: 0, claimed: {}, adult: false, day: { d: today(), free: FREE_PER_DAY, spins: 0, hug: false, ads: 0, claimed: {} } }; }
  function load() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); return s && s.v ? s : fresh(); } catch { return fresh(); } }
  function rollDay() { if (S.day?.d !== today()) S.day = { d: today(), free: FREE_PER_DAY, spins: 0, hug: false, ads: 0, claimed: {} }; }
  function save() {
    S.ts = Date.now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch {}
    clearTimeout(saveTimer);
    saveTimer = setTimeout(cloudPush, 1500);
  }
  async function cloudPush() {
    if (!API || !tg?.initData) return;
    try { await fetch(API + "/api/save/gacha", { method: "POST", headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": tg.initData }, body: JSON.stringify({ data: S }) }); } catch {}
  }
  async function cloudPull() {
    if (!API || !tg?.initData) return;
    try {
      const r = await fetch(API + "/api/save/gacha", { headers: { "X-Telegram-Init-Data": tg.initData } });
      const j = await r.json();
      if (j?.data?.v && Number(j.data.ts || 0) > Number(S.ts || 0)) { S = j.data; try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch {} if ($("lg-root")) paint(); }
    } catch {}
  }

  // ---------- home banner (games-hub puts it under the carousel) ----------
  function bannerHTML() {
    const t = T();
    return `<button type="button" class="lg-banner" id="hub-gacha"><span class="lg-bimg" style="background-image:url('${A}banner.webp')"></span>
      <span class="lg-btxt"><span class="lg-btag">${t.tag}</span><b>${t.title}</b><small>${esc(t.sub)}</small></span></button>`;
  }

  // ---------- game screen ----------
  function open() {
    rollDay();
    $("lg-root")?.remove();
    const el = document.createElement("div");
    el.id = "lg-root"; el.className = "lg-root";
    document.body.appendChild(el);
    document.body.classList.add("lg-lock");
    try { tg?.BackButton?.show?.(); tg?.BackButton?.onClick?.(close); } catch {}
    paint();
    cloudPull();
  }
  function close() {
    $("lg-root")?.remove(); $("lg-pop")?.remove();
    document.body.classList.remove("lg-lock");
    try { tg?.BackButton?.offClick?.(close); tg?.BackButton?.hide?.(); } catch {}
  }
  function paint() {
    const el = $("lg-root"); if (!el) return;
    rollDay();
    const t = T();
    if (!S.adult) {
      el.innerHTML = `<div class="lg-gate"><img src="${A}banner.webp" alt=""><p>${esc(t.gate)}</p><button type="button" class="lg-gold" data-x="adult">${t.ok}</button><button type="button" class="lg-ghost" data-x="close">${t.back}</button></div>`;
      el.querySelector('[data-x="adult"]').onclick = () => { S.adult = true; save(); paint(); };
      el.querySelector('[data-x="close"]').onclick = close;
      return;
    }
    const total = CARDS.length, got = Object.keys(S.owned).length;
    const poolCard = (p, side) => `<button type="button" class="lg-pool ${side ? "side" : ""}" data-pool="${p}" style="background-image:url('${p === "kiss" ? A + "fireworks.webp" : A + "backhug.webp"}')">${side ? "" : `<span class="lg-ptag">${p === "kiss" ? "💋 KISS POOL" : "⭐ STANDARD"}</span><b>${p === "kiss" ? t.kiss : t.std}</b><small>${p === "kiss" ? t.kissSub : t.stdSub}</small>`}</button>`;
    const other = pool === "std" ? "kiss" : "std";
    el.innerHTML = `
      <div class="lg-top"><button type="button" class="lg-pill" data-x="close">${t.back}</button>
        <span class="lg-stats"><span class="lg-pill" id="lg-hearts">💗 ${S.hearts}</span><span class="lg-pill">🎟 ${S.day.free}/${FREE_PER_DAY}</span></span></div>
      <div class="lg-pools">${poolCard(other, true)}${poolCard(pool)}${poolCard(other, true)}</div>
      <div class="lg-reel-wrap"><div class="lg-reel" id="lg-reel"></div><i class="lg-arrow up"></i><i class="lg-arrow down"></i></div>
      <div class="lg-pity">${t.pity(Math.max(1, PITY - S.pity))} · ${t.collected(got, total)}</div>
      <div class="lg-btns">
        <button type="button" class="lg-free" data-x="free" ${pool === "kiss" ? "disabled" : ""}><small>${t.free}</small><span>${S.day.free > 0 ? t.left(S.day.free) : t.none}</span></button>
        <button type="button" class="lg-buy" data-x="buy"><small>${t.spin(COST[pool])}</small><span>SPIN ✨</span></button>
      </div>
      <button type="button" class="lg-ad" data-x="ad">${t.ad}</button>
      <div class="lg-row"><h4>${t.missions}</h4><button type="button" class="lg-pill" data-x="album">${t.album}</button></div>
      <div id="lg-miss">${missionsHTML()}</div>`;
    fillReel(null);
    el.querySelector('[data-x="close"]').onclick = close;
    el.querySelectorAll("[data-pool]").forEach((b) => (b.onclick = () => { if (spinning) return; pool = b.dataset.pool; paint(); }));
    el.querySelector('[data-x="free"]').onclick = () => spin("free");
    el.querySelector('[data-x="buy"]').onclick = () => spin("hearts");
    el.querySelector('[data-x="ad"]').onclick = async () => { if (!spinning) await window.CSLAds?.reward?.("gacha", lang()); };
    el.querySelector('[data-x="album"]').onclick = album;
    wireMissions();
  }
  function missionsHTML() {
    const t = T();
    return MISSIONS.map(([id, goal, rw, daily]) => {
      const [h, n] = goal(), done = daily ? S.day.claimed[id] : S.claimed[id], ready = !done && h >= n;
      const icon = id.includes("hug") ? "🤗" : id.includes("kiss") ? "💋" : id.includes("ad") ? "📺" : id.includes("spin") ? "🌸" : "📖";
      return `<div class="lg-m ${done ? "done" : ""}">${icon}<div class="lg-mt">${daily ? `<i>${t.daily}</i> ` : ""}${esc(t.m[id])}<div class="lg-bar"><i style="width:${Math.min(100, (h / n) * 100)}%"></i></div></div>
        ${done ? `<em>${t.done}</em>` : ready ? `<button type="button" class="lg-claim" data-m="${id}">${t.claim} 💗${rw}</button>` : `<em>${Math.min(h, n)}/${n} · 💗${rw}</em>`}</div>`;
    }).join("");
  }
  function wireMissions() {
    $("lg-root")?.querySelectorAll("[data-m]").forEach((b) => (b.onclick = () => {
      const m = MISSIONS.find((x) => x[0] === b.dataset.m); if (!m) return;
      const [id, goal, rw, daily] = m, [h, n] = goal();
      if (h < n || (daily ? S.day.claimed[id] : S.claimed[id])) return;
      (daily ? S.day.claimed : S.claimed)[id] = true; S.hearts += rw; save();
      toast(`${T().got}${rw}`); paint();
    }));
  }

  // ---------- reel ----------
  function cardTile(c, cls = "") { return `<div class="lg-c r-${c.r} ${cls}" style="background-image:url('${c.img}')"><i>${STARS[c.r]}</i></div>`; }
  function fillReel(result) {
    const reel = $("lg-reel"); if (!reel) return;
    const pick = () => CARDS[Math.floor(Math.random() * CARDS.length)];
    const items = [];
    for (let i = 0; i < 34; i++) items.push(pick());
    if (result) items[30] = result; else items[1] = CARDS.find((c) => c.r === "m") || items[1];
    reel.innerHTML = items.map((c, i) => cardTile(c, i === (result ? 30 : 1) ? "target" : "")).join("");
    const w = reel.firstElementChild?.offsetWidth || 110, gap = 10, wrap = reel.parentElement.clientWidth;
    const idx = result ? 30 : 1;
    const x = -(idx * (w + gap)) + (wrap / 2 - w / 2);
    if (!result) { reel.style.transition = "none"; reel.style.transform = `translateX(${x}px)`; reel.children[idx]?.classList.add("mid"); return Promise.resolve(); }
    reel.style.transition = "none"; reel.style.transform = `translateX(${wrap / 2 - w / 2}px)`;
    void reel.offsetWidth;
    return new Promise((res) => {
      reel.style.transition = "transform 3.2s cubic-bezier(.12,.75,.12,1)";
      reel.style.transform = `translateX(${x + (Math.random() * 30 - 15)}px)`;
      let tick = 0; const iv = setInterval(() => { try { tg?.HapticFeedback?.selectionChanged?.(); } catch {} if (++tick > 14) clearInterval(iv); }, 160);
      setTimeout(() => { clearInterval(iv); reel.children[idx]?.classList.add("mid"); res(); }, 3300);
    });
  }
  function roll() {
    const rates = RATES[pool];
    let r;
    if (S.pity + 1 >= PITY) r = "m";
    else {
      let x = Math.random() * 100;
      r = ["m", "e", "r", "c"].find((k) => (x -= rates[k]) < 0) || "r";
    }
    const list = CARDS.filter((c) => c.r === r);
    // prefer cards the player does not have yet (2 tries)
    let c = list[Math.floor(Math.random() * list.length)];
    if (S.owned[c.id]) c = list[Math.floor(Math.random() * list.length)];
    return c;
  }
  async function spin(how) {
    if (spinning) return;
    rollDay();
    const t = T();
    if (how === "free") {
      if (pool === "kiss") { toast(t.kissOnly); return; }
      if (S.day.free <= 0) { toast(t.noHearts); return; }
      S.day.free--;
    } else {
      if (S.hearts < COST[pool]) { toast(t.noHearts); return; }
      S.hearts -= COST[pool];
    }
    spinning = true;
    $("lg-root")?.querySelectorAll(".lg-btns button,.lg-ad").forEach((b) => (b.disabled = true));
    const c = roll();
    S.pity = c.r === "m" ? 0 : S.pity + 1;
    S.day.spins++;
    if (c.kind === "hug") S.day.hug = true;
    const isNew = !S.owned[c.id];
    S.owned[c.id] = (S.owned[c.id] || 0) + 1;
    if (!isNew) S.hearts += DUPE[c.r];
    save();
    const h = $("lg-hearts"); if (h) h.textContent = "💗 " + S.hearts;
    await fillReel(c);
    spinning = false;
    reveal(c, isNew);
  }

  // ---------- reveal / album ----------
  function reveal(c, isNew, fromAlbum) {
    const t = T();
    $("lg-pop")?.remove();
    const el = document.createElement("div");
    el.id = "lg-pop"; el.className = `lg-pop r-${c.r}`;
    el.innerHTML = `<div class="lg-burst"></div><div class="lg-big r-${c.r}">${c.vid ? `<video playsinline webkit-playsinline muted preload="auto" poster="${c.img}" src="${c.vid}"></video>` : `<img src="${c.img}" alt="">`}</div>
      <div class="lg-rar">${STARS[c.r]} ${RNAME[c.r]}</div><div class="lg-name">${esc(nameOf(c))}</div>
      ${fromAlbum ? "" : `<div class="lg-new">${isNew ? t.newC : t.dupe(DUPE[c.r])}</div>`}
      <div class="lg-pbtns">${c.vid ? `<button type="button" class="lg-ghost" data-x="play">${t.play}</button>` : ""}<button type="button" class="lg-gold" data-x="ok">${t.close}</button></div>`;
    document.body.appendChild(el);
    const v = el.querySelector("video");
    if (v) { el.querySelector('[data-x="play"]').onclick = () => { v.currentTime = 0; v.play().catch(() => {}); }; v.play().catch(() => {}); }
    el.querySelector('[data-x="ok"]').onclick = () => { el.remove(); if (!fromAlbum) paint(); };
    try { tg?.HapticFeedback?.notificationOccurred?.(c.r === "m" || c.r === "e" ? "success" : "warning"); } catch {}
  }
  function album() {
    const t = T();
    $("lg-pop")?.remove();
    const el = document.createElement("div");
    el.id = "lg-pop"; el.className = "lg-pop lg-album";
    el.innerHTML = `<h3>${t.album} · ${t.collected(Object.keys(S.owned).length, CARDS.length)}</h3><div class="lg-grid">${CARDS.map((c) => S.owned[c.id]
      ? `<button type="button" class="lg-c r-${c.r}" data-c="${c.id}" style="background-image:url('${c.img}')"><i>${STARS[c.r]}</i>${S.owned[c.id] > 1 ? `<b>×${S.owned[c.id]}</b>` : ""}</button>`
      : `<div class="lg-c lock r-${c.r}"><i>${STARS[c.r]}</i><span>🔒</span></div>`).join("")}</div><button type="button" class="lg-gold" data-x="ok">${t.close}</button>`;
    document.body.appendChild(el);
    el.querySelector('[data-x="ok"]').onclick = () => el.remove();
    el.querySelectorAll("[data-c]").forEach((b) => (b.onclick = () => reveal(CARDS.find((c) => c.id === b.dataset.c), false, true)));
  }
  function toast(msg) {
    const d = document.createElement("div"); d.className = "lg-toast"; d.textContent = msg;
    document.body.appendChild(d); setTimeout(() => d.remove(), 2200);
  }

  // ad reward → +3 spins (the backend limits how many ads a day)
  document.addEventListener("csl-ad-reward", (e) => {
    if (e.detail?.game !== "gacha" || e.detail.bonus === undefined) return;
    rollDay(); S.day.free += Number(e.detail.bonus) || AD_SPINS; S.day.ads++; save();
    toast(T().adOk); if ($("lg-root")) paint();
  });
  document.addEventListener("csl-lang", () => { if ($("lg-root")) paint(); });
  // preload the card art so the reel looks smooth
  setTimeout(() => CARDS.forEach((c) => { const i = new Image(); i.src = c.img; }), 2500);

  window.CSLGacha = { open, close, bannerHTML };
})();
