/*
  Adsgram ads (Fix 38).
  - Interstitial "Between turns" (int-58331): free players only, at most once every 15 minutes,
    and only after every 6th story turn. The game always works without watching it.
  - Reward "Bonus" (58330): the player CHOOSES to watch an ad and gets +5 free turns.
    The backend (/api/ads/reward) limits how many bonuses one player gets per day.
*/
(function () {
  const REWARD_BLOCK = "58330";
  const INTER_BLOCK = "int-58331";
  const INTER_GAP_MS = 15 * 60 * 1000;
  const INTER_EVERY = 6;
  const TS_KEY = "csl_ad_int_ts";

  const L = {
    en: { btn: "📺 Watch ad: +5 turns", short: "📺 +5", ok: "🎁 +5 free turns added!", no: "Ad not finished, no bonus this time.", none: "No ad available right now. Try again later.", max: "You've used today's ad bonuses. Come back tomorrow!" },
    my: { btn: "📺 ကြော်ငြာကြည့်: +၅ ကြိမ်", short: "📺 +၅", ok: "🎁 အခမဲ့ +၅ ကြိမ် ရပါပြီ!", no: "ကြော်ငြာ အဆုံးထိ မကြည့်လို့ bonus မရပါ။", none: "အခု ကြော်ငြာ မရှိသေးပါ။ နောက်မှ ပြန်စမ်းပါ။", max: "ဒီနေ့ ကြော်ငြာ bonus ကုန်ပါပြီ။ မနက်ဖြန် ပြန်လာပါ!" },
    ru: { btn: "📺 Реклама: +5 ходов", short: "📺 +5", ok: "🎁 +5 бесплатных ходов!", no: "Реклама не досмотрена — бонуса нет.", none: "Сейчас нет рекламы. Попробуйте позже.", max: "Бонусы за рекламу на сегодня закончились." },
    es: { btn: "📺 Ver anuncio: +5 turnos", short: "📺 +5", ok: "🎁 ¡+5 turnos gratis!", no: "Anuncio no terminado, sin bonus.", none: "No hay anuncios ahora. Inténtalo más tarde.", max: "Ya usaste los bonus de hoy. ¡Vuelve mañana!" }
  };
  const t = (lang) => L[lang] || L.en;

  let rewardCtl = null, interCtl = null, turnCount = 0, busy = false;
  function ctl(id) {
    try { return window.Adsgram ? window.Adsgram.init({ blockId: id }) : null; } catch { return null; }
  }
  function toast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg; el.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("show"), 2600);
  }

  // Called after a successful story turn. Resolves when the ad is closed (or right away).
  async function afterTurn(isVip) {
    if (isVip) return;
    turnCount += 1;
    if (turnCount < INTER_EVERY) return;
    const last = Number(localStorage.getItem(TS_KEY) || 0);
    if (Date.now() - last < INTER_GAP_MS) return;
    interCtl = interCtl || ctl(INTER_BLOCK);
    if (!interCtl) return;
    turnCount = 0;
    try { localStorage.setItem(TS_KEY, String(Date.now())); } catch {}
    try { await interCtl.show(); } catch { /* skipped or no ad: just continue */ }
  }

  // Fix 46: spinner while the ad loads, network error message, and a reliable +5 credit.
  const NET = { en: "📡 Network error. Check your connection and try again.", my: "📡 အင်တာနက် ချိတ်ဆက်မှု မရပါ။ လိုင်းစစ်ပြီး ပြန်စမ်းပါ။", ru: "📡 Ошибка сети. Проверьте подключение.", es: "📡 Error de red. Revisa tu conexión." };
  const net = (lang) => NET[lang] || NET.en;
  function spin(on) {
    let el = document.getElementById("csl-ad-spin");
    if (!on) { el?.remove(); return; }
    if (el) return;
    el = document.createElement("div");
    el.id = "csl-ad-spin"; el.className = "csl-ad-spin";
    el.innerHTML = '<div class="csl-ad-ring"></div>';
    el.addEventListener("click", (e) => e.stopPropagation());
    document.body.appendChild(el);
  }
  const PEND = "csl_ad_pending";
  async function credit(game, tg, API) {
    // Up to 4 tries: the player already watched, so a short network drop must not lose the bonus.
    for (let k = 0; k < 4; k++) {
      try {
        const resp = await fetch(API + (game === "city" ? "/api/city/ad-cash" : "/api/ads/reward"), {
          method: "POST", cache: "no-store",
          headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": tg.initData },
          body: JSON.stringify({ game })
        });
        if (resp.ok) { const d = await resp.json().catch(() => ({})); return { ok: true, bonus: Number(d.bonus) || 5, cash: d.cash, left: d.left }; }
        if (resp.status === 429 || resp.status === 401) return { ok: false, status: resp.status };
      } catch { /* network: retry */ }
      await new Promise((r) => setTimeout(r, 1500 * (k + 1)));
    }
    return { ok: false, net: true };
  }
  // A bonus that could not reach the server is retried the next time the app opens.
  async function flushPending() {
    let p; try { p = JSON.parse(localStorage.getItem(PEND) || "null"); } catch {}
    const tg = window.Telegram?.WebApp, API = window.VIDEOSPACE_CONFIG?.VIP_API_URL;
    if (!p || !tg?.initData || !API || Date.now() - p.ts > 6 * 3600 * 1000) { try { localStorage.removeItem(PEND); } catch {} return; }
    const r = await credit(p.game, tg, API);
    if (r.ok || !r.net) try { localStorage.removeItem(PEND); } catch {}
    if (r.ok) document.dispatchEvent(new CustomEvent("csl-ad-reward", { detail: { game: p.game, bonus: r.bonus, cash: r.cash, left: r.left } }));
  }
  setTimeout(() => { flushPending().catch(() => {}); }, 3000);

  // Player tapped the reward button. game = "story" | "detective".
  async function reward(game, lang) {
    if (busy) return false;
    const tg = window.Telegram?.WebApp;
    const API = window.VIDEOSPACE_CONFIG?.VIP_API_URL;
    if (!API || !tg?.initData) { toast(t(lang).none); return false; }
    if (navigator.onLine === false) { toast(net(lang)); return false; }
    rewardCtl = rewardCtl || ctl(REWARD_BLOCK);
    if (!rewardCtl) { toast(navigator.onLine === false || !window.Adsgram ? net(lang) : t(lang).none); return false; }
    busy = true;
    spin(true);
    const offStart = () => spin(false);
    try { rewardCtl.addEventListener?.("onStart", offStart); } catch {}
    const safety = setTimeout(() => spin(false), 20000);
    try {
      let result;
      try { result = await rewardCtl.show(); }
      catch (r) {
        spin(false);
        const desc = String(r?.description || r?.message || "");
        if (navigator.onLine === false || /network|fetch|timeout|load|connection/i.test(desc)) toast(net(lang));
        else toast(r && r.error ? t(lang).none : t(lang).no);
        return false;
      }
      if (!result || !result.done) { spin(false); toast(t(lang).no); return false; }
      spin(true); // crediting
      try { localStorage.setItem(PEND, JSON.stringify({ game, ts: Date.now() })); } catch {}
      const c = await credit(game, tg, API);
      spin(false);
      if (c.ok || !c.net) try { localStorage.removeItem(PEND); } catch {}
      if (c.status === 429) { toast(t(lang).max); return false; }
      if (!c.ok) { toast(c.net ? net(lang) : t(lang).none); return false; }
      if (game !== "city" && game !== "gacha") toast(t(lang).ok.replace("+5", "+" + c.bonus).replace("+၅", "+" + c.bonus));
      try { tg.HapticFeedback?.notificationOccurred?.("success"); } catch {}
      document.dispatchEvent(new CustomEvent("csl-ad-reward", { detail: { game, bonus: c.bonus, cash: c.cash, left: c.left } }));
      return true;
    } catch { toast(net(lang)); return false; }
    finally {
      busy = false; clearTimeout(safety); spin(false);
      try { rewardCtl.removeEventListener?.("onStart", offStart); } catch {}
    }
  }

  // Fix 44: "+" shop sheet: watch an ad (+5 ⚡) or buy ⚡ energy with Telegram Stars.
  const S = {
    en: { title: "⚡ Get more energy", sub: "1 ⚡ = 1 story turn. Bought energy never expires.", ad: "📺 Watch ad: +5 ⚡ (free)", buy: (s, e) => `${e} ⚡  ·  ${s} ⭐`, close: "Close", paid: "⚡ Energy added!", fail: "Payment not completed.", more: "⚡ Get more turns" },
    my: { title: "⚡ လျှပ်စီး ထပ်ယူမယ်", sub: "၁ ⚡ = ၁ ကြိမ်ဆော့ခွင့်။ ဝယ်ထားတဲ့ ⚡ က သက်တမ်းမကုန်ပါ။", ad: "📺 ကြော်ငြာကြည့်: +၅ ⚡ (အခမဲ့)", buy: (s, e) => `${e} ⚡  ·  ${s} ⭐`, close: "ပိတ်မယ်", paid: "⚡ လျှပ်စီး ထည့်ပြီးပါပြီ!", fail: "ငွေပေးချေမှု မပြီးပါ။", more: "⚡ ဆော့ခွင့် ထပ်ယူမယ်" },
    ru: { title: "⚡ Больше энергии", sub: "1 ⚡ = 1 ход. Купленная энергия не сгорает.", ad: "📺 Реклама: +5 ⚡ (бесплатно)", buy: (s, e) => `${e} ⚡  ·  ${s} ⭐`, close: "Закрыть", paid: "⚡ Энергия добавлена!", fail: "Оплата не завершена.", more: "⚡ Больше ходов" },
    es: { title: "⚡ Más energía", sub: "1 ⚡ = 1 turno. La energía comprada no caduca.", ad: "📺 Ver anuncio: +5 ⚡ (gratis)", buy: (s, e) => `${e} ⚡  ·  ${s} ⭐`, close: "Cerrar", paid: "⚡ ¡Energía añadida!", fail: "Pago no completado.", more: "⚡ Más turnos" }
  };
  const s = (lang) => S[lang] || S.en;
  let packs = null;
  async function loadPacks(API) {
    if (packs) return packs;
    try { const r = await fetch(API + "/api/energy/packs"); const d = await r.json(); packs = Array.isArray(d.packs) ? d.packs : []; } catch { packs = []; }
    return packs;
  }
  function done(game) { document.dispatchEvent(new CustomEvent("csl-ad-reward", { detail: { game } })); }
  async function buy(game, lang, pack, sheet) {
    const tg = window.Telegram?.WebApp;
    const API = window.VIDEOSPACE_CONFIG?.VIP_API_URL;
    if (!API || !tg?.initData || !tg.openInvoice) { toast(s(lang).fail); return; }
    if (navigator.onLine === false) { toast(net(lang)); return; }
    try {
      const r = await fetch(API + "/api/energy/checkout", { method: "POST", headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": tg.initData }, body: JSON.stringify({ packId: pack.id }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.invoiceLink) { toast(s(lang).fail); return; }
      tg.openInvoice(d.invoiceLink, (status) => {
        if (status === "paid") {
          sheet.remove(); toast(s(lang).paid);
          try { tg.HapticFeedback?.notificationOccurred?.("success"); } catch {}
          setTimeout(() => done(game), 1500); setTimeout(() => done(game), 4000);
        } else if (status === "failed") toast(s(lang).fail);
      });
    } catch { toast(net(lang)); }
  }
  async function openShop(game, lang) {
    document.getElementById("csl-shop")?.remove();
    const L2 = s(lang);
    const el = document.createElement("div");
    el.id = "csl-shop"; el.className = "csl-shop";
    el.innerHTML = `<div class="csl-shop-card"><h3>${L2.title}</h3><p>${L2.sub}</p>
      <button type="button" class="csl-shop-ad" data-x="ad">${L2.ad}</button>
      <div class="csl-shop-packs" data-x="packs"><span class="vn-dots3"><i></i><i></i><i></i></span></div>
      <button type="button" class="csl-shop-close" data-x="close">${L2.close}</button></div>`;
    document.body.appendChild(el);
    el.addEventListener("click", (e) => { e.stopPropagation(); if (e.target === el) el.remove(); });
    el.querySelector('[data-x="close"]').addEventListener("click", () => el.remove());
    el.querySelector('[data-x="ad"]').addEventListener("click", async () => { el.remove(); await reward(game, lang); });
    const API = window.VIDEOSPACE_CONFIG?.VIP_API_URL;
    const list = API ? await loadPacks(API) : [];
    const box = el.querySelector('[data-x="packs"]');
    if (!box) return;
    box.innerHTML = list.map((p, i) => `<button type="button" class="csl-shop-pack" data-i="${i}">${L2.buy(p.stars, p.energy)}</button>`).join("");
    box.querySelectorAll("[data-i]").forEach((b) => b.addEventListener("click", () => buy(game, lang, list[Number(b.dataset.i)], el)));
  }

  window.CSLAds = { afterTurn, reward, openShop, label: (lang, short) => (short ? "+" : s(lang).more) };
})();
