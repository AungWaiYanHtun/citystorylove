/* 🏝️ Island Clash — Phase 1: build your island (CoC style).
   Drag to pan, pinch / wheel to zoom. Build, upgrade, collect. Builders + timers run offline.
   Saves to localStorage + /api/save/island. Ads via CSLAds.reward("island"). */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const KEY = "csl_island_v1", A = "island-assets/";
  const tg = window.Telegram?.WebApp, API = window.VIDEOSPACE_CONFIG?.VIP_API_URL;
  const lang = () => { try { return localStorage.getItem("hub_lang") === "my" ? "my" : "en"; } catch { return "en"; } };
  const L = {
    en: { title: "Island Clash", sub: "Build your island · raid your rivals", play: "▶ Play", shop: "Build", attack: "Attack", gems: "Free gems", soon: "⚔️ Battles arrive in Phase 2!", lv: "Level", upg: "Upgrade", move: "Move", collect: "Collect", max: "Max level", needTH: (n) => `Needs Town Hall ${n}`, noB: "All builders are busy", noRes: (r) => `Not enough ${r}`, full: "Storage is full", ok: "✓", cancel: "✕", built: "Built!", fin: "Finish", ad15: "▶ Ad: −15 min", limit: "Limit reached — upgrade Town Hall", gemAd: "+5 💎 from ad", place: "Drag to place, then ✓", prod: "Production", cap: "Capacity", hr: "/h", gold: "gold", elixir: "elixir", gemsW: "gems", say: { boy: ["This island is ours! 🏝️", "Let's build something big.", "Collect the gold, boss!"], girl: ["Hi! Welcome home 💕", "Our island looks prettier every day!", "Let's upgrade the Town Hall?"], builder: ["On it, boss! 🔨", "Give me a job!", "Need more builders?"], fisher: ["Nice catch today 🐟", "The sea is calm.", "Shh… the fish are biting."] }, vip: "VIP: 2× faster builds + 1 extra builder",
      n: { townhall: "Town Hall", goldmine: "Gold Mine", elixir: "Elixir Collector", goldstore: "Gold Storage", elixstore: "Elixir Storage", cannon: "Cannon", archer: "Archer Tower", barracks: "Barracks", hut: "Builder's Hut" } },
    my: { title: "Island Clash", sub: "ကိုယ့်ကျွန်းတည်ဆောက် · ရန်သူကိုတိုက်", play: "▶ ဆော့မယ်", shop: "ဆောက်မယ်", attack: "တိုက်မယ်", gems: "Gem အလကား", soon: "⚔️ တိုက်ပွဲက အဆင့် ၂ မှာလာမယ်!", lv: "Level", upg: "Upgrade", move: "ရွှေ့", collect: "သိမ်း", max: "အမြင့်ဆုံး level", needTH: (n) => `Town Hall ${n} လိုတယ်`, noB: "ဆောက်သူတွေ အားလုံးအလုပ်များနေ", noRes: (r) => `${r} မလောက်ဘူး`, full: "သိုလှောင်ရုံ ပြည့်နေပြီ", ok: "✓", cancel: "✕", built: "ဆောက်ပြီး!", fin: "ပြီးစေ", ad15: "▶ Ad: −15 မိနစ်", limit: "အရေအတွက်ပြည့်ပြီ — Town Hall မြှင့်ပါ", gemAd: "Ad ကနေ +5 💎", place: "ဆွဲပြီးနေရာချ၊ ပြီးရင် ✓", prod: "ထုတ်လုပ်မှု", cap: "သိုလှောင်နိုင်မှု", hr: "/နာရီ", gold: "ရွှေ", elixir: "elixir", gemsW: "gem", say: { boy: ["ဒီကျွန်းက ငါတို့ပိုင်တယ် 🏝️", "ကြီးကြီးကျယ်ကျယ် ဆောက်ကြမယ်", "ရွှေသိမ်းလိုက်နော်"], girl: ["ဟိုင်း! ပြန်ရောက်ပြီလား 💕", "ကျွန်းလေးက နေ့တိုင်းပိုလှလာတယ်", "Town Hall မြှင့်ရအောင်?"], builder: ["လုပ်ပေးမယ် ဆရာ 🔨", "အလုပ်ပေးပါဦး!", "ဆောက်သူ ထပ်လိုသေးလား?"], fisher: ["ဒီနေ့ ငါးကောင်းကောင်းရတယ် 🐟", "ပင်လယ်က ငြိမ်နေတယ်", "တိုးတိုး… ငါးဟပ်နေပြီ"] }, vip: "VIP: ၂ဆ မြန်မြန်ဆောက် + ဆောက်သူ ၁ ယောက်ပို",
      n: { townhall: "Town Hall", goldmine: "ရွှေတွင်း", elixir: "Elixir စုစက်", goldstore: "ရွှေသိုလှောင်ရုံ", elixstore: "Elixir သိုလှောင်ရုံ", cannon: "အမြောက်", archer: "လေးသမားမျှော်စင်", barracks: "စစ်တန်းလျား", hut: "ဆောက်သူတဲ" } }
  };
  let t = L[lang()];

  // ---- building rules ----
  const M = 60, H = 3600;
  const D = {
    townhall: { s: 3, w: 1.12, max: 5, res: "gold", cost: [0, 0, 1000, 4000, 15000, 50000], time: [0, 0, 60, 10 * M, 2 * H, 6 * H], lim: [1, 1, 1, 1, 1] },
    goldmine: { s: 2, w: 1.1, max: 5, res: "elixir", cost: [0, 150, 300, 700, 1500, 3000], time: [0, 10, 60, 5 * M, 20 * M, H], prod: [0, 200, 400, 700, 1100, 1600], store: [0, 500, 1000, 2000, 4000, 6000], lim: [2, 3, 4, 5, 6], kind: "gold" },
    elixir: { s: 2, w: 1.1, max: 5, res: "gold", cost: [0, 150, 300, 700, 1500, 3000], time: [0, 10, 60, 5 * M, 20 * M, H], prod: [0, 200, 400, 700, 1100, 1600], store: [0, 500, 1000, 2000, 4000, 6000], lim: [2, 3, 4, 5, 6], kind: "elixir" },
    goldstore: { s: 2, w: 1.1, max: 5, res: "elixir", cost: [0, 300, 750, 1500, 3000, 6000], time: [0, 10, 2 * M, 10 * M, 40 * M, 2 * H], cap: [0, 1500, 3000, 6000, 12000, 25000], lim: [1, 1, 2, 2, 3], kind: "gold" },
    elixstore: { s: 2, w: 1.0, max: 5, res: "gold", cost: [0, 300, 750, 1500, 3000, 6000], time: [0, 10, 2 * M, 10 * M, 40 * M, 2 * H], cap: [0, 1500, 3000, 6000, 12000, 25000], lim: [1, 1, 2, 2, 3], kind: "elixir" },
    cannon: { s: 2, w: 1.05, max: 5, res: "gold", cost: [0, 250, 1000, 4000, 10000, 25000], time: [0, 15, 5 * M, 30 * M, 2 * H, 5 * H], lim: [1, 2, 2, 3, 4] },
    archer: { s: 2, w: 1.0, max: 5, res: "gold", cost: [0, 1000, 2000, 5000, 12000, 30000], time: [0, 30, 10 * M, 45 * M, 3 * H, 6 * H], lim: [0, 1, 2, 2, 3] },
    barracks: { s: 2, w: 1.1, max: 5, res: "elixir", cost: [0, 200, 1000, 3000, 8000, 20000], time: [0, 20, 5 * M, 30 * M, 2 * H, 4 * H], lim: [1, 1, 2, 2, 3] },
    hut: { s: 2, w: 1.0, max: 1, res: "gems", cost: [0, 0], time: [0, 0], lim: [3, 3, 3, 3, 3], gemCost: [0, 0, 250, 500] }
  };
  const ORDER = ["goldmine", "elixir", "goldstore", "elixstore", "cannon", "archer", "barracks", "hut"];
  const ICON = { gold: "🪙", elixir: "🟣", gems: "💎" };

  // ---- iso grid (world 1600×1600, ground image) ----
  const N = 11, TW = 80, TH2 = 40, OX = 789, OY = 781 - (N * TH2) / 2;
  const P = (gx, gy) => ({ x: OX + (gx - gy) * (TW / 2), y: OY + (gx + gy) * (TH2 / 2) });

  // ---- state ----
  let S = load(), VIP = false, ui = null, place = null, saveT = 0, loop = 0;
  function fresh() {
    return { v: 1, ts: Date.now(), gold: 500, elixir: 500, gems: 50, nid: 5,
      b: [{ id: 1, t: "townhall", lv: 1, x: 4, y: 4 }, { id: 2, t: "hut", lv: 1, x: 8, y: 1 }, { id: 3, t: "goldmine", lv: 1, x: 1, y: 7, last: Date.now() }, { id: 4, t: "elixir", lv: 1, x: 8, y: 7, last: Date.now() }] };
  }
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); return s && s.v ? s : fresh(); } catch { return fresh(); } }
  const ser = () => JSON.stringify(S, (k, v) => (k === "_el" ? undefined : v));
  function save() { S.ts = Date.now(); try { localStorage.setItem(KEY, ser()); } catch {} clearTimeout(saveT); saveT = setTimeout(push, 2000); }
  const hdr = () => ({ "Content-Type": "application/json", "X-Telegram-Init-Data": tg.initData });
  async function push() { if (!API || !tg?.initData) return; try { await fetch(API + "/api/save/island", { method: "POST", headers: hdr(), body: `{"data":${ser()}}` }); } catch {} }
  async function pull() {
    if (!API || !tg?.initData) return;
    try { const j = await (await fetch(API + "/api/save/island", { headers: hdr() })).json();
      if (j?.data?.v && Number(j.data.ts || 0) > Number(S.ts || 0)) { S = j.data; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} if (ui) drawAll(); } } catch {}
  }
  async function checkVip() { if (!API || !tg?.initData) return; try { const j = await (await fetch(API + "/api/vip-status", { headers: hdr() })).json(); VIP = !!j.active; } catch {} hud(); }

  const th = () => S.b.find((b) => b.t === "townhall")?.lv || 1;
  const count = (type) => S.b.filter((b) => b.t === type).length;
  const builders = () => count("hut") + (VIP ? 1 : 0);
  const busyN = () => S.b.filter((b) => b.busy).length;
  function cap(kind) { let c = 1000 * th(); S.b.forEach((b) => { const d = D[b.t]; if (d.cap && d.kind === kind && !(b.busy && b.lv === 0)) c += d.cap[b.lv]; }); return c; }
  function stored(b) { const d = D[b.t]; if (!d.prod || !b.lv || b.busy) return 0; return Math.min(d.store[b.lv], Math.floor(((Date.now() - (b.last || Date.now())) / 3600000) * d.prod[b.lv])); }
  const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e4 ? Math.round(n / 1e3) + "K" : String(Math.floor(n)));
  const ftime = (s) => { s = Math.max(0, Math.ceil(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}h ${m}m` : m ? `${m}m ${x}s` : `${x}s`; };
  function toast(msg) { const el = $("toast"); if (!el) return; el.textContent = msg; el.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("show"), 2400); }

  // ---- finish timers ----
  function tick() {
    let ch = false;
    S.b.forEach((b) => { if (b.busy && Date.now() >= b.busy.until) { const prod = D[b.t].prod; if (prod && b.lv) collect(b, true); b.lv = b.busy.to; b.busy = null; if (prod) b.last = Date.now(); ch = true; if (ui) { fx(b, "⭐ " + t.built); draw(b); } } });
    if (ch) save();
    if (!ui) return;
    S.b.forEach((b) => { const el = b._el; if (!el) return;
      if (b.busy) { const tot = b.busy.until - b.busy.start, left = (b.busy.until - Date.now()) / 1000; el.querySelector(".is-bar i").style.width = Math.min(100, 100 - (left * 1000 / tot) * 100) + "%"; el.querySelector(".is-time").textContent = ftime(left); }
      const d = D[b.t]; if (d.prod) el.classList.toggle("ready", stored(b) >= Math.max(20, d.store[b.lv] * 0.08)); });
    hud(); if (ui.info) info(ui.info, true);
  }

  // ---- UI ----
  function open() {
    if (ui) return;
    t = L[lang()];
    const root = document.createElement("div"); root.id = "is-root";
    root.innerHTML = `<div id="is-view"><div id="is-world"><img class="is-ground" src="${A}ground.webp" alt="" draggable="false"><canvas id="is-grid" width="1600" height="1600"></canvas><div id="is-ents"></div></div><div class="is-cloud c1"></div><div class="is-cloud c2"></div><div class="is-cloud c3"></div></div>
      <div class="is-top"><button class="is-x" id="is-back">‹</button><div class="is-res"><div class="is-r" id="is-g"><span>🪙</span><b></b><i><u></u></i></div><div class="is-r el" id="is-e"><span>🟣</span><b></b><i><u></u></i></div></div><div class="is-right"><div class="is-gem" id="is-gm">💎 <b></b></div><div class="is-bld" id="is-bl">👷 <b></b></div></div></div>
      <div class="is-bottom"><button id="is-atk" class="is-btn red">⚔️<small>${t.attack}</small></button><button id="is-ad" class="is-btn blue">🎁<small>${t.gems}</small></button><button id="is-shop" class="is-btn gold big">🔨<small>${t.shop}</small></button></div>
      <div id="is-panel" class="is-panel hidden"></div><div id="is-pl" class="is-pl hidden"><span>${t.place}</span><button id="is-no" class="is-pb no">✕</button><button id="is-yes" class="is-pb yes">✓</button></div>`;
    document.body.appendChild(root); document.body.classList.add("is-open");
    ui = { root, view: $("is-view"), world: $("is-world"), ents: $("is-ents"), sc: 0.6, tx: 0, ty: 0, info: null };
    grid(); fit(); drawAll(); hud(); wire(); spawnPeople();
    $("is-back").onclick = close;
    $("is-shop").onclick = shop;
    $("is-atk").onclick = () => toast(t.soon);
    $("is-ad").onclick = async () => { const ok = await window.CSLAds?.reward?.("island", lang()); if (ok) { S.gems += 5; save(); hud(); toast(t.gemAd); } };
    $("is-no").onclick = () => endPlace(false); $("is-yes").onclick = () => endPlace(true);
    loop = setInterval(tick, 1000); tick(); pull(); checkVip();
    try { tg?.disableVerticalSwipes?.(); } catch {}
  }
  function close() { clearInterval(loop); cancelAnimationFrame(raf); ppl = []; place = null; ui?.root.remove(); ui = null; document.body.classList.remove("is-open"); save(); try { tg?.enableVerticalSwipes?.(); } catch {} }

  function grid() {
    const c = $("is-grid").getContext("2d"); c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 1.5;
    for (let i = 0; i <= N; i++) { let a = P(i, 0), b = P(i, N); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); a = P(0, i); b = P(N, i); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
  }
  function fit() {
    const vw = ui.view.clientWidth, vh = ui.view.clientHeight;
    // Ground artwork is square. Fit to the shorter viewport edge so the
    // complete island remains visible on portrait phones (no zoom crop).
    ui.min = Math.min(vw, vh) / 1600;
    ui.sc = ui.min;
    const worldSize = 1600 * ui.sc;
    ui.tx = (vw - worldSize) / 2;
    ui.ty = (vh - worldSize) / 2;
    apply();
  }
  function apply() {
    const vw = ui.view.clientWidth, vh = ui.view.clientHeight, W = 1600 * ui.sc;
    // Center a smaller world; clamp a zoomed-in world to its edges.
    ui.tx = W <= vw ? Math.max(0, Math.min(vw - W, ui.tx)) : Math.min(0, Math.max(vw - W, ui.tx));
    ui.ty = W <= vh ? Math.max(0, Math.min(vh - W, ui.ty)) : Math.min(0, Math.max(vh - W, ui.ty));
    ui.world.style.transform = `translate(${ui.tx}px,${ui.ty}px) scale(${ui.sc})`;
  }
  function zoomAt(f, cx, cy) { const ns = Math.max(ui.min, Math.min(1.6, ui.sc * f)); const k = ns / ui.sc; ui.tx = cx - (cx - ui.tx) * k; ui.ty = cy - (cy - ui.ty) * k; ui.sc = ns; apply(); }
  const toWorld = (cx, cy) => ({ x: (cx - ui.tx) / ui.sc, y: (cy - ui.ty) / ui.sc });
  function toGrid(wx, wy, s) { const a = (wx - OX) / (TW / 2), b = (wy - OY) / (TH2 / 2); return { x: Math.round((a + b) / 2 - s / 2), y: Math.round((b - a) / 2 - s / 2) }; }

  function wire() {
    const v = ui.view, pts = new Map(); let st = null, pinch = null, drag = null;
    v.addEventListener("pointerdown", (e) => {
      v.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) {
        st = { x: e.clientX, y: e.clientY, tx: ui.tx, ty: ui.ty, time: Date.now(), moved: false, target: e.target };
        const be = e.target.closest?.(".is-b"); drag = place && be && be === place.b._el ? { ox: place.b.x, oy: place.b.y } : null;
      } else if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), sc: ui.sc }; drag = null; }
    });
    v.addEventListener("pointermove", (e) => {
      if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pts.size >= 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); zoomAt((pinch.sc * d / pinch.d) / ui.sc, (a.x + b.x) / 2, (a.y + b.y) / 2); return; }
      if (!st) return; const dx = e.clientX - st.x, dy = e.clientY - st.y; if (Math.abs(dx) + Math.abs(dy) > 8) st.moved = true;
      if (drag) { const w = toWorld(e.clientX, e.clientY - 30), g = toGrid(w.x, w.y, D[place.b.t].s); if (g.x !== place.b.x || g.y !== place.b.y) { place.b.x = g.x; place.b.y = g.y; draw(place.b); } return; }
      ui.tx = st.tx + dx; ui.ty = st.ty + dy; apply();
    });
    const up = (e) => {
      pts.delete(e.pointerId); if (pts.size < 2) pinch = null;
      if (st && pts.size === 0) { if (!st.moved && Date.now() - st.time < 500) tap(st.target); st = null; drag = null; }
    };
    v.addEventListener("pointerup", up); v.addEventListener("pointercancel", up);
    v.addEventListener("wheel", (e) => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.12 : 0.9, e.clientX, e.clientY); }, { passive: false });
    window.addEventListener("resize", () => ui && fit());
  }
  function tap(target) {
    if (place) return; const pe = target.closest?.(".is-p"); if (pe) { tapPerson(pe); return; }
    const be = target.closest?.(".is-b");
    if (!be) { hidePanel(); return; }
    const b = S.b.find((x) => x.id === +be.dataset.id); if (!b) return;
    if (D[b.t].prod && stored(b) > 0 && be.classList.contains("ready")) { collect(b); return; }
    info(b);
  }

  // ---- entities ----
  function drawAll() { ui.ents.innerHTML = ""; S.b.forEach((b) => { b._el = null; draw(b); }); }
  function draw(b) {
    const d = D[b.t], s = d.s;
    let el = b._el;
    if (!el) { el = document.createElement("div"); el.className = "is-b"; el.dataset.id = b.id; el.innerHTML = `<div class="is-foot"></div><img src="${A}${b.t}.webp" alt="" draggable="false"><span class="is-lv"></span><span class="is-bub"></span><div class="is-cons"><div class="is-bar"><i></i></div><span class="is-time"></span><em>🔨</em></div>`; ui.ents.appendChild(el); b._el = el; }
    const top = P(b.x, b.y), bot = P(b.x + s, b.y + s), W = s * TW;
    el.style.left = (bot.x - W / 2) + "px"; el.style.top = top.y + "px"; el.style.width = W + "px"; el.style.height = (bot.y - top.y) + "px";
    // Sort buildings and people by their ground-contact (bottom) screen Y.
    // This lets a resident correctly pass behind a building instead of always
    // being drawn over its roof/walls.
    el.style.zIndex = 10 + Math.floor(bot.y);
    const img = el.querySelector("img"); img.style.width = W * d.w + "px";
    el.querySelector(".is-lv").textContent = b.lv || "";
    el.querySelector(".is-bub").textContent = d.kind === "gold" ? "🪙" : "🟣";
    el.classList.toggle("busy", !!b.busy); el.classList.toggle("new", b.lv === 0);
    el.classList.toggle("placing", !!(place && place.b === b)); el.classList.toggle("bad", !!(place && place.b === b && !free(b)));
  }
  function free(b, gap) {
    const s = D[b.t].s, g = gap ? 1 : 0; if (b.x < 0 || b.y < 0 || b.x + s > N || b.y + s > N) return false;
    return !S.b.some((o) => o !== b && o.x - g < b.x + s && b.x < o.x + D[o.t].s + g && o.y - g < b.y + s && b.y < o.y + D[o.t].s + g);
  }
  function spot(type) {
    const s = D[type].s, tmp = { t: type, x: 0, y: 0 };
    const c = []; for (let gy = 0; gy <= N - s; gy++) for (let gx = 0; gx <= N - s; gx++) c.push([gx, gy, Math.hypot(gx + s / 2 - 5.5, gy + s / 2 - 6.5)]);
    c.sort((a, b) => a[2] - b[2]);
    for (const gap of [true, false]) for (const [gx, gy] of c) { tmp.x = gx; tmp.y = gy; if (free(tmp, gap)) return { x: gx, y: gy }; }
    return null;
  }
  function fx(b, text, cls) {
    if (!b._el) return; const f = document.createElement("div"); f.className = "is-fx " + (cls || ""); f.textContent = text;
    const top = P(b.x + D[b.t].s / 2, b.y + D[b.t].s / 2); f.style.left = top.x + "px"; f.style.top = (top.y - 110) + "px"; f.style.zIndex = 9999;
    ui.ents.appendChild(f); setTimeout(() => f.remove(), 1400);
  }

  // ---- actions ----
  function collect(b, silent) {
    const d = D[b.t], n = stored(b), room = cap(d.kind) - S[d.kind]; if (n <= 0) return;
    if (room <= 0) { if (!silent) toast(t.full); return; }
    const got = Math.min(n, room); S[d.kind] += got; b.last = Date.now() - (n - got > 0 ? ((n - got) / d.prod[b.lv]) * 3600000 : 0);
    if (!silent && ui) { fx(b, `+${fmt(got)} ${ICON[d.kind]}`, d.kind); try { tg?.HapticFeedback?.impactOccurred?.("light"); } catch {} }
    save(); hud();
  }
  function pay(res, amt) {
    if (S[res] < amt) { toast(t.noRes(res === "gems" ? t.gemsW : t[res])); return false; }
    S[res] -= amt; return true;
  }
  function start(b, to) {
    const d = D[b.t], dur = d.time[to] * (VIP ? 0.5 : 1) * 1000;
    if (dur <= 0) { b.lv = to; return; }
    b.busy = { to, start: Date.now(), until: Date.now() + dur };
  }
  function upgrade(b) {
    const d = D[b.t], to = b.lv + 1;
    if (b.busy || to > d.max) return;
    if (b.t !== "townhall" && to > th()) { toast(t.needTH(to)); return; }
    if (busyN() >= builders()) { toast(t.noB); return; }
    if (!pay(d.res, d.cost[to])) return;
    if (d.prod) collect(b, true);
    start(b, to); save(); draw(b); hud(); info(b, true); fx(b, "🔨");
  }
  function finish(b) {
    const mins = Math.ceil((b.busy.until - Date.now()) / 60000), g = Math.max(1, Math.ceil(mins / 2));
    if (!pay("gems", g)) return; b.busy.until = Date.now(); tick();
  }
  async function adSkip(b) { const ok = await window.CSLAds?.reward?.("island", lang()); if (ok && b.busy) { b.busy.until -= 15 * 60000; save(); tick(); } }

  // ---- panels ----
  function hidePanel() { $("is-panel")?.classList.add("hidden"); if (ui) ui.info = null; }
  function info(b, refresh) {
    if (refresh && ui.info !== b) return;
    ui.info = b; const d = D[b.t], p = $("is-panel"), to = b.lv + 1;
    let rows = "";
    if (d.prod && b.lv) rows += `<p>${t.prod}: <b>${d.prod[b.lv]}${ICON[d.kind]}${t.hr}</b> · ${t.cap}: <b>${d.store[b.lv]}</b></p>`;
    if (d.cap && b.lv) rows += `<p>${t.cap}: <b>${fmt(d.cap[b.lv])} ${ICON[d.kind]}</b></p>`;
    let act = "";
    if (b.busy) { const left = (b.busy.until - Date.now()) / 1000, g = Math.max(1, Math.ceil(left / 120)); act = `<p class="is-tm">⏳ ${ftime(left)}</p><button class="is-pbt gem" data-a="fin">${t.fin} · ${g}💎</button><button class="is-pbt blue" data-a="ad">${t.ad15}</button>`; }
    else if (to > d.max) act = `<p class="is-tm">${t.max}</p>`;
    else act = `<button class="is-pbt gold" data-a="up">${t.upg} → ${t.lv} ${to} · ${fmt(d.cost[to])} ${ICON[d.res]} · ⏱ ${ftime(d.time[to] * (VIP ? 0.5 : 1))}</button>`;
    if (d.prod && stored(b) > 0 && !b.busy) act += `<button class="is-pbt green" data-a="col">${t.collect} +${fmt(stored(b))} ${ICON[d.kind]}</button>`;
    act += `<button class="is-pbt dark" data-a="mv">✥ ${t.move}</button>`;
    p.innerHTML = `<div class="is-ph"><img src="${A}${b.t}.webp" alt=""><div><b>${t.n[b.t]}</b><small>${t.lv} ${b.lv}${b.busy ? " → " + b.busy.to : ""}</small>${rows}</div><button class="is-pc">✕</button></div><div class="is-acts">${act}</div>`;
    p.classList.remove("hidden");
    p.querySelector(".is-pc").onclick = hidePanel;
    p.querySelectorAll("[data-a]").forEach((x) => (x.onclick = () => { const a = x.dataset.a; if (a === "up") upgrade(b); if (a === "fin") finish(b); if (a === "ad") adSkip(b); if (a === "col") { collect(b); info(b, true); } if (a === "mv") startPlace(b, false); }));
  }
  function shop() {
    hidePanel(); if (place) return;
    const p = $("is-panel"), T = th();
    const items = ORDER.map((k) => {
      const d = D[k], lim = d.lim[T - 1], c = count(k), can = c < lim;
      const cost = k === "hut" ? (d.gemCost[c + 1] ?? 0) : d.cost[1], res = k === "hut" ? "gems" : d.res;
      return `<button class="is-si ${can ? "" : "off"}" data-k="${k}"><img src="${A}${k}.webp" alt=""><b>${t.n[k]}</b><small>${c}/${lim}</small><span>${can ? fmt(cost) + " " + ICON[res] : "🔒"}</span></button>`;
    }).join("");
    p.innerHTML = `<div class="is-ph"><div><b>🔨 ${t.shop}</b><small>${t.vip}</small></div><button class="is-pc">✕</button></div><div class="is-shop">${items}</div>`;
    p.classList.remove("hidden"); p.querySelector(".is-pc").onclick = hidePanel;
    p.querySelectorAll(".is-si").forEach((x) => (x.onclick = () => {
      const k = x.dataset.k, d = D[k], c = count(k);
      if (c >= d.lim[T - 1]) { toast(t.limit); return; }
      if (k !== "hut" && busyN() >= builders()) { toast(t.noB); return; }
      const res = k === "hut" ? "gems" : d.res, cost = k === "hut" ? d.gemCost[c + 1] : d.cost[1];
      if (S[res] < cost) { toast(t.noRes(res === "gems" ? t.gemsW : t[res])); return; }
      const sp = spot(k); if (!sp) { toast("No space"); return; }
      const b = { id: S.nid++, t: k, lv: 0, x: sp.x, y: sp.y }; hidePanel(); startPlace(b, true, res, cost);
    }));
  }
  function startPlace(b, isNew, res, cost) {
    hidePanel(); place = { b, isNew, res, cost, ox: b.x, oy: b.y };
    if (isNew) { if (b.t === "hut") b.lv = 1; S.b.push(b); }
    ui.root.classList.add("placing"); $("is-pl").classList.remove("hidden"); draw(b);
    const c = P(b.x + 1, b.y + 1); const vw = ui.view.clientWidth, vh = ui.view.clientHeight; ui.tx = vw / 2 - c.x * ui.sc; ui.ty = vh / 2 - c.y * ui.sc; apply();
  }
  function endPlace(ok) {
    const pl = place; if (!pl) return; const b = pl.b;
    if (ok && !free(b)) { toast("❌"); return; }
    place = null; ui.root.classList.remove("placing"); $("is-pl").classList.add("hidden");
    if (!ok) { if (pl.isNew) { S.b = S.b.filter((x) => x !== b); b._el?.remove(); } else { b.x = pl.ox; b.y = pl.oy; draw(b); } return; }
    if (pl.isNew) {
      if (!pay(pl.res, pl.cost)) { S.b = S.b.filter((x) => x !== b); b._el?.remove(); return; }
      if (b.t !== "hut") start(b, 1);
      if (D[b.t].prod) b.last = Date.now();
      fx(b, b.busy ? "🔨" : "⭐");
    }
    draw(b); save(); hud();
  }

  function hud() {
    if (!ui) return;
    const g = $("is-g"), e = $("is-e"), cg = cap("gold"), ce = cap("elixir");
    g.querySelector("b").textContent = fmt(S.gold); g.querySelector("u").style.width = Math.min(100, (S.gold / cg) * 100) + "%";
    e.querySelector("b").textContent = fmt(S.elixir); e.querySelector("u").style.width = Math.min(100, (S.elixir / ce) * 100) + "%";
    $("is-gm").querySelector("b").textContent = S.gems;
    $("is-bl").querySelector("b").textContent = `${builders() - busyN()}/${builders()}`;
  }


  // ---- island residents: walk only on the visible grass, sandy road and dock ----
  // Coordinates are in the 1600x1600 ground.webp world. The polygon follows the
  // open lawn; the narrow road corridor and dock apron are added separately.
  // Character height is deliberately smaller than the previous oversized pass.
  // Values are world pixels and scale with the island camera.
  const PPL = [
    { k: "boy", h: 190 },
    { k: "girl", h: 182 },
    { k: "builder", h: 184 },
    { k: "fisher", h: 184 }
  ];
  const ROAD = [{ x: 905, y: 744 }, { x: 1120, y: 900 }, { x: 930, y: 1040 }, { x: 780, y: 1150 }, { x: 665, y: 1245 }];
  const BEACH = [{ x: 590, y: 1240 }, { x: 710, y: 1270 }, { x: 780, y: 1240 }];
  const DOCK = { x: 665, y: 1245 };
  // Fixed natural obstacles visible on the original island artwork (world pixels).
  // These cover the campfire/logs and exposed stones inside the lawn; the outer
  // tree line remains excluded by the walkable-land polygon.
  const NATURAL_BLOCKERS = [
    {x:405,y:610,rx:38,ry:34}, {x:485,y:560,rx:42,ry:27},
    {x:755,y:455,rx:20,ry:18}, {x:895,y:465,rx:34,ry:24},
    {x:1010,y:475,rx:42,ry:30}, {x:1080,y:520,rx:22,ry:18},
    {x:1145,y:640,rx:26,ry:26}, {x:1160,y:790,rx:34,ry:30},
    {x:930,y:1000,rx:35,ry:25}, {x:720,y:1050,rx:24,ry:18}
  ];
  const SPEED = 76;
  const LAWN = [
    {x:350,y:610},{x:410,y:500},{x:540,y:405},{x:690,y:350},{x:850,y:345},
    {x:1010,y:405},{x:1140,y:520},{x:1200,y:650},{x:1160,y:790},
    {x:1050,y:900},{x:930,y:1000},{x:790,y:1055},{x:630,y:1035},
    {x:490,y:960},{x:390,y:835},{x:335,y:710}
  ];
  const SAND = [{x:520,y:1170},{x:590,y:1155},{x:690,y:1175},{x:780,y:1195},{x:835,y:1260},{x:770,y:1320},{x:640,y:1320},{x:535,y:1270}];
  const WALK_NODES = [
    {x:520,y:570},{x:650,y:500},{x:790,y:470},{x:940,y:500},{x:1060,y:590},
    {x:1080,y:730},{x:990,y:850},{x:850,y:930},{x:700,y:930},{x:540,y:850},
    {x:470,y:720},{x:650,y:700},{x:810,y:650},{x:960,y:700},{x:820,y:810},
    {x:700,y:800},{x:905,y:744},{x:1120,y:900},{x:930,y:1040},{x:780,y:1150},
    {x:665,y:1245},{x:590,y:1240},{x:710,y:1270},{x:820,y:1240}
  ];
  let ppl = [], raf = 0, lastT = 0;
  const gridF = (wx, wy) => { const a = (wx - OX) / (TW / 2), b = (wy - OY) / (TH2 / 2); return { x: (a + b) / 2, y: (b - a) / 2 }; };
  const insidePoly = (x, y, poly) => {
    let inside = false;
    for (let i=0,j=poly.length-1;i<poly.length;j=i++) {
      const a=poly[i], b=poly[j];
      if (((a.y>y)!==(b.y>y)) && x < (b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x) inside=!inside;
    }
    return inside;
  };
  const segDist = (p,a,b) => { const dx=b.x-a.x,dy=b.y-a.y, l=dx*dx+dy*dy; const u=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0; return Math.hypot(p.x-a.x-u*dx,p.y-a.y-u*dy); };
  const nearLine = (pt, line, width) => line.slice(1).some((q,i)=>segDist(pt,line[i],q)<=width);
  function walkable(x,y) {
    const pt={x,y};
    const land=insidePoly(x,y,LAWN) || insidePoly(x,y,SAND) || nearLine(pt,ROAD,31);
    if (!land) return false;
    if (NATURAL_BLOCKERS.some(o => ((x-o.x)*(x-o.x))/(o.rx*o.rx)+((y-o.y)*(y-o.y))/(o.ry*o.ry) < 1)) return false;
    const g=gridF(x,y);
    if (S.b.some(b=>g.x>b.x-0.12 && g.x<b.x+D[b.t].s+0.12 && g.y>b.y-0.12 && g.y<b.y+D[b.t].s+0.12)) return false;
    return true;
  }
  function segmentWalkable(a,b) {
    const d=Math.hypot(b.x-a.x,b.y-a.y), steps=Math.max(2,Math.ceil(d/8));
    for(let i=1;i<steps;i++){const f=i/steps;if(!walkable(a.x+(b.x-a.x)*f,a.y+(b.y-a.y)*f))return false;}
    return true;
  }
  const LAWN_NODES = WALK_NODES.slice(0, 16).filter(point => walkable(point.x, point.y));
  const CELL=32, WMIN=320, WMAX=1232, YMIN=320, YMAX=1344;
  const keyOf=(ix,iy)=>ix+','+iy;
  const worldOf=(ix,iy)=>({x:WMIN+ix*CELL+CELL/2,y:YMIN+iy*CELL+CELL/2});
  function nearestCell(pt) {
    let best=null,bd=Infinity;
    const cx=Math.round((pt.x-WMIN-CELL/2)/CELL), cy=Math.round((pt.y-YMIN-CELL/2)/CELL);
    for(let r=0;r<=9 && !best;r++) for(let y=cy-r;y<=cy+r;y++) for(let x=cx-r;x<=cx+r;x++) {
      if(x<0||y<0||x>=(WMAX-WMIN)/CELL||y>=(YMAX-YMIN)/CELL) continue;
      const q=worldOf(x,y); if(!walkable(q.x,q.y) || !segmentWalkable(pt,q)) continue;
      const d=(q.x-pt.x)**2+(q.y-pt.y)**2; if(d<bd){bd=d;best={x,y};}
    }
    return best;
  }
  function findPath(from,to) {
    const a=nearestCell(from), b=nearestCell(to); if(!a||!b) return [];
    const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    const open=[{...a,g:0,f:Math.hypot(a.x-b.x,a.y-b.y)}], came=new Map(), costs=new Map([[keyOf(a.x,a.y),0]]), closed=new Set();
    let found=false, loops=0;
    while(open.length && loops++<5000) {
      open.sort((u,v)=>u.f-v.f); const cur=open.shift(), ck=keyOf(cur.x,cur.y);
      if(closed.has(ck)) continue; closed.add(ck);
      if(cur.x===b.x&&cur.y===b.y){found=true;break;}
      for(const [dx,dy] of dirs){
        const nx=cur.x+dx,ny=cur.y+dy, nk=keyOf(nx,ny);
        if(nx<0||ny<0||nx>=(WMAX-WMIN)/CELL||ny>=(YMAX-YMIN)/CELL||closed.has(nk)) continue;
        const from=worldOf(cur.x,cur.y),q=worldOf(nx,ny); if(!walkable(q.x,q.y)||!segmentWalkable(from,q)) continue;
        if(dx&&dy){const q1=worldOf(cur.x+dx,cur.y),q2=worldOf(cur.x,cur.y+dy);if(!walkable(q1.x,q1.y)||!walkable(q2.x,q2.y))continue;}
        const terrain=nearLine(q,ROAD,34)?0.82:1; const ng=cur.g+(dx&&dy?1.414:1)*terrain; if(ng>=(costs.get(nk)??Infinity))continue;
        costs.set(nk,ng);came.set(nk,ck);open.push({x:nx,y:ny,g:ng,f:ng+Math.hypot(nx-b.x,ny-b.y)});
      }
    }
    if(!found) return [];
    const cells=[];let k=keyOf(b.x,b.y);cells.push(b);
    while(k!==keyOf(a.x,a.y)){k=came.get(k);if(!k)return [];const [x,y]=k.split(',').map(Number);cells.push({x,y});}
    cells.reverse();
    // String-pull the grid route only across segments that pass the same
    // dense walkability test used by movement. This removes tiny zig-zags
    // without allowing shortcuts through obstacles or outside walkable land.
    const raw = cells.map(c=>worldOf(c.x,c.y));
    if (raw.length <= 2) return raw;
    const smooth = [raw[0]];
    let anchor = 0;
    while (anchor < raw.length - 1) {
      let next = anchor + 1;
      for (let j = raw.length - 1; j > anchor + 1; j--) {
        if (segmentWalkable(raw[anchor], raw[j])) { next = j; break; }
      }
      smooth.push(raw[next]);
      anchor = next;
    }
    return smooth;
  }
  function randomLawnPoint(forPerson) {
    // Choose a clear point with enough room around other residents. This avoids
    // sending two people to the same tiny patch of grass or spawning them on top
    // of one another.
    for (let i = 0; i < 180; i++) {
      const q = LAWN_NODES[Math.floor(Math.random() * LAWN_NODES.length)];
      const point = { x: q.x + (Math.random() - .5) * 52, y: q.y + (Math.random() - .5) * 52 };
      if (!walkable(point.x, point.y)) continue;
      const crowded = ppl.some(other => other !== forPerson && Math.hypot(other.x - point.x, other.y - point.y) < 132);
      if (!crowded) return point;
    }
    // A deterministic fallback still stays inside the central lawn.
    const fallbacks = [{x:790,y:700},{x:650,y:850},{x:990,y:700},{x:700,y:520}];
    return fallbacks.find(point => walkable(point.x, point.y) && !ppl.some(other => other !== forPerson && Math.hypot(other.x-point.x,other.y-point.y)<110)) || {x:790,y:700};
  }
  function spawnPeople() {
    ppl.forEach(p=>p.el.remove()); ppl=[];
    PPL.forEach((d,i)=>{
      const el=document.createElement('div');el.className='is-p';el.dataset.k=d.k;
      const src=`${A}characters/${d.k}_front_0.png`;
      el.innerHTML=`<div class="is-fig" style="height:${d.h}px">
        <img class="is-sprite" src="${src}" alt="" draggable="false">
      </div><span class="is-say"></span>`;
      el.style.setProperty('--person-height', `${d.h}px`);
      ui.ents.appendChild(el);
      const pos = i === 3 ? { x: 665, y: 1245 } : randomLawnPoint();
      ppl.push({ id: i, k:d.k, el, x:pos.x, y:pos.y, route:[], wait:.2+Math.random()*.6, act:i===3?'fish':'idle', dir:'front', frame:0, animDistance:0 });
    });
    lastT=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(step);
  }
  function setRoute(p, target, act) {
    let destination = target;
    // Avoid selecting another resident's exact standing spot as a destination.
    if (ppl.some(other => other !== p && Math.hypot(other.x - destination.x, other.y - destination.y) < 112)) {
      destination = randomLawnPoint(p);
    }
    const path = findPath({ x:p.x, y:p.y }, destination);
    p.route = path;
    p.act = act || 'idle';
  }
  function plan(p) {
    const job=p.k==='builder'?S.b.find(b=>b.busy):null;
    if(job){
      const s=D[job.t].s, target=P(job.x+s+.4,job.y+s+.4), safe=walkable(target.x,target.y)?target:randomLawnPoint(p);
      setRoute(p,safe,'work');p.job=job.id;return;
    }
    if(p.k==='fisher' && (p.act!=='fish' || Math.random()<.25)) { setRoute(p,DOCK,'fish');return; }
    if(p.act==='fish' && Math.random()<.55){setRoute(p,randomLawnPoint(p),'idle');return;}
    const target=Math.random()<.22?BEACH[Math.floor(Math.random()*BEACH.length)]:randomLawnPoint(p);
    setRoute(p,target,'idle');
  }
  function setFacing(p, dx, dy, walking, distanceMoved) {
    // Direction is derived from the actual screen-space travel vector.
    // Never mirror a sprite: use the matching authored left/right artwork.
    if (walking && (Math.abs(dx) + Math.abs(dy) > 0.001)) {
      if (Math.abs(dx) > Math.abs(dy) * 1.12) p.dir = dx < 0 ? 'left' : 'right';
      else p.dir = dy < 0 ? 'back' : 'front';
      p.animDistance = (p.animDistance || 0) + distanceMoved;
    } else {
      p.animDistance = 0;
    }
    // The two supplied PNG poses alternate after a fixed travel distance,
    // so animation cadence follows walking speed rather than device FPS.
    const frame = walking ? (Math.floor(p.animDistance / 18) % 2) : 0;
    if (p.frame !== frame || p._renderedDir !== p.dir) {
      const src = `${A}characters/${p.k}_${p.dir}_${frame}.png`;
      const img = p.el.querySelector('.is-sprite');
      if (img) img.src = src;
      p.frame = frame;
      p._renderedDir = p.dir;
    }
  }
  function step(now) {
    if(!ui)return;
    const dt=Math.min(.08,(now-lastT)/1000);lastT=now;
    ppl.forEach(p=>{
      let walking=false, moveX=0, moveY=0;
      if(p.route.length){
        const q=p.route[0],dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy),mv=SPEED*dt;
        if(d<=mv){p.x=q.x;p.y=q.y;p.route.shift();if(!p.route.length)p.wait=p.act==='fish'?3.5:.25+Math.random()*.55;}
        else{moveX=dx/d;moveY=dy/d;p.x+=moveX*mv;p.y+=moveY*mv;walking=true;}
      }else{
        const job=p.act==='work'?S.b.find(b=>b.id===p.job&&b.busy):null;
        if(p.act==='work'&&!job)p.act='idle';
        if(p.k==='builder'&&p.act!=='work'&&S.b.some(b=>b.busy))plan(p);
        else if(!job){p.wait-=dt;if(p.act==='fish'&&p.wait<=0&&Math.random()<.45){say(p,'🐟',true);p.wait=3+Math.random()*4;}else if(p.wait<=0)plan(p);}
      }
      const atDock=p.act==='fish'&&!p.route.length,working=p.act==='work'&&!p.route.length;
      p.el.classList.toggle('walk',walking);p.el.classList.toggle('fishing',atDock);p.el.classList.toggle('working',working);
      setFacing(p, moveX, moveY, walking, walking ? SPEED * dt : 0);
      // Match building depth sorting: lower screen-Y feet appear behind,
      // higher screen-Y feet appear in front.
      p.el.style.zIndex = 10 + Math.floor(p.y);
      p.el.style.transform=`translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px)`;
      p.el.firstChild.style.transform='translateX(-50%)';
    });
    raf=requestAnimationFrame(step);
  }
  function say(p, text, short) {
    const b = p.el.querySelector(".is-say"); b.textContent = text; p.el.classList.add("talk");
    clearTimeout(p.sayT); p.sayT = setTimeout(() => p.el.classList.remove("talk"), short ? 1500 : 2800);
  }
  function tapPerson(el) {
    const p = ppl.find((x) => x.el === el); if (!p) return;
    const lines = t.say[p.k]; say(p, lines[Math.floor(Math.random() * lines.length)]);
    try { tg?.HapticFeedback?.impactOccurred?.("light"); } catch {}
  }

  // ---- hub card ----
  function cardHTML() {
    t = L[lang()];
    return `<button type="button" id="hub-island" class="is-card"><div class="is-card-img" style="background-image:url('${A}card.webp')"><span class="is-card-tag">NEW · BUILD</span></div><div class="is-card-body"><b>🏝️ ${t.title}</b><small>${t.sub}</small><span class="is-card-play">${t.play}</span></div></button>`;
  }
  window.CSLIsland = { open, close, cardHTML, _state: () => S };
})();
