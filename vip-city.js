/*
  VIP City (demo). A landscape isometric town where every Telegram player gets a small house.
  - Auto landscape: requestFullscreen + lockOrientation when possible; if the phone is still
    upright, the whole game is rotated 90° with CSS so it always plays sideways.
  - Players come from GET /api/city/map  -> { me: tgid, houses: [{ id, name, plot, color }] }
    and the first visit calls POST /api/city/claim, which gives the player the next free plot.
  - window.VipCity.open({ me, houses }) can be fed mock data (demo); VipCity.play() loads the real map.
*/
(function () {
  const TW = 128, TH = 64, N = 22;              // tile size and grid size
  const ASSET = (window.VIP_CITY_ASSETS || "city-assets/");
  // Fixed landmarks (col, row, sprite, scale)
  const LAND = [
    { c: 10, r: 10, s: "park", w: 2.1, name: "Central Park" },
    { c: 6, r: 9, s: "school", w: 1.9, name: "University", locked: false },
    { c: 14, r: 7, s: "cafe", w: 1.3, name: "Cafe" },
    { c: 15, r: 14, s: "school", w: 1.9, name: "Hospital", locked: true },
    { c: 5, r: 15, s: "cafe", w: 1.3, name: "Mall", locked: true }
  ];
  const ROADS = new Set();
  for (let i = 0; i < N; i++) { ROADS.add(`${i},8`); ROADS.add(`${i},12`); ROADS.add(`8,${i}`); ROADS.add(`12,${i}`); ROADS.add(`${i},4`); ROADS.add(`${i},16`); ROADS.add(`4,${i}`); ROADS.add(`16,${i}`); }
  const busy = new Set();
  LAND.forEach((l) => { for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) busy.add(`${l.c + a},${l.r + b}`); });
  // Plots for houses: every free grass tile next to a road, closest to the center first.
  const PLOTS = [];
  for (let c = 1; c < N - 1; c++) for (let r = 1; r < N - 1; r++) {
    const k = `${c},${r}`;
    if (ROADS.has(k) || busy.has(k)) continue;
    const nearRoad = ROADS.has(`${c + 1},${r}`) || ROADS.has(`${c - 1},${r}`) || ROADS.has(`${c},${r + 1}`) || ROADS.has(`${c},${r - 1}`);
    if (nearRoad) PLOTS.push([c, r]);
  }
  PLOTS.sort((a, b) => Math.hypot(a[0] - 10.5, a[1] - 10.5) - Math.hypot(b[0] - 10.5, b[1] - 10.5));
  // keep houses apart: at least 2 tiles between plots
  for (let i = PLOTS.length - 1; i >= 0; i--) {
    if (PLOTS.slice(0, i).some((p) => Math.abs(p[0] - PLOTS[i][0]) + Math.abs(p[1] - PLOTS[i][1]) < 2)) PLOTS.splice(i, 1);
  }

  const iso = (c, r) => ({ x: (c - r) * TW / 2, y: (c + r) * TH / 2 });
  const hue = (id) => { let h = 0; String(id).split("").forEach((ch) => (h = (h * 31 + ch.charCodeAt(0)) % 360)); return h; };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  function drawGround(cv) {
    const p = iso(0, 0), W = N * TW, H = N * TH + 40;
    cv.width = W; cv.height = H;
    const g = cv.getContext("2d");
    const ox = W / 2;
    // water around the island
    g.fillStyle = "#4fb7d9"; g.fillRect(0, 0, W, H);
    for (let c = 0; c < N; c++) for (let r = 0; r < N; r++) {
      const q = iso(c, r), x = ox + q.x, y = q.y + 20;
      const edge = c === 0 || r === 0 || c === N - 1 || r === N - 1;
      const road = ROADS.has(`${c},${r}`) && !edge;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + TW / 2, y + TH / 2); g.lineTo(x, y + TH); g.lineTo(x - TW / 2, y + TH / 2); g.closePath();
      g.fillStyle = edge ? "#f1dca0" : road ? "#8e939b" : ((c + r) % 2 ? "#8fd16a" : "#86c962");
      g.fill();
      g.strokeStyle = road ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.05)"; g.stroke();
      if (road) { // dashed centre mark
        g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(x - 3, y + TH / 2 - 1.5, 6, 3);
      }
    }
    void p;
    return { ox };
  }

  let root = null, world = null, view = { x: 0, y: 0, z: 0.45 }, data = null;

  function apply() { world.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.z})`; }

  function sprite(kind, c, r, w, extra = "") {
    const q = iso(c, r), size = TW * w;
    return `<img class="vc-sp ${extra}" src="${ASSET}${kind}.webp" alt="" style="left:${q.x + N * TW / 2 - size / 2}px;top:${q.y + 20 + TH - size * 0.92}px;width:${size}px;z-index:${(c + r) * 10}">`;
  }

  function render() {
    const houses = (data.houses || []).map((h, i) => ({ ...h, plot: h.plot ?? i }));
    let html = `<canvas class="vc-ground"></canvas>`;
    LAND.forEach((l) => {
      html += sprite(l.s, l.c, l.r, l.w, l.locked ? "vc-lock" : "");
      const q = iso(l.c, l.r);
      html += `<button class="vc-tag ${l.locked ? "locked" : ""}" data-land="${esc(l.name)}" style="left:${q.x + N * TW / 2}px;top:${q.y + 20 - TW * l.w * 0.55}px;z-index:${(l.c + l.r) * 10 + 5}">${l.locked ? "🔒 " : ""}${esc(l.name)}</button>`;
    });
    houses.forEach((h) => {
      const p = PLOTS[h.plot % PLOTS.length]; if (!p) return;
      const [c, r] = p, q = iso(c, r), me = String(h.id) === String(data.me), size = TW * 0.95;
      html += `<img class="vc-sp vc-house ${me ? "me" : ""}" data-h="${esc(h.id)}" src="${ASSET}house.webp" alt="" style="left:${q.x + N * TW / 2 - size / 2}px;top:${q.y + 20 + TH - size * 0.9}px;width:${size}px;z-index:${(c + r) * 10};filter:hue-rotate(${me ? 0 : hue(h.id)}deg) drop-shadow(0 6px 4px rgba(0,0,0,.25))${me ? " drop-shadow(0 0 14px #ffd166)" : ""}">`;
      html += `<button class="vc-name ${me ? "me" : ""}" data-h="${esc(h.id)}" style="left:${q.x + N * TW / 2}px;top:${q.y + 20 - size * 0.62}px;z-index:${(c + r) * 10 + 6}">${me ? "👑 " : ""}${esc(h.name)}</button>`;
    });
    world.innerHTML = html;
    drawGround(world.querySelector(".vc-ground"));
    root.querySelector("#vc-count").textContent = `🏠 ${houses.length}`;
  }

  function focusMine() {
    const houses = data.houses || [];
    const i = houses.findIndex((h) => String(h.id) === String(data.me));
    const p = PLOTS[(houses[i]?.plot ?? i) % PLOTS.length] || [10, 10];
    const q = iso(p[0], p[1]), box = root.querySelector(".vc-stage").getBoundingClientRect();
    const rot = root.classList.contains("rot");
    const W = rot ? box.height : box.width, H = rot ? box.width : box.height;
    view.z = 0.45;
    view.x = W / 2 - (q.x + N * TW / 2) * view.z;
    view.y = H / 2 - (q.y + 20) * view.z;
    apply();
  }

  function card(html) {
    const el = root.querySelector("#vc-card");
    el.innerHTML = html + `<button class="vc-btn ghost" data-x>Close</button>`;
    el.classList.remove("hidden");
  }

  function onTap(e) {
    const h = e.target.closest("[data-h]"), l = e.target.closest("[data-land]");
    if (h) {
      const house = data.houses.find((x) => String(x.id) === h.dataset.h);
      const me = String(house.id) === String(data.me);
      card(`<b>${me ? "👑 " : "🏠 "}${esc(house.name)}${me ? " (You)" : ""}</b><p>${me ? "This is your house. Decorate it and invite friends." : "A neighbour from Telegram."}</p>` +
        (me ? `<button class="vc-btn gold">🚪 Enter my house</button>` : `<button class="vc-btn gold">👋 Say hi</button><button class="vc-btn">🚪 Visit</button>`));
    } else if (l) {
      const lm = LAND.find((x) => x.name === l.dataset.land);
      card(`<b>${lm.locked ? "🔒 " : "📍 "}${esc(lm.name)}</b><p>${lm.locked ? "Unlocks later in the story." : "Go here to meet characters and start a scene."}</p>${lm.locked ? "" : `<button class="vc-btn gold">▶ Go</button>`}`);
    }
  }

  function enableDrag() {
    const st = root.querySelector(".vc-stage");
    let d = null, moved = false;
    const pt = (e) => { const t = e.touches ? e.touches[0] : e; return root.classList.contains("rot") ? { x: t.clientY, y: window.innerWidth - t.clientX } : { x: t.clientX, y: t.clientY }; };
    const down = (e) => { if (e.touches && e.touches.length > 1) return; d = pt(e); d.vx = view.x; d.vy = view.y; moved = false; };
    const move = (e) => { if (!d) return; const p = pt(e); const dx = p.x - d.x, dy = p.y - d.y; if (Math.abs(dx) + Math.abs(dy) > 6) moved = true; view.x = d.vx + dx; view.y = d.vy + dy; apply(); if (e.cancelable) e.preventDefault(); };
    const up = (e) => { if (d && !moved) onTap(e); d = null; };
    st.addEventListener("mousedown", down); window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    st.addEventListener("touchstart", down, { passive: true }); st.addEventListener("touchmove", move, { passive: false }); st.addEventListener("touchend", up);
    st.addEventListener("wheel", (e) => { view.z = Math.min(1.2, Math.max(0.3, view.z * (e.deltaY < 0 ? 1.1 : 0.9))); apply(); }, { passive: true });
  }

  function orient() {
    // Rotate to landscape when the phone is held upright.
    root.classList.toggle("rot", window.innerHeight > window.innerWidth);
  }

  function open(opts) {
    data = opts;
    const tg = window.Telegram?.WebApp;
    try { if (tg?.isVersionAtLeast?.("8.0")) { tg.requestFullscreen?.(); tg.lockOrientation?.(); } } catch {}
    root?.remove();
    root = document.createElement("div");
    root.className = "vc";
    root.innerHTML = `<div class="vc-stage"><div class="vc-world"></div></div>
      <div class="vc-hud">
        <span class="vc-pill">☀️ Day 1</span><span class="vc-pill">💵 $0</span><span class="vc-pill" id="vc-count"></span>
        <span class="vc-sp-fill"></span>
        <span class="vc-dist hidden"><button class="vc-ic sm" id="vc-prev">◀</button><span class="vc-pill" id="vc-dname"></span><button class="vc-ic sm" id="vc-next">▶</button></span>
        <button class="vc-ic" id="vc-home" title="My house">🏠</button><button class="vc-ic">❤️</button><button class="vc-ic">🎁</button><button class="vc-ic" id="vc-x" title="Close">✕</button>
      </div>
      <div class="vc-card hidden" id="vc-card"></div>`;
    document.body.appendChild(root);
    world = root.querySelector(".vc-world");
    orient(); render(); enableDrag();
    setTimeout(focusMine, 30);
    root.querySelector("#vc-home").addEventListener("click", () => { if (data.me == null && opts.load) opts.load(data.myDistrict); else focusMine(); });
    root.querySelector("#vc-x").addEventListener("click", close);
    if (opts.load && data.districts > 1) {
      root.querySelector(".vc-dist").classList.remove("hidden");
      root.querySelector("#vc-dname").textContent = `🏘️ ${data.district + 1}/${data.districts}`;
      root.querySelector("#vc-prev").addEventListener("click", () => opts.load((data.district - 1 + data.districts) % data.districts));
      root.querySelector("#vc-next").addEventListener("click", () => opts.load((data.district + 1) % data.districts));
    }
    root.querySelector("#vc-card").addEventListener("click", (e) => { if (e.target.closest("[data-x]")) e.currentTarget.classList.add("hidden"); });
    if (!resizeHooked) { resizeHooked = true; window.addEventListener("resize", () => { if (root) { orient(); focusMine(); } }); }
  }
  let resizeHooked = false;

  function close() {
    root?.remove(); root = null;
    const tg = window.Telegram?.WebApp;
    try { tg?.unlockOrientation?.(); if (!document.querySelector(".vn")) tg?.exitFullscreen?.(); } catch {}
  }
  function toast(msg) {
    let t = document.getElementById("vc-toast");
    if (!t) { t = document.createElement("div"); t.id = "vc-toast"; t.className = "vc-toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.remove("hidden"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.add("hidden"), 2600);
  }

  // Real map from the server: your house is claimed on the first visit.
  async function play() {
    const tg = window.Telegram?.WebApp;
    const API = ((window.VIDEOSPACE_CONFIG || {}).VIP_API_URL || "").replace(/\/$/, "");
    if (!tg?.initData) { toast("Open this game inside Telegram."); return; }
    let busy = false;
    const load = async (d) => {
      if (busy) return; busy = true;
      document.body.classList.add("vc-loading");
      try {
        const r = await fetch(API + "/api/city/map" + (d == null ? "" : "?d=" + d), { headers: { "X-Telegram-Init-Data": tg.initData } });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || "City is temporarily unavailable.");
        open({ ...j, load });
      } catch (e) {
        toast(navigator.onLine === false ? "📡 Network error. Check your internet." : (e.message || "Error"));
      } finally { busy = false; document.body.classList.remove("vc-loading"); }
    };
    await load(null);
  }

  window.VipCity = { open, play, close, PLOTS };
})();
