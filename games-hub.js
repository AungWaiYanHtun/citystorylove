/* CityStoryLove Fix 32: one "Story Games" tab. It lists AI Detective and Story as cards;
   tap a card to play, "← Story Games" goes back to the list. Load after detective-game.js and story-game.js. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const TXT = {
    en: { tab: "🎮 Story Games", eyebrow: "STORY GAMES", h: '🎮 Story <span class="gold-text">Games</span>', pick: "Pick a game to play", back: "← Story Games", play: "▶ Play",
      det: ["🕵️ AI Detective", "Solve the case · find love"], story: ["💞 Love Story", "Your choices write the story"] },
    ru: { tab: "🎮 Игры-истории", eyebrow: "ИГРЫ", h: '🎮 Игры-<span class="gold-text">истории</span>', pick: "Выберите игру", back: "← Игры", play: "▶ Играть",
      det: ["🕵️ ИИ-детектив", "Раскройте дело · найдите любовь"], story: ["💞 История любви", "Ваш выбор пишет историю"] },
    es: { tab: "🎮 Juegos", eyebrow: "JUEGOS DE HISTORIA", h: '🎮 Juegos de <span class="gold-text">historia</span>', pick: "Elige un juego", back: "← Juegos", play: "▶ Jugar",
      det: ["🕵️ Detective IA", "Resuelve el caso · encuentra amor"], story: ["💞 Historia de amor", "Tus decisiones crean la historia"] },
    my: { tab: "🎮 Story Games", eyebrow: "STORY GAMES", h: '🎮 Story <span class="gold-text">Games</span>', pick: "ဆော့ချင်တဲ့ဂိမ်း ရွေးပါ", back: "← Story Games", play: "▶ ဆော့မယ်",
      det: ["🕵️ AI စုံထောက်", "အမှုဖော် · အချစ်ရှာ"], story: ["💞 အချစ်ဇာတ်လမ်း", "ကိုယ်ရွေးတာနဲ့ ဇာတ်လမ်းဖြစ်လာ"] }
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
    [det, story].forEach((b) => b && b.classList.add("hidden"));

    const btn = document.createElement("button");
    btn.type = "button"; btn.id = "games-tab-btn"; btn.className = "game-tabs-btn";
    nav.insertBefore(btn, nav.firstChild);

    const sec = document.createElement("section");
    sec.id = "games-section"; sec.className = "story-section games-section hidden";
    const anchor = $("detective-section") || $("story-section");
    anchor?.parentNode?.insertBefore(sec, anchor);

    // A back button on top of each game.
    [["detective-section", det], ["story-section", story]].forEach(([id, b]) => {
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
    if ($("detective-tab-btn")) cards.push(card("hub-det", "detective-assets/bg_party.webp", "detective-assets/mira.webp", "AI", t.det, t.play));
    if ($("story-tab-btn")) cards.push(card("hub-story", "story-assets/bg_cafe.webp", "story-assets/lin_smile.webp", "AI", t.story, t.play));
    sec.innerHTML = `<div class="section-heading"><div><span class="eyebrow">${t.eyebrow}</span><h2>${t.h}</h2></div><span class="result-count">${t.pick}</span></div><div class="cg-library">${cards.join("")}</div>`;
    $("hub-det")?.addEventListener("click", () => openGame("detective-tab-btn", "detective-section"));
    $("hub-story")?.addEventListener("click", () => openGame("story-tab-btn", "story-section"));
  }
  function card(id, bg, pic, tag, txt, play) {
    return `<button type="button" class="cg-card" id="${id}"><div class="cg-card-img" style="background-image:url('${bg}')"><img src="${pic}" alt=""><span class="cg-card-tag">${tag}</span></div><div class="cg-card-body"><b>${txt[0]}</b><small>${txt[1]}</small><span class="cg-card-play">${play}</span></div></button>`;
  }

  function hideAll() {
    ["vip-hero", "story-section", "detective-section", "city-section"].forEach((id) => $(id)?.classList.add("hidden"));
    ["story-tab-btn", "detective-tab-btn", "city-tab-btn"].forEach((id) => $(id)?.classList.remove("active"));
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
    $("games-tab-btn")?.classList.add("active");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
