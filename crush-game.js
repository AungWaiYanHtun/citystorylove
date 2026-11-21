/* Crush City — anime dating sim (portrait + landscape). Original characters & script. v1 */
(function () {
  const A = "crush-assets/", V = "?v=19";
  const tg = window.Telegram?.WebApp;
  const UID = (() => { try { return String(window.Telegram?.WebApp?.initDataUnsafe?.user?.id || ""); } catch { return ""; } })();
  const SAVE = UID ? "csl_crush_v1_" + UID : "csl_crush_v1";
  try { if (UID && !localStorage.getItem(SAVE) && localStorage.getItem("csl_crush_v1")) { localStorage.setItem(SAVE, localStorage.getItem("csl_crush_v1")); localStorage.removeItem("csl_crush_v1"); } } catch {}
  const GIRLS = [
    { k: "mina", name: "Mina", job: "Barista", home: "cafe", need: null },
    { k: "rina", name: "Rina", job: "Rock guitarist", home: "lounge", need: "Mina Lv.2" },
    { k: "lily", name: "Lily", job: "Art student", home: "park", need: "Mina Lv.3" },
    { k: "sora", name: "Sora", job: "Fitness coach", home: "studio", need: "Mina Lv.4" },
  ];
  const BG = { lounge: "bg_lounge", cafe: "bg_cafe", studio: "bg_studio", park: "bg_park", street: "bg_street", shop: "bg_shop", rain: "bg_rain", market: "bg_market" };
  const EMAX = 25, EREGEN = 6 * 60 * 1000, TALK_E = 1, DATE_E = 5, GAME_COST = 300, LV_AFF = 100;
  const S0 = { name: "", adult: false, opt: { speed: 1, sound: true, music: true, vib: true }, energy: EMAX, eT: Date.now(), coins: 100, gems: 3, intro: false, cur: "mina", g: { mina: { aff: 0, lv: 1, date: 0, cg: [] } } };
  let S, ui, story;

  const load = () => { try { S = Object.assign(JSON.parse(JSON.stringify(S0)), JSON.parse(localStorage.getItem(SAVE) || "{}")); } catch { S = JSON.parse(JSON.stringify(S0)); } S.opt = Object.assign({ speed: 1, sound: true, music: true, vib: true }, S.opt || {}); };
  const save = () => { try { localStorage.setItem(SAVE, JSON.stringify(S)); } catch {} };
  const G = (k) => (S.g[k] = S.g[k] || { aff: 0, lv: 1, date: 0, cg: [] });
  // tidy asset folders: crush-assets/<Girl>/<Girl>.webp, <Girl>/cg/, <Girl>/outfits/, <Girl>/voice/, bg/, ui/, music/
  const cap = (k) => k.charAt(0).toUpperCase() + k.slice(1);
  const img = (n) => {
    if (n.startsWith("g_")) { const N = cap(n.slice(2)); return `${A}${N}/${N}.webp${V}`; }
    if (n.startsWith("cg_")) { const id = n.slice(3); return `${A}${cap(id.replace(/\d+$/, ""))}/cg/${id}.webp${V}`; }
    if (n.startsWith("bg_")) return `${A}bg/${n.slice(3)}.webp${V}`;
    return `${A}ui/${n}.webp${V}`;
  };
  const VOICE = { mina: ["ah", "laugh", "hello", "thanks", "okay", "love", "what", "hey", "gasp", "giggle"] };
  const FACES = { mina: ["pout", "blush", "surprise", "laugh", "blink"] }; // <Girl>/face/*.webp, drawn over the face
  const POSES = { mina: ["head", "cheek", "hand", "shoulder", "body"] }; // <Girl>/pose/<zone>.webp, full-body reaction poses (598px wide canvas, 40px wider each side)
  const FACE_BOX = { mina: [37.645, 6.364, 27.992, 13.818] }; // left, top, width, height in % of the sprite
  // touch reactions: zone -> face, motion, voice, lines
  const TOUCH = {
    head: { face: "pout", anim: "shake", v: "what", t: ["Hey! Not my hair!", "Mou~ you'll mess up my twin tails!", "I'm not a puppy, stop patting me!", "Hmph! My bows took forever!"] },
    cheek: { face: "blush", anim: "bounce", v: "giggle", t: ["W-what are you doing…?", "My cheeks are getting warm…", "Ehehe… that tickles.", "D-don't stare so close!"] },
    hand: { face: "laugh", anim: "hop", v: "laugh", t: ["High five!", "Hehe, hi again!", "Holding my hand? …Okay, just a little.", "Yay! You noticed me waving!"] },
    shoulder: { face: "surprise", anim: "jump", v: "gasp", t: ["Eh?! You scared me!", "Oh! What is it?", "Huh? Did you call me?"] },
    body: { face: "pout", anim: "back", v: "hey", t: ["Hey! Hands to yourself!", "Too close! Personal space, please!", "Ah-ah! Behave!"] },
  }; // files in <Girl>/voice/
  // ---------- outfits + level rewards (FREE row / GOLD row bought with ⭐) ----------
  const OUTFITS = { mina: [
    { id: "default", name: "Barista" },
    { id: "purple_dress", name: "Party Dress" }, { id: "star_bikini", name: "Star Bikini" }, { id: "green_romper", name: "Green Romper" },
    { id: "leather_jacket", name: "Biker Jacket" }, { id: "white_dress", name: "White Dress" }, { id: "denim_overalls", name: "Denim Overalls" },
    { id: "vip_retro_aerobics", name: "Retro Aerobics", vip: 1 }, { id: "vip_coral_lace", name: "Coral Lace", vip: 1 }, { id: "vip_yellow_biker", name: "Yellow Biker", vip: 1 },
    { id: "vip_idol_ruffle", name: "Idol Ruffle", vip: 1 }, { id: "vip_navy_sport", name: "Navy Sport", vip: 1 }, { id: "vip_autumn_chic", name: "Autumn Chic", vip: 1 },
    { id: "vip_heart_denim", name: "Heart Denim", vip: 1 }, { id: "vip_rock_star", name: "Rock Star", vip: 1 }, { id: "vip_hero_suit", name: "Hero Suit", vip: 1 },
  ] };
  // one reward per level: o = outfit, c = coins, g = gems, p = photo
  const TRACK = { mina: { price: 100, item: "crush_mina_gold",
    free: [{ o: "purple_dress" }, { c: 500 }, { p: "mina3" }, { o: "star_bikini" }, { o: "green_romper" }, { c: 1000 }, { p: "mina4" }, { o: "leather_jacket" }, { o: "white_dress" }, { o: "denim_overalls" }],
    gold: [{ o: "vip_retro_aerobics" }, { o: "vip_coral_lace" }, { p: "mina5", g: 10 }, { o: "vip_yellow_biker" }, { o: "vip_idol_ruffle" }, { o: "vip_navy_sport" }, { o: "vip_autumn_chic" }, { o: "vip_heart_denim" }, { o: "vip_rock_star" }, { o: "vip_hero_suit" }] } };
  const outSrc = (k, id) => `${A}${cap(k)}/outfits/${id}.webp${V}`;
  const W = (k) => { const g = G(k); g.own = g.own || ["default"]; g.wear = g.wear || "default"; g.cl = g.cl || { f: [], g: [] }; return g; };
  const MUSIC = { main: "main", date: "date", talk: "talk", d_cafe: "d_cafe", d_park: "d_park", d_lounge: "d_lounge", d_studio: "d_studio", d_street: "d_street", d_shop: "d_shop", d_rain: "d_rain", d_market: "d_market" };
  const el = (h) => { const d = document.createElement("div"); d.innerHTML = h.trim(); return d.firstChild; };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const haptic = (t) => { if (S && S.opt.vib === false) return; try { tg?.HapticFeedback?.impactOccurred?.(t || "light"); } catch {} };
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const FLAG_DEF = { cat: "the kitten", cafe: "Mina's Corner" };
  const nm = (t) => String(t || "").replace(/\{P\}/g, S.name || "You").replace(/\{(cat|cafe)\}/g, (_, k) => (S.f && S.f[k]) || FLAG_DEF[k]);
  // ---------- music + voices ----------
  const AU = { bgm: null, track: "", want: "", unlocked: false, voice: null, girl: "mina" };
  function music(track) {
    AU.want = track || AU.want;
    if (!S || !S.opt.music || !AU.unlocked || !ui) { if (AU.bgm) AU.bgm.pause(); return; }
    if (AU.track !== AU.want || !AU.bgm) {
      if (AU.bgm) { const old = AU.bgm; fade(old, 0, 900, () => old.pause()); }
      const a = new Audio(`${A}music/${MUSIC[AU.want]}.mp3${V}`); a.loop = true; a.volume = 0; AU.bgm = a; AU.track = AU.want;
      a.play().then(() => fade(a, 0.45, 1000)).catch(() => {});
    } else if (AU.bgm.paused) { AU.bgm.play().then(() => fade(AU.bgm, 0.45, 600)).catch(() => {}); }
  }
  function fade(a, to, ms, done) {
    const from = a.volume, t0 = performance.now();
    const f = (now) => { const k = Math.min(1, (now - t0) / ms); try { a.volume = Math.max(0, Math.min(1, from + (to - from) * k)); } catch {} if (k < 1) requestAnimationFrame(f); else done && done(); };
    requestAnimationFrame(f);
  }
  function unlockAudio() { if (AU.unlocked) return; AU.unlocked = true; music(); }
  function voice(clip, k) {
    k = k || AU.girl;
    if (!S || !S.opt.sound || !(VOICE[k] || []).includes(clip)) return;
    try {
      if (AU.voice) AU.voice.pause();
      const v = new Audio(`${A}${cap(k)}/voice/${clip}.mp3${V}`); v.volume = 1; AU.voice = v;
      if (AU.bgm && !AU.bgm.paused) { fade(AU.bgm, 0.15, 150); v.onended = () => AU.bgm && fade(AU.bgm, 0.45, 500); }
      v.play().catch(() => {});
    } catch {}
  }
  function stopAudio() { try { AU.bgm && AU.bgm.pause(); AU.voice && AU.voice.pause(); } catch {} AU.bgm = null; AU.track = ""; }

  // tiny synth sound effects (no audio files needed)
  let AC = null;
  function sfx(kind) {
    if (!S || !S.opt.sound) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume();
      const notes = { tap: [[660, 0, .06]], ok: [[660, 0, .08], [880, .07, .1]], heart: [[784, 0, .09], [988, .08, .09], [1318, .16, .16]], lv: [[523, 0, .1], [659, .1, .1], [784, .2, .1], [1046, .3, .25]], no: [[300, 0, .12], [220, .1, .16]] }[kind] || [[660, 0, .06]];
      const t0 = AC.currentTime;
      notes.forEach(([f, d, l]) => { const o = AC.createOscillator(), g = AC.createGain(); o.type = "triangle"; o.frequency.value = f; g.gain.setValueAtTime(.0001, t0 + d); g.gain.exponentialRampToValueAtTime(.18, t0 + d + .01); g.gain.exponentialRampToValueAtTime(.0001, t0 + d + l); o.connect(g).connect(AC.destination); o.start(t0 + d); o.stop(t0 + d + l + .02); });
    } catch {}
  }

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
      <div class="cc-hud hidden"><span class="cc-pill"><i class="cc-plus" data-buy="e">+</i><b class="cc-e"></b><em>⚡</em></span><span class="cc-pill"><i class="cc-plus" data-buy="c">+</i><b class="cc-c"></b><em class="cc-coin"></em></span><span class="cc-pill"><i class="cc-plus" data-buy="g">+</i><b class="cc-g"></b><em>💎</em></span><button class="cc-gear" aria-label="Settings">⚙️</button></div>
      <div class="cc-ui"></div><div class="cc-layer"></div></div></div>`) };
    ui.stage = ui.root.querySelector(".cc-stage"); ui.bg = ui.root.querySelector(".cc-bg"); ui.girl = ui.root.querySelector(".cc-girl");
    ui.ui = ui.root.querySelector(".cc-ui"); ui.layer = ui.root.querySelector(".cc-layer");
    document.body.appendChild(ui.root); document.body.classList.add("cc-open");
    addEventListener("resize", fitStage); try { tg?.onEvent?.("viewportChanged", fitStage); } catch {}
    fitStage();
    ui.root.querySelector(".cc-gear").onclick = () => settings();
    ui.root.querySelectorAll(".cc-plus").forEach((b) => (b.onclick = () => adOffer(b.dataset.buy)));
    ui.timer = setInterval(() => ui && hud(), 10000);
    ui.root.addEventListener("pointerdown", unlockAudio, { once: true });
    ui.vis = () => { if (document.hidden) { AU.bgm && AU.bgm.pause(); } else music(); };
    document.addEventListener("visibilitychange", ui.vis);
    title();
  }
  function close() {
    if (!ui) return; clearInterval(ui.timer); removeEventListener("resize", fitStage); document.removeEventListener("visibilitychange", ui.vis); stopAudio(); AU.unlocked = false;
    ui.root.remove(); ui = null; document.body.classList.remove("cc-open");
    try {  } catch {}
  }

  function setBg(k) { ui.bg.style.backgroundImage = `url('${img(BG[k] || k)}')`; }
  function showGirl(k, dressed) {
    clearTimeout(ui.faceT); clearTimeout(ui.blinkT); clearTimeout(ui.poseT); ui.gk = k; ui.hit = null; ui.busyFace = false; ui.mood = null;
    // a worn outfit is its own full drawing (own hair + pose), so the default face/pose overlays are skipped
    const wear = k && dressed && OUTFITS[k] ? W(k).wear : "default", plain = wear !== "default";
    const fb = plain ? null : FACE_BOX[k];
    ui.girl.innerHTML = k ? `<div class="cc-gw"><div class="cc-gb"><img class="cc-gbase" src="${plain ? outSrc(k, wear) : img("g_" + k)}" alt="">${fb ? `<img class="cc-face" alt="" style="left:${fb[0]}%;top:${fb[1]}%;width:${fb[2]}%;height:${fb[3]}%">` : ""}${POSES[k] && !plain ? `<img class="cc-pose" alt="">` : ""}</div></div>` : "";
    ui.girl.className = "cc-girl" + (k ? " on" : "");
    if (k && FACES[k] && !plain) { FACES[k].forEach((f) => { const i = new Image(); i.src = faceSrc(k, f); }); blinkLoop(); }
    if (k && POSES[k] && !plain) POSES[k].forEach((z) => { const i = new Image(); i.src = poseSrc(k, z); });
  }
  const poseSrc = (k, z) => `${A}${cap(k)}/pose/${z}.webp${V}`;
  // swap the whole body into a reaction pose, then ease back to idle
  function setPose(z, ms) {
    const gb = ui.girl.querySelector(".cc-gb"), pe = ui.girl.querySelector(".cc-pose");
    if (!gb || !pe || !POSES[ui.gk] || !POSES[ui.gk].includes(z)) return false;
    clearTimeout(ui.poseT);
    const show = () => { gb.classList.add("posing"); ui.busyFace = true; };
    const src = poseSrc(ui.gk, z);
    if (pe.getAttribute("src") !== src) { pe.onload = show; pe.src = src; if (pe.complete) show(); } else show();
    ui.poseT = setTimeout(() => { gb.classList.remove("posing"); ui.busyFace = false; }, ms);
    return true;
  }
  const faceSrc = (k, f) => `${A}${cap(k)}/face/${f}.webp${V}`;
  function setFace(f, ms) {
    const el = ui && ui.girl.querySelector(".cc-face"); if (!el) return;
    clearTimeout(ui.faceT);
    if (f && FACES[ui.gk].includes(f)) { el.src = faceSrc(ui.gk, f); el.classList.add("on"); } else el.classList.remove("on");
    ui.busyFace = !!f && f !== "blink";
    if (f && ms) ui.faceT = setTimeout(() => setFace(null), ms);
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  // story expression: face overlay held for the line + a small motion
  const MOOD_ANIM = { surprise: "jump", laugh: "hop", pout: "shake", blush: "bounce" };
  function mood(f) {
    if (!ui || !ui.gk) return;
    if (!f) { if (ui.mood) { ui.mood = null; setFace(null); } return; }
    if (f === ui.mood) return; ui.mood = f; setFace(f, 0); if (MOOD_ANIM[f]) anim(MOOD_ANIM[f]);
  }
  function blinkLoop() {
    clearTimeout(ui.blinkT);
    ui.blinkT = setTimeout(() => { if (!ui || !ui.gk) return; if (!ui.busyFace) setFace("blink", 140); blinkLoop(); }, 2600 + Math.random() * 2600);
  }
  function anim(name) {
    const w = ui.girl.querySelector(".cc-gw"); if (!w) return;
    w.classList.remove("a-shake", "a-bounce", "a-hop", "a-jump", "a-back"); void w.offsetWidth; w.classList.add("a-" + name);
  }
  // which part of the girl was touched (sprite-relative %), null = missed her
  function touchZone(e) {
    const im = ui.girl.querySelector(".cc-gbase"); if (!im) return null;
    const r = im.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return null;
    try { // ignore taps on transparent pixels
      if (!ui.hit) { const c = document.createElement("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext("2d").drawImage(im, 0, 0); ui.hit = c.getContext("2d"); ui.hitK = ui.gk; }
      const px = (x * im.naturalWidth) | 0, py = (y * im.naturalHeight) | 0, R = 18; // finger-sized tolerance
      const d = ui.hit.getImageData(Math.max(0, px - R), Math.max(0, py - R), R * 2, R * 2).data; let hit = false;
      for (let i = 3; i < d.length; i += 16) if (d[i] > 60) { hit = true; break; }
      if (!hit) return null;
    } catch {}
    const fb = FACE_BOX[ui.gk] || [37, 6, 28, 14];
    const fx = x * 100, fy = y * 100;
    if (fx > 70 && fy > 9 && fy < 31) return "hand";
    if ((fx < 24 || fx > 76) && fy < 58) return "head"; // twin tails
    if (fy < fb[1] + fb[3] && fx > fb[0] + 3 && fx < fb[0] + fb[2] - 3 && fy > fb[1] + fb[3] * 0.38) return "cheek";
    if (fy < fb[1] + fb[3] * 1.05) return "head";
    if (fy < 33) return "shoulder";
    return "body";
  }
  function onTouchGirl(e) {
    if (e.target !== ui.ui || !ui.gk || !ui.ui.querySelector(".cc-hello")) return;
    const z = touchZone(e); if (!z) return;
    const now = performance.now(); if (now - (ui.lastTouch || 0) < 650) return; ui.lastTouch = now;
    const r = TOUCH[z];
    ui.touchN = (ui.touchZ === z ? (ui.touchN || 0) + 1 : 0); ui.touchZ = z;
    if (!setPose(z, 2300)) setFace(r.face, 1900); anim(r.anim); voice(r.v, ui.gk); haptic(z === "body" || z === "head" ? "medium" : "light"); sfx(z === "body" || z === "head" ? "tap" : "heart");
    const h = ui.ui.querySelector(".cc-hello"); if (h) { h.textContent = r.t[ui.touchN % r.t.length]; h.classList.remove("pop"); void h.offsetWidth; h.classList.add("pop"); }
  }
  function hudOn(on) { ui.root.querySelector(".cc-hud").classList.toggle("hidden", !on); if (on) hud(); }

  // ---------- title ----------
  function title() {
    hudOn(false); showGirl(null); setBg(ui.stage.classList.contains("port") ? "title_key_port" : "title_key"); music("main");
    const TIPS = ["Tip: Talk every day to raise affection.", "Tip: Dates unlock new chapters and photos.", "Tip: Energy refills 1 every 6 minutes.", "Tip: Some answers make her heart race more than others."];
    ui.ui.innerHTML = `<div class="cc-title"><img class="cc-logo" src="${img("logo")}" alt="Crush City"><button class="cc-tgear" aria-label="Settings">⚙️</button><button class="cc-texit" aria-label="Exit">✕</button><div class="cc-load"><div class="cc-bar"><i></i></div><div class="cc-pct">Loading… 0%</div><div class="cc-tip">${TIPS[(Math.random() * TIPS.length) | 0]}</div></div><div class="cc-tap hidden">Tap to start</div><div class="cc-ver">v1.0</div></div>`;
    const bar = ui.ui.querySelector(".cc-bar i"), tap = ui.ui.querySelector(".cc-tap"), pct = ui.ui.querySelector(".cc-pct");
    ui.ui.querySelector(".cc-tgear").onclick = (e) => { e.stopPropagation(); settings(true); };
    ui.ui.querySelector(".cc-texit").onclick = (e) => { e.stopPropagation(); close(); };
    const pre = ["bg_lounge", "bg_cafe", "bg_park", "bg_studio", "g_mina", "cg_mina1", "cg_mina2"].map((n) => new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = img(n); }));
    let done = 0; pre.forEach((p) => p.then(() => { const v = Math.round((++done / pre.length) * 100); bar.style.width = v + "%"; pct.textContent = `Loading… ${v}%`; }));
    Promise.race([Promise.all(pre), wait(8000)]).then(() => {
      bar.style.width = "100%"; ui.ui.querySelector(".cc-load").classList.add("hidden"); tap.classList.remove("hidden");
      const t = ui.ui.querySelector(".cc-title");
      const go = async (e) => {
        if (e.target.closest("button")) return;
        t.onclick = null; sfx("ok"); haptic();
        if (!S.adult && !(await ageGate())) { t.onclick = go; return; }
        if (!S.name) await askName(false);
        if (!S.intro) { await play(story.prologue, "mina"); S.intro = true; G("mina"); save(); }
        home("mina");
      };
      t.onclick = go;
    });
  }

  // ---------- dialogue player ----------
  function bubble(name, text, tapHint) {
    return new Promise((res) => {
      text = nm(text);
      ui.ui.innerHTML = `<div class="cc-say ${name ? "" : "narr"}">${name ? `<b>${esc(nm(name))}</b>` : ""}<p></p>${tapHint ? `<small>Tap to continue</small>` : ""}</div>`;
      const p = ui.ui.querySelector("p"); let i = 0, full = false; const step = [1, 2, 4][S.opt.speed ?? 1];
      if (S.opt.speed === 3) { p.textContent = text; full = true; }
      const tick = full ? 0 : setInterval(() => { i += step; p.textContent = text.slice(0, i); if (i >= text.length) { clearInterval(tick); full = true; } }, 24);
      ui.ui.onclick = () => { if (!full) { clearInterval(tick); p.textContent = text; full = true; return; } ui.ui.onclick = null; sfx("tap"); res(); };
    });
  }
  function choose(name, line, opts) {
    return new Promise((res) => {
      ui.ui.innerHTML = `<div class="cc-say side">${name ? `<b>${esc(nm(name))}</b>` : ""}<p>${esc(nm(line))}</p></div><div class="cc-choices">${opts.map((o, i) => `<button data-i="${i}">${esc(nm(o[0]))}</button>`).join("")}</div>`;
      ui.ui.onclick = null;
      if (ui.stage.classList.contains("port")) { const c = ui.ui.querySelector(".cc-choices"), sy = ui.ui.querySelector(".cc-say.side"); sy.style.bottom = (40 + c.offsetHeight + 70) + "px"; }
      ui.ui.querySelectorAll(".cc-choices button").forEach((b) => (b.onclick = (e) => { e.stopPropagation(); haptic(); sfx("ok"); res(opts[+b.dataset.i]); }));
    });
  }
  function cgView(id, cap) {
    return new Promise((res) => {
      const v = el(`<div class="cc-cg"><img src="${img("cg_" + id)}" alt=""><p>${esc(nm(cap || ""))}</p><button class="cc-x">✕</button></div>`);
      ui.layer.appendChild(v); requestAnimationFrame(() => v.classList.add("on"));
      v.onclick = () => { v.remove(); res(); };
    });
  }
  async function play(steps, girl) {
    AU.girl = girl || AU.girl; hudOn(false); let last = { name: "", text: "" };
    for (const st of steps) {
      if (st.bg) { setBg(st.bg); if (String(AU.want).startsWith("d_") && MUSIC["d_" + st.bg]) music("d_" + st.bg); }
      if (st.show) showGirl(st.show);
      if (st.hide) showGirl(null);
      if (st.n) { await bubble("", st.n, true); last = { name: "", text: st.n }; }
      if (st.s) { mood(st.s[2]); await bubble(st.s[0], st.s[1], true); last = { name: st.s[0], text: st.s[1] }; }
      if (st.c) { const o = await choose(last.name, last.text, st.c); if (o[4]) { S.f = Object.assign(S.f || {}, o[4]); save(); } addAff(girl, o[1], true); hearts(o[1]); if (o[2]) { mood(o[3]); await bubble(last.name || "", o[2], true); } }
      if (st.n || st.c) mood(null);
      if (st.cg) { const g = G(girl); if (!g.cg.includes(st.cg)) g.cg.push(st.cg); save(); await cgView(st.cg, st.cap); }
    }
    ui.ui.onclick = null;
  }
  function hearts(n) {
    if (!n) return; sfx("heart"); if (n >= 12) voice("ah"); else if (n >= 10) voice("laugh"); const h = el(`<div class="cc-pop">${n >= 12 ? "💖" : n >= 8 ? "❤️" : "🤍"} +${n}</div>`);
    ui.layer.appendChild(h); setTimeout(() => h.remove(), 1300);
  }
  function addAff(k, n, quiet) {
    const g = G(k); g.aff += n; let up = false;
    while (g.aff >= LV_AFF) { g.aff -= LV_AFF; g.lv++; up = true; }
    save(); if (up && !quiet) levelUp(k); else if (up) ui.pendingLv = k;
  }
  function levelUp(k) {
    const g = G(k), unlock = GIRLS.find((x) => x.need === `${GIRLS.find((y) => y.k === k).name} Lv.${g.lv}`);
    const pics = (story.gallery[k] || []).filter((p) => p.lv === g.lv && !p.track);
    S.coins += 50 * g.lv; S.gems += 1; save(); haptic("heavy"); sfx("lv"); setTimeout(() => voice("love", k), 500);
    popup(`Level ${g.lv}!`, `<div class="cc-big">💖</div><p>${GIRLS.find((y) => y.k === k).name} likes you more.</p><p class="cc-rw">+${50 * g.lv} <span class="cc-coin"></span> &nbsp; +1 💎</p>${pics.length ? `<p>📸 New photo in Gallery!</p>` : ""}${TRACK[k] && g.lv <= TRACK[k].free.length ? `<p>🎁 New level reward! Open Progress.</p>` : ""}${unlock ? `<p>🔓 ${unlock.name} unlocked (story coming soon)</p>` : ""}`, [["Yay!", "green"]]).then(() => { hud(); if (ui.ui.querySelector(".cc-hello")) home(k); });
    pics.forEach((p) => { if (!g.cg.includes(p.id)) g.cg.push(p.id); }); save();
  }


  // ---------- first-run: age check, name, settings ----------
  function box(title, body, noClose) {
    const p = el(`<div class="cc-modal"><div class="cc-box"><div class="cc-ribbon">${title}</div>${noClose ? "" : `<button class="cc-close">✕</button>`}<div class="cc-body">${body}</div></div></div>`);
    ui.layer.appendChild(p); return p;
  }
  function ageGate() {
    return new Promise((res) => {
      const p = box("Welcome!", `<div class="cc-big">💌</div><p>Crush City is a romance story for adults.</p><p>Are you 18 or older?</p><div class="cc-btns"><button class="cc-btn yellow" data-a="0">No</button><button class="cc-btn green" data-a="1">Yes, I'm 18+</button></div>`, true);
      p.querySelectorAll("[data-a]").forEach((b) => (b.onclick = async () => {
        if (b.dataset.a === "1") { sfx("ok"); S.adult = true; save(); p.remove(); res(true); }
        else { sfx("no"); p.remove(); await popup("Sorry!", `<div class="cc-big">🔞</div><p>This game is only for players 18 and older.</p>`, [["OK", "blue"]]); res(false); }
      }));
    });
  }
  function askName(canCancel) {
    return new Promise((res) => {
      const p = box("What's your name?", `<p>Mina will call you by this name.</p><input class="cc-in" maxlength="12" placeholder="Your name" value="${esc(S.name || "")}"><p class="cc-err hidden">Please type a name (1–12 letters).</p><div class="cc-btns"><button class="cc-btn yellow cc-rnd">🎲 Random</button><button class="cc-btn green cc-ok">OK</button></div>`, !canCancel);
      const inp = p.querySelector(".cc-in"), err = p.querySelector(".cc-err");
      const RN = ["Alex", "Jay", "Kai", "Leo", "Max", "Ryan", "Theo", "Sam", "Nico", "Ethan"];
      p.querySelector(".cc-rnd").onclick = () => { sfx("tap"); inp.value = RN[(Math.random() * RN.length) | 0]; };
      const ok = () => {
        const v = inp.value.replace(/[<>{}]/g, "").trim();
        if (!v) { sfx("no"); err.classList.remove("hidden"); return; }
        sfx("ok"); S.name = v.slice(0, 12); save(); p.remove(); res(true);
      };
      p.querySelector(".cc-ok").onclick = ok;
      inp.onkeydown = (e) => { if (e.key === "Enter") { inp.blur(); ok(); } };
      const c = p.querySelector(".cc-close"); if (c) c.onclick = () => { p.remove(); res(false); };
      setTimeout(() => { try { inp.focus(); } catch {} }, 250);
    });
  }
  function settings(fromTitle) {
    const seg = (key, labels) => `<div class="cc-seg" data-k="${key}">${labels.map((l, i) => `<button data-v="${i}" class="${(key === "speed" ? S.opt.speed : S.opt[key] ? 1 : 0) === i ? "on" : ""}">${l}</button>`).join("")}</div>`;
    const p = box("Settings", `
      <div class="cc-set"><span>📝 Text speed</span>${seg("speed", ["Slow", "Normal", "Fast", "Instant"])}</div>
      <div class="cc-set"><span>🎵 Music</span>${seg("music", ["Off", "On"])}</div>
      <div class="cc-set"><span>🔊 Sound & voice</span>${seg("sound", ["Off", "On"])}</div>
      <div class="cc-set"><span>📳 Vibration</span>${seg("vib", ["Off", "On"])}</div>
      <div class="cc-set"><span>🙂 Your name</span><button class="cc-btn blue cc-sm cc-nm">${esc(S.name || "—")} ✏️</button></div>
      <p class="cc-cred">Music: Djaro, OwlishMedia, TERNOX (CC0) · Voice: cicifyre (CC0)</p>
      <div class="cc-btns"><button class="cc-btn yellow cc-reset">↺ Restart</button><button class="cc-btn green cc-exit">🚪 Exit game</button></div>`);
    p.querySelectorAll(".cc-seg").forEach((g) => g.querySelectorAll("button").forEach((b) => (b.onclick = () => {
      const k = g.dataset.k, v = +b.dataset.v; S.opt[k] = k === "speed" ? v : v === 1; save();
      g.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); sfx("tap"); if (k === "vib" && v) haptic(); if (k === "music") { unlockAudio(); music(); } if (k === "sound" && v) voice("okay");
    })));
    p.querySelector(".cc-close").onclick = () => p.remove();
    p.querySelector(".cc-nm").onclick = async () => { p.remove(); await askName(true); settings(fromTitle); };
    p.querySelector(".cc-exit").onclick = () => { p.remove(); close(); };
    p.querySelector(".cc-reset").onclick = async () => {
      p.remove();
      const r = await popup("Restart?", `<div class="cc-big">⚠️</div><p>All progress, coins and photos will be deleted.</p>`, [["Cancel", "blue"], ["Restart", "yellow"]]);
      if (r === 1) { const keep = { opt: S.opt, adult: S.adult }; localStorage.removeItem(SAVE); load(); Object.assign(S, keep); save(); title(); }
    };
  }

  // ---------- popups ----------
  function popup(title, body, btns) {
    return new Promise((res) => {
      const p = el(`<div class="cc-modal"><div class="cc-box"><div class="cc-ribbon">${title}</div><button class="cc-close">✕</button><div class="cc-body">${body}</div><div class="cc-btns">${btns.map((b, i) => `<button class="cc-btn ${b[1]}" data-i="${i}">${b[0]}</button>`).join("")}</div></div></div>`);
      ui.layer.appendChild(p);
      const end = (v) => { p.remove(); res(v); };
      p.querySelector(".cc-close").onclick = () => end(-1);
      p.querySelectorAll(".cc-btn").forEach((b) => (b.onclick = () => { sfx("ok"); end(+b.dataset.i); }));
    });
  }
  async function adOffer(kind) {
    const what = { e: ["Need energy?", "⚡", "+10 energy"], c: ["Need coins?", "<span class='cc-coin big'></span>", "+300 coins"], g: ["Need gems?", "💎", "+3 gems"] }[kind];
    const r = await popup(what[0], `<div class="cc-big">${what[1]}</div><p>Watch a short ad to get <b>${what[2]}</b>.</p>`, [["▶ Watch ad", "green"]]);
    if (r !== 0) return false;
    let ok = false;
    try { ok = window.CSLAds ? await window.CSLAds.reward("island", "en") : false; } catch {}
    if (!ok && !window.CSLAds) ok = true; // local test without ads
    if (ok) { if (kind === "e") S.energy += 10; if (kind === "c") S.coins += 300; if (kind === "g") S.gems += 3; save(); hud(); }
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
    S.cur = k; AU.girl = k; save(); music("main"); if (ui.lastHome !== k) setTimeout(() => voice("hello", k), 350); ui.lastHome = k;
    const gi = GIRLS.find((x) => x.k === k), g = G(k);
    setBg(gi.home); showGirl(k, true); hudOn(true);
    const lines = ["Hi! Good to see you.", "You came back! I missed you a little.", "Coffee? Or… me? Kidding!", "Where are we going today?"];
    ui.ui.innerHTML = `
      <button class="cc-girls">👭 Girls</button>
      <div class="cc-hello">${lines[(Math.random() * lines.length) | 0]}</div>
      <div class="cc-left"><button class="cc-sq gal"><span>🖼️</span>Gallery</button><div class="cc-row"><button class="cc-sq prog"><span>💞</span>Progress<i class="cc-lv">Lv.${g.lv}</i>${rwReady(k) ? `<i class="cc-dot">!</i>` : ""}</button><button class="cc-sq dress"><span>👗</span>Dress</button></div></div>
      <div class="cc-right"><button class="cc-big-btn talk">💬 TALK <small>⚡${TALK_E}</small></button><button class="cc-big-btn date">❤️ DATE <small>⚡${DATE_E}</small></button></div>`;
    ui.ui.onclick = null; ui.hit = null;
    ui.ui.onpointerdown = onTouchGirl;
    const q = (s) => ui.ui.querySelector(s);
    q(".talk").onclick = () => talk(k);
    q(".date").onclick = () => date(k);
    q(".gal").onclick = () => gallery(k);
    q(".prog").onclick = () => (TRACK[k] ? rewards(k) : progress(k));
    q(".dress").onclick = () => wardrobe(k);
    q(".cc-girls").onclick = girls;
  }

  async function talk(k) {
    if (!(await spend("e", TALK_E))) return;
    const pool = story.talk[k] || []; if (!pool.length) return;
    const g = G(k); g.seen = (g.seen || []).filter((i) => i < pool.length);
    if (g.seen.length >= pool.length) g.seen = [];
    const left = pool.map((_, i) => i).filter((i) => !g.seen.includes(i));
    const n = left[(Math.random() * left.length) | 0]; g.seen.push(n); save();
    const [line, face, opts] = pool[n], name = cap(k);
    music("talk");
    hudOn(false); mood(face); await sleep(250);
    const o = await choose(name, line, opts);
    S.coins += o[1]; save(); hearts(o[1]);
    mood(o[3]); await bubble(name, o[2], true); mood(null);
    addAff(k, o[1] * 2); home(k);
  }

  async function date(k) {
    const g = G(k), list = story[k] || [];
    if (g.date >= list.length) { await popup("To be continued", `<div class="cc-big">💌</div><p>You finished ${GIRLS.find((x) => x.k === k).name}'s story for now.</p><p>New dates are coming soon! Keep chatting to level up.</p>`, [["OK", "blue"]]); return; }
    const ch = list[g.date];
    const r = await popup("Go on a date?", `<p class="cc-ch">${ch.title}</p><p>Costs ⚡${DATE_E}</p>`, [["Let's go!", "green"]]);
    if (r !== 0 || !(await spend("e", DATE_E))) return;
    music(MUSIC["d_" + ch.bg] ? "d_" + ch.bg : "date");
    await play([{ bg: ch.bg }, ...ch.steps], k);
    g.date++; save(); voice("thanks", k);
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
        const coins = win * 15, aff = win * 6; S.coins += coins; save();
        await popup(win >= 4 ? "Perfect shoot!" : win >= 2 ? "Nice photos!" : "Try again!", `<div class="cc-big">${"❤️".repeat(win) || "💔"}</div><p class="cc-rw">+${coins} <span class="cc-coin"></span> &nbsp; +${aff} 💞</p>`, [["Great", "green"]]);
        addAff(k, aff); res();
      };
    });
  }

  // ---------- level rewards ----------
  function rwReady(k) {
    const t = TRACK[k]; if (!t) return false; const g = W(k), gold = hasGold(k);
    for (let i = 0; i < t.free.length && i < g.lv; i++) { if (!g.cl.f.includes(i + 1)) return true; if (gold && !g.cl.g.includes(i + 1)) return true; }
    return false;
  }
  function hasGold(k) {
    const g = W(k), t = TRACK[k]; if (g.gold) return true;
    try { if (t && window.CSLStars?.has?.(t.item)) { g.gold = true; save(); return true; } } catch {}
    return false;
  }
  function rwIcon(k, r) {
    if (r.o) return `<img class="rw-o" src="${outSrc(k, r.o)}" alt="">`;
    if (r.p) return `<span class="rw-p" style="background-image:url('${img("cg_" + r.p)}')">📸</span>${r.g ? `<em class="rw-x">+${r.g}💎</em>` : ""}`;
    if (r.c) return `<span class="rw-c"><span class="cc-coin big"></span><em>${r.c}</em></span>`;
    if (r.g) return `<span class="rw-c">💎<em>${r.g}</em></span>`;
    return "";
  }
  function rwName(k, r) {
    if (r.o) return (OUTFITS[k].find((x) => x.id === r.o) || {}).name || "Outfit";
    if (r.p) return "Photo"; if (r.c) return `${r.c} coins`; return `${r.g} gems`;
  }
  async function giveReward(k, r) {
    const g = W(k);
    if (r.c) S.coins += r.c;
    if (r.g) S.gems += r.g;
    if (r.o && !g.own.includes(r.o)) g.own.push(r.o);
    if (r.p && !g.cg.includes(r.p)) g.cg.push(r.p);
    save(); hud(); haptic("heavy"); sfx("lv");
    if (r.p) { const ph = (story.gallery[k] || []).find((x) => x.id === r.p); await cgView(r.p, ph ? ph.cap : ""); if (r.g) await popup("Bonus!", `<div class="cc-big">💎</div><p class="cc-rw">+${r.g} 💎</p>`, [["Yay!", "green"]]); return; }
    if (r.o) {
      const a = await popup("New outfit!", `<img class="rw-new" src="${outSrc(k, r.o)}" alt=""><p><b>${esc(rwName(k, r))}</b></p>`, [["Later", "blue"], ["👗 Wear", "green"]]);
      if (a === 1) { g.wear = r.o; save(); voice("love", k); }
      return;
    }
    await popup("Reward!", `<div class="cc-big">${r.c ? `<span class="cc-coin big"></span>` : "💎"}</div><p class="cc-rw">+${r.c || r.g} ${r.c ? `<span class="cc-coin"></span>` : "💎"}</p>`, [["Yay!", "green"]]);
  }
  async function buyGold(k) {
    const t = TRACK[k], have = window.CSLStars ? window.CSLStars.get() : 0;
    const r = await popup("Unlock GOLD", `<div class="cc-big">👑</div><p>Get all ${t.gold.length} GOLD rewards for ${GIRLS.find((x) => x.k === k).name}:</p><p>${t.gold.filter((x) => x.o).length} VIP outfits, a VIP photo and gems.</p><p>One-time price: <b>${t.price} ⭐</b></p><p><small>You have ${have} ⭐</small></p>`, [["Cancel", "blue"], [`Unlock ${t.price} ⭐`, "green"]]);
    if (r !== 1) return false;
    if (!window.CSLStars) { await popup("Not available", `<p>Stars are not ready. Please reopen the game.</p>`, [["OK", "blue"]]); return false; }
    if (have < t.price) {
      const m = await popup("Not enough ⭐", `<div class="cc-big">⭐</div><p>You need ${t.price - have} more ⭐.</p>`, [["Later", "blue"], ["Get ⭐", "green"]]);
      if (m === 1) window.CSLStars.open(); return false;
    }
    const res = await window.CSLStars.spend(t.price, t.item);
    if (!res.ok) { await popup("Oops", `<p>${esc(res.error || "Purchase failed.")}</p>`, [["OK", "blue"]]); return false; }
    W(k).gold = true; save(); haptic("heavy"); sfx("lv"); voice("love", k);
    await popup("GOLD unlocked!", `<div class="cc-big">👑</div><p>Claim your GOLD rewards on every level you reach.</p>`, [["Yay!", "green"]]);
    return true;
  }
  function rewards(k) {
    const t = TRACK[k]; if (!t) return;
    const g = W(k), name = GIRLS.find((x) => x.k === k).name;
    const p = el(`<div class="cc-modal rw-modal"><div class="rw-box"><div class="cc-ribbon">${name} · Progress</div><button class="cc-close">✕</button>
      <div class="rw-top"><span class="rw-lv">💞 Lv.${g.lv}</span><div class="cc-meter"><i style="width:${g.aff}%"></i><span>${g.aff}/${LV_AFF}</span></div></div>
      <div class="rw-main"><div class="rw-side"><div class="rw-lab free"><b>FREE</b><small>Friend gifts</small></div><div class="rw-lab gold"><b>GOLD</b><small>VIP gifts</small><button class="rw-buy"></button></div></div>
      <div class="rw-scroll"><div class="rw-cols"></div></div></div></div></div>`);
    ui.layer.appendChild(p);
    const draw = () => {
      const gold = hasGold(k), cols = p.querySelector(".rw-cols"), buy = p.querySelector(".rw-buy");
      buy.textContent = gold ? "✔ Unlocked" : `🔓 ${t.price} ⭐`; buy.disabled = gold; buy.classList.toggle("own", gold);
      cols.innerHTML = t.free.map((f, i) => {
        const L = i + 1, reach = g.lv >= L, fc = g.cl.f.includes(L), gc = g.cl.g.includes(L), gr = t.gold[i];
        const st = (claimed, ok) => claimed ? "done" : ok ? "ready" : "lock";
        return `<div class="rw-col ${reach ? "reach" : ""}">
          <button class="rw-c1 free ${st(fc, reach)}" data-row="f" data-l="${L}">${rwIcon(k, f)}<i class="rw-badge"></i><span class="rw-nm">${esc(rwName(k, f))}</span></button>
          <div class="rw-heart"><span>${L}</span></div>
          <button class="rw-c1 gold ${st(gc, reach && gold)} ${gold ? "" : "vip"}" data-row="g" data-l="${L}">${rwIcon(k, gr)}<i class="rw-badge"></i><span class="rw-nm">${esc(rwName(k, gr))}</span></button></div>`;
      }).join("");
      cols.querySelectorAll(".rw-c1").forEach((b) => (b.onclick = async () => {
        const row = b.dataset.row, L = +b.dataset.l, r = (row === "f" ? t.free : t.gold)[L - 1];
        if (b.classList.contains("done")) { sfx("tap"); return; }
        if (row === "g" && !hasGold(k)) { if (await buyGold(k)) draw(); return; }
        if (g.lv < L) { sfx("no"); await popup(`Level ${L}`, `<div class="cc-big">🔒</div><p>Reach Lv.${L} with ${name} to claim this.</p><p><small>Talk and date to fill hearts.</small></p>`, [["OK", "blue"]]); return; }
        (row === "f" ? g.cl.f : g.cl.g).push(L); save();
        await giveReward(k, r); draw();
      }));
      const first = cols.querySelector(".ready") || cols.querySelectorAll(".rw-col")[Math.max(0, g.lv - 1)];
      if (first) first.closest(".rw-col").scrollIntoView({ inline: "center", block: "nearest" });
    };
    p.querySelector(".rw-buy").onclick = async () => { if (await buyGold(k)) draw(); };
    p.querySelector(".cc-close").onclick = () => { p.remove(); home(k); };
    draw();
  }

  // ---------- wardrobe ----------
  function wardrobe(k) {
    const list = OUTFITS[k]; if (!list) return;
    const g = W(k), t = TRACK[k];
    const where = (id) => { for (const row of ["free", "gold"]) { const i = t[row].findIndex((r) => r.o === id); if (i >= 0) return [row, i + 1]; } return null; };
    const p = el(`<div class="cc-modal"><div class="cc-box wide wd-box"><div class="cc-ribbon">Wardrobe</div><button class="cc-close">✕</button><div class="cc-body"><div class="wd-grid"></div></div></div></div>`);
    ui.layer.appendChild(p);
    const draw = () => {
      p.querySelector(".wd-grid").innerHTML = list.map((o) => {
        const own = g.own.includes(o.id), on = g.wear === o.id, w = where(o.id);
        const lab = on ? "Selected" : own ? "Wear" : w ? `🔒 ${w[0] === "gold" ? "GOLD " : ""}Lv.${w[1]}` : "🔒";
        return `<button class="wd-c ${on ? "on" : ""} ${own ? "" : "lock"} ${o.vip ? "vip" : ""}" data-id="${o.id}">${o.vip ? `<i class="wd-vip">VIP</i>` : ""}<img src="${o.id === "default" ? img("g_" + k) : outSrc(k, o.id)}" alt=""><b>${esc(o.name)}</b><span>${lab}</span></button>`;
      }).join("");
      p.querySelectorAll(".wd-c").forEach((b) => (b.onclick = async () => {
        const id = b.dataset.id;
        if (!g.own.includes(id)) { sfx("no"); const r = await popup("Locked", `<div class="cc-big">🔒</div><p>Level up ${GIRLS.find((x) => x.k === k).name} to unlock this outfit.</p>`, [["OK", "blue"], ["💞 Progress", "green"]]); if (r === 1) { p.remove(); rewards(k); } return; }
        if (g.wear === id) return;
        g.wear = id; save(); sfx("ok"); haptic(); showGirl(k, true); anim("hop"); draw();
      }));
    };
    p.querySelector(".cc-close").onclick = () => { p.remove(); home(k); };
    draw();
  }

  // ---------- gallery / progress / girls ----------
  async function gallery(k) {
    const g = G(k), list = story.gallery[k] || [];
    list.forEach((p) => { if (!p.track && (p.date ? g.date >= p.date : p.lv <= g.lv) && !g.cg.includes(p.id)) g.cg.push(p.id); }); save(); // catch up older saves
    const body = `<div class="cc-gal">${list.map((p) => g.cg.includes(p.id) ? `<button class="cc-ph" data-id="${p.id}" style="background-image:url('${img("cg_" + p.id)}')"></button>` : `<div class="cc-ph lock"><b>🔒</b><span>${p.date ? "Date " + p.date : (p.track === "gold" ? "GOLD " : "") + "Lv." + p.lv}</span></div>`).join("")}</div>`;
    const p = el(`<div class="cc-modal"><div class="cc-box wide"><div class="cc-ribbon">Gallery · ${g.cg.filter((id) => list.some((x) => x.id === id)).length}/${list.length}</div><button class="cc-close">✕</button><div class="cc-body">${body}</div></div></div>`);
    ui.layer.appendChild(p); p.querySelector(".cc-close").onclick = () => p.remove();
    const open = list.filter((x) => g.cg.includes(x.id));
    p.querySelectorAll(".cc-ph[data-id]").forEach((b) => (b.onclick = () => { sfx("tap"); photoView(open, open.findIndex((x) => x.id === b.dataset.id)); }));
  }
  // full-screen photo viewer: caption bubble, ◀ ▶ arrows, ✕ close, swipe
  function photoView(list, i) {
    const v = el(`<div class="cc-pv"><img alt=""><button class="pv-x">✕</button><button class="pv-a l">❮</button><button class="pv-a r">❯</button><p></p></div>`);
    ui.layer.appendChild(v);
    const im = v.querySelector("img"), cp = v.querySelector("p");
    const show = () => { const x = list[i]; im.src = img("cg_" + x.id); cp.textContent = nm(x.cap || ""); v.querySelector(".l").style.visibility = i > 0 ? "" : "hidden"; v.querySelector(".r").style.visibility = i < list.length - 1 ? "" : "hidden"; };
    const go = (d) => { const n = i + d; if (n < 0 || n >= list.length) return; i = n; sfx("tap"); show(); };
    v.querySelector(".l").onclick = (e) => { e.stopPropagation(); go(-1); };
    v.querySelector(".r").onclick = (e) => { e.stopPropagation(); go(1); };
    v.querySelector(".pv-x").onclick = (e) => { e.stopPropagation(); v.remove(); };
    let sx = null; v.onpointerdown = (e) => { sx = e.clientX; }; v.onpointerup = (e) => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); };
    requestAnimationFrame(() => v.classList.add("on")); show();
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
    return `<button type="button" id="hub-crush" class="cc-card"><div class="cc-card-img" style="background-image:url('${img("title_key")}')"><span class="cc-card-tag">NEW</span></div><div class="cc-card-body"><b>💘 Crush City</b><small>Date, chat and fall in love in the city of neon.</small><span class="cc-card-play">Play</span></div></button>`;
  }
  story = window.CRUSH_STORY;
  window.CSLCrush = { open, close, cardHTML, _state: () => S };
})();
