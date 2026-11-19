// ⭐ Stars pill in the hub top bar (right corner). Server keeps the balance.
// Watch an ad = +1 ⭐ (daily limit on the server). Buy with Telegram Stars, 1 = 1.
(function () {
  const tg = window.Telegram?.WebApp;
  const API = () => window.VIDEOSPACE_CONFIG?.VIP_API_URL || "";
  const PACKS = [10, 50, 100, 250, 500, 1000];
  let stars = 0;
  const SKEY = "csl_stars_" + (window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "x");
  try { stars = Number(localStorage.getItem(SKEY) || 0) || 0; } catch {}

  function set(n) {
    stars = Math.max(0, Number(n) || 0);
    try { localStorage.setItem(SKEY, String(stars)); } catch {}
    const v = document.querySelector("#star-pill .sp-n"); if (v) v.textContent = stars;
    document.dispatchEvent(new CustomEvent("csl-stars", { detail: stars }));
  }
  async function load() {
    if (!tg?.initData || !API()) return;
    try {
      const r = await fetch(API() + "/api/stars", { cache: "no-store", headers: { "X-Telegram-Init-Data": tg.initData } });
      if (r.ok) { const d = await r.json(); set(d.stars); }
    } catch {}
  }
  function toast(t) {
    const e = document.createElement("div"); e.className = "sp-toast"; e.textContent = t; document.body.appendChild(e);
    setTimeout(() => e.classList.add("out"), 1800); setTimeout(() => e.remove(), 2300);
  }
  async function buy(n, btn) {
    if (!tg?.initData) { toast("Open in Telegram to buy stars."); return; }
    btn.disabled = true;
    try {
      const r = await fetch(API() + "/api/stars/checkout", { method: "POST", headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": tg.initData }, body: JSON.stringify({ stars: n }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.invoiceLink) throw new Error(d.error || "Checkout failed.");
      tg.openInvoice(d.invoiceLink, (st) => {
        if (st === "paid") { toast(`⭐ +${n} stars!`); set(stars + n); setTimeout(load, 2500); closeSheet(); }
        else if (st === "failed") toast("Payment failed.");
      });
    } catch (e) { toast(e.message || "Checkout failed."); }
    finally { btn.disabled = false; }
  }
  function closeSheet() { document.getElementById("star-sheet")?.remove(); }
  function openSheet() {
    closeSheet();
    const el = document.createElement("div"); el.id = "star-sheet";
    el.innerHTML = `<div class="ss-box"><div class="ss-h">⭐ Get Stars</div><div class="ss-bal">You have <b>${stars}</b> ⭐</div>
      <button type="button" class="ss-ad">📺 Watch ad · +1 ⭐ <small>free</small></button>
      <div class="ss-grid">${PACKS.map((n) => `<button type="button" class="ss-pk" data-n="${n}"><b>${n} ⭐</b><small>${n} Telegram Stars</small></button>`).join("")}</div>
      <button type="button" class="ss-x">Close</button></div>`;
    document.body.appendChild(el);
    el.addEventListener("click", (e) => { if (e.target === el) closeSheet(); });
    el.querySelector(".ss-x").onclick = closeSheet;
    el.querySelector(".ss-ad").onclick = async () => {
      closeSheet();
      const ok = window.CSLAds ? await window.CSLAds.reward("stars", "en") : false;
      if (ok) { toast("⭐ +1 star!"); load(); }
    };
    el.querySelectorAll(".ss-pk").forEach((b) => (b.onclick = () => buy(+b.dataset.n, b)));
  }
  function mount() {
    const bar = document.querySelector(".topbar"); if (!bar || document.getElementById("star-pill")) return;
    const st = document.createElement("style");
    st.textContent = `.topbar{position:relative}
#star-pill{position:absolute;right:14px;top:50%;transform:translateY(-50%);z-index:50;display:flex;align-items:center;gap:6px;height:38px;padding:0 5px 0 12px;border-radius:19px;border:1px solid rgba(255,214,90,.55);background:rgba(255,200,40,.12);color:#fff;font-weight:800;font-size:16px;cursor:pointer}
#star-pill .sp-plus{width:28px;height:28px;border-radius:50%;background:linear-gradient(#ffd75a,#f5a300);color:#5a3a00;display:flex;align-items:center;justify-content:center;font-size:20px;line-height:1}
#star-sheet{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.6);display:flex;align-items:flex-end;justify-content:center}
#star-sheet .ss-box{width:100%;max-width:480px;background:#1b1430;border-radius:22px 22px 0 0;padding:18px 16px 22px;color:#fff;border-top:2px solid #ffcf4a}
#star-sheet .ss-h{font-size:21px;font-weight:800;text-align:center}
#star-sheet .ss-bal{text-align:center;opacity:.85;margin:4px 0 14px}
#star-sheet button{font-family:inherit;cursor:pointer;border:0;color:#fff}
#star-sheet .ss-ad{width:100%;padding:13px;border-radius:14px;background:linear-gradient(#3ccf6e,#1f9e4c);font-size:17px;font-weight:800;margin-bottom:12px}
#star-sheet .ss-ad small{opacity:.8;font-weight:600}
#star-sheet .ss-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
#star-sheet .ss-pk{padding:12px 4px;border-radius:14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,214,90,.4)!important;display:flex;flex-direction:column;gap:3px}
#star-sheet .ss-pk b{font-size:17px}#star-sheet .ss-pk small{font-size:11px;opacity:.7}
#star-sheet .ss-x{width:100%;margin-top:12px;padding:11px;border-radius:14px;background:rgba(255,255,255,.12);font-size:15px}
.sp-toast{position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:10000;background:rgba(20,15,40,.95);color:#fff;padding:10px 18px;border-radius:14px;font-weight:700;transition:opacity .4s}
.sp-toast.out{opacity:0}`;
    document.head.appendChild(st);
    const p = document.createElement("button"); p.type = "button"; p.id = "star-pill";
    p.innerHTML = `⭐ <span class="sp-n">${stars}</span><span class="sp-plus">+</span>`;
    p.onclick = openSheet; bar.appendChild(p);
    load();
  }
  window.CSLStars = { get: () => stars, refresh: load, open: openSheet };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
