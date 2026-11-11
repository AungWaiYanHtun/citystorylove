/*
  ✨ The Moon Crystal — fantasy romance visual novel (English, voiced). Story in moon-story.js.
  Play as Kael (love Lyra) or Lyra (love Kael). Voiced lines: moon-assets/vo/<hash>.mp3, close-ups lip-flap while speaking.
  Chapters 1–2 free, then 3 a Yangon day; ad = +2; VIP unlimited. Saves in localStorage + /api/save/moon.
*/
(function () {
  const $ = (id) => document.getElementById(id);
  const A = "moon-assets/", KEY = "csl_moon_v1";
  const tg = window.Telegram?.WebApp, API = window.VIDEOSPACE_CONFIG?.VIP_API_URL;
  const P = { K: { name: "Kael", col: "#78beff", pic: "c_kael_heal" }, L: { name: "Lyra", col: "#c4a0ff", pic: "c_lyra_heal" }, V: { name: "Malzar", col: "#ff5a5a" }, S: { name: "Sylvara", col: "#7ee0a0" } };
  const t = {
    title: "✨ The Moon Crystal", sub: "Magic, battles & a forbidden love", tag: "NEW · FANTASY",
    gate: "The Moon Crystal is a fantasy romance with battles, hugs and kisses (no nudity). I confirm I am 18 or older.", ok: "Enter ✨", back: "‹ Back",
    pick: "Who will you play?", rK: "Play as Kael · the knight ⚔️", rL: "Play as Lyra · the mage 🔮", start: "▶ Start", cont: "▶ Continue", restart: "↺ New story",
    tap: "Tap to continue", voice: "🔊 Voice", subs: "💬 Text", tix: (n) => `🎟️ ${n} free chapters left today`, vipOn: "👑 VIP · unlimited",
    gateT: "🎟️ Out of free chapters", gateP: "You get 3 free chapters every day (chapters 1–2 are always free). Watch a short ad to unlock 2 more, or get VIP for unlimited play with no ads.",
    adBtn: "📺 Watch ad: +2 chapters", vipBtn: "👑 VIP: unlimited, no ads", later: "Come back tomorrow", got: "🎟️ +2 chapters unlocked!",
    cg: { hug: "🤗 Hug unlocked", kiss: "💋 Kiss unlocked" }, miss: "The moment passes… maybe next time you'll be braver. 💭",
    soonH: "To be continued…", soonP: "New chapters are on the way. Your progress is saved — come back soon to continue the journey!", seasonH: "Next Season Soon", love: "Love", menu: "☰ Menu"
  };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const STORY = () => window.CSL_MOON_STORY || [];
  const hash = (s) => { let x = 5381; for (let i = 0; i < s.length; i++) x = ((x * 33) ^ s.charCodeAt(i)) >>> 0; return x.toString(36); };
  const FREE_FROM = 3, FREE_PER_DAY = 3, AD_CH = 2, GAIN = 0.55;
  let S = load(), typing = null, onTap = null, saveT = null, VIP = false, audio = null, flap = null, curBg = "", cu = {};

  const yday = () => new Date(Date.now() + 6.5 * 3600e3).toISOString().slice(0, 10);
  function tix() { if (!S.tix || S.tix.d !== yday()) S.tix = { d: yday(), used: 0, bonus: 0 }; return S.tix; }
  const left = () => { const x = tix(); return Math.max(0, FREE_PER_DAY + x.bonus - x.used); };
  function fresh() { return { v: 1, ts: Date.now(), adult: false, voice: true, cur: null, runs: {}, gallery: {} }; }
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); return s && s.v ? s : fresh(); } catch { return fresh(); } }
  function save() { S.ts = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} clearTimeout(saveT); saveT = setTimeout(push, 1500); }
  const hdr = () => ({ "Content-Type": "application/json", "X-Telegram-Init-Data": tg.initData });
  async function push() { if (!API || !tg?.initData) return; try { await fetch(API + "/api/save/moon", { method: "POST", headers: hdr(), body: JSON.stringify({ data: S }) }); } catch {} }
  async function pull() {
    if (!API || !tg?.initData) return;
    try { const j = await (await fetch(API + "/api/save/moon", { headers: hdr() })).json();
      if (j?.data?.v && Number(j.data.ts || 0) > Number(S.ts || 0)) { S = j.data; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} if ($("mn-root") && !S.cur) menu(); } } catch {}
  }
  async function checkVip() {
    if (!API || !tg?.initData) return;
    try { const j = await (await fetch(API + "/api/vip-status", { headers: hdr() })).json(); VIP = !!j.active; } catch {}
    const b = $("mn-tix"); if (b) b.textContent = VIP ? t.vipOn : t.tix(left());
  }
  function toast(msg) { const el = $("toast"); if (!el) return; el.textContent = msg; el.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("show"), 2600); }
  const run = () => S.runs[S.cur];
  const partner = () => (S.cur === "K" ? "L" : "K");

  // ---------- hub banner (under Love Gacha) ----------
  function bannerHTML() {
    return `<button type="button" class="lg-banner mn-banner" id="hub-moon"><span class="lg-bimg" style="background-image:url('${A}banner.webp')"></span>
      <span class="lg-btxt"><span class="lg-btag" style="background:#7c5cff">🔮 ${t.tag}</span><b>${t.title}</b><small>${esc(t.sub)}</small></span></button>`;
  }

  // ---------- open / close ----------
  function open() {
    $("mn-root")?.remove();
    const el = document.createElement("div"); el.id = "mn-root"; el.className = "sl-root mn-root";
    document.body.appendChild(el); document.body.classList.add("sl-lock");
    try { tg?.BackButton?.show?.(); tg?.BackButton?.onClick?.(back); } catch {}
    S.cur = null; menu(); pull(); checkVip();
  }
  function close() {
    stopVoice(); $("mn-root")?.remove(); document.body.classList.remove("sl-lock");
    try { tg?.BackButton?.offClick?.(back); tg?.BackButton?.hide?.(); } catch {}
  }
  function back() { stopVoice(); if (S.cur && $("mn-play")) { S.cur = null; save(); menu(); } else close(); }

  // ---------- menu ----------
  function menu() {
    const el = $("mn-root"); if (!el) return;
    if (!S.adult) {
      el.innerHTML = `<div class="sl-gate" style="background-image:url('${A}s01.webp')"><div class="sl-gbox"><h2>${t.title}</h2><p>${esc(t.gate)}</p>
        <button type="button" class="sl-gold" id="mn-ok">${t.ok}</button><button type="button" class="sl-ghost" id="mn-x">${t.back}</button></div></div>`;
      $("mn-ok").onclick = () => { S.adult = true; save(); menu(); }; $("mn-x").onclick = close; return;
    }
    const N = STORY().length;
    const routes = ["K", "L"].map((k) => { const r = S.runs[k], pct = r ? Math.round((r.i / N) * 100) : 0;
      return `<button type="button" class="sl-route" data-r="${k}"><span class="sl-rimg" style="background-image:url('${A}${k === "K" ? "s04" : "s02"}.webp');background-size:cover;background-position:center"></span>
        <b>${P[k].name}</b><small>${esc(k === "K" ? t.rK : t.rL)}</small>${r ? `<i class="sl-prog"><em style="width:${pct}%"></em></i>` : ""}</button>`; }).join("");
    el.innerHTML = `<div class="sl-menu" style="background-image:url('${A}s01.webp')"><div class="sl-top"><button type="button" class="sl-pill" id="mn-x">${t.back}</button>
      <span><button type="button" class="sl-pill" id="mn-voice">${t.voice} ${S.voice ? "ON" : "OFF"}</button> <button type="button" class="sl-pill" id="mn-subs">${t.subs} ${S.subs ? "ON" : "OFF"}</button></span></div>
      <h1>${t.title}</h1><p class="sl-sub">${esc(t.sub)}</p><p class="sl-tix" id="mn-tix">${VIP ? t.vipOn : t.tix(left())}</p><h3>${esc(t.pick)}</h3><div class="sl-routes">${routes}</div></div>`;
    $("mn-x").onclick = close;
    $("mn-voice").onclick = () => { S.voice = !S.voice; save(); menu(); };
    $("mn-subs").onclick = () => { S.subs = !S.subs; save(); menu(); };
    el.querySelectorAll("[data-r]").forEach((b) => (b.onclick = () => routeSheet(b.dataset.r)));
  }
  function routeSheet(k) {
    const r = S.runs[k], d = document.createElement("div"); d.className = "sl-sheet";
    d.innerHTML = `<div class="sl-sbox"><img src="${A}${P[k].pic}.webp" alt="" style="height:170px;border-radius:14px;object-fit:cover"><b>${P[k].name}</b>
      ${r && !r.done ? `<button type="button" class="sl-gold" data-a="c">${t.cont}</button>` : ""}<button type="button" class="${r && !r.done ? "sl-ghost" : "sl-gold"}" data-a="n">${r ? t.restart : t.start}</button><button type="button" class="sl-ghost" data-a="x">${t.back}</button></div>`;
    $("mn-root").appendChild(d);
    d.onclick = (e) => {
      const a = e.target.closest("[data-a]")?.dataset.a; if (!a) { if (e.target === d) d.remove(); return; }
      if (a === "x") return d.remove();
      if (a === "n" || !S.runs[k]) S.runs[k] = { i: 0, love: 10, done: false, unl: 0 };
      S.cur = k; save(); d.remove(); play();
    };
  }

  // ---------- chapter tickets ----------
  function chapterGate(ch) {
    const r = run();
    if (VIP || ch < FREE_FROM || (r.unl || 0) >= ch) return Promise.resolve(true);
    if (left() > 0) { tix().used++; r.unl = ch; save(); return Promise.resolve(true); }
    return new Promise((res) => {
      const d = document.createElement("div"); d.className = "sl-sheet sl-adgate";
      d.innerHTML = `<div class="sl-sbox"><div class="sl-gico">🎟️</div><b>${esc(t.gateT)}</b><p>${esc(t.gateP)}</p>
        <button type="button" class="sl-gold" data-a="ad">${esc(t.adBtn)}</button><button type="button" class="sl-ghost" data-a="vip">${esc(t.vipBtn)}</button><button type="button" class="sl-ghost" data-a="x">${esc(t.later)}</button></div>`;
      $("mn-play").appendChild(d); $("mn-box")?.classList.add("hide");
      d.addEventListener("click", async (e) => {
        e.stopPropagation(); const a = e.target.closest("[data-a]")?.dataset.a; if (!a) return;
        if (a === "x") { d.remove(); res(false); return; }
        if (a === "vip") { document.dispatchEvent(new CustomEvent("videospace:open-vip-plans")); return; }
        const ok = await window.CSLAds?.reward?.("moon", "en");
        if (ok) { tix().bonus += AD_CH; tix().used++; r.unl = ch; save(); d.remove(); $("mn-box")?.classList.remove("hide"); toast(t.got); res(true); }
      });
    });
  }

  // ---------- play ----------
  function play() {
    const el = $("mn-root");
    el.innerHTML = `<div class="sl-play" id="mn-play"><div class="sl-bg mn-bg" id="mn-bg"></div><div class="mn-bg mn-cu" id="mn-cu"></div>
      <div class="sl-hud"><button type="button" class="sl-pill" id="mn-x">${t.back}</button><span class="sl-chap" id="mn-chap"></span><span class="sl-love"><i>💗</i><span class="sl-lbar"><em id="mn-lv"></em></span></span></div>
      <div class="sl-box mn-box" id="mn-box"><span class="sl-who hide" id="mn-who"></span><p id="mn-txt"></p><small class="sl-tap">${t.tap} ▾</small></div><div class="sl-ch" id="mn-chs"></div></div>`;
    $("mn-x").onclick = (e) => { e.stopPropagation(); back(); };
    $("mn-play").addEventListener("click", (e) => { if (e.target.closest(".sl-ch button,.sl-hud,.sl-sheet,.mn-soon")) return; tap(); });
    let chn = null; for (let i = 0; i <= run().i && i < STORY().length; i++) { const n = STORY()[i]; if (n.ch) chn = n; }
    if (chn) { cu = chn.cu || {}; setBg(chn.bg); $("mn-chap").textContent = chn.title.split("·")[0].trim(); }
    for (let i = 0; i <= run().i && i < STORY().length; i++) if (STORY()[i].bg) setBg(STORY()[i].bg);
    love(0); step();
  }
  function tap() { if (typing) { typing(); return; } if (onTap) { stopVoice(); const f = onTap; onTap = null; f(); } }
  function setBg(bg) { if (!bg) return; curBg = bg; const b = $("mn-bg"); if (b) b.style.backgroundImage = `url('${A}${bg}.webp')`; }
  function closeup(key) {
    const c = $("mn-cu"); if (!c) return;
    if (!key) { c.classList.remove("on"); return; }
    c.dataset.k = key; c.style.backgroundImage = `url('${A}c_${key}.webp')`; c.classList.add("on");
  }
  function stopVoice() { if (audio) { try { audio.pause(); } catch {} audio = null; } clearInterval(flap); flap = null; const c = $("mn-cu"); if (c?.dataset.k) c.style.backgroundImage = `url('${A}c_${c.dataset.k}.webp')`; }
  // closed-mouth image: c_ for most, o_ for kael_heal (its c_ is a smile with open mouth)
  const OPEN_IS_C = { kael_heal: true }, NO_FLAP = { sylvara: true };
  function voice(who, text) {
    stopVoice(); if (!S.voice || !"KLVS".includes(who)) return;
    audio = new Audio(`${A}vo/${hash(text)}.mp3`); audio.play().catch(() => {});
    const c = $("mn-cu"), k = c?.dataset.k; if (!k || NO_FLAP[k] || !c.classList.contains("on")) return;
    const closed = `url('${A}${OPEN_IS_C[k] ? "o_" : "c_"}${k}.webp')`, open = `url('${A}${OPEN_IS_C[k] ? "c_" : "o_"}${k}.webp')`;
    let n = 0; c.style.backgroundImage = closed;
    flap = setInterval(() => { if (!audio || audio.ended || audio.paused && audio.currentTime > 0) { c.style.backgroundImage = closed; clearInterval(flap); return; }
      if (audio.currentTime === 0) return; n++; c.style.backgroundImage = (n % 3 && Math.random() > 0.2) ? open : closed; }, 110);
  }
  function love(d) {
    const r = run(); r.love = Math.max(0, Math.min(100, r.love + d)); const lv = $("mn-lv"); if (lv) lv.style.width = r.love + "%";
    if (d) { const f = document.createElement("div"); f.className = "sl-float " + (d > 0 ? "up" : "down"); f.textContent = (d > 0 ? "+" : "") + d + " 💗"; $("mn-play")?.appendChild(f); setTimeout(() => f.remove(), 1300);
      try { tg?.HapticFeedback?.impactOccurred?.("light"); } catch {} }
  }
  function say(who, text, name) {
    return new Promise((res) => {
      const w = $("mn-who"), p = $("mn-txt"); if (!p) return;
      if ("KLVS".includes(who) && who.length === 1) {
        const key = who === "V" ? "malzar" : cu[who]; closeup(key || null);
        w.textContent = P[who].name + (who === S.cur ? " (you)" : ""); w.className = "sl-who"; w.style.background = P[who].col;
      } else if (who === "o") { closeup(null); w.textContent = name; w.className = "sl-who"; w.style.background = "#d8a447"; }
      else { closeup(null); w.className = "sl-who hide"; }
      p.className = who === "n" ? "narr" : "";
      voice(who, text);
      if (audio && !S.subs) { // voiced line without subtitles: show a speaking wave; text only if the audio fails
        p.className = "mn-wave"; p.innerHTML = "<i></i><i></i><i></i><i></i><i></i>";
        audio.addEventListener("error", () => { if (p.className === "mn-wave") { p.className = ""; p.textContent = text; } });
        audio.addEventListener("ended", () => p.classList.add("done"));
        typing = null; onTap = res; return;
      }
      let i = 0; p.textContent = "";
      const iv = setInterval(() => { i += 2; p.textContent = text.slice(0, i); if (i >= text.length) done(); }, 24);
      function done() { clearInterval(iv); p.textContent = text; typing = null; onTap = res; }
      typing = done;
    });
  }
  async function step() {
    const r = run(), N = STORY(); if (!$("mn-play")) return;
    if (r.i >= N.length) return soon();
    const n = N[r.i];
    if (n.soon || n.season) return soon(n.season);
    if (n.ch) {
      cu = n.cu || {}; setBg(n.bg); closeup(null); $("mn-chap").textContent = n.title.split("·")[0].trim();
      if (!(await chapterGate(n.ch))) { S.cur = null; save(); return menu(); }
      await titleCard(n.title); return next();
    }
    if (n.bg) setBg(n.bg);
    if (n.cg) {
      closeup(null);
      if (r.love >= (n.cg.need || 0)) await showCg(n.cg); else await say("n", t.miss);
      return next();
    }
    if (n.n) await say("n", n.n);
    else if (n.o) await say("o", n.o[1], n.o[0]);
    else { const who = ["K", "L", "V", "S"].find((k) => n[k]); if (who) await say(who, n[who]); }
    if (n.c) {
      const opts = n.c[S.cur] || []; const i = await choose(opts); const c = opts[i];
      love(Math.round((c[1] || 0) * GAIN));
      if (c[2]) await say(partner(), c[2]);
      try { await window.CSLAds?.afterTurn?.(VIP); } catch {}
    }
    next();
  }
  function next() { run().i++; save(); step(); }
  function choose(opts) {
    return new Promise((res) => {
      const box = $("mn-chs"); onTap = null;
      box.innerHTML = opts.map((c, i) => `<button type="button" data-i="${i}">${esc(c[0])}</button>`).join(""); box.classList.add("on");
      box.querySelectorAll("button").forEach((b) => (b.onclick = (e) => { e.stopPropagation(); stopVoice(); box.classList.remove("on"); box.innerHTML = ""; res(Number(b.dataset.i)); }));
    });
  }
  function titleCard(txt) {
    return new Promise((res) => {
      const d = document.createElement("div"); d.className = "sl-title mn-title"; d.innerHTML = `<span>🔮</span><h2>${esc(txt)}</h2>`;
      $("mn-play").appendChild(d); const go = () => { d.classList.add("out"); setTimeout(() => d.remove(), 400); res(); };
      const tm = setTimeout(go, 2400); onTap = () => { clearTimeout(tm); go(); };
    });
  }
  function showCg(cg) {
    S.gallery[cg.k] = 1; save();
    try { tg?.HapticFeedback?.notificationOccurred?.("success"); } catch {}
    return new Promise((res) => {
      const d = document.createElement("div"); d.className = "sl-cg k-" + cg.k;
      d.innerHTML = `<img src="${A}${cg.img}.webp" alt="" class="mn-cgimg"><div class="sl-hearts">${"<i>💗</i>".repeat(10)}</div><span class="sl-badge">${t.cg[cg.k] || "💗"}</span><p>${esc(cg.t)}</p><small>${t.tap} ▾</small>`;
      $("mn-play").appendChild(d); requestAnimationFrame(() => d.classList.add("on"));
      setTimeout(() => (onTap = () => { d.classList.remove("on"); setTimeout(() => d.remove(), 450); res(); }), 2200);
    });
  }
  function soon(season) {
    stopVoice(); closeup(null);
    const d = document.createElement("div"); d.className = "sl-endc mn-soon";
    d.innerHTML = `<img src="${A}${season ? "s25" : "s12"}.webp" alt=""><div class="sl-ebox"><small>${season ? "SEASON 1 · THE END" : "THE MOON CRYSTAL"}</small><h2>${season ? t.seasonH : t.soonH}</h2><p>${esc(t.soonP)}</p>
      <div class="sl-elove">💗 ${run().love}/100</div><button type="button" class="sl-gold" data-a="m">${t.menu}</button></div>`;
    $("mn-play").appendChild(d);
    d.onclick = (ev) => { if (ev.target.closest("[data-a]")) { S.cur = null; save(); menu(); } };
  }
  window.CSLMoon = { open, close, bannerHTML };
})();
