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
    en: { title: "Island Clash", sub: "Build your island · raid your rivals", play: "▶ Play", shop: "Build", attack: "Attack", gems: "Free gems", soon: "⚔️ Battles arrive in Phase 2!", lv: "Level", upg: "Upgrade", move: "Move", collect: "Collect", max: "Max level", needTH: (n) => `Needs Town Hall ${n}`, noB: "All builders are busy", noRes: (r) => `Not enough ${r}`, full: "Storage is full", ok: "✓", cancel: "✕", built: "Built!", fin: "Finish", ad15: "▶ Ad: −15 min", limit: "Limit reached — upgrade Town Hall", gemAd: "+5 💎 from ad", place: "Drag to place, then ✓", prod: "Production", cap: "Capacity", hr: "/h", gold: "gold", elixir: "elixir", gemsW: "gems", vip: "VIP: 2× faster builds + 1 extra builder",
      n: { townhall: "Town Hall", goldmine: "Gold Mine", elixir: "Elixir Collector", goldstore: "Gold Storage", elixstore: "Elixir Storage", cannon: "Cannon", archer: "Archer Tower", barracks: "Barracks", hut: "Builder's Hut" } },
    my: { title: "Island Clash", sub: "ကိုယ့်ကျွန်းတည်ဆောက် · ရန်သူကိုတိုက်", play: "▶ ဆော့မယ်", shop: "ဆောက်မယ်", attack: "တိုက်မယ်", gems: "Gem အလကား", soon: "⚔️ တိုက်ပွဲက အဆင့် ၂ မှာလာမယ်!", lv: "Level", upg: "Upgrade", move: "ရွှေ့", collect: "သိမ်း", max: "အမြင့်ဆုံး level", needTH: (n) => `Town Hall ${n} လိုတယ်`, noB: "ဆောက်သူတွေ အားလုံးအလုပ်များနေ", noRes: (r) => `${r} မလောက်ဘူး`, full: "သိုလှောင်ရုံ ပြည့်နေပြီ", ok: "✓", cancel: "✕", built: "ဆောက်ပြီး!", fin: "ပြီးစေ", ad15: "▶ Ad: −15 မိနစ်", limit: "အရေအတွက်ပြည့်ပြီ — Town Hall မြှင့်ပါ", gemAd: "Ad ကနေ +5 💎", place: "ဆွဲပြီးနေရာချ၊ ပြီးရင် ✓", prod: "ထုတ်လုပ်မှု", cap: "သိုလှောင်နိုင်မှု", hr: "/နာရီ", gold: "ရွှေ", elixir: "elixir", gemsW: "gem", vip: "VIP: ၂ဆ မြန်မြန်ဆောက် + ဆောက်သူ ၁ ယောက်ပို",
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
    grid(); fit(); drawAll(); hud(); wire();
    $("is-back").onclick = close;
    $("is-shop").onclick = shop;
    $("is-atk").onclick = () => toast(t.soon);
    $("is-ad").onclick = async () => { const ok = await window.CSLAds?.reward?.("island", lang()); if (ok) { S.gems += 5; save(); hud(); toast(t.gemAd); } };
    $("is-no").onclick = () => endPlace(false); $("is-yes").onclick = () => endPlace(true);
    loop = setInterval(tick, 1000); tick(); pull(); checkVip();
    try { tg?.disableVerticalSwipes?.(); } catch {}
  }
  function close() { clearInterval(loop); place = null; ui?.root.remove(); ui = null; document.body.classList.remove("is-open"); save(); try { tg?.enableVerticalSwipes?.(); } catch {} }

  function grid() {
    const c = $("is-grid").getContext("2d"); c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 1.5;
    for (let i = 0; i <= N; i++) { let a = P(i, 0), b = P(i, N); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); a = P(0, i); b = P(N, i); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
  }
  function fit() { const vw = ui.view.clientWidth, vh = ui.view.clientHeight; ui.min = Math.max(vw, vh) / 1600; ui.sc = Math.max(ui.min, 0.66); ui.tx = vw / 2 - OX * ui.sc; ui.ty = vh / 2 - 760 * ui.sc; apply(); }
  function apply() {
    const vw = ui.view.clientWidth, vh = ui.view.clientHeight, W = 1600 * ui.sc;
    ui.tx = Math.min(0, Math.max(vw - W, ui.tx)); ui.ty = Math.min(0, Math.max(vh - W, ui.ty));
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
    window.addEventListener("resize", () => ui && apply());
  }
  function tap(target) {
    const be = target.closest?.(".is-b"); if (place) return;
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
    el.style.zIndex = 10 + (b.x + b.y + s) * 2;
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

  // ---- hub card ----
  function cardHTML() {
    t = L[lang()];
    return `<button type="button" id="hub-island" class="is-card"><div class="is-card-img" style="background-image:url('${A}card.webp')"><span class="is-card-tag">NEW · BUILD</span></div><div class="is-card-body"><b>🏝️ ${t.title}</b><small>${t.sub}</small><span class="is-card-play">${t.play}</span></div></button>`;
  }
  window.CSLIsland = { open, close, cardHTML, _state: () => S };
})();
