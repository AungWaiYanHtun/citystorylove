/* Crush City — anime dating sim (portrait + landscape). Original characters & script. v1 */
(function () {
  const A = "crush-assets/", V = "?v=4";
  const tg = window.Telegram?.WebApp;
  const SAVE = "csl_crush_v1";
  const GIRLS = [
    { k: "mina", name: "Mina", job: "Barista", home: "cafe", need: null },
    { k: "rina", name: "Rina", job: "Rock guitarist", home: "lounge", need: "Mina Lv.2" },
    { k: "lily", name: "Lily", job: "Art student", home: "park", need: "Mina Lv.3" },
    { k: "sora", name: "Sora", job: "Fitness coach", home: "studio", need: "Mina Lv.4" },
  ];
  const BG = { lounge: "bg_lounge", cafe: "bg_cafe", studio: "bg_studio", park: "bg_park" };
  const EMAX = 25, EREGEN = 6 * 60 * 1000, TALK_E = 1, DATE_E = 5, GAME_COST = 300, LV_AFF = 100;
  const S0 = { energy: EMAX, eT: Date.now(), coins: 500, gems: 20, intro: false, cur: "mina", g: { mina: { aff: 0, lv: 1, date: 0, cg: [] } } };
  let S, ui, story;

  const load = () => { try { S = Object.assign(JSON.parse(JSON.stringify(S0)), JSON.parse(localStorage.getItem(SAVE) || "{}")); } catch { S = JSON.parse(JSON.stringify(S0)); } };
  const save = () => { try { localStorage.setItem(SAVE, JSON.stringify(S)); } catch {} };
  const G = (k) => (S.g[k] = S.g[k] || { aff: 0, lv: 1, date: 0, cg: [] });
  const img = (n) => `${A}${n}.webp${V}`;
  const el = (h) => { const d = document.createElement("div"); d.innerHTML = h.trim(); return d.firstChild; };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const haptic = (t) => { try { tg?.HapticFeedback?.impactOccurred?.(t || "light"); } catch {} };

  function regen() {
    const n = Math.floor((Date.now() - S.eT) / EREGEN);
    if (S.energy >= EMAX) { S.eT = Date.now(); return; }
    if (n > 0) { S.energy = Math.min(EMAX, S.energy + n); S.eT += n * EREGEN; save(); }
  }

  // ---------- stage (fixed 1280x720, scaled; rotated when the phone is held upright) ----------
  function fitStage() {
    if (!ui) return; const w = innerWidth, h = innerHeight, port = h > w;
    // portrait phones get their own upright 720-wide layout (no rotating)
    const SW = port ? 720 : 1280, SH = port ? Math.max(1100, Math.min(1560, Math.round(720 * h / w))) : 720;
    const sc = Math.min(w / SW, h / SH), st = ui.stage.style;
    ui.stage.classList.toggle("port", port);
    st.width = SW + "px"; st.height = SH + "px";
    st.transform = `translate(-50%,-50%) scale(${sc})`;
  }

  function hud() {
    regen();
    ui.root.querySelector(".cc-e").textContent = `${S.energy}/${EMAX}`;
    ui.root.querySelector(".cc-c").textContent = S.coins;
    ui.root.querySelector(".cc-g").textContent = S.gems;
  }

  function open() {
    load();
    if (ui) return;
    try { tg?.expand?.(); tg?.disableVerticalSwipes?.();  } catch {}
    ui = { root: el(`<div id="cc-root"><div class="cc-stage">
      <div class="cc-bg"></div><div class="cc-girl"></div>
      <div class="cc-hud hidden"><span class="cc-pill"><i class="cc-plus" data-buy="e">+</i><b class="cc-e"></b><em>⚡</em></span><span class="cc-pill"><i class="cc-plus" data-buy="c">+</i><b class="cc-c"></b><em class="cc-coin"></em></span><span class="cc-pill"><i class="cc-plus" data-buy="g">+</i><b class="cc-g"></b><em>💎</em></span><button class="cc-gear" aria-label="Exit">✕</button></div>
      <div class="cc-ui"></div><div class="cc-layer"></div></div></div>`) };
    ui.stage = ui.root.querySelector(".cc-stage"); ui.bg = ui.root.querySelector(".cc-bg"); ui.girl = ui.root.querySelector(".cc-girl");
    ui.ui = ui.root.querySelector(".cc-ui"); ui.layer = ui.root.querySelector(".cc-layer");
    document.body.appendChild(ui.root); document.body.classList.add("cc-open");
    addEventListener("resize", fitStage); try { tg?.onEvent?.("viewportChanged", fitStage); } catch {}
    fitStage();
    ui.root.querySelector(".cc-gear").onclick = close;
    ui.root.querySelectorAll(".cc-plus").forEach((b) => (b.onclick = () => adOffer(b.dataset.buy)));
    ui.timer = setInterval(() => ui && hud(), 10000);
    title();
  }
  function close() {
    if (!ui) return; clearInterval(ui.timer); removeEventListener("resize", fitStage);
    ui.root.remove(); ui = null; document.body.classList.remove("cc-open");
    try {  } catch {}
  }

  function setBg(k) { ui.bg.style.backgroundImage = `url('${img(BG[k] || k)}')`; }
  function showGirl(k) { ui.girl.innerHTML = k ? `<img src="${img("g_" + k)}" alt="">` : ""; ui.girl.className = "cc-girl" + (k ? " on" : ""); }
  function hudOn(on) { ui.root.querySelector(".cc-hud").classList.toggle("hidden", !on); if (on) hud(); }

  // ---------- title ----------
  function title() {
    hudOn(false); showGirl(null); setBg(ui.stage.classList.contains("port") ? "title_key_port" : "title_key");
    ui.ui.innerHTML = `<div class="cc-title"><img class="cc-logo" src="${img("logo")}" alt="Crush City"><div class="cc-bar"><i></i></div><div class="cc-tap hidden">Tap to start</div></div>`;
    const bar = ui.ui.querySelector(".cc-bar i"), tap = ui.ui.querySelector(".cc-tap");
    const pre = ["bg_lounge", "bg_cafe", "bg_park", "bg_studio", "g_mina", "cg_mina1", "cg_mina2"].map((n) => new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = img(n); }));
    let done = 0; pre.forEach((p) => p.then(() => (bar.style.width = (++done / pre.length) * 100 + "%")));
    Promise.race([Promise.all(pre), wait(8000)]).then(() => {
      bar.style.width = "100%"; ui.ui.querySelector(".cc-bar").classList.add("hidden"); tap.classList.remove("hidden");
      ui.ui.querySelector(".cc-title").onclick = async () => {
        if (!S.intro) { await play(story.prologue, "mina"); S.intro = true; G("mina"); save(); }
        home("mina");
      };
    });
  }

  // ---------- dialogue player ----------
  function bubble(name, text, tapHint) {
    return new Promise((res) => {
      ui.ui.innerHTML = `<div class="cc-say ${name ? "" : "narr"}">${name ? `<b>${name}</b>` : ""}<p></p>${tapHint ? `<small>Tap to continue</small>` : ""}</div>`;
      const p = ui.ui.querySelector("p"); let i = 0, full = false;
      const tick = setInterval(() => { i += 2; p.textContent = text.slice(0, i); if (i >= text.length) { clearInterval(tick); full = true; } }, 22);
      ui.ui.onclick = () => { if (!full) { clearInterval(tick); p.textContent = text; full = true; return; } ui.ui.onclick = null; res(); };
    });
  }
  function choose(name, line, opts) {
    return new Promise((res) => {
      ui.ui.innerHTML = `<div class="cc-say side">${name ? `<b>${name}</b>` : ""}<p>${line}</p></div><div class="cc-choices">${opts.map((o, i) => `<button data-i="${i}">${o[0]}</button>`).join("")}</div>`;
      ui.ui.onclick = null;
      if (ui.stage.classList.contains("port")) { const c = ui.ui.querySelector(".cc-choices"), sy = ui.ui.querySelector(".cc-say.side"); sy.style.bottom = (40 + c.offsetHeight + 70) + "px"; }
      ui.ui.querySelectorAll(".cc-choices button").forEach((b) => (b.onclick = (e) => { e.stopPropagation(); haptic(); res(opts[+b.dataset.i]); }));
    });
  }
  function cgView(id, cap) {
    return new Promise((res) => {
      const v = el(`<div class="cc-cg"><img src="${img("cg_" + id)}" alt=""><p>${cap || ""}</p><button class="cc-x">✕</button></div>`);
      ui.layer.appendChild(v); requestAnimationFrame(() => v.classList.add("on"));
      v.onclick = () => { v.remove(); res(); };
    });
  }
  async function play(steps, girl) {
    hudOn(false); let last = { name: "", text: "" };
    for (const st of steps) {
      if (st.bg) setBg(st.bg);
      if (st.show) showGirl(st.show);
      if (st.hide) showGirl(null);
      if (st.n) { await bubble("", st.n, true); last = { name: "", text: st.n }; }
      if (st.s) { await bubble(st.s[0], st.s[1], true); last = { name: st.s[0], text: st.s[1] }; }
      if (st.c) { const o = await choose(last.name, last.text, st.c); addAff(girl, o[1], true); hearts(o[1]); if (o[2]) await bubble(last.name || "", o[2], true); }
      if (st.cg) { const g = G(girl); if (!g.cg.includes(st.cg)) g.cg.push(st.cg); save(); await cgView(st.cg, st.cap); }
    }
    ui.ui.onclick = null;
  }
  function hearts(n) {
    if (!n) return; const h = el(`<div class="cc-pop">${n >= 12 ? "💖" : n >= 8 ? "❤️" : "🤍"} +${n}</div>`);
    ui.layer.appendChild(h); setTimeout(() => h.remove(), 1300);
  }
  function addAff(k, n, quiet) {
    const g = G(k); g.aff += n; let up = false;
    while (g.aff >= LV_AFF) { g.aff -= LV_AFF; g.lv++; up = true; }
    save(); if (up && !quiet) levelUp(k); else if (up) ui.pendingLv = k;
  }
  function levelUp(k) {
    const g = G(k), unlock = GIRLS.find((x) => x.need === `${GIRLS.find((y) => y.k === k).name} Lv.${g.lv}`);
    const pics = (story.gallery[k] || []).filter((p) => p.lv === g.lv);
    S.coins += 200 * g.lv; S.gems += 5; save(); haptic("heavy");
    popup(`Level ${g.lv}!`, `<div class="cc-big">💖</div><p>${GIRLS.find((y) => y.k === k).name} likes you more.</p><p class="cc-rw">+${200 * g.lv} <span class="cc-coin"></span> &nbsp; +5 💎</p>${pics.length ? `<p>📸 New photo in Gallery!</p>` : ""}${unlock ? `<p>🔓 ${unlock.name} unlocked (story coming soon)</p>` : ""}`, [["Yay!", "green"]]).then(() => hud());
    pics.forEach((p) => { if (!g.cg.includes(p.id)) g.cg.push(p.id); }); save();
  }

  // ---------- popups ----------
  function popup(title, body, btns) {
    return new Promise((res) => {
      const p = el(`<div class="cc-modal"><div class="cc-box"><div class="cc-ribbon">${title}</div><button class="cc-close">✕</button><div class="cc-body">${body}</div><div class="cc-btns">${btns.map((b, i) => `<button class="cc-btn ${b[1]}" data-i="${i}">${b[0]}</button>`).join("")}</div></div></div>`);
      ui.layer.appendChild(p);
      const end = (v) => { p.remove(); res(v); };
      p.querySelector(".cc-close").onclick = () => end(-1);
      p.querySelectorAll(".cc-btn").forEach((b) => (b.onclick = () => end(+b.dataset.i)));
    });
  }
  async function adOffer(kind) {
    const what = { e: ["Need energy?", "⚡", "+10 energy"], c: ["Need coins?", "<span class='cc-coin big'></span>", "+500 coins"], g: ["Need gems?", "💎", "+5 gems"] }[kind];
    const r = await popup(what[0], `<div class="cc-big">${what[1]}</div><p>Watch a short ad to get <b>${what[2]}</b>.</p>`, [["▶ Watch ad", "green"]]);
    if (r !== 0) return false;
    let ok = false;
    try { ok = window.CSLAds ? await window.CSLAds.reward("island", "en") : false; } catch {}
    if (!ok && !window.CSLAds) ok = true; // local test without ads
    if (ok) { if (kind === "e") S.energy += 10; if (kind === "c") S.coins += 500; if (kind === "g") S.gems += 5; save(); hud(); }
    return ok;
  }
  async function spend(kind, n) {
    regen();
    if (kind === "e" && S.energy < n) { await popup("Not enough energy!", `<div class="cc-big">⚡</div><p>Energy refills 1 every 6 min.</p>`, [["Get more", "green"]]).then((r) => r === 0 && adOffer("e")); return false; }
    if (kind === "c" && S.coins < n) { await popup("Not enough coins!", `<div class="cc-big"><span class="cc-coin big"></span></div>`, [["Get more", "green"]]).then((r) => r === 0 && adOffer("c")); return false; }
    if (kind === "e") { if (S.energy >= EMAX) S.eT = Date.now(); S.energy -= n; } else S.coins -= n;
    save(); hud(); return true;
  }

  // ---------- home scene ----------
  function home(k) {
    S.cur = k; save();
    const gi = GIRLS.find((x) => x.k === k), g = G(k);
    setBg(gi.home); showGirl(k); hudOn(true);
    const lines = ["Hi! Good to see you.", "You came back! I missed you a little.", "Coffee? Or… me? Kidding!", "Where are we going today?"];
    ui.ui.innerHTML = `
      <button class="cc-girls">👭 Girls</button>
      <div class="cc-hello">${lines[(Math.random() * lines.length) | 0]}</div>
      <div class="cc-left"><button class="cc-sq gal"><span>🖼️</span>Gallery</button><div class="cc-row"><button class="cc-sq prog"><span>💞</span>Progress<i class="cc-lv">Lv.${g.lv}</i></button><button class="cc-sq dress"><span>👗</span>Dress</button></div></div>
      <div class="cc-right"><button class="cc-big-btn talk">💬 TALK <small>⚡${TALK_E}</small></button><button class="cc-big-btn date">❤️ DATE <small>⚡${DATE_E}</small></button></div>`;
    ui.ui.onclick = null;
    const q = (s) => ui.ui.querySelector(s);
    q(".talk").onclick = () => talk(k);
    q(".date").onclick = () => date(k);
    q(".gal").onclick = () => gallery(k);
    q(".prog").onclick = () => progress(k);
    q(".dress").onclick = () => popup("Wardrobe", `<div class="cc-big">👗</div><p>New outfits for ${gi.name} are being drawn.</p><p>Coming soon!</p>`, [["OK", "blue"]]);
    q(".cc-girls").onclick = girls;
  }

  async function talk(k) {
    if (!(await spend("e", TALK_E))) return;
    const pool = story.talk[k] || []; const t = pool[(Math.random() * pool.length) | 0];
    const o = await choose(t[0][0], t[0][1], t[1].map((x) => [x[0], x[1]]));
    const coins = 20 + o[1] * 5; S.coins += coins; save(); hearts(o[1]);
    await bubble(t[0][0], o[1] >= 5 ? "Hehe, you always know what to say." : o[1] >= 3 ? "Mm, fair enough!" : "…Okay then.", true);
    addAff(k, o[1] * 2); home(k);
  }

  async function date(k) {
    const g = G(k), list = story[k] || [];
    if (g.date >= list.length) { await popup("To be continued", `<div class="cc-big">💌</div><p>You finished ${GIRLS.find((x) => x.k === k).name}'s story for now.</p><p>New dates are coming soon! Keep chatting to level up.</p>`, [["OK", "blue"]]); return; }
    const ch = list[g.date];
    const r = await popup("Go on a date?", `<p class="cc-ch">${ch.title}</p><p>Costs ⚡${DATE_E}</p>`, [["Let's go!", "green"]]);
    if (r !== 0 || !(await spend("e", DATE_E))) return;
    await play([{ bg: ch.bg }, ...ch.steps], k);
    g.date++; save();
    if (ui.pendingLv) { const p = ui.pendingLv; ui.pendingLv = null; levelUp(p); }
    showGirl(k); hudOn(true);
    ui.ui.innerHTML = `<div class="cc-say"><b>${GIRLS.find((x) => x.k === k).name}</b><p>Fantastic date! Want more fun?</p></div>`;
    const m = await popup("Mini game", `<div class="cc-mg-prev" style="background-image:url('${img("bg_studio")}')"><span>📸</span></div><p>Photo shoot! Win to earn hearts and coins.</p>`, [["Skip", "yellow"], [`<span class="cc-coin"></span> ${GAME_COST}`, "green"]]);
    if (m === 1 && (await spend("c", GAME_COST))) await photoGame(k);
    home(k);
  }

  // ---------- photo mini game: stop the moving heart inside the glowing zone, 5 shots ----------
  function photoGame(k) {
    return new Promise((res) => {
      setBg("studio"); showGirl(k); hudOn(false);
      ui.ui.innerHTML = `<div class="cc-mg"><div class="cc-hearts">${"<i>🤍</i>".repeat(5)}</div><div class="cc-track"><div class="cc-zone"></div><div class="cc-cursor">💗</div></div><button class="cc-shot"><span>📷</span>Tap!</button></div>`;
      const zone = ui.ui.querySelector(".cc-zone"), cur = ui.ui.querySelector(".cc-cursor"), hs = ui.ui.querySelectorAll(".cc-hearts i");
      let shot = 0, win = 0, x = 0, dir = 1, sp = 0.9, z0 = 0, zw = 22, run = true, last = performance.now();
      const newZone = () => { zw = Math.max(10, 22 - shot * 2.5); z0 = 8 + Math.random() * (84 - zw); zone.style.left = z0 + "%"; zone.style.width = zw + "%"; sp = 0.9 + shot * 0.18; };
      newZone();
      const loop = (now) => { if (!run) return; const dt = Math.min(40, now - last); last = now; x += dir * sp * dt / 16; if (x > 100) { x = 100; dir = -1; } if (x < 0) { x = 0; dir = 1; } cur.style.left = x + "%"; requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
      ui.ui.querySelector(".cc-shot").onclick = async (e) => {
        e.stopPropagation(); if (shot >= 5) return; haptic("medium");
        const ok = x >= z0 && x <= z0 + zw; if (ok) win++;
        hs[shot].textContent = ok ? "❤️" : "💔"; shot++;
        const f = el(`<div class="cc-flash"></div>`); ui.layer.appendChild(f); setTimeout(() => f.remove(), 350);
        if (shot < 5) { newZone(); return; }
        run = false; await wait(500);
        const coins = win * 80, aff = win * 6; S.coins += coins; save();
        await popup(win >= 4 ? "Perfect shoot!" : win >= 2 ? "Nice photos!" : "Try again!", `<div class="cc-big">${"❤️".repeat(win) || "💔"}</div><p class="cc-rw">+${coins} <span class="cc-coin"></span> &nbsp; +${aff} 💞</p>`, [["Great", "green"]]);
        addAff(k, aff); res();
      };
    });
  }

  // ---------- gallery / progress / girls ----------
  async function gallery(k) {
    const g = G(k), list = story.gallery[k] || [];
    const body = `<div class="cc-gal">${list.map((p) => g.cg.includes(p.id) ? `<button class="cc-ph" data-id="${p.id}" style="background-image:url('${img("cg_" + p.id)}')"><span>${p.cap}</span></button>` : `<div class="cc-ph lock"><b>🔒</b><span>Lv.${p.lv}</span></div>`).join("")}</div>`;
    const p = el(`<div class="cc-modal"><div class="cc-box wide"><div class="cc-ribbon">Gallery</div><button class="cc-close">✕</button><div class="cc-body">${body}</div></div></div>`);
    ui.layer.appendChild(p); p.querySelector(".cc-close").onclick = () => p.remove();
    p.querySelectorAll(".cc-ph[data-id]").forEach((b) => (b.onclick = () => cgView(b.dataset.id, list.find((x) => x.id === b.dataset.id).cap)));
  }
  function progress(k) {
    const g = G(k), gi = GIRLS.find((x) => x.k === k), list = story[k] || [];
    popup(`${gi.name} · Lv.${g.lv}`, `<div class="cc-prog"><img src="${img("g_" + k)}" alt=""><div><p>${gi.job}</p><div class="cc-meter"><i style="width:${g.aff}%"></i><span>${g.aff}/${LV_AFF} 💞</span></div><p>Story: ${Math.min(g.date, list.length)}/${list.length} dates</p><p>Photos: ${g.cg.length}/${(story.gallery[k] || []).length}</p><small>Talk and date to fill hearts. Each level gives coins, gems and new photos.</small></div></div>`, [["OK", "blue"]]);
  }
  function girls() {
    const mina = G("mina");
    const body = `<div class="cc-gl">${GIRLS.map((x) => { const need = x.need ? +x.need.split("Lv.")[1] : 0, open = !need || mina.lv >= need, ready = x.k === "mina";
      return `<button class="cc-gc ${open ? "" : "lock"} ${ready ? "" : "soon"}" data-k="${x.k}"><img src="${img("g_" + x.k)}" alt=""><b>${x.name}</b><small>${ready ? x.job : open ? "Coming soon" : "🔒 " + x.need}</small></button>`; }).join("")}</div>`;
    const p = el(`<div class="cc-modal"><div class="cc-box wide"><div class="cc-ribbon">Girls</div><button class="cc-close">✕</button><div class="cc-body">${body}</div></div></div>`);
    ui.layer.appendChild(p); p.querySelector(".cc-close").onclick = () => p.remove();
    p.querySelectorAll(".cc-gc").forEach((b) => (b.onclick = () => { if (b.dataset.k === "mina") { p.remove(); home("mina"); } }));
  }

  function cardHTML() {
    return `<button type="button" id="hub-crush" class="cc-card"><div class="cc-card-img" style="background-image:url('${img("title_key")}')"><img src="${img("logo")}" alt=""><span class="cc-card-tag">NEW</span></div><div class="cc-card-body"><b>💘 Crush City</b><small>Date, chat and fall in love in the city of neon.</small><span class="cc-card-play">Play</span></div></button>`;
  }
  story = window.CRUSH_STORY;
  window.CSLCrush = { open, close, cardHTML, _state: () => S };
})();
