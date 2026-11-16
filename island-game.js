/* 🏝️ Island — cozy island scene (look of the user's reference picture).
   One hand-painted island map, HUD like the reference, 4 residents walking on the lawn, path and dock.
   Functions (Build, Map, tasks…) come later; buttons show "coming soon" for now.
   Saves to localStorage + /api/save/island. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const KEY = "csl_island_cozy_v1", A = "island-assets/";
  const tg = window.Telegram?.WebApp, API = window.VIDEOSPACE_CONFIG?.VIP_API_URL;
  const lang = () => { try { return localStorage.getItem("hub_lang") === "my" ? "my" : "en"; } catch { return "en"; } };
  const L = {
    en: { title: "Island Life", sub: "Your own little island", play: "▶ Play", build: "Build", map: "Map", soon: "Coming soon ✨", gems: "+5 💎 from ad",
      say: { boy: ["This island is ours! 🏝️", "Nice day, right?", "Let's build something new."], girl: ["Hi! Welcome home 💕", "The flowers smell so good 🌺", "Let's sit by the fire tonight?"], builder: ["On it, boss! 🔨", "Give me a job!", "This house needs a new roof."], fisher: ["Nice catch today 🐟", "The sea is calm.", "Shh… the fish are biting."] } },
    my: { title: "Island Life", sub: "ကိုယ်ပိုင် ကျွန်းလေး", play: "▶ ဆော့မယ်", build: "ဆောက်မယ်", map: "မြေပုံ", soon: "မကြာခင်လာမယ် ✨", gems: "Ad ကနေ +5 💎",
      say: { boy: ["ဒီကျွန်းက ငါတို့ပိုင်တယ် 🏝️", "ဒီနေ့ ရာသီဥတုကောင်းတယ်နော်", "အသစ်တစ်ခု ဆောက်ကြမယ်"], girl: ["ဟိုင်း! ပြန်ရောက်ပြီလား 💕", "ပန်းရနံ့လေး မွှေးလိုက်တာ 🌺", "ညကျ မီးပုံနားထိုင်ရအောင်?"], builder: ["လုပ်ပေးမယ် ဆရာ 🔨", "အလုပ်ပေးပါဦး!", "ဒီအိမ်ခေါင်မိုး ပြင်ရမယ်"], fisher: ["ဒီနေ့ ငါးကောင်းကောင်းရတယ် 🐟", "ပင်လယ်က ငြိမ်နေတယ်", "တိုးတိုး… ငါးဟပ်နေပြီ"] } }
  };
  let t = L[lang()];

  // ---- state ----
  let S = load(), ui = null, saveT = 0;
  function fresh() { return { v: 1, ts: Date.now(), lv: 1, xp: 0, gold: 500, wood: 300, gems: 50 }; }
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); return s && s.v ? s : fresh(); } catch { return fresh(); } }
  function save() { S.ts = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} clearTimeout(saveT); saveT = setTimeout(push, 2000); }
  const hdr = () => ({ "Content-Type": "application/json", "X-Telegram-Init-Data": tg.initData });
  async function push() { if (!API || !tg?.initData) return; try { await fetch(API + "/api/save/island", { method: "POST", headers: hdr(), body: JSON.stringify({ data: S }) }); } catch {} }
  async function pull() {
    if (!API || !tg?.initData) return;
    try { const j = await (await fetch(API + "/api/save/island", { headers: hdr() })).json();
      if (j?.data?.v && j.data.wood != null && Number(j.data.ts || 0) > Number(S.ts || 0)) { S = j.data; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} hud(); } } catch {}
  }
  const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e4 ? Math.round(n / 1e3) + "K" : String(Math.floor(n)));
  function toast(msg) { const el = $("toast"); if (!el) return; el.textContent = msg; el.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("show"), 2200); }

  // ---- UI ----
  const W = 1024; // world = the island picture, 1024×1024
  function open() {
    if (ui) return;
    t = L[lang()];
    const root = document.createElement("div"); root.id = "is-root";
    root.innerHTML = `<div id="is-view"><div id="is-world"><img class="is-ground" src="${A}cozy_bg.webp" alt="" draggable="false"><div id="is-ents"></div></div></div>
      <div class="cz-top">
        <button class="cz-ava" id="cz-back"><img src="${A}ui_avatar.webp" alt=""></button>
        <div class="cz-lv"><img src="${A}ui_star.webp" alt=""><b id="cz-lvn"></b><div class="cz-xp"><i id="cz-xpb"></i><span id="cz-xpt"></span></div></div>
        <div class="cz-pill cz-gold"><img src="${A}ui_coin.webp" alt=""><b id="cz-g"></b><button data-p="gold">+</button></div>
        <div class="cz-pill cz-woodp"><img class="cz-wood" src="${A}ui_wood.webp" alt=""><b id="cz-w"></b><button data-p="wood">+</button></div>
        <div class="cz-pill"><img src="${A}ui_gem.webp" alt=""><b id="cz-m"></b><button data-p="gems">+</button></div>
        <button class="cz-gear" data-s="1"><img src="${A}ui_gear.webp" alt=""></button>
      </div>
      <div class="cz-side"><button class="cz-sq" data-s="1"><img src="${A}ui_tasks.webp" alt=""></button><button class="cz-sq" data-s="1"><img src="${A}ui_trophy.webp" alt=""></button><button class="cz-sq" data-s="1"><img src="${A}ui_mail.webp" alt=""><em>1</em></button></div>
      <div class="cz-right"><button class="cz-big" data-s="1"><img src="${A}ui_build.webp" alt=""><small>${t.build}</small></button><button class="cz-big" data-s="1"><img src="${A}ui_map.webp" alt=""><small>${t.map}</small></button></div>`;
    document.body.appendChild(root); document.body.classList.add("is-open");
    ui = { root, view: $("is-view"), world: $("is-world"), ents: $("is-ents"), sc: 1, tx: 0, ty: 0 };
    fit(); hud(); wire(); spawnPeople();
    $("cz-back").onclick = close;
    root.querySelectorAll("[data-s]").forEach((b) => (b.onclick = () => toast(t.soon)));
    root.querySelectorAll("[data-p]").forEach((b) => (b.onclick = async () => {
      if (b.dataset.p !== "gems") { toast(t.soon); return; }
      const ok = await window.CSLAds?.reward?.("island", lang()); if (ok) { S.gems += 5; save(); hud(); toast(t.gems); }
    }));
    pull();
    try { tg?.disableVerticalSwipes?.(); } catch {}
  }
  function close() { cancelAnimationFrame(raf); ppl = []; ui?.root.remove(); ui = null; document.body.classList.remove("is-open"); save(); try { tg?.enableVerticalSwipes?.(); } catch {} }
  function hud() {
    if (!ui) return; const need = 100 * S.lv;
    $("cz-lvn").textContent = S.lv; $("cz-xpt").textContent = `${S.xp}/${need}`; $("cz-xpb").style.width = Math.min(100, (S.xp / need) * 100) + "%";
    $("cz-g").textContent = fmt(S.gold); $("cz-w").textContent = fmt(S.wood); $("cz-m").textContent = fmt(S.gems);
  }
  // whole island fits the screen width (like the reference); pinch / wheel zooms, drag pans
  function fit() {
    const vw = ui.view.clientWidth, vh = ui.view.clientHeight;
    ui.min = Math.min(vw / W, vh / W); ui.fitW = vw / W;
    ui.sc = Math.min(vw / W * 1.18, vh / W); const w = W * ui.sc;
    ui.tx = (vw - w) / 2; ui.ty = Math.max(0, (vh - w) * 0.5 + 10);
    apply();
    // Build / Map sit over the island's lower-right shore, like the reference picture
    const r = ui.root.querySelector(".cz-right"); if (r) r.style.bottom = Math.max(14, vh - (ui.ty + w * 0.93)) + "px";
  }
  function apply() {
    const vw = ui.view.clientWidth, vh = ui.view.clientHeight, w = W * ui.sc;
    ui.tx = w <= vw ? (vw - w) / 2 : Math.min(0, Math.max(vw - w, ui.tx));
    ui.ty = w <= vh ? Math.min(Math.max(ui.ty, 0), vh - w) : Math.min(0, Math.max(vh - w, ui.ty));
    ui.world.style.transform = `translate(${ui.tx}px,${ui.ty}px) scale(${ui.sc})`;
  }
  function zoomAt(f, cx, cy) { const ns = Math.max(ui.min, Math.min(ui.fitW * 2.2, ui.sc * f)); const k = ns / ui.sc; ui.tx = cx - (cx - ui.tx) * k; ui.ty = cy - (cy - ui.ty) * k; ui.sc = ns; apply(); }
  function wire() {
    const v = ui.view, pts = new Map(); let st = null, pinch = null;
    v.addEventListener("pointerdown", (e) => {
      v.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) st = { x: e.clientX, y: e.clientY, tx: ui.tx, ty: ui.ty, time: Date.now(), moved: false, target: e.target };
      else if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), sc: ui.sc }; }
    });
    v.addEventListener("pointermove", (e) => {
      if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pts.size >= 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); zoomAt((pinch.sc * d / pinch.d) / ui.sc, (a.x + b.x) / 2, (a.y + b.y) / 2); return; }
      if (!st) return; const dx = e.clientX - st.x, dy = e.clientY - st.y; if (Math.abs(dx) + Math.abs(dy) > 8) st.moved = true;
      ui.tx = st.tx + dx; ui.ty = st.ty + dy; apply();
    });
    const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (st && pts.size === 0) { if (!st.moved && Date.now() - st.time < 500) tap(st.target); st = null; } };
    v.addEventListener("pointerup", up); v.addEventListener("pointercancel", up);
    v.addEventListener("wheel", (e) => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.12 : 0.9, e.clientX, e.clientY); }, { passive: false });
    window.addEventListener("resize", () => ui && fit());
  }
  function tap(target) { const pe = target.closest?.(".is-p"); if (pe) tapPerson(pe); }

  // ---- walkable map: 64×64 cells of 16px over the island picture (lawn, sand path, beach to the dock, dock) ----
  const C = 16, G = 64, MASK = "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000111111111000000000000000000000000000000000000000000000000000000111111111111000000000000000000000000000000000000000000000000011111111111111111000000000000000000000000000000000000000000000000001111111111111111100000000000000000000000000000000000000000000000011111111111111111100000000000000000000000000000000000000000000001111111111111111111100000000000000000000000000000000000000000000111111111111111111111000000000000000000000000000000000000000000011111111111111111111111000000000000000000000000000000000000000011111111111111111111111110000000000000000000000000000000111111111111111111111111111111111111000000000000000000000000000011111111111111111111111110011111111100000000000000000000000000000011111111111111111111111110111111110000000000000000000000000000001111111111111111111111111101111111100000000000000000000000000000111111111111111111111111111111111110000000000000000000000000000011111111111111111111111111111011111000000000000000000000000000001111111111111111111111111111111001110000000000000000000000000000111111111111111111111111111111111001100000000000000000000000011111111111111111111111111111111111100111000000000000000000000000011111111111111111111111111111111111110100000000000000000000000000111111111111111111111111111111111111000000000000000000000000000111111111111111111111111111111111111100000000000000000000000000111111111111111111111111111111111110000000000000000000000000000001111111111111111111111111111111100000000000000000000000000000000001111111111111111111111111110000000000000000000000000000000000010111111111111111111111111000000000000000000000000000000000000001111111111111111111111110000000000000000000000000000000000000000011110011111111111110000000000000000000000000000000000000000000000111100011111111111000000000000000000000000000000000000000000000001000100111111111000000000000000000000000000000000000000000000000000011111111111000000000000000000000000000000000000000000000000000001111001111100000000000000000000000000000000000000000000000000000001111011100000000000000000000000000000000000000000000000000000000111111100000000000000000000000000000000000000000000000000000000001111100000000000000000000000000000000000000000000000000000000001111100000000000000000000000000000000000000000000000000000000000001110000000000000000000000000000000000000000000000000000000000000011000000000000000000000000000000000000000000000000000000000000001100000000000000000000000000000000000000000000000000000000000000110000000000000000000000000000000000000000000000000000000000000011000000000000000000000000000000000000000000000000000011100000001100000000000000000000000000000000000000000000000000111111100000110000000000000000000000000000000000000000000000000111111110000011000000000000000000000000000000000000000000000000011111111100001100000000000000000000000000000000000000000000000000111100111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
  const free = (cx, cy) => cx >= 0 && cy >= 0 && cx < G && cy < G && MASK.charCodeAt(cy * G + cx) === 49;
  const walkable = (x, y) => free(Math.floor(x / C), Math.floor(y / C));
  const cen = (cx, cy) => ({ x: cx * C + C / 2, y: cy * C + C / 2 });
  function nearest(p) {
    const cx = Math.floor(p.x / C), cy = Math.floor(p.y / C);
    for (let r = 0; r < 12; r++) for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (free(x, y)) return { x, y };
    return null;
  }
  function sight(a, b) { // straight line stays on walkable ground (with a little body width)
    const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.ceil(d / 5);
    for (let i = 1; i <= n; i++) { const x = a.x + (b.x - a.x) * i / n, y = a.y + (b.y - a.y) * i / n;
      if (!walkable(x, y) || !walkable(x + 6, y) || !walkable(x - 6, y) || !walkable(x, y + 4) || !walkable(x, y - 4)) return false; }
    return true;
  }
  function findPath(from, to) {
    const a = nearest(from), b = nearest(to); if (!a || !b) return [];
    const k = (x, y) => y * G + x, came = new Map(), cost = new Map([[k(a.x, a.y), 0]]), open = [{ x: a.x, y: a.y, f: 0 }], done = new Set();
    let ok = false;
    while (open.length) {
      let bi = 0; for (let i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i;
      const c = open.splice(bi, 1)[0], ck = k(c.x, c.y); if (done.has(ck)) continue; done.add(ck);
      if (c.x === b.x && c.y === b.y) { ok = true; break; }
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
        const nx = c.x + dx, ny = c.y + dy, nk = k(nx, ny); if (!free(nx, ny) || done.has(nk)) continue;
        if (dx && dy && (!free(c.x + dx, c.y) || !free(c.x, c.y + dy))) continue;
        const g = cost.get(ck) + (dx && dy ? 1.414 : 1); if (g >= (cost.get(nk) ?? 1e9)) continue;
        cost.set(nk, g); came.set(nk, ck); open.push({ x: nx, y: ny, f: g + Math.hypot(nx - b.x, ny - b.y) });
      }
    }
    if (!ok) return [];
    const cells = []; let cur = k(b.x, b.y); while (cur !== undefined) { cells.push(cen(cur % G, Math.floor(cur / G))); if (cur === k(a.x, a.y)) break; cur = came.get(cur); }
    cells.reverse(); cells[cells.length - 1] = walkable(to.x, to.y) ? { x: to.x, y: to.y } : cells[cells.length - 1];
    // string-pulling: keep only the corners, so people walk in long straight natural lines
    const out = []; let s = { x: from.x, y: from.y }, i = 0;
    while (i < cells.length - 1) { let j = cells.length - 1; while (j > i + 1 && !sight(s, cells[j])) j--; out.push(cells[j]); s = cells[j]; i = j; }
    if (!out.length) out.push(cells[cells.length - 1]);
    return out;
  }

  // ---- residents ----
  // Boy and girl use 8 directions × 8 walk frames; builder and fisher retain 4 directions × 2 frames.
  const DIRS = ["front", "back", "left", "right"], DIRS8 = ["front", "front_right", "right", "back_right", "back", "back_left", "left", "front_left"], SPEED = 50, FIG_H = 292 / 320; // figure fills 292 of the 320px frame
  const PPL = [{ k: "boy", h: 112, at: { x: 700, y: 560 } }, { k: "girl", h: 100, at: { x: 450, y: 420 } }, { k: "builder", h: 106, at: { x: 660, y: 320 } }, { k: "fisher", h: 106, at: { x: 330, y: 560 } }];
  const SPOTS = {
    fire: { x: 330, y: 370 }, sign: { x: 300, y: 480 }, house: { x: 690, y: 315 }, garden: { x: 560, y: 690 },
    well: { x: 830, y: 520 }, dock: { x: 290, y: 880 }, beach: { x: 460, y: 915 }, lawnR: { x: 760, y: 420 }
  };
  const LIKES = { boy: ["house", "well", "garden", "fire", "beach"], girl: ["fire", "sign", "garden", "lawnR", "well"], builder: ["house", "garden", "well", "sign"], fisher: ["dock", "dock", "beach", "fire"] };
  const IMG = {}; // preload every frame so a turn never flashes blank
  function src(k, d, f) { return `${A}characters/${k}_${d}_${f}.webp`; }
  function preload() {
    Object.keys(LIKES).forEach((k) => {
      const dirs = (k === "boy" || k === "girl") ? DIRS8 : DIRS;
      const frames = (k === "boy" || k === "girl") ? Array.from({ length: 8 }, (_, i) => i) : [0, 1];
      dirs.forEach((d) => frames.forEach((f) => {
        const u = src(k, d, f); if (!IMG[u]) { IMG[u] = new Image(); IMG[u].src = u; }
      }));
    });
  }
  let ppl = [], raf = 0, lastT = 0;
  function randomLawn() { for (let i = 0; i < 200; i++) { const p = { x: 260 + Math.random() * 560, y: 200 + Math.random() * 520 }; if (sight(p, p) && walkable(p.x, p.y)) return p; } return { x: 500, y: 450 }; }
  function show(p, dir, f) { if (dir === p.dir && f === p.fi) return; p.dir = dir; p.fi = f; p.img.src = src(p.k, dir, f); }
  // pick the facing from the screen direction of travel, with hysteresis so it doesn't flicker on diagonals
  function wantDir(p, dx, dy) {
    if (p.k === "boy" || p.k === "girl") {
      // Eight-way facing: 0° is screen-down/front, then clockwise in 45° steps.
      // with hysteresis: keep the current facing until the path clearly leaves its 45° slice
      const angle = Math.atan2(dx, dy), cur = DIRS8.indexOf(p.dir);
      if (cur >= 0) {
        let diff = angle - cur * Math.PI / 4; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        if (Math.abs(diff) < Math.PI / 8 + 0.3) return p.dir;
      }
      return DIRS8[(Math.round(angle / (Math.PI / 4)) + 8) % 8];
    }
    const ax = Math.abs(dx), ay = Math.abs(dy), side = dx > 0 ? "right" : "left", vert = dy > 0 ? "front" : "back";
    const cur = p.dir, curSide = cur === "left" || cur === "right";
    if (curSide) return ay > ax * 1.35 ? vert : side;
    return ax > ay * 1.35 ? side : vert;
  }
  function spawnPeople() {
    preload();
    ppl.forEach((p) => p.el.remove()); ppl = [];
    PPL.forEach((d, i) => {
      const el = document.createElement("div"); el.className = "is-p"; el.dataset.k = d.k;
      const fh = d.h / FIG_H, fw = fh * 180 / 320;
      el.innerHTML = `<div class="is-fig" style="height:${fh.toFixed(1)}px;width:${fw.toFixed(1)}px"><img class="is-spr" alt="" draggable="false"></div><span class="is-say"></span>`;
      ui.ents.appendChild(el);
      const p = { k: d.k, h: d.h, el, img: el.querySelector("img"), x: d.at.x, y: d.at.y, route: [], wait: 0.6 + i * 0.9, spot: null, dir: "", fi: -1, dist: 0, turn: 0, v: 0 };
      ppl.push(p); show(p, ["front", "right", "left", "back"][i], 0);
    });
    lastT = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(step);
  }
  function plan(p) {
    const likes = LIKES[p.k], name = Math.random() < 0.7 ? likes[Math.floor(Math.random() * likes.length)] : null;
    const base = name ? SPOTS[name] : randomLawn();
    const tgt = { x: base.x + (name ? (Math.random() - 0.5) * 30 : 0), y: base.y + (name ? (Math.random() - 0.5) * 16 : 0) };
    if (ppl.some((o) => o !== p && (Math.hypot(o.x - tgt.x, o.y - tgt.y) < 70 || (o.route.length && Math.hypot(o.route[o.route.length-1].x - tgt.x, o.route[o.route.length-1].y - tgt.y) < 70)))) { p.wait = 0.8; return; }
    p.route = findPath({ x: p.x, y: p.y }, tgt); p.spot = name;
    if (!p.route.length) p.wait = 1;
  }
  function step(now) {
    if (!ui) return;
    const dt = Math.min(0.08, (now - lastT) / 1000); lastT = now;
    ppl.forEach((p, idx) => {
      let target = 0;
      if (p.route.length) {
        const q = p.route[0], dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy);
        const blocked = idx > 0 && ppl.some((o, j) => j < idx && Math.hypot(o.x - p.x, o.y - p.y) < 46 && ((o.x - p.x) * dx + (o.y - p.y) * dy) > 0);
        if (blocked) p.hold = (p.hold || 0) + dt; else p.hold = 0;
        const want = d > 0.5 ? wantDir(p, dx, dy) : p.dir;
        if (want !== p.dir && !p.turn) {
          // a small 45° change turns while walking; only a real turn (90° or more) stops briefly
          const a = DIRS8.indexOf(want), b = DIRS8.indexOf(p.dir), gap = a >= 0 && b >= 0 ? Math.min((a - b + 8) % 8, (b - a + 8) % 8) : 2;
          if (gap <= 1 && p.v > 4) { p.dir = want; p.fi = -1; } else p.turn = 0.16;
        }
        if (p.turn > 0) { p.turn -= dt; p.v = 0; if (p.turn <= 0.08) show(p, want, 0); if (p.turn <= 0) p.turn = 0; }
        else if (!(blocked && p.hold < 2.5)) {
          target = SPEED;
          p.v += (target - p.v) * Math.min(1, dt * 7); // ease into the walk
          const mv = p.v * dt;
          if (d <= mv) { p.x = q.x; p.y = q.y; p.dist += d; p.route.shift(); if (!p.route.length) { p.v = 0; arrive(p); } }
          else { p.x += (dx / d) * mv; p.y += (dy / d) * mv; p.dist += mv; }
        } else p.v = 0;
      } else { p.v = 0; p.wait -= dt; if (p.wait <= 0) plan(p); }
      const walking = p.v > 4;
      p.el.classList.toggle("walk", walking);
      const STEP = (p.k === "boy" || p.k === "girl") ? p.h * 0.55 : p.h * 0.3; // ground covered per complete walk cycle (two steps)
      const ph = p.dist / STEP;
      const frame = (p.k === "boy" || p.k === "girl") ? (walking ? Math.floor(ph * 8) % 8 : 0) : (walking ? Math.floor(ph) % 2 : 0);
      show(p, p.dir, frame);
      const bob = walking ? ((p.k === "boy" || p.k === "girl") ? -Math.abs(Math.sin(ph * Math.PI * 2)) * p.h * 0.006 : -Math.abs(Math.sin(ph * Math.PI)) * p.h * 0.012) : 0;
      p.el.style.zIndex = Math.round(p.y);
      p.el.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px)`;
      p.el.firstChild.style.transform = `translate(-50%,${bob.toFixed(2)}px)`;
    });
    raf = requestAnimationFrame(step);
  }
  function arrive(p) {
    p.wait = 2 + Math.random() * 4;
    const face = { fire: "left", house: "back", dock: "left", well: "right", garden: "front", beach: "front", sign: "left" }[p.spot];
    if (face) show(p, face, 0);
    if (p.spot === "dock") { p.wait = 6 + Math.random() * 6; setTimeout(() => ui && say(p, "🎣", true), 1500); }
    if (p.k === "builder" && p.spot === "house") { p.wait = 4; setTimeout(() => ui && say(p, "🔨", true), 800); }
  }
  function say(p, text, short) {
    const b = p.el.querySelector(".is-say"); b.textContent = text; p.el.classList.add("talk");
    clearTimeout(p.sayT); p.sayT = setTimeout(() => p.el.classList.remove("talk"), short ? 1500 : 2800);
  }
  function tapPerson(el) {
    const p = ppl.find((x) => x.el === el); if (!p) return;
    const lines = t.say[p.k]; say(p, lines[Math.floor(Math.random() * lines.length)]);
    if (S.xp < 100 * S.lv) { S.xp += 1; save(); hud(); }
    try { tg?.HapticFeedback?.impactOccurred?.("light"); } catch {}
  }

  // ---- hub card ----
  function cardHTML() {
    t = L[lang()];
    return `<button type="button" id="hub-island" class="is-card"><div class="is-card-img" style="background-image:url('${A}cozy_bg.webp')"><span class="is-card-tag">NEW</span></div><div class="is-card-body"><b>🏝️ ${t.title}</b><small>${t.sub}</small><span class="is-card-play">${t.play}</span></div></button>`;
  }
  window.CSLIsland = { open, close, cardHTML, _state: () => S };
})();
