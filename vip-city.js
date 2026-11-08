/*
  VIP City (Fix 57: enter your own house — living room + bedroom, new icon HUD). One painted town map (city-assets/map4.webp, 2752x1536) with player houses on top.
  - Every Telegram player owns one plot. A house (home.webp) is drawn on its plot with the player's name.
  - Auto landscape: requestFullscreen + lockOrientation; if the phone is upright the game is rotated 90° with CSS.
  - Data: GET /api/city/map -> { me, district, districts, myDistrict, houses: [{ id, name, plot }] }  (plot 0..11)
  - window.VipCity.open({ me, houses }) takes mock data (demo); VipCity.play() loads the real map.
*/
(function () {
  const MW = 2752, MH = 1536, OX = 688, OY = 384; // map4 = map3 with bigger lawns, no railway (metro), seam fixed
  const ASSET = (window.VIP_CITY_ASSETS || "city-assets/");
  // Plot order = closest to the neighbourhood centre first (same order as before, so saved plots keep their lawn).
  const PLOTS = [[1394,853,83],[1470,820,83],[1318,888,87],[1471,894,85],[1316,770,106],[1546,859,82],[1396,930,85],[1542,788,83],[1206,822,105],[1222,722,101],[1617,826,81],[1114,773,100]]; // [x, y, house width]: centre of each enlarged fenced lawn on map4 (map px); width = 85% of the lawn so the house sits inside the fence
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
    { x: 1850, y: 600, name: "Ⓜ️ Metro", locked: true },
    { x: 750, y: 70, name: "Hospital", locked: true },
    { x: 1590, y: 1165, name: "Stadium", locked: true },
    { x: 150, y: 590, name: "Lighthouse", locked: true }
  ];
  const TINTS = [0, -14, 14, -26, 26, -7, 7]; // small hue shifts keep the roof warm and the lawn green
  const hue = (id) => { let h = 0; String(id).split("").forEach((ch) => (h = (h * 31 + ch.charCodeAt(0)) % 360)); return h; };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  let room = null, root = null, world = null, view = { x: 0, y: 0, z: 1 }, data = null, opts = null;

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
    let html = `<img class="vc-map" src="${ASSET}map4.webp" alt="" draggable="false">`;
    LAND.forEach((l) => {
      html += `<button class="vc-tag ${l.locked ? "locked" : ""}" data-land="${esc(l.name)}" style="left:${l.x}px;top:${l.y}px">${l.locked ? "🔒 " : ""}${esc(l.name)}</button>`;
    });
    houses.forEach((h) => {
      const p = PLOTS[Number(h.plot) % PLOTS.length]; if (!p) return; const HOUSE_W = p[2];
      const [x, y] = p, me = String(h.id) === String(data.me);
      html += `<img class="vc-house ${me ? "me" : ""}" data-h="${esc(h.id)}" src="${ASSET}home.webp" alt="" draggable="false" style="left:${x - HOUSE_W / 2}px;top:${y - HOUSE_W * 0.52}px;width:${HOUSE_W}px;z-index:${y};filter:hue-rotate(${me ? 0 : TINTS[hue(h.id) % TINTS.length]}deg) drop-shadow(0 3px 3px rgba(0,0,0,.3))${me ? " drop-shadow(0 0 8px #ffd166)" : ""}">`;
      html += `<button class="vc-name ${me ? "me" : ""}" data-h="${esc(h.id)}" style="left:${x}px;top:${y - HOUSE_W * 0.5}px;z-index:${y + 1000}">${me ? "👑 " : ""}${esc(h.name)}</button>`;
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
        (me ? `<button class="vc-btn gold" data-enter>🚪 Enter my house</button>` : `<button class="vc-btn gold">👋 Say hi</button><button class="vc-btn">🚪 Visit</button>`));
    } else if (l) {
      const lm = LAND.find((x) => x.name === l.dataset.land);
      card(`<b>${lm.locked ? "🔒 " : "📍 "}${esc(lm.name)}</b><p>${lm.locked ? "Unlocks later in the story." : "Go here to meet characters and start a scene."}</p>${lm.locked ? "" : `<button class="vc-btn gold">▶ Go</button>`}`);
    }
  }


  // ---- Inside your own house (Fix 57). Arrow spots are in image % (x, y) on the 1376x768 room art. ----
  const RW = 1376, RH = 768;
  const ROOMS = {
    living: { img: "room_living.webp", name: "Living room", arrows: [
      { x: 54, y: 57, dir: "up", act: "soon", label: "Kitchen" },
      { x: 96, y: 66, dir: "right", go: "bed", label: "Bedroom" },
      { x: 50, y: 93, dir: "down", act: "out", label: "Go out" } ] },
    bed: { img: "room_bed.webp", name: "Bedroom", arrows: [
      { x: 92, y: 56, dir: "right", go: "living", label: "Living room" } ] }
  };
  function layoutRoom() {
    const el = root?.querySelector("#vc-room"); if (!el || !room) return;
    const { W, H } = box(), k = Math.max(W / RW, H / RH), w = RW * k, h = RH * k, ox = (W - w) / 2, oy = (H - h) / 2;
    const rb = el.querySelector(".vc-rbox"); rb.style.cssText = `width:${w}px;height:${h}px;left:${ox}px;top:${oy}px`;
    el.querySelectorAll(".vc-arrow").forEach((a) => {
      const x = Math.min(W - 40, Math.max(40, ox + w * a.dataset.x / 100)), y = Math.min(H - 42, Math.max(90, oy + h * a.dataset.y / 100));
      a.style.left = x + "px"; a.style.top = y + "px";
    });
  }
  function enterRoom(id) {
    const r = ROOMS[id]; if (!r || !root) return;
    room = id;
    const el = root.querySelector("#vc-room");
    el.classList.remove("hidden"); el.classList.remove("fade"); void el.offsetWidth; el.classList.add("fade");
    el.querySelector(".vc-rimg").src = ASSET + r.img;
    el.querySelector(".vc-arrows").innerHTML = r.arrows.map((a, i) =>
      `<button class="vc-arrow ${a.dir}" data-i="${i}" data-x="${a.x}" data-y="${a.y}" title="${esc(a.label)}"><span></span><em>${esc(a.label)}</em></button>`).join("");
    root.classList.add("in-room");
    root.querySelector("#vc-card").classList.add("hidden");
    layoutRoom();
  }
  function leaveRoom() {
    room = null; root?.classList.remove("in-room");
    root?.querySelector("#vc-room")?.classList.add("hidden");
    focusMine();
  }
  function onRoomTap(e) {
    const b = e.target.closest(".vc-arrow"); if (!b || !room) return;
    const a = ROOMS[room].arrows[Number(b.dataset.i)];
    if (a.go) enterRoom(a.go); else if (a.act === "out") leaveRoom(); else toast("🍳 " + a.label + " — coming soon");
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
      <div class="vc-room hidden" id="vc-room"><div class="vc-rbox"><img class="vc-rimg" alt="" draggable="false"></div><div class="vc-arrows"></div></div>
      <div class="vc-hud">
        <span class="vc-pill2 day"><img src="${ASSET}hud/sun.webp" alt=""><b>▶▶ DAY 1</b></span>
        <span class="vc-pill2 cash"><img src="${ASSET}hud/cash.webp" alt=""><b>$0</b><button class="vc-plus" id="vc-cash">+</button></span>
        <span class="vc-pill sm" id="vc-count"></span>
        <span class="vc-sp-fill"></span>
        <span class="vc-dist hidden"><button class="vc-ic sm" id="vc-prev">◀</button><span class="vc-pill" id="vc-dname"></span><button class="vc-ic sm" id="vc-next">▶</button></span>
        <button class="vc-icon" id="vc-home" title="Map"><img src="${ASSET}hud/map.webp" alt=""></button>
        <button class="vc-icon" id="vc-love" title="Love"><img src="${ASSET}hud/heart.webp" alt=""></button>
        <button class="vc-icon" id="vc-gift" title="Gifts"><img src="${ASSET}hud/gift.webp" alt=""></button>
        <button class="vc-icon" id="vc-set" title="Settings"><img src="${ASSET}hud/gear.webp" alt=""></button>
        <button class="vc-ic sm x" id="vc-x" title="Close">✕</button>
      </div>
      <div class="vc-card hidden" id="vc-card"></div>`;
    document.body.appendChild(root);
    world = root.querySelector(".vc-world");
    world.style.width = MW + "px"; world.style.height = MH + "px";
    orient(); render(); enableDrag();
    setTimeout(focusMine, 30);
    root.querySelector("#vc-home").addEventListener("click", () => { if (room) { leaveRoom(); return; } if (data.me == null && opts.load) opts.load(data.myDistrict); else focusMine(); });
    root.querySelector("#vc-love").addEventListener("click", () => toast("❤️ Love meter — coming soon"));
    root.querySelector("#vc-gift").addEventListener("click", () => toast("🎁 Gifts — coming soon"));
    root.querySelector("#vc-cash").addEventListener("click", () => toast("💵 Earn money in the story — coming soon"));
    root.querySelector("#vc-set").addEventListener("click", () => card(`<b>⚙️ Settings</b><p>More options are coming soon.</p><button class="vc-btn gold" data-exit>🚪 Exit VIP City</button>`));
    root.querySelector("#vc-room").addEventListener("click", onRoomTap);
    root.querySelector("#vc-x").addEventListener("click", close);
    if (opts.load && data.districts > 1) {
      root.querySelector(".vc-dist").classList.remove("hidden");
      root.querySelector("#vc-dname").textContent = `🏘️ ${data.district + 1}/${data.districts}`;
      root.querySelector("#vc-prev").addEventListener("click", () => opts.load((data.district - 1 + data.districts) % data.districts));
      root.querySelector("#vc-next").addEventListener("click", () => opts.load((data.district + 1) % data.districts));
    }
    root.querySelector("#vc-card").addEventListener("click", (e) => { if (e.target.closest("[data-x]")) e.currentTarget.classList.add("hidden"); if (e.target.closest("[data-exit]")) close(); if (e.target.closest("[data-enter]")) { e.currentTarget.classList.add("hidden"); enterRoom("living"); } });
    if (!resizeHooked) { resizeHooked = true; window.addEventListener("resize", () => { if (root) { orient(); focusMine(); if (room) layoutRoom(); } }); }
  }
  let resizeHooked = false;

  function close() {
    room = null; root?.remove(); root = null;
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

  window.VipCity = { open, play, close, enterRoom, leaveRoom, PLOTS };
})();
