/*
  VIP City (Fix 54). One painted town map (city-assets/map.webp, 1376x768) with player houses on top.
  - Every Telegram player owns one plot. A house (home.webp) is drawn on its plot with the player's name.
  - Auto landscape: requestFullscreen + lockOrientation; if the phone is upright the game is rotated 90° with CSS.
  - Data: GET /api/city/map -> { me, district, districts, myDistrict, houses: [{ id, name, plot }] }  (plot 0..11)
  - window.VipCity.open({ me, houses }) takes mock data (demo); VipCity.play() loads the real map.
*/
(function () {
  const MW = 2752, MH = 1536, OX = 688, OY = 384; // map3 = map2 extended on every side; map2 sits at (OX, OY)
  const ASSET = (window.VIP_CITY_ASSETS || "city-assets/");
  // Plot = centre of an empty fenced lawn painted on map2.webp (map pixels). Order = closest to the neighbourhood centre first.
  const PLOTS = [[705,468],[780,438],[630,510],[780,512],[630,385],[855,478],[705,545],[855,405],[520,440],[535,340],[930,445],[425,395]].map(([x, y]) => [x + OX, y + OY]);
  // Landmarks painted on the map: tag position (x, y) above the building.
  const LAND = [
    { x: 918, y: 554, name: "🎓 University" },
    { x: 1858, y: 984, name: "⛲ Park" },
    { x: 420, y: 860, name: "🏖️ Beach" },
    { x: 2670, y: 640, name: "🎡 Fun Park" },
    { x: 1900, y: 100, name: "🏕️ Lake" },
    { x: 1448, y: 584, name: "Villa", locked: true },
    { x: 988, y: 774, name: "Mall", locked: true },
    { x: 1738, y: 846, name: "Hotel", locked: true },
    { x: 1943, y: 714, name: "Gym", locked: true },
    { x: 1950, y: 545, name: "Station", locked: true },
    { x: 750, y: 70, name: "Hospital", locked: true },
    { x: 1590, y: 1165, name: "Stadium", locked: true },
    { x: 150, y: 590, name: "Lighthouse", locked: true }
  ];
  const HOUSE_W = 96;
  const TINTS = [0, -14, 14, -26, 26, -7, 7]; // small hue shifts keep the roof warm and the lawn green
  const hue = (id) => { let h = 0; String(id).split("").forEach((ch) => (h = (h * 31 + ch.charCodeAt(0)) % 360)); return h; };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  let root = null, world = null, view = { x: 0, y: 0, z: 1 }, data = null, opts = null;

  const box = () => {
    const r = root.querySelector(".vc-stage").getBoundingClientRect();
    return root.classList.contains("rot") ? { W: r.height, H: r.width } : { W: r.width, H: r.height };
  };
  const minZ = () => { const { W, H } = box(); return Math.max(W / MW, H / MH); };
  function clamp() {
    const { W, H } = box();
    view.z = Math.min(2.6, Math.max(minZ(), view.z));
    view.x = Math.min(0, Math.max(W - MW * view.z, view.x));
    view.y = Math.min(0, Math.max(H - MH * view.z, view.y));
  }
  function apply() { clamp(); world.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.z})`; }

  function render() {
    const houses = data.houses || [];
    let html = `<img class="vc-map" src="${ASSET}map3.webp" alt="" draggable="false">`;
    LAND.forEach((l) => {
      html += `<button class="vc-tag ${l.locked ? "locked" : ""}" data-land="${esc(l.name)}" style="left:${l.x}px;top:${l.y}px">${l.locked ? "🔒 " : ""}${esc(l.name)}</button>`;
    });
    houses.forEach((h) => {
      const p = PLOTS[Number(h.plot) % PLOTS.length]; if (!p) return;
      const [x, y] = p, me = String(h.id) === String(data.me);
      html += `<img class="vc-house ${me ? "me" : ""}" data-h="${esc(h.id)}" src="${ASSET}home.webp" alt="" draggable="false" style="left:${x - HOUSE_W / 2}px;top:${y - HOUSE_W * 0.62}px;width:${HOUSE_W}px;z-index:${y};filter:hue-rotate(${me ? 0 : TINTS[hue(h.id) % TINTS.length]}deg) drop-shadow(0 3px 3px rgba(0,0,0,.3))${me ? " drop-shadow(0 0 8px #ffd166)" : ""}">`;
      html += `<button class="vc-name ${me ? "me" : ""}" data-h="${esc(h.id)}" style="left:${x}px;top:${y - HOUSE_W * 0.6}px;z-index:${y + 1000}">${me ? "👑 " : ""}${esc(h.name)}</button>`;
    });
    world.innerHTML = html;
    root.querySelector("#vc-count").textContent = `🏠 ${houses.length}`;
  }

  function focusMine() {
    const houses = data.houses || [];
    const mine = houses.find((h) => String(h.id) === String(data.me));
    const p = mine ? PLOTS[Number(mine.plot) % PLOTS.length] : [690 + OX, 460 + OY];
    const { W, H } = box();
    view.z = Math.max(minZ() * 1.35, 0.9);
    view.x = W / 2 - p[0] * view.z;
    view.y = H / 2 - p[1] * view.z;
    apply();
  }

  function card(html) {
    const el = root.querySelector("#vc-card");
    el.innerHTML = html + `<button class="vc-btn ghost" data-x>Close</button>`;
    el.classList.remove("hidden");
  }
  function onTap(e) {
    const h = e.target.closest?.("[data-h]"), l = e.target.closest?.("[data-land]");
    if (h) {
      const house = data.houses.find((x) => String(x.id) === h.dataset.h); if (!house) return;
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
    let d = null, moved = false, pinch = null;
    const pt = (t) => root.classList.contains("rot") ? { x: t.clientY, y: window.innerWidth - t.clientX } : { x: t.clientX, y: t.clientY };
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const down = (e) => {
      if (e.touches && e.touches.length === 2) {
        const a = pt(e.touches[0]), b = pt(e.touches[1]);
        pinch = { d: dist(a, b), z: view.z, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, vx: view.x, vy: view.y }; d = null; moved = true; return;
      }
      const p = pt(e.touches ? e.touches[0] : e); d = { ...p, vx: view.x, vy: view.y }; moved = false;
    };
    const move = (e) => {
      if (pinch && e.touches && e.touches.length === 2) {
        const a = pt(e.touches[0]), b = pt(e.touches[1]);
        const z = Math.min(2.6, Math.max(minZ(), pinch.z * dist(a, b) / pinch.d)), k = z / pinch.z;
        view.z = z; view.x = pinch.cx - (pinch.cx - pinch.vx) * k; view.y = pinch.cy - (pinch.cy - pinch.vy) * k; apply();
        if (e.cancelable) e.preventDefault(); return;
      }
      if (!d) return;
      const p = pt(e.touches ? e.touches[0] : e), dx = p.x - d.x, dy = p.y - d.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
      view.x = d.vx + dx; view.y = d.vy + dy; apply();
      if (e.cancelable) e.preventDefault();
    };
    const up = (e) => { if (d && !moved) onTap(e); d = null; if (!e.touches || !e.touches.length) pinch = null; };
    st.addEventListener("mousedown", down); window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
    st.addEventListener("touchstart", down, { passive: true }); st.addEventListener("touchmove", move, { passive: false }); st.addEventListener("touchend", up);
    st.addEventListener("wheel", (e) => {
      const { W, H } = box(), z = view.z * (e.deltaY < 0 ? 1.1 : 0.9), k = Math.min(2.6, Math.max(minZ(), z)) / view.z;
      view.x = W / 2 - (W / 2 - view.x) * k; view.y = H / 2 - (H / 2 - view.y) * k; view.z *= k; apply();
    }, { passive: true });
  }

  function orient() { root.classList.toggle("rot", window.innerHeight > window.innerWidth); }

  function open(o) {
    opts = o; data = o;
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
    world.style.width = MW + "px"; world.style.height = MH + "px";
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
