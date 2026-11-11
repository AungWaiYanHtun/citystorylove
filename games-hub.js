/* CityStoryLove Fix 32: one "Story Games" tab. It lists AI Detective and Story as cards;
   tap a card to play, "← Story Games" goes back to the list. Load after detective-game.js and story-game.js. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const TXT = {
    en: { tab: "🎮 Story Games", eyebrow: "STORY GAMES", h: '🎮 Story <span class="gold-text">Games</span>', pick: "Pick a game to play", back: "← Story Games", play: "▶ Play",
      det: ["🕵️ AI Detective", "Solve the case · find love"], story: ["💞 Love Story", "Your choices write the story"], date: ["💘 Sweet Date", "Date, hug, kiss · your love story"] },
    ru: { tab: "🎮 Игры-истории", eyebrow: "ИГРЫ", h: '🎮 Игры-<span class="gold-text">истории</span>', pick: "Выберите игру", back: "← Игры", play: "▶ Играть",
      det: ["🕵️ ИИ-детектив", "Раскройте дело · найдите любовь"], story: ["💞 История любви", "Ваш выбор пишет историю"], date: ["💘 Sweet Date", "Свидания, объятия, поцелуи"] },
    es: { tab: "🎮 Juegos", eyebrow: "JUEGOS DE HISTORIA", h: '🎮 Juegos de <span class="gold-text">historia</span>', pick: "Elige un juego", back: "← Juegos", play: "▶ Jugar",
      det: ["🕵️ Detective IA", "Resuelve el caso · encuentra amor"], story: ["💞 Historia de amor", "Tus decisiones crean la historia"], date: ["💘 Sweet Date", "Citas, abrazos, besos"] },
    my: { tab: "🎮 Story Games", eyebrow: "STORY GAMES", h: '🎮 Story <span class="gold-text">Games</span>', pick: "ဆော့ချင်တဲ့ဂိမ်း ရွေးပါ", back: "← Story Games", play: "▶ ဆော့မယ်",
      det: ["🕵️ AI စုံထောက်", "အမှုဖော် · အချစ်ရှာ"], story: ["💞 အချစ်ဇာတ်လမ်း", "ကိုယ်ရွေးတာနဲ့ ဇာတ်လမ်းဖြစ်လာ"], date: ["💘 Sweet Date", "ချိန်းတွေ့၊ ဖက်၊ နမ်း · ကိုယ့်အချစ်ဇာတ်လမ်း"] }
  };
  function T() {
    let l = "en";
    try { l = localStorage.getItem("hub_lang") || "en"; } catch {}
    return TXT[l] || TXT.en;
  }
  const OTHER = ["city-tab-btn"];

  function mount() {
    const nav = document.querySelector(".game-tabs");
    const det = $("detective-tab-btn"), story = $("story-tab-btn");
    if (!nav || $("games-tab-btn") || (!det && !story)) return;
    $("date-tab-btn")?.classList.add("hidden");
    [det, story].forEach((b) => b && b.classList.add("hidden"));

    const btn = document.createElement("button");
    btn.type = "button"; btn.id = "games-tab-btn"; btn.className = "game-tabs-btn";
    nav.insertBefore(btn, nav.firstChild);

    const sec = document.createElement("section");
    sec.id = "games-section"; sec.className = "story-section games-section hidden";
    const anchor = $("detective-section") || $("story-section");
    anchor?.parentNode?.insertBefore(sec, anchor);

    // A back button on top of each game.
    [["detective-section", det], ["story-section", story], ["date-section", $("date-tab-btn")]].forEach(([id, b]) => {
      const s = $(id); if (!s || !b) return;
      const bk = document.createElement("button");
      bk.type = "button"; bk.className = "hub-back";
      bk.addEventListener("click", () => openHub());
      s.insertBefore(bk, s.firstChild);
    });

    btn.addEventListener("click", () => openHub());
    OTHER.forEach((id) => $(id)?.addEventListener("click", () => {
      sec.classList.add("hidden"); btn.classList.remove("active");
    }, true));
    openHub();
  }

  function render() {
    const t = T(), sec = $("games-section"); if (!sec) return;
    $("games-tab-btn").textContent = t.tab;
    document.querySelectorAll(".hub-back").forEach((b) => (b.textContent = t.back));
    const cards = [];
    if (window.CSLBeach) { const b = window.CSLBeach.cardInfo(); cards.push(card(b.id, b.bg, b.pic, b.tag, b.txt, t.play)); }
    if ($("date-tab-btn")) cards.push(card("hub-date", "date-assets/bg_rooftop.webp", "date-assets/mya_smile.webp", "HOT", t.date, t.play));
    if ($("detective-tab-btn")) cards.push(card("hub-det", "detective-assets/bg_party.webp", "detective-assets/mira.webp", "AI", t.det, t.play));
    if ($("story-tab-btn")) cards.push(card("hub-story", "story-assets/bg_cafe.webp", "story-assets/lin_smile.webp", "AI", t.story, t.play));
    sec.innerHTML = `<div class="cg-library" id="cg-lib">${cards.join("")}</div><div class="cg-dots" id="cg-dots">${cards.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</div>${window.CSLGacha ? window.CSLGacha.bannerHTML() : ""}${window.CSLMoon ? window.CSLMoon.bannerHTML() : ""}`;
    carousel();
    $("hub-gacha")?.addEventListener("click", () => window.CSLGacha?.open());
    $("hub-moon")?.addEventListener("click", () => window.CSLMoon?.open());
    $("hub-beach")?.addEventListener("click", () => window.CSLBeach?.open());
    $("hub-det")?.addEventListener("click", () => openGame("detective-tab-btn", "detective-section"));
    $("hub-story")?.addEventListener("click", () => openGame("story-tab-btn", "story-section"));
    $("hub-date")?.addEventListener("click", () => openGame("date-tab-btn", "date-section"));
  }
  function carousel() {
    const lib = $("cg-lib"), dots = $("cg-dots"); if (!lib) return;
    const cs = [...lib.querySelectorAll(".cg-card")];
    const mark = () => {
      const mid = lib.scrollLeft + lib.clientWidth / 2;
      let best = 0, bd = 1e9;
      cs.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
      cs.forEach((c, i) => c.classList.toggle("on", i === best));
      dots?.querySelectorAll("i").forEach((d, i) => d.classList.toggle("on", i === best));
    };
    lib.addEventListener("scroll", () => requestAnimationFrame(mark), { passive: true });
    dots?.querySelectorAll("i").forEach((d, i) => d.addEventListener("click", () => cs[i]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })));
    // a side card that is not centered scrolls to the center first instead of opening
    cs.forEach((c) => c.addEventListener("click", (e) => { if (!c.classList.contains("on")) { e.stopImmediatePropagation(); c.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); } }, true));
    mark();
  }
  function card(id, bg, pic, tag, txt, play) {
    return `<button type="button" class="cg-card" id="${id}"><div class="cg-card-img" style="background-image:url('${bg}')"><img src="${pic}" alt=""><span class="cg-card-tag">${tag}</span></div><div class="cg-card-body"><b>${txt[0]}</b><small>${txt[1]}</small><span class="cg-card-play">${play}</span></div></button>`;
  }

  function hideAll() {
    ["vip-hero", "story-section", "detective-section", "city-section", "date-section"].forEach((id) => $(id)?.classList.add("hidden"));
    ["story-tab-btn", "detective-tab-btn", "city-tab-btn", "date-tab-btn"].forEach((id) => $(id)?.classList.remove("active"));
  }
  function openHub() {
    hideAll();
    render();
    $("games-section")?.classList.remove("hidden");
    $("games-tab-btn")?.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openGame(btnId, secId) {
    $("games-section")?.classList.add("hidden");
    $(btnId)?.click(); // the game's own (hidden) tab button opens it
    $("story-section") && secId !== "story-section" && $("story-section").classList.add("hidden");
    $("detective-section") && secId !== "detective-section" && $("detective-section").classList.add("hidden");
    $("date-section") && secId !== "date-section" && $("date-section").classList.add("hidden");
    $("games-tab-btn")?.classList.add("active");
  }

  // Fix 41: every "Get VIP" button (VIP tab + games) clicks #vip-page-buy. It had no listener → open the plans.
  function wireVip() {
    const b = $("vip-page-buy");
    if (b && !b.dataset.wired) { b.dataset.wired = "1"; b.addEventListener("click", () => document.dispatchEvent(new CustomEvent("videospace:open-vip-plans"))); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wireVip); else wireVip();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
  // Fix 74: re-draw texts in place when the language changes (no page reload).
  document.addEventListener("csl-lang", () => { const sec = $("games-section"); if (sec) { const open = !sec.classList.contains("hidden"); render(); if (!open) sec.classList.add("hidden"); } });
})();

// Fix 73: language picker in the top bar (EN / RU / ES / MY). Saves hub_lang and reloads.
(function () {
  const LG = [["en", "🇬🇧", "English"], ["ru", "🇷🇺", "Русский"], ["es", "🇪🇸", "Español"], ["my", "🇲🇲", "မြန်မာ"]];
  function add() {
    const bar = document.querySelector(".topbar"); if (!bar || document.getElementById("lang-pick")) return;
    let cur = "en"; try { cur = localStorage.getItem("hub_lang") || "en"; } catch {}
    const c = LG.find((x) => x[0] === cur) || LG[0];
    const w = document.createElement("div"); w.id = "lang-pick"; w.className = "lang-pick";
    w.innerHTML = `<button type="button" class="lang-btn">🌐 ${c[0].toUpperCase()} ▾</button><div class="lang-menu hidden">${LG.map(([id, f, t]) => `<button type="button" data-lg="${id}" class="${id === cur ? "on" : ""}">${f} ${t}</button>`).join("")}</div>`;
    bar.appendChild(w);
    const menu = w.querySelector(".lang-menu");
    w.querySelector(".lang-btn").addEventListener("click", (e) => { e.stopPropagation(); menu.classList.toggle("hidden"); });
    menu.addEventListener("click", (e) => { const b = e.target.closest("[data-lg]"); if (!b) return; const lg = b.dataset.lg; try { localStorage.setItem("hub_lang", lg); localStorage.setItem("csl_lang_fix72", "1"); } catch {}
      menu.classList.add("hidden"); w.querySelector(".lang-btn").textContent = "🌐 " + lg.toUpperCase() + " ▾";
      menu.querySelectorAll("[data-lg]").forEach((x) => x.classList.toggle("on", x.dataset.lg === lg));
      document.documentElement.lang = lg; document.dispatchEvent(new CustomEvent("csl-lang", { detail: lg })); });
    document.addEventListener("click", () => menu.classList.add("hidden"));
    const st = document.createElement("style");
    st.textContent = `.topbar{position:relative}.lang-pick{position:absolute;right:16px;top:50%;transform:translateY(-50%);z-index:50}
.lang-btn{height:38px;padding:0 14px;border-radius:19px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;font-weight:700;font-size:14px}
.lang-menu{position:absolute;right:0;top:44px;min-width:150px;display:flex;flex-direction:column;padding:6px;border-radius:14px;background:#1e1e22;border:1px solid rgba(255,255,255,.18);box-shadow:0 10px 24px rgba(0,0,0,.5)}
.lang-menu.hidden{display:none}.lang-menu button{height:40px;text-align:left;padding:0 12px;border:0;border-radius:10px;background:none;color:#fff;font-size:15px}
.lang-menu button.on{background:rgba(240,185,58,.2);color:#f0b93a;font-weight:800}`;
    document.head.appendChild(st);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", add); else add();
})();
