/*
  VIP City (Fix 57: enter your own house — living room + bedroom, new icon HUD). One painted town map (city-assets/map4.webp, 2752x1536) with player houses on top.
  - Every Telegram player owns one plot. A house (home.webp) is drawn on its plot with the player's name.
  - Landscape: requestFullscreen; lockOrientation only after the phone is really sideways (so Telegram buttons sit on the long edge). Upright phones get a hint and a CSS 90° rotation as fallback.
  - Data: GET /api/city/map -> { me, district, districts, myDistrict, houses: [{ id, name, plot }] }  (plot 0..11)
  - window.VipCity.open({ me, houses }) takes mock data (demo); VipCity.play() loads the real map.
*/
(function () {
  const MW = 2752, MH = 1536, OX = 688, OY = 384; // map4 = map3 with bigger lawns, no railway (metro), seam fixed
  const ASSET = (window.VIP_CITY_ASSETS || "city-assets/");
  // Plot order = closest to the neighbourhood centre first (same order as before, so saved plots keep their lawn).
  const PLOTS = [[1394,853,83],[1470,820,83],[1318,888,87],[1471,894,85],[1316,770,106],[1546,859,82],[1396,930,85],[1542,788,83],[1206,822,105],[1222,722,101],[1617,826,81],[1114,773,100],[2336,108,130],[2572,120,130],[2468,176,130],[2440,56,128]]; // Fix 63: plots 12-15 are the 4 big lawns (top right) // [x, y, house width]: centre of each enlarged fenced lawn on map4 (map px); width = 85% of the lawn so the house sits inside the fence
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
    { x: 1278, y: 1150, name: "📱 Tech Shop", shop: "tech" },
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
    // Fix 63: empty lots are for sale until you own a house.
    if (data.me == null) {
      const taken = new Set(houses.map((h) => Number(h.plot)));
      PLOTS.forEach((p, i) => {
        if (taken.has(i)) return;
        const pr = price(i), big = i >= BIG_FROM;
        html += `<button class="vc-sale ${big ? "big" : ""}" data-plot="${i}" style="left:${p[0]}px;top:${p[1]}px;z-index:${p[1] + 900}">🏷️ $${pr}${big ? " · Big" : ""}</button>`;
      });
    }
    world.innerHTML = html;
    root.querySelector("#vc-count").textContent = `🏠 ${houses.length}`;
    showCash();
  }

  const BIG_FROM = 12;
  const price = (i) => Number((data.prices || [])[i]) || (i >= BIG_FROM ? 150 : 130);
  function showCash() { const b = root?.querySelector("#vc-cashv"); if (b) b.textContent = "$" + (Number(data.cash) || 0); }
  const API = () => ((window.VIDEOSPACE_CONFIG || {}).VIP_API_URL || "").replace(/\/$/, "");
  async function api(path, body) {
    const tg = window.Telegram?.WebApp;
    const r = await fetch(API() + path, { method: body ? "POST" : "GET", cache: "no-store",
      headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": tg?.initData || "" }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, j };
  }
  async function refresh() {
    if (!opts?.load) return;
    try { const r = await api("/api/city/map"); if (r.ok) { Object.assign(data, r.j); render(); } } catch {}
  }
  function lotCard(i) {
    const pr = price(i), cash = Number(data.cash) || 0, big = i >= BIG_FROM;
    if (data.me != null) { card(`<b>🏡 Lot for sale</b><p>You already have a house.</p>`); return; }
    card(`<b>🏡 ${big ? "Big house lot" : "House lot"}</b><p>${big ? "A wide lawn by the river. " : ""}Price <b>$${pr}</b> · You have <b>$${cash}</b></p>` +
      (cash >= pr ? `<button class="vc-btn gold" data-lot="${i}">🔑 Buy house · $${pr}</button>`
        : `<p class="vc-need">You need $${pr - cash} more.</p><button class="vc-btn gold" data-getcash>💵 Get money</button>`));
  }
  let buying = false;
  async function buyLot(i) {
    if (buying) return; buying = true;
    try {
      if (!opts?.load) { // demo / mock data
        if ((Number(data.cash) || 0) < price(i)) { lotCard(i); return; }
        data.cash -= price(i); data.me = "demo"; data.houses = [...(data.houses || []), { id: "demo", name: "You", plot: i }];
      } else {
        const r = await api("/api/city/buy", { plot: i });
        if (!r.ok) {
          if (r.status === 402) { data.cash = price(i) - (r.j.need || 0); lotCard(i); }
          else if (r.j.error === "TAKEN") { toast("Someone just bought this lot. Pick another one."); await refresh(); root.querySelector("#vc-card").classList.add("hidden"); }
          else toast(r.j.error === "HAS_HOUSE" ? "You already have a house." : "Buying failed. Try again.");
          return;
        }
        Object.assign(data, r.j);
      }
      root.querySelector("#vc-card").classList.add("hidden");
      render(); focusMine();
      try { window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success"); } catch {}
      toast("🎉 Your new house! Tap it to go inside.");
    } catch { toast("📡 Network error. Check your internet."); }
    finally { buying = false; }
  }
  let packs = null;
  async function openCash() {
    const cash = Number(data.cash) || 0, left = data.adLeft ?? 10, ad = data.adCash || 5;
    card(`<b>💵 Get money</b><p>You have <b>$${cash}</b>. Money is used for houses and items.</p>
      <button class="vc-btn gold" data-adcash ${left <= 0 ? "disabled" : ""}>📺 Watch ad: +$${ad} (free)${left <= 0 ? " · come back tomorrow" : ` · ${left} left today`}</button>
      <div class="vc-packs" id="vc-packs"><span class="vc-dots">…</span></div>`);
    if (!packs) { try { const r = await api("/api/city/cash-packs"); packs = r.ok && Array.isArray(r.j.packs) ? r.j.packs : []; } catch { packs = []; } }
    const box = root?.querySelector("#vc-packs"); if (!box) return;
    box.innerHTML = packs.map((p) => `<button class="vc-pack" data-pack="${esc(p.id)}"><b>$${p.cash}</b><span>${p.stars} ⭐</span></button>`).join("") || "";
  }
  async function buyPack(id) {
    const tg = window.Telegram?.WebApp;
    if (!tg?.openInvoice) { toast("Payment not available here."); return; }
    try {
      const r = await api("/api/city/cash-checkout", { packId: id });
      if (!r.ok || !r.j.invoiceLink) { toast("Payment not completed."); return; }
      tg.openInvoice(r.j.invoiceLink, (status) => {
        if (status === "paid") {
          toast("💵 Money added!"); root?.querySelector("#vc-card")?.classList.add("hidden");
          setTimeout(refresh, 1500); setTimeout(refresh, 4500);
        } else if (status === "failed") toast("Payment not completed.");
      });
    } catch { toast("📡 Network error. Check your internet."); }
  }
  document.addEventListener("csl-ad-reward", (e) => {
    const d = e.detail || {}; if (d.game !== "city" || !root) return;
    if (d.cash != null) data.cash = Number(d.cash); else data.cash = (Number(data.cash) || 0) + (Number(d.bonus) || 5);
    if (d.left != null) data.adLeft = Number(d.left);
    showCash(); toast(`💵 +$${d.bonus || 5}! You have $${data.cash}.`);
  });

  // Shops in town. Items are bought here, then used at home.
  const SHOPS = {
    tech: { name: "📱 Tech Shop", info: "Computers, phones and gadgets.", items: [
      { id: "pc", icon: "💻", name: "Computer", price: 500 },
      { id: "phone", icon: "📱", name: "Phone", price: 300 },
      { id: "tablet", icon: "📲", name: "Tablet", price: 250 },
      { id: "headphones", icon: "🎧", name: "Headphones", price: 80 } ] }
  };
  function focusAt(x, y) {
    const { W, H } = box();
    view.z = Math.max(minZ() * 1.35, 0.9);
    view.x = W / 2 - x * view.z; view.y = H / 2 - y * view.z;
    apply();
  }
  function openShop(id) {
    const sh = SHOPS[id]; if (!sh) return;
    const own = owned();
    card(`<b>${esc(sh.name)}</b><p>${esc(sh.info)} · You have <b>$${Number(data.cash) || 0}</b></p><div class="vc-shop">` +
      sh.items.map((it) => `<div class="vc-item"><span class="ic">${it.icon}</span><span class="nm">${esc(it.name)}<small>$${it.price}</small></span>` +
        (own[it.id] ? `<span class="own">✓ Owned</span>` : `<button class="vc-btn gold sm" data-buy="${it.id}">Buy</button>`) + `</div>`).join("") + `</div>`);
  }
  function goShop(id) {
    const lm = LAND.find((x) => x.shop === id); if (!lm) return;
    if (room) { switching = false; leaveRoom(); }
    focusAt(lm.x, lm.y); openShop(id);
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
    const h = e.target.closest?.("[data-h]"), l = e.target.closest?.("[data-land]"), lot = e.target.closest?.("[data-plot]");
    if (lot) { lotCard(Number(lot.dataset.plot)); return; }
    if (h) {
      const house = data.houses.find((x) => String(x.id) === h.dataset.h); if (!house) return;
      const me = String(house.id) === String(data.me);
      card(`<b>${me ? "👑 " : "🏠 "}${esc(house.name)}${me ? " (You)" : ""}</b><p>${me ? "This is your house. Decorate it and invite friends." : "A neighbour from Telegram."}</p>` +
        (me ? `<button class="vc-btn gold" data-enter>🚪 Enter my house</button>` : `<button class="vc-btn gold">👋 Say hi</button><button class="vc-btn">🚪 Visit</button>`));
    } else if (l) {
      const lm = LAND.find((x) => x.name === l.dataset.land);
      if (lm.shop) { openShop(lm.shop); return; }
      card(`<b>${lm.locked ? "🔒 " : "📍 "}${esc(lm.name)}</b><p>${lm.locked ? "Unlocks later in the story." : "Go here to meet characters and start a scene."}</p>${lm.locked ? "" : `<button class="vc-btn gold">▶ Go</button>`}`);
    }
  }


  // ---- Inside your own house (Fix 57). Arrow spots are in image % (x, y) on the 1376x768 room art. ----
  const RW = 1376, RH = 768;
  const ROOMS = {
    living: { img: "room_living.webp", name: "Living room", arrows: [
      { x: 54, y: 57, dir: "up", go: "kitchen", label: "Kitchen" },
      { x: 88, y: 62, dir: "right", go: "bed", label: "Bedroom" },
      { x: 42, y: 84, dir: "down", act: "out", label: "Go out" } ] },
    kitchen: { img: "room_kitchen.webp", name: "Kitchen", arrows: [
      { x: 50, y: 88, dir: "down", go: "living", label: "Living room" },
      { x: 49, y: 58, dir: "up", go: "pool", label: "Pool" } ] },
    pool: { img: "room_pool.webp", name: "Pool", arrows: [
      { x: 6, y: 55, dir: "left", go: "kitchen", label: "Kitchen" } ],
      // Free spots (no shop): tap a lounger to sit.
      spots: [ { id: "lounger1", free: true, x: 60, y: 62, w: 20, h: 14, icon: "🏖️", name: "Sun lounger", info: "Lie back and enjoy the sun by the pool." },
        { id: "lounger2", free: true, x: 70, y: 72, w: 26, h: 16, icon: "🏖️", name: "Sun lounger", info: "Lie back and enjoy the sun by the pool." } ] },
    // Hallway (Fix 68): between the bedroom and the living room.
    hall: { img: "room_hall.webp", name: "Hallway", arrows: [
      { x: 18, y: 62, dir: "left", go: "living", label: "Living room" },
      { x: 50, y: 50, dir: "up", act: "out", label: "Outside" },
      { x: 68, y: 52, dir: "right", go: "bath", label: "Bathroom" },
      { x: 85, y: 55, dir: "right", go: "bed", label: "My room" } ] },
    bath: { img: "room_bath.webp", name: "Bathroom", arrows: [
      { x: 6, y: 58, dir: "left", go: "hall", label: "Hallway" } ] },
    bed: { img: "room_bed.webp", name: "Bedroom", arrows: [
      { x: 93, y: 50, dir: "right", go: "hall", label: "Hallway" } ],
      // Tappable furniture (box in image %). Items must be bought before use.
      spots: [ { id: "pc", x: 62, y: 51, w: 25, h: 31, icon: "💻", name: "Computer", shop: "tech",
        info: "You don't have a computer yet. Buy one at the 📱 Tech Shop in town, then use it here." } ] }
  };
  // Keep arrows away from the screen edges (phone gesture bar, notch) so taps always land.
  const SAFE = 72;
  const imgCache = {};
  function preload(name) {
    if (!imgCache[name]) { const im = new Image(); im.src = ASSET + name; imgCache[name] = im.decode ? im.decode().catch(() => {}) : Promise.resolve(); }
    return imgCache[name];
  }
  function layoutRoom() {
    const el = root?.querySelector("#vc-room"); if (!el || !room) return;
    const { W, H } = box(), k = Math.max(W / RW, H / RH), w = RW * k, h = RH * k, ox = (W - w) / 2, oy = (H - h) / 2;
    const rb = el.querySelector(".vc-rbox"); rb.style.cssText = `width:${w}px;height:${h}px;left:${ox}px;top:${oy}px`;
    el.querySelectorAll(".vc-arrow").forEach((a) => {
      const x = Math.min(W - SAFE, Math.max(SAFE, ox + w * a.dataset.x / 100)), y = Math.min(H - SAFE, Math.max(96, oy + h * a.dataset.y / 100));
      a.style.left = x + "px"; a.style.top = y + "px";
    });
  }
  let switching = false;
  async function enterRoom(id) {
    const r = ROOMS[id]; if (!r || !root || switching) return;
    switching = true;
    const el = root.querySelector("#vc-room"), rb = el.querySelector(".vc-rbox"), arrows = el.querySelector(".vc-arrows");
    const first = el.classList.contains("hidden");
    root.querySelector("#vc-card").classList.add("hidden");
    arrows.classList.add("off");
    await preload(r.img);
    if (!root) { switching = false; return; }
    room = id;
    // Cross-fade: the new picture fades in on top of the old one, so the city map never shows through.
    const img = document.createElement("img");
    img.className = "vc-rimg in"; img.alt = ""; img.draggable = false; img.src = ASSET + r.img;
    rb.appendChild(img);
    if (first) { el.classList.remove("hidden"); root.classList.add("in-room"); }
    arrows.innerHTML = r.arrows.map((a, i) =>
      `<button class="vc-arrow ${a.dir}" data-i="${i}" data-x="${a.x}" data-y="${a.y}" title="${esc(a.label)}"><span></span><em>${esc(a.label)}</em></button>`).join("");
    rb.querySelectorAll(".vc-spot").forEach((x) => x.remove());
    (r.spots || []).forEach((sp, i) => {
      const b = document.createElement("button");
      b.className = "vc-spot"; b.dataset.s = i; b.title = sp.name;
      b.style.cssText = `left:${sp.x}%;top:${sp.y}%;width:${sp.w}%;height:${sp.h}%`;
      b.innerHTML = `<i>${sp.free ? sp.icon : "🔒"}</i>`; if (sp.free) b.classList.add("free");
      rb.appendChild(b);
    });
    layoutRoom();
    requestAnimationFrame(() => requestAnimationFrame(() => img.classList.remove("in")));
    setTimeout(() => {
      rb.querySelectorAll(".vc-rimg").forEach((x) => { if (x !== img) x.remove(); });
      arrows.classList.remove("off"); switching = false;
    }, 320);
    Object.values(ROOMS).forEach((x) => preload(x.img));
  }
  function leaveRoom() {
    if (switching) return;
    room = null; root?.classList.remove("in-room"); root?.querySelector("#vc-card")?.classList.add("hidden");
    const el = root?.querySelector("#vc-room");
    if (el) { el.classList.add("hidden"); el.querySelector(".vc-rbox").innerHTML = ""; el.querySelector(".vc-arrows").innerHTML = ""; }
    focusMine();
  }
  const owned = () => { try { return JSON.parse(localStorage.getItem("vc_items") || "{}"); } catch { return {}; } };
  function onRoomTap(e) {
    const sp = e.target.closest(".vc-spot");
    if (sp && room && !switching) {
      const it = ROOMS[room].spots[Number(sp.dataset.s)];
      if (it.free) { card(`<b>${it.icon} ${esc(it.name)}</b><p>${esc(it.info)}</p><button class="vc-btn gold" data-sit="${esc(it.id)}">😌 Sit &amp; relax</button>`); return; }
      if (owned()[it.id]) { toast(it.icon + " " + it.name + " — coming soon"); return; }
      card(`<b>${it.icon} ${esc(it.name)} 🔒</b><p>${esc(it.info)}</p>` +
        `<button class="vc-btn gold" data-shop="${it.shop}">🗺️ Go to Tech Shop</button>`);
      return;
    }
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

  // Telegram draws its own Close/menu buttons at the top of the REAL screen. To put them on the long
  // edge the phone must really be in landscape, so we only lock orientation once the phone is sideways.
  let oriLocked = false, hintT = 0;
  // Time of day follows the phone clock; the day counter starts at 1 on the first visit and goes up by itself.
  const TOD = [ { id: "night", name: "Night", from: 0 }, { id: "morning", name: "Morning", from: 5 },
    { id: "afternoon", name: "Afternoon", from: 12 }, { id: "evening", name: "Evening", from: 17 }, { id: "night", name: "Night", from: 20 } ];
  function tod() { const h = new Date().getHours(); let t = TOD[0]; TOD.forEach((x) => { if (h >= x.from) t = x; }); return t; }
  function dayNo() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let d0 = Number(localStorage.getItem("vc_day0"));
    if (!d0) { d0 = today.getTime(); try { localStorage.setItem("vc_day0", String(d0)); } catch {} }
    return Math.max(1, Math.round((today.getTime() - d0) / 864e5) + 1);
  }
  let clockT = 0;
  function tickClock() {
    if (!root) return;
    const t = tod(), img = root.querySelector("#vc-tod"), b = root.querySelector("#vc-day");
    if (img && !img.src.endsWith(t.id + ".webp")) img.src = ASSET + "tod/" + t.id + ".webp";
    if (b) b.textContent = "Day " + dayNo();
    root.dataset.tod = t.id;
  }
  // Portrait = the game is blocked by a full-screen "turn your phone" card (only Exit works).
  function rotHint(show) {
    let h = document.getElementById("vc-rothint");
    if (!show) { h?.remove(); return; }
    if (h) return;
    h = document.createElement("div"); h.id = "vc-rothint"; h.className = "vc-rotblock";
    h.innerHTML = `<div class="vc-rb-card"><div class="vc-rb-ico">📱</div><b>Turn your phone sideways</b><small>Turn on auto-rotate if the screen doesn't turn.</small></div><button type="button" id="vc-rb-x" aria-label="Close">✕</button>`;
    h.querySelector("#vc-rb-x").onclick = () => { try { close(); } catch {} };
    document.body.appendChild(h);
  }
  function orient() {
    const port = window.innerHeight > window.innerWidth;
    root.classList.remove("rot");
    // In Telegram fullscreen landscape the HUD sits in Telegram's own top bar, between Close and the menu buttons.
    const ct = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tg-content-safe-area-inset-top")) || 0;
    root.classList.toggle("tgbar", !port && ct > 20);
    if (port) { rotHint(true); return; }
    rotHint(false);
    if (!oriLocked) {
      try { const tg = window.Telegram?.WebApp; if (tg?.isVersionAtLeast?.("8.0")) { tg.lockOrientation?.(); oriLocked = true; } } catch {}
    }
  }

  function open(o) {
    opts = o; data = o; oriLocked = false;
    const tg = window.Telegram?.WebApp;
    try { if (tg?.isVersionAtLeast?.("8.0")) { tg.requestFullscreen?.(); tg.unlockOrientation?.(); } } catch {}
    root?.remove();
    root = document.createElement("div");
    root.className = "vc";
    root.innerHTML = `<div class="vc-stage"><div class="vc-world"></div></div>
      <div class="vc-room hidden" id="vc-room"><div class="vc-rbox"></div><div class="vc-arrows"></div></div>
      <div class="vc-hud">
        <span class="vc-pill2 day" id="vc-daypill"><img id="vc-tod" src="${ASSET}tod/${tod().id}.webp" alt=""><b id="vc-day">Day ${dayNo()}</b></span>
        <span class="vc-pill2 cash"><img src="${ASSET}hud/cash.webp" alt=""><b id="vc-cashv">$0</b><button class="vc-plus" id="vc-cash">+</button></span>
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
    tickClock(); clearInterval(clockT); clockT = setInterval(tickClock, 60000);
    root.querySelector("#vc-daypill").addEventListener("click", () => { const t = tod(); toast(`${t.name} · Day ${dayNo()}`); });
    try { const tg = window.Telegram?.WebApp; if (!tgHooked && tg?.onEvent) { tgHooked = true; ["fullscreenChanged", "contentSafeAreaChanged", "safeAreaChanged"].forEach((ev) => tg.onEvent(ev, () => root && orient())); } } catch {}
    setTimeout(focusMine, 30);
    if (data.me == null) setTimeout(() => toast("🏡 Buy an empty lot to get your own house!"), 600);
    root.querySelector("#vc-home").addEventListener("click", () => { if (room) { leaveRoom(); return; } if (data.me == null) toast("🏷️ Pick an empty lot to buy your house."); focusMine(); });
    root.querySelector("#vc-love").addEventListener("click", () => toast("❤️ Love meter — coming soon"));
    root.querySelector("#vc-gift").addEventListener("click", () => toast("🎁 Gifts — coming soon"));
    root.querySelector("#vc-cash").addEventListener("click", openCash);
    root.querySelector(".vc-pill2.cash").addEventListener("click", (e) => { if (e.target.id !== "vc-cash") openCash(); });
    root.querySelector("#vc-set").addEventListener("click", () => card(`<b>⚙️ Settings</b><p>More options are coming soon.</p><button class="vc-btn gold" data-exit>🚪 Exit VIP City</button>`));
    root.querySelector("#vc-room").addEventListener("click", onRoomTap);
    Object.values(ROOMS).forEach((x) => preload(x.img));
    root.querySelector("#vc-x").addEventListener("click", close);
    if (opts.load && data.districts > 1) {
      root.querySelector(".vc-dist").classList.remove("hidden");
      root.querySelector("#vc-dname").textContent = `🏘️ ${data.district + 1}/${data.districts}`;
      root.querySelector("#vc-prev").addEventListener("click", () => opts.load((data.district - 1 + data.districts) % data.districts));
      root.querySelector("#vc-next").addEventListener("click", () => opts.load((data.district + 1) % data.districts));
    }
    root.querySelector("#vc-card").addEventListener("click", (e) => { if (e.target.closest("[data-x]")) e.currentTarget.classList.add("hidden"); if (e.target.closest("[data-exit]")) close(); const gs = e.target.closest("[data-shop]"); if (gs) { goShop(gs.dataset.shop); return; } if (e.target.closest("[data-buy]")) { toast("💵 Items can be bought soon."); return; } if (e.target.closest("[data-sit]")) { e.currentTarget.classList.add("hidden"); toast("☀️ You relax on the sun lounger. More pool fun coming soon!"); return; } const lt = e.target.closest("[data-lot]"); if (lt) { buyLot(Number(lt.dataset.lot)); return; } if (e.target.closest("[data-getcash]")) { openCash(); return; } const ac = e.target.closest("[data-adcash]"); if (ac && !ac.disabled) { e.currentTarget.classList.add("hidden"); window.CSLAds?.reward ? window.CSLAds.reward("city", "en") : toast("No ad available right now."); return; } const pk = e.target.closest("[data-pack]"); if (pk) { buyPack(pk.dataset.pack); return; } if (e.target.closest("[data-enter]")) { e.currentTarget.classList.add("hidden"); enterRoom("living"); } });
    if (!resizeHooked) { resizeHooked = true; window.addEventListener("resize", () => { if (root) { orient(); focusMine(); if (room) layoutRoom(); } }); }
  }
  let resizeHooked = false, tgHooked = false;

  function close() {
    room = null; root?.remove(); root = null;
    const tg = window.Telegram?.WebApp;
    rotHint(false); oriLocked = false; clearInterval(clockT);
    try { tg?.unlockOrientation?.(); if (!document.querySelector(".vn")) tg?.exitFullscreen?.(); } catch {}
  }
  function toast(msg) {
    let t = document.getElementById("vc-toast");
    if (!t) { t = document.createElement("div"); t.id = "vc-toast"; t.className = "vc-toast"; }
    (root || document.body).appendChild(t);
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
