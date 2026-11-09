/*
  VIP City (Fix 57: enter your own house — living room + bedroom, new icon HUD). One painted town map (city-assets/map4.webp, 2752x1536) with player houses on top.
  - Every Telegram player owns one plot. A house (home.webp) is drawn on its plot with the player's name.
  - Landscape: requestFullscreen; lockOrientation only after the phone is really sideways (so Telegram buttons sit on the long edge). Upright phones get a hint and a CSS 90° rotation as fallback.
  - Data: GET /api/city/map -> { me, district, districts, myDistrict, houses: [{ id, name, plot }] }  (plot 0..11)
  - window.VipCity.open({ me, houses }) takes mock data (demo); VipCity.play() loads the real map.
*/
(function () {
  const MW = 3440, MH = 2688, OX = 688, OY = 768; // Fix 78: map5 = map4 extended +384 top, +384 bottom city + 384 open sea, +688 right (old coords +384 y). map4 = map3 with bigger lawns, no railway (metro), seam fixed
  const ASSET = (window.VIP_CITY_ASSETS || "city-assets/");
  const AV = "?v=87"; // Fix 78: cache-bust changed art (map, rooms)
  // Plot order = closest to the neighbourhood centre first (same order as before, so saved plots keep their lawn).
  const PLOTS = [[1394,1237,83],[1470,1204,83],[1318,1272,87],[1471,1278,85],[1316,1154,106],[1546,1243,82],[1396,1314,85],[1542,1172,83],[1206,1206,105],[1222,1106,101],[1617,1210,81],[1114,1157,100],[2336,492,130],[2572,504,130],[2468,560,130],[2440,440,128]]; // Fix 63: plots 12-15 are the 4 big lawns (top right) // [x, y, house width]: centre of each enlarged fenced lawn on map4 (map px); width = 85% of the lawn so the house sits inside the fence
  // Landmarks painted on the map: tag position (x, y) above the building.
  const LAND = [
    { x: 918, y: 938, name: "🎓 University" },
    { x: 1858, y: 1368, name: "⛲ Park" },
    { x: 420, y: 1244, name: "🏖️ Beach" },
    { x: 2670, y: 1024, name: "🎡 Fun Park" },
    { x: 1900, y: 484, name: "🏕️ Lake" },
    { x: 1448, y: 968, name: "Villa", locked: true },
    { x: 988, y: 1158, name: "Mall", locked: true },
    { x: 1738, y: 1230, name: "Hotel", locked: true },
    { x: 1943, y: 1098, name: "Gym", locked: true },
    { x: 1850, y: 984, name: "Ⓜ️ Metro", locked: true },
    { x: 750, y: 454, name: "Hospital", locked: true },
    { x: 1590, y: 1549, name: "Stadium", locked: true },
    { x: 1278, y: 1534, name: "📱 Tech Shop", shop: "tech" },
    { x: 150, y: 974, name: "Lighthouse", locked: true },
    { x: 425, y: 862, name: "🎣 Fishing Pier", fish: true } // Fix 77
  ];
  const TINTS = [0, -14, 14, -26, 26, -7, 7]; // small hue shifts keep the roof warm and the lawn green
  const hue = (id) => { let h = 0; String(id).split("").forEach((ch) => (h = (h * 31 + ch.charCodeAt(0)) % 360)); return h; };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  let visiting = null; // Fix 75: {id,name} while inside a neighbour's house
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
    let html = `<img class="vc-map" src="${ASSET}map5.webp${AV}" alt="" draggable="false">`;
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
    // Fix 82: farms — owned fields show the owner, empty ones are for sale until you own one.
    FARMS.forEach((p, i) => {
      const f = (data.farms || []).find((x) => Number(x.farm) === i), mine = f && String(data.myFarm) === String(i);
      if (f) html += `<button class="vc-name farm ${mine ? "me" : ""}" data-farm="${i}" style="left:${p[0]}px;top:${p[1]}px;z-index:${p[1] + 1000}">${mine ? "👑 🌾 My farm" : "🌾 " + esc(f.name)}</button>`;
      else if (data.myFarm == null) html += `<button class="vc-sale farm" data-farm="${i}" style="left:${p[0]}px;top:${p[1]}px;z-index:${p[1] + 900}">🌾 $${farmPrice()}</button>`;
    });
    world.innerHTML = html;
    root.querySelector("#vc-count").textContent = `🏠 ${houses.length}`;
    showCash();
  }

  const BIG_FROM = 12;
  // Fix 82: 6 farm fields on map5 (map px, centre of each fenced field). Order must match the server (CITY_FARMS).
  const FARMS = [[2485,262],[2650,382],[1675,668],[1952,788],[2507,720],[2650,848]];
  const farmPrice = () => Number(data.farmPrice) || 200;
  function farmCard(i) {
    const f = (data.farms || []).find((x) => Number(x.farm) === i), cash = Number(data.cash) || 0, pr = farmPrice();
    if (f) {
      if (String(data.myFarm) === String(i)) { card(`<b>🌾 My farm</b><p>Your own field. Plant wheat, rice, carrots, potatoes, grapes, mangoes and apples, then harvest and sell them for $.</p><button class="vc-btn gold" data-plant>🌱 Plant</button>`); return; }
      card(`<b>🌾 ${esc(f.name)}'s farm</b><p>This field belongs to ${esc(f.name)}.</p>`); return;
    }
    if (data.myFarm != null) { card(`<b>🌾 Farm for sale</b><p>You already have a farm.</p>`); return; }
    card(`<b>🌾 Farm field</b><p>Buy this field, then plant and harvest crops yourself. Price <b>$${pr}</b> · You have <b>$${cash}</b></p>` +
      (cash >= pr ? `<button class="vc-btn gold" data-farmbuy="${i}">🔑 Buy farm · $${pr}</button>`
        : `<p class="vc-need">You need $${pr - cash} more.</p><button class="vc-btn gold" data-getcash>💵 Get money</button>`));
  }
  async function buyFarm(i) {
    if (buying) return; buying = true;
    try {
      if (!opts?.load) {
        if ((Number(data.cash) || 0) < farmPrice()) { farmCard(i); return; }
        data.cash -= farmPrice(); data.myFarm = i; data.farms = [...(data.farms || []), { farm: i, name: "You" }];
      } else {
        const r = await api("/api/city/farm-buy", { farm: i });
        if (!r.ok) {
          if (r.status === 402) { data.cash = farmPrice() - (r.j.need || 0); farmCard(i); }
          else if (r.j.error === "TAKEN") { toast("Someone just bought this farm. Pick another one."); await refresh(); root.querySelector("#vc-card").classList.add("hidden"); }
          else toast(r.j.error === "HAS_FARM" ? "You already have a farm." : "Buying failed. Try again.");
          return;
        }
        Object.assign(data, r.j);
      }
      root.querySelector("#vc-card").classList.add("hidden");
      render();
      try { window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.("success"); } catch {}
      toast("🎉 Your new farm! Tap it to plant.");
    } catch { toast("📡 Network error. Check your internet."); }
    finally { buying = false; }
  }
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
    const h = e.target.closest?.("[data-h]"), l = e.target.closest?.("[data-land]"), lot = e.target.closest?.("[data-plot]"), fm = e.target.closest?.("[data-farm]");
    if (fm) { farmCard(Number(fm.dataset.farm)); return; }
    if (lot) { lotCard(Number(lot.dataset.plot)); return; }
    if (h) {
      const house = data.houses.find((x) => String(x.id) === h.dataset.h); if (!house) return;
      const me = String(house.id) === String(data.me);
      card(`<b>${me ? "👑 " : "🏠 "}${esc(house.name)}${me ? " (You)" : ""}</b><p>${me ? "This is your house. Decorate it and invite friends." : "A neighbour from Telegram."}</p>` +
        (me ? `<button class="vc-btn gold" data-enter>🚪 Enter my house</button>` : `<button class="vc-btn gold" data-hi="${esc(house.name)}">👋 Say hi</button><button class="vc-btn" data-visit="${esc(house.id)}">🚪 Visit</button>`));
    } else if (l) {
      const lm = LAND.find((x) => x.name === l.dataset.land);
      if (lm.shop) { openShop(lm.shop); return; }
      if (lm.fish) { card(`<b>🎣 Fishing Pier</b><p>Cast your line from the wooden pier and catch fish. Rare fish sell for more $.</p><button class="vc-btn gold" data-fish>🎣 Go fishing</button>`); return; }
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
      { x: 50, y: 50, dir: "up", go: "mate", label: "Mate" }, // Fix 83: housemate's room (was Outside)
      { x: 68, y: 52, dir: "right", go: "bath", label: "Bathroom" },
      { x: 85, y: 55, dir: "right", go: "bed", label: "My room" } ] },
    // Fix 83: housemate's room behind the hallway's centre door. Male player -> girl's room, female -> boy's room, gay -> gay room.
    mate: { get img() { const g = (getProfile() || {}).gender; return g === "f" ? "room_boy.webp" : g === "g" ? "room_gay.webp" : "room_girl.webp"; },
      get name() { return mateLabel(); }, arrows: [ { x: 8, y: 55, dir: "left", go: "hall", label: "Hallway" } ],
      spots: [ { id: "mate", mate: true, x: 49, y: 12, w: 18, h: 84, icon: "💬", name: "housemate", info: "" } ] },
    bath: { img: "room_bath.webp", name: "Bathroom", arrows: [
      { x: 6, y: 58, dir: "left", go: "hall", label: "Hallway" } ] },
    bed: { img: "room_bed.webp", name: "Bedroom", arrows: [
      { x: 93, y: 50, dir: "right", go: "hall", label: "Hallway" } ],
      // Tappable furniture (box in image %). Items must be bought before use.
      spots: [ { id: "pc", x: 62, y: 51, w: 25, h: 31, icon: "💻", name: "Computer", shop: "tech",
        info: "You don't have a computer yet. Buy one at the 📱 Tech Shop in town, then use it here." },
        // Fix 76: wardrobe = your storage. Items you buy are kept here.
        { id: "wardrobe", x: 20.5, y: 25, w: 16.5, h: 39, icon: "🚪", name: "Wardrobe", storage: true, info: "Your wardrobe." } ] }
  };
  // Keep arrows away from the screen edges (phone gesture bar, notch) so taps always land.
  const SAFE = 72;
  const imgCache = {};
  function preload(name) {
    if (!imgCache[name]) { const im = new Image(); im.src = ASSET + name + AV; imgCache[name] = im.decode ? im.decode().catch(() => {}) : Promise.resolve(); }
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
    const rsrc = roomSrc(id); await preload(rsrc);
    if (!root) { switching = false; return; }
    room = id;
    // Cross-fade: the new picture fades in on top of the old one, so the city map never shows through.
    const img = document.createElement("img");
    img.className = "vc-rimg in"; img.alt = ""; img.draggable = false; img.src = ASSET + rsrc + AV;
    rb.appendChild(img);
    if (first) { el.classList.remove("hidden"); root.classList.add("in-room"); }
    const lab = (a) => a.go === "mate" ? mateLabel() : visiting && a.label === "My room" ? "Bedroom" : a.label;
    arrows.innerHTML = r.arrows.map((a, i) =>
      `<button class="vc-arrow ${a.dir}" data-i="${i}" data-x="${a.x}" data-y="${a.y}" title="${esc(lab(a))}"><span></span><em>${esc(lab(a))}</em></button>`).join("");
    let vb = el.querySelector(".vc-visit"); if (visiting) { if (!vb) { vb = document.createElement("div"); vb.className = "vc-visit"; el.appendChild(vb); } vb.textContent = "🚪 Visiting " + visiting.name + "'s house"; } else vb?.remove();
    rb.querySelectorAll(".vc-spot,.vc-mate").forEach((x) => x.remove());
    const sc = sceneFor(id), here = !visiting && mateAt() === "room";
    if (sc) { const z = SCENE_SPOT[mateOf().id][sc], b = document.createElement("button"); b.className = "vc-spot mate"; b.dataset.m = sc; b.title = mateOf().name;
      b.style.cssText = `left:${z[0]}%;top:${z[1]}%;width:${z[2]}%;height:${z[3]}%`; b.innerHTML = `<i>${({ sleep: "💤", tv: "📺", eat: "🍽️", pool: "🌴" })[sc] || "💬"}</i>`; rb.appendChild(b); }
    if (!visiting && id === "bath" && mateAt() === "bath") setTimeout(() => toast("🚿 " + mateOf().name + " is taking a shower. The door is closed."), 400);
    if (!visiting && id === "mate" && !here && !sc) setTimeout(() => toast("🚪 " + mateOf().name + " is not here. " + mateOf().she + " is " + ({ bath: "in the bathroom", cook: "in the kitchen", tv: "watching TV in the living room", eat: "having " + mealName() + " in the kitchen", pool: "relaxing by the pool" })[mateAt()] + "."), 400);
    if (id === "mate" && here) { const mi = document.createElement("img"); mi.className = "vc-mate"; mi.alt = ""; mi.draggable = false; mi.src = ASSET + "npc/mate_" + mateOf().key + ".webp" + AV; rb.appendChild(mi); }
    (r.spots || []).forEach((sp, i) => {
      if (sp.mate && !here) return;
      const b = document.createElement("button");
      b.className = "vc-spot"; b.dataset.s = i; b.title = sp.name;
      b.style.cssText = `left:${sp.x}%;top:${sp.y}%;width:${sp.w}%;height:${sp.h}%`;
      b.innerHTML = `<i>${sp.free || sp.storage || sp.mate || visiting ? sp.icon : "🔒"}</i>`; if (sp.free || sp.storage) b.classList.add("free"); if (sp.mate) b.classList.add("mate");
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
    const was = visiting; visiting = null;
    room = null; root?.classList.remove("in-room"); root?.querySelector("#vc-card")?.classList.add("hidden");
    const el = root?.querySelector("#vc-room");
    if (el) { el.classList.add("hidden"); el.querySelector(".vc-rbox").innerHTML = ""; el.querySelector(".vc-arrows").innerHTML = ""; el.querySelector(".vc-visit")?.remove(); }
    focusMine(); if (was) toast("👋 You left " + was.name + "'s house.");
  }
  // Fix 76: wardrobe card — shows every item you own (from shops) in 8 slots.
  function wardrobeCard() {
    const own = owned(), all = Object.values(SHOPS).flatMap((sh) => sh.items || []);
    const have = all.filter((it) => own[it.id]);
    const slots = [];
    const n = Math.max(12, Math.ceil((have.length + 1) / 4) * 4); // grows as you buy more, from any store
    for (let i = 0; i < n; i++) { const it = have[i]; slots.push(it ? `<div class="vc-wslot on" title="${esc(it.name)}"><i>${it.icon || "📦"}</i><small>${esc(it.name)}</small></div>` : `<div class="vc-wslot"><i>＋</i></div>`); }
    card(`<b>🚪 Wardrobe</b><p>${have.length ? "Your items are kept here." : "Empty. Buy clothes and items at shops in town — they are kept here."}</p><div class="vc-wgrid">${slots.join("")}</div>` +
      (have.length ? "" : `<button class="vc-btn gold" data-town>🗺️ Go shopping in town</button>`));
  }
  const owned = () => { try { return JSON.parse(localStorage.getItem("vc_items") || "{}"); } catch { return {}; } };
  function onRoomTap(e) {
    const sp = e.target.closest(".vc-spot");
    if (sp && sp.dataset.m && room && !switching) { if (sp.dataset.m === "sleep") toast("💤 " + mateOf().name + " is sleeping. Let " + mateOf().them + " rest."); else mateCard(sp.dataset.m); return; }
    if (sp && room && !switching) {
      const it = ROOMS[room].spots[Number(sp.dataset.s)];
      if (visiting && !it.free) { toast(it.icon + " This is " + visiting.name + "'s " + it.name.toLowerCase() + "."); return; }
      if (it.storage) { wardrobeCard(); return; }
      if (it.mate) { mateCard(); return; }
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


  // ---- First-run setup (Fix 69): language → name → avatar. Saved in localStorage vc_profile. ----
  // Fix 72: the setup's language choice must not switch the app menus (they stay English). One-time reset of hub_lang set by v69-v71.
  try { if (!localStorage.getItem("csl_lang_fix72")) { localStorage.setItem("hub_lang", "en"); localStorage.setItem("csl_lang_fix72", "1"); } } catch {}
  const LANGS = [["en", "🇬🇧", "English"], ["ru", "🇷🇺", "Русский"], ["es", "🇪🇸", "Español"], ["my", "🇲🇲", "မြန်မာ"]];
  const GENDERS = [["m", "♂", "Male"], ["f", "♀", "Female"], ["g", "🏳️‍🌈", "Gay"]];
  const AV_PER = 4; // avatar slots per group: city-assets/avatars/{m,f,g}{1..4}.webp (user's pictures go here)
  function mateLabel() { return (getProfile() || {}).gender === "m" || !(getProfile() || {}).gender ? "Her room" : "His room"; }
  function getProfile() { try { return JSON.parse(localStorage.getItem("vc_profile") || "null"); } catch { return null; } }
  function setupFlow(done) {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user || {};
    const pf = Object.assign({ lang: localStorage.getItem("hub_lang") || "en", name: (tgUser.first_name || "").slice(0, 16), gender: "m", avatar: 1 }, getProfile() || {});
    const el = document.createElement("div"); el.className = "vc-setup"; root.appendChild(el);
    const esc2 = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const step = (n) => {
      if (n === 1) el.innerHTML = `<div class="vc-sbox"><div class="vc-sdots"><i class="on"></i><i></i><i></i></div><h3>Choose your language</h3>
        <div class="vc-langs">${LANGS.map(([id, f, t]) => `<button class="vc-lang${pf.lang === id ? " on" : ""}" data-l="${id}"><span>${f}</span>${t}</button>`).join("")}</div>
        <button class="vc-go" data-next>NEXT</button></div>`;
      if (n === 2) el.innerHTML = `<div class="vc-sbox"><div class="vc-sdots"><i></i><i class="on"></i><i></i></div><div class="vc-hello">Hello... <em>♡</em></div><div class="vc-sub">MY NAME IS...</div>
        <input class="vc-name-in" maxlength="16" placeholder="Your name" value="${esc2(pf.name)}"><button class="vc-go" data-next>LET'S GO!</button><button class="vc-back" data-back>← Back</button></div>`;
      if (n === 3) el.innerHTML = `<div class="vc-sbox wide"><div class="vc-sdots"><i></i><i></i><i class="on"></i></div><h3>Choose your avatar</h3>
        <div class="vc-gtabs">${GENDERS.map(([id, ic, t]) => `<button class="vc-gtab${pf.gender === id ? " on" : ""}" data-g="${id}"><span>${ic}</span>${t}</button>`).join("")}</div>
        <div class="vc-avs">${Array.from({ length: AV_PER }, (_, i) => `<button class="vc-av${pf.avatar === i + 1 ? " on" : ""}" data-a="${i + 1}"><img src="${ASSET}avatars/${pf.gender}${i + 1}.webp" alt="" onerror="this.remove()"><span>👤</span></button>`).join("")}</div>
        <button class="vc-go" data-next>START</button><button class="vc-back" data-back>← Back</button></div>`;
      el.dataset.step = n;
      const inp = el.querySelector(".vc-name-in"); if (inp) setTimeout(() => inp.focus(), 50);
    };
    el.addEventListener("click", (e) => {
      const n = Number(el.dataset.step);
      const l = e.target.closest("[data-l]"); if (l) { pf.lang = l.dataset.l; step(1); return; }
      const g = e.target.closest("[data-g]"); if (g) { pf.gender = g.dataset.g; pf.avatar = 1; step(3); return; }
      const a = e.target.closest("[data-a]"); if (a) { pf.avatar = Number(a.dataset.a); step(3); return; }
      if (e.target.closest("[data-back]")) { if (n === 2) pf.name = el.querySelector(".vc-name-in").value.trim(); step(n - 1); return; }
      if (!e.target.closest("[data-next]")) return;
      if (n === 1) { step(2); return; }
      if (n === 2) { const v = el.querySelector(".vc-name-in").value.trim().slice(0, 16); if (!v) { toast("✍️ Please type your name."); return; } pf.name = v; step(3); return; }
      try { localStorage.setItem("vc_profile", JSON.stringify(pf)); } catch {}
      el.remove(); toast(`👋 Welcome to VIP City, ${pf.name}!`); done && done(pf);
    });
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" && el.dataset.step === "2") el.querySelector("[data-next]").click(); });
    step(1);
  }


  // ---- Fix 85: housemate (Mia / Leo / Kai) with love points, daily talks, hug and kiss missions. ----
  const MATE = {
    m: { key: "girl", id: "mia", name: "Mia", them: "her", she: "She" },
    f: { key: "boy", id: "leo", name: "Leo", them: "him", she: "He" },
    g: { key: "gay", id: "kai", name: "Kai", them: "him", she: "He" } };
  // Fix 86: daily routine by local hour. sleep (mate room) / bath / room / cook (kitchen) / tv (living).
  function mateAt() { const h = new Date().getHours();
    // Fix 87 timetable (no overlaps): 23-6 sleep, 6-7 shower, 7-8 breakfast, 8-12 room, 12-13 cook, 13-14 lunch, 14-16 pool, 16-18 room, 18-19 cook, 19-20 dinner, 20-23 TV.
    return h < 6 || h >= 23 ? "sleep" : h < 7 ? "bath" : h < 8 ? "eat" : h < 12 ? "room" : h < 13 ? "cook" : h < 14 ? "eat" : h < 16 ? "pool" : h < 18 ? "room" : h < 19 ? "cook" : h < 20 ? "eat" : "tv"; }
  function mealName() { const h = new Date().getHours(); return h < 10 ? "breakfast" : h < 16 ? "lunch" : "dinner"; }
  const SCENE_ROOM = { sleep: "mate", cook: "kitchen", tv: "living", eat: "kitchen", pool: "pool" };
  const SCENE_SPOT = {
    mia: { sleep: [60, 50, 18, 22], cook: [72, 36, 12, 48], tv: [73, 36, 15, 30], pool: [57, 36, 23, 38], eat: [25, 55, 13, 36] },
    leo: { sleep: [62, 50, 16, 18], cook: [68, 26, 13, 58], tv: [74, 42, 15, 40], pool: [66, 45, 29, 32], eat: [27, 56, 13, 36] },
    kai: { sleep: [62, 54, 16, 16], cook: [46, 24, 22, 74], tv: [76, 50, 14, 34], pool: [66, 45, 29, 36], eat: [27, 55, 13, 36] } };
  function sceneFor(id) { if (visiting) return null; const a = mateAt(); return SCENE_ROOM[a] === id ? a : null; }
  function roomSrc(id) { const sc = sceneFor(id); return sc ? "mate/" + mateOf().id + "_" + sc + ".webp" : ROOMS[id].img; }
  function baseRoom(on) { const im = root && root.querySelector(".vc-rimg"); if (!im || !room) return; im.src = ASSET + (on ? ROOMS[room].img : roomSrc(room)) + AV; }
  const mateOf = () => MATE[(getProfile() || {}).gender] || MATE.m;
  // Daily talks per player gender. {me} = player's name. Each has a sweet (+5 extra) and a plain choice.
  const TALKS = {
    m: [
      { lines: ["Oh, {me}! You're home. I was just thinking about you.", "Do you ever feel like this house is warmer when we're both here?"],
        choices: [{ text: "It is. Because you're here.", love: 5, reply: ["*blushes* You always know what to say..."] }, { text: "Maybe it's the heater.", love: 0, reply: ["Haha... you're impossible, {me}."] }] },
      { lines: ["I made too much coffee this morning. Want some?", "I like the way you smile when you take the first sip."],
        choices: [{ text: "I only smile like that around you.", love: 5, reply: ["Stop it... my heart is racing now."] }, { text: "Thanks, I'm good.", love: 0, reply: ["Oh... okay. Maybe next time."] }] },
      { lines: ["Can I tell you a secret?", "When you're late, I keep looking at the door."],
        choices: [{ text: "Then I'll come home earlier for you.", love: 5, reply: ["Promise? ...I'll wait for you, {me}."] }, { text: "Traffic was bad.", love: 0, reply: ["Mm. I see."] }] },
      { lines: ["Look, the city lights are so pretty tonight.", "Do you think we could watch them together sometime?"],
        choices: [{ text: "Every night, if you want.", love: 5, reply: ["*smiles softly* I'd like that more than anything."] }, { text: "Sure, sometime.", love: 0, reply: ["Okay... sometime."] }] },
      { lines: ["I had a dream about you last night.", "We were walking on the beach, holding hands."],
        choices: [{ text: "Let's make that dream real.", love: 5, reply: ["You mean it? Then... it's a date, {me}."] }, { text: "Weird dream.", love: 0, reply: ["Hmph. Forget I said anything."] }] } ],
    f: [
      { lines: ["Hey, {me}. You look really nice today.", "I mean... you always do. I just never say it."],
        choices: [{ text: "Say it more often, then.", love: 5, reply: ["*laughs* Okay. You're beautiful, {me}."] }, { text: "Thanks, Leo.", love: 0, reply: ["Yeah... no problem."] }] },
      { lines: ["I'm trying to learn a love song on my guitar.", "Want to be the first one to hear it?"],
        choices: [{ text: "Only if it's about me.", love: 5, reply: ["Maybe it is... *grins*"] }, { text: "Maybe later.", love: 0, reply: ["Oh. Sure, later."] }] },
      { lines: ["You worked hard today. Sit, I'll cook dinner for you.", "I like taking care of you."],
        choices: [{ text: "I like being taken care of by you.", love: 5, reply: ["Then let me do it every day."] }, { text: "I can cook myself.", love: 0, reply: ["Right... of course you can."] }] },
      { lines: ["I beat my high score, but it's not fun without you watching.", "You're my lucky charm, you know?"],
        choices: [{ text: "Then I'll always cheer for you.", love: 5, reply: ["With you here, I can't lose."] }, { text: "Games are boring.", love: 0, reply: ["Ouch. Okay."] }] },
      { lines: ["Can I be honest? I get a little jealous when other guys talk to you.", "Is that silly?"],
        choices: [{ text: "Not silly. You're the only one I want.", love: 5, reply: ["*his face turns red* ...Really?"] }, { text: "A bit silly.", love: 0, reply: ["Yeah. Forget it."] }] } ],
    g: [
      { lines: ["{me}! Finally, you're home. I picked out a new shirt, rate it?", "Be honest... do I look good?"],
        choices: [{ text: "You look amazing. As always.", love: 5, reply: ["Oh stop, you're making me blush, darling."] }, { text: "It's okay.", love: 0, reply: ["Just okay?! Rude. *pouts*"] }] },
      { lines: ["I put a new record on. It's our kind of song.", "Dance with me for a minute?"],
        choices: [{ text: "Only if you lead.", love: 5, reply: ["*takes your hand* Happily."] }, { text: "I can't dance.", love: 0, reply: ["Everyone can dance, silly."] }] },
      { lines: ["You know what I love about living with you?", "I can just be myself. No masks."],
        choices: [{ text: "I love the real you.", love: 5, reply: ["*soft smile* ...That means everything to me."] }, { text: "Same here.", love: 0, reply: ["Good, good."] }] },
      { lines: ["I keep a little playlist called '{me}'.", "Every song reminds me of you."],
        choices: [{ text: "Play me the first song.", love: 5, reply: ["Close your eyes and listen... this one's my favourite."] }, { text: "That's a bit much.", love: 0, reply: ["Oh... okay. Noted."] }] },
      { lines: ["Can I ask you something?", "If I held your hand on the street... would you mind?"],
        choices: [{ text: "I'd hold it tighter.", love: 5, reply: ["*eyes sparkle* You're the best thing that happened to me."] }, { text: "Let's not rush.", love: 0, reply: ["Sure. No rush."] }] } ] };
  const HUG = {
    m: ["Hey {me}... I had a rough day.", "Could you... just hold me for a moment?"],
    f: ["You look tired, {me}.", "Come here. Let me give you a hug."],
    g: ["Ugh, today was a mess.", "I need a big hug from my favourite person. Now. *opens arms*"] };
  const HUG_END = { m: ["*you wrap your arms around her*", "...Thank you. I feel safe with you."], f: ["*he pulls you into a warm hug*", "Better? I'm always here for you."], g: ["*you hug him tight*", "Mmm. Okay, now I'm happy again."] };
  const KISS = {
    m: ["{me}... we've been living together for a while now.", "I don't want to just be your housemate anymore.", "*she steps closer, looking into your eyes*"],
    f: ["{me}, I have to tell you something.", "I think I'm falling for you.", "*he gently brushes your hair away from your face*"],
    g: ["Okay, I'm just going to say it.", "I like you, {me}. Like, really like you.", "*he leans closer with a nervous smile*"] };
  const today = () => new Date(Date.now() + 6.5 * 3600e3).toISOString().slice(0, 10);
  function mateSave(s) { localStorage.setItem("vc_mate", JSON.stringify(s)); }
  function mateLoad() { let s; try { s = JSON.parse(localStorage.getItem("vc_mate") || "null"); } catch {} return Object.assign({ love: 0, day: "", n: 0, hug: false, kiss: false }, s || {}); }
  const fill = (t) => t.replace(/\{me\}/g, (getProfile() || {}).name || "You");
  function mateCard(sc) {
    const mt = mateOf(), s = mateLoad(), talked = s.day === today(), tvd = s.tv === today();
    const pct = Math.min(100, s.love);
    card(`<b>💞 ${mt.name}</b><div class="vc-love"><i style="width:${pct}%"></i><span>❤️ ${s.love} / 100</span></div>` +
      (sc === "eat" ? `<button class="vc-btn gold" data-mact="eat" ${s.meal === today() + mealName() ? "disabled" : ""}>🍽️ ${s.meal === today() + mealName() ? "Ate " + mealName() + " together" : "Eat " + mealName() + " together (+5 ❤️)"}</button>` : "") +
      (sc === "pool" ? `<button class="vc-btn gold" data-mact="pool" ${s.pool === today() ? "disabled" : ""}>🌴 ${s.pool === today() ? "Relaxed together today" : "Relax together (+5 ❤️)"}</button>` : "") +
      (sc === "tv" ? `<button class="vc-btn gold" data-mtv ${tvd ? "disabled" : ""}>📺 ${tvd ? "Watched TV together today" : "Watch TV together (+5 ❤️)"}</button>` : "") +
      `<button class="vc-btn gold" data-mtalk ${talked ? "disabled" : ""}>💬 ${talked ? "Talked today — come back tomorrow" : "Talk (+5 ❤️)"}</button>` +
      `<button class="vc-btn" data-mhug ${s.love < 30 ? "disabled" : ""}>🤗 Hug ${s.love < 30 ? "🔒 30 ❤️" : s.hug ? "" : "— Mission"}</button>` +
      `<button class="vc-btn" data-mkiss ${s.love < 60 ? "disabled" : ""}>💋 Kiss ${s.love < 60 ? "🔒 60 ❤️" : s.kiss ? "" : "— Mission"}</button>`);
  }
  const TV = {
    m: [{ lines: ["Shh, the movie's starting! Sit next to me, {me}.", "*she shares her blanket with you*", "Ugh, this part is so scary... can I hold your arm?"],
          choices: [{ text: "Hold on as tight as you want.", love: 5, reply: ["*leans on your shoulder* ...I'm not scared anymore."] }, { text: "It's just a movie.", love: 0, reply: ["Hmph. Still scary."] }] },
        { lines: ["It's my favourite romance drama! Watch with me?", "Look, he's confessing to her... so sweet.", "Would you ever do something like that, {me}?"],
          choices: [{ text: "Maybe I already am.", love: 5, reply: ["*hides her red face behind a cushion*"] }, { text: "Too cheesy for me.", love: 0, reply: ["Boo. You have no romance."] }] }],
    f: [{ lines: ["Hey, the game's on! Come sit, I saved you a spot.", "*he hands you the popcorn*", "You know, it's way more fun watching with you."],
          choices: [{ text: "Everything's more fun with you.", love: 5, reply: ["*puts his arm around your shoulder* Yeah... it is."] }, { text: "I don't get the rules.", love: 0, reply: ["I'll explain... later."] }] },
        { lines: ["Movie night! I picked a comedy, you'll love it.", "*you both laugh at the same joke*", "I love your laugh, {me}."],
          choices: [{ text: "Then keep making me laugh.", love: 5, reply: ["Deal. Every single day."] }, { text: "The movie is funny.", love: 0, reply: ["Right... the movie."] }] }],
    g: [{ lines: ["Darling! The dance show is on, sit, sit!", "*he passes you the popcorn bowl*", "Okay, who's your favourite dancer? Mine's sitting right next to me."],
          choices: [{ text: "Smooth. Mine too.", love: 5, reply: ["*laughs and leans on you* Stop, I'm melting."] }, { text: "The one in red.", love: 0, reply: ["Wow. Okay. Rude."] }] },
        { lines: ["This old movie always makes me cry.", "*he dabs his eyes* Don't look at me like that.", "Can I lean on you for the ending?"],
          choices: [{ text: "Always. Come here.", love: 5, reply: ["*rests his head on your shoulder* ...Thank you, {me}."] }, { text: "You're such a softie.", love: 0, reply: ["And proud of it."] }] }] };
  const ACT = {
    eat: { m: ["I made your favourite, {me}. Sit with me?", "*she pushes a plate towards you* Try it. Is it good?"],
           f: ["Food's ready! Come eat with me, {me}.", "*he pulls out a chair for you* Ladies first."],
           g: ["Darling, the table is set! Don't make me eat alone.", "*he pours you a glass of juice* Cheers to us."],
           ch: { m: [["It's delicious. Like you.", 5, "*giggles* Eat, you flirt!"], ["It's fine.", 0, "Just fine? I'll try harder next time."]],
                 f: [["Best meal ever, chef.", 5, "*grins* I'll cook for you forever, then."], ["A bit salty.", 0, "Noted... I'll fix it."]],
                 g: [["Five stars, Chef Kai!", 5, "*bows dramatically* Thank you, thank you!"], ["It's okay.", 0, "Okay?! The audacity."]] } },
    pool: { m: ["The water looks so nice today. Sit with me in the sun, {me}?", "*she offers you a glass of juice*"],
            f: ["Perfect weather, right? Come relax with me.", "*he slides over to make room on the lounger*"],
            g: ["Sunglasses on, drinks ready. Join me, darling!", "*he hands you a fruity drink with a tiny umbrella*"],
            ch: { m: [["Only if you sit close to me.", 5, "*moves closer* Like this?"], ["It's too hot.", 0, "Then sit under the umbrella, silly."]],
                  f: [["Nowhere I'd rather be.", 5, "*smiles and closes his eyes* Me too."], ["Just a minute.", 0, "Okay, just a minute."]],
                  g: [["Cheers to sunny days with you.", 5, "*clinks glasses* The sunniest, with you here."], ["I'll burn.", 0, "Sunscreen exists, you know!"]] } } };
  function mateAct(kind) {
    const g = (getProfile() || {}).gender || "m", mt = mateOf(), s = mateLoad(), a = ACT[kind];
    const stamp = kind === "eat" ? today() + mealName() : today(), key = kind === "eat" ? "meal" : "pool";
    if (s[key] === stamp) { toast("❤️ Already done — come back later."); return; }
    talk({ npc: "mate_" + mt.key, name: mt.name, lines: a[g].map((x) => ({ who: "npc", text: fill(x) })),
      choices: a.ch[g].map((c) => ({ text: fill(c[0]), love: c[1], reply: [fill(c[2])] })),
      onChoice: (c) => { const s2 = mateLoad(); s2.love = Math.min(100, s2.love + 5 + (c.love || 0)); s2[key] = stamp; mateSave(s2); },
      onEnd: () => toast("❤️ " + mt.name + ": " + mateLoad().love + " / 100") });
  }
  function mateTV() {
    const g = (getProfile() || {}).gender || "m", mt = mateOf(), s = mateLoad();
    if (s.tv === today()) { toast("📺 You already watched TV with " + mt.name + " today."); return; }
    const list = TV[g] || TV.m, tk = list[(s.tvn || 0) % list.length];
    talk({ npc: "mate_" + mt.key, name: mt.name, lines: tk.lines.map((x) => ({ who: "npc", text: fill(x) })),
      choices: tk.choices.map((c) => ({ text: fill(c.text), reply: c.reply.map(fill), love: c.love })),
      onChoice: (c) => { const s2 = mateLoad(); s2.love = Math.min(100, s2.love + 5 + (c.love || 0)); s2.tv = today(); s2.tvn = (s2.tvn || 0) + 1; mateSave(s2); },
      onEnd: () => toast("📺❤️ " + mt.name + ": " + mateLoad().love + " / 100") });
  }
  function mateTalk() {
    const g = (getProfile() || {}).gender || "m", mt = mateOf(), s = mateLoad();
    if (s.day === today()) { toast("💬 You already talked with " + mt.name + " today."); return; }
    const list = TALKS[g] || TALKS.m, tk = list[s.n % list.length];
    talk({ npc: "mate_" + mt.key, name: mt.name, lines: tk.lines.map((x) => ({ who: "npc", text: fill(x) })),
      choices: tk.choices.map((c) => ({ text: fill(c.text), reply: c.reply.map(fill), love: c.love })),
      onChoice: (c) => { const s2 = mateLoad(); s2.love = Math.min(100, s2.love + 5 + (c.love || 0)); s2.day = today(); s2.n++; mateSave(s2); },
      onEnd: () => toast("❤️ " + mt.name + ": " + mateLoad().love + " / 100") });
  }
  function mateHug() {
    const g = (getProfile() || {}).gender || "m", mt = mateOf(), s = mateLoad(); if (s.love < 30) return;
    talk({ npc: "mate_" + mt.key, name: mt.name, lines: HUG[g].map((x) => ({ who: "npc", text: fill(x) })).concat(HUG_END[g].map((x, i) => ({ who: i ? "npc" : "me", text: fill(x) }))),
      onEnd: () => { const s2 = mateLoad(); if (!s2.hug) { s2.hug = true; s2.love = Math.min(100, s2.love + 10); mateSave(s2); toast("🎉 Mission complete: Hug " + mt.name + "! +10 ❤️"); } } });
  }
  function mateKiss() {
    const g = (getProfile() || {}).gender || "m", mt = mateOf(), s = mateLoad(); if (s.love < 60) return;
    talk({ npc: "mate_" + mt.key, name: mt.name, lines: KISS[g].map((x) => ({ who: "npc", text: fill(x) })),
      choices: [{ text: "Kiss " + mt.them, reply: [] }, { text: "Not yet...", reply: ["It's okay. I'll wait for you."], no: true }],
      onChoice: (c) => { if (c.no) return; const f = document.createElement("div"); f.className = "vc-fade"; f.innerHTML = "<span>💋</span><p>" + esc(fill("{me} and " + mt.name + " share a soft kiss...")) + "</p>"; root.appendChild(f);
        setTimeout(() => { f.classList.add("out"); setTimeout(() => f.remove(), 700); }, 2600);
        const s2 = mateLoad(); if (!s2.kiss) { s2.kiss = true; s2.love = Math.min(100, s2.love + 15); mateSave(s2); setTimeout(() => toast("🎉 Mission complete: Kiss " + mt.name + "! +15 ❤️"), 2800); } } });
  }

  // ---- Talk scene (Fix 71): player on the left, girl on the right, dialogue box at the bottom. ----
  // talk({ npc:"mia", name:"Mia", lines:[{who:"npc"|"me", text}], choices:[{text, reply}] })
  function talk(t) {
    if (!root) return;
    const pf = getProfile() || { name: "You", gender: "m", avatar: 1 };
    root.querySelector(".vc-talk")?.remove();
    const el = document.createElement("div"); el.className = "vc-talk";
    el.innerHTML = `<img class="vc-tme" src="${ASSET}player/${pf.gender}${pf.avatar}.webp" alt="" onerror="this.remove()">
      <img class="vc-tnpc" src="${ASSET}npc/${t.npc}.webp" alt="">
      <div class="vc-tbox"><b class="vc-tname"></b><p class="vc-ttext"></p><div class="vc-tch"></div><span class="vc-tnext">▼</span></div>`;
    root.appendChild(el); root.classList.add("in-talk"); baseRoom(true);
    const lines = (t.lines || []).slice(); let i = 0, choosing = false;
    const show = (ln) => {
      const me = ln.who === "me";
      el.classList.toggle("me-speaks", me); el.classList.toggle("npc-speaks", !me);
      el.querySelector(".vc-tname").textContent = me ? pf.name : t.name;
      el.querySelector(".vc-tname").className = "vc-tname " + (me ? "me" : "npc");
      el.querySelector(".vc-ttext").textContent = ln.text;
    };
    const step = () => {
      if (i < lines.length) { show(lines[i++]); return; }
      if (t.choices?.length && !choosing) {
        choosing = true; el.classList.add("choosing");
        el.querySelector(".vc-tch").innerHTML = t.choices.map((c, k) => `<button class="vc-tc" data-c="${k}">${c.text}</button>`).join("");
        return;
      }
      if (!choosing || el.classList.contains("done")) { el.remove(); root?.classList.remove("in-talk"); baseRoom(false); t.onEnd && t.onEnd(); }
    };
    el.addEventListener("click", (e) => {
      const c = e.target.closest("[data-c]");
      if (c) { const ch = t.choices[Number(c.dataset.c)]; t.onChoice && t.onChoice(ch); el.classList.remove("choosing"); el.classList.add("done"); el.querySelector(".vc-tch").innerHTML = ""; lines.push({ who: "me", text: ch.text }); (ch.reply || []).forEach((r) => lines.push({ who: "npc", text: r })); step(); return; }
      if (!el.classList.contains("choosing")) step();
    });
    step();
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
    const hint = () => { if (data.me == null) setTimeout(() => toast("🏡 Buy an empty lot to get your own house!"), 600); };
    if (!getProfile()) setupFlow(hint); else hint();
    root.querySelector("#vc-home").addEventListener("click", () => { if (room) { leaveRoom(); return; } if (data.me == null) toast("🏷️ Pick an empty lot to buy your house."); focusMine(); });
    root.querySelector("#vc-love").addEventListener("click", () => toast("❤️ Love meter — coming soon"));
    root.querySelector("#vc-gift").addEventListener("click", () => toast("🎁 Gifts — coming soon"));
    root.querySelector("#vc-cash").addEventListener("click", openCash);
    root.querySelector(".vc-pill2.cash").addEventListener("click", (e) => { if (e.target.id !== "vc-cash") openCash(); });
    root.querySelector("#vc-set").addEventListener("click", () => card(`<b>⚙️ Settings</b><p>More options are coming soon.</p><button class="vc-btn" data-profile>👤 Edit profile</button><button class="vc-btn gold" data-exit>🚪 Exit VIP City</button>`));
    root.querySelector("#vc-room").addEventListener("click", onRoomTap);
    Object.values(ROOMS).forEach((x) => preload(x.img));
    root.querySelector("#vc-x").addEventListener("click", close);
    if (opts.load && data.districts > 1) {
      root.querySelector(".vc-dist").classList.remove("hidden");
      root.querySelector("#vc-dname").textContent = `🏘️ ${data.district + 1}/${data.districts}`;
      root.querySelector("#vc-prev").addEventListener("click", () => opts.load((data.district - 1 + data.districts) % data.districts));
      root.querySelector("#vc-next").addEventListener("click", () => opts.load((data.district + 1) % data.districts));
    }
    root.querySelector("#vc-card").addEventListener("click", (e) => { if (e.target.closest("[data-x]")) e.currentTarget.classList.add("hidden"); if (e.target.closest("[data-exit]")) close(); if (e.target.closest("[data-profile]")) { e.currentTarget.classList.add("hidden"); setupFlow(); return; } const gs = e.target.closest("[data-shop]"); if (gs) { goShop(gs.dataset.shop); return; } if (e.target.closest("[data-fish]")) { e.currentTarget.classList.add("hidden"); toast("🎣 Fishing is coming soon!"); return; } if (e.target.closest("[data-town]")) { e.currentTarget.classList.add("hidden"); leaveRoom(); return; } if (e.target.closest("[data-buy]")) { toast("💵 Items can be bought soon."); return; } if (e.target.closest("[data-sit]")) { e.currentTarget.classList.add("hidden"); toast("☀️ You relax on the sun lounger. More pool fun coming soon!"); return; } const fb = e.target.closest("[data-farmbuy]"); if (fb) { buyFarm(Number(fb.dataset.farmbuy)); return; } const ma = e.target.closest("[data-mact]"); if (ma) { e.currentTarget.classList.add("hidden"); mateAct(ma.dataset.mact); return; } if (e.target.closest("[data-mtv]")) { e.currentTarget.classList.add("hidden"); mateTV(); return; } if (e.target.closest("[data-mtalk]")) { e.currentTarget.classList.add("hidden"); mateTalk(); return; } if (e.target.closest("[data-mhug]")) { e.currentTarget.classList.add("hidden"); mateHug(); return; } if (e.target.closest("[data-mkiss]")) { e.currentTarget.classList.add("hidden"); mateKiss(); return; } if (e.target.closest("[data-plant]")) { e.currentTarget.classList.add("hidden"); toast("🌱 Planting is coming next!"); return; } const lt = e.target.closest("[data-lot]"); if (lt) { buyLot(Number(lt.dataset.lot)); return; } if (e.target.closest("[data-getcash]")) { openCash(); return; } const ac = e.target.closest("[data-adcash]"); if (ac && !ac.disabled) { e.currentTarget.classList.add("hidden"); window.CSLAds?.reward ? window.CSLAds.reward("city", "en") : toast("No ad available right now."); return; } const pk = e.target.closest("[data-pack]"); if (pk) { buyPack(pk.dataset.pack); return; } if (e.target.closest("[data-enter]")) { e.currentTarget.classList.add("hidden"); visiting = null; enterRoom("living"); return; } const hi = e.target.closest("[data-hi]"); if (hi) { e.currentTarget.classList.add("hidden"); toast("👋 You waved at " + hi.dataset.hi + "!"); return; } const vs = e.target.closest("[data-visit]"); if (vs) { const hs = data?.houses?.find((x) => String(x.id) === vs.dataset.visit); e.currentTarget.classList.add("hidden"); visiting = { id: vs.dataset.visit, name: hs ? hs.name : "Neighbour" }; enterRoom("living"); } });
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

  window.VipCity = { open, play, close, enterRoom, leaveRoom, PLOTS, FARMS, getProfile, talk };
})();
