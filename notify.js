/* Ask once for permission so the bot can send update messages (broadcasts).
   Telegram blocks bot messages to users who never pressed Start; this popup fixes that. */
(function () {
  const tg = window.Telegram?.WebApp, API = window.VIDEOSPACE_CONFIG?.VIP_API_URL;
  if (!tg || !tg.initData || !API) return;
  const KEY = "csl_write_access", now = Date.now();
  const report = (allowed) => {
    try {
      fetch(API + "/api/bot/write-access", { method: "POST", headers: { "Content-Type": "application/json", "X-Telegram-Init-Data": tg.initData }, body: JSON.stringify({ allowed: !!allowed }) }).catch(() => {});
    } catch {}
  };
  let st = {}; try { st = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch {}
  if (tg.initDataUnsafe?.user?.allows_write_to_pm) {
    if (!st.ok) { report(true); try { localStorage.setItem(KEY, JSON.stringify({ ok: 1 })); } catch {} }
    return;
  }
  if (typeof tg.requestWriteAccess !== "function") return;
  if (st.asked && now - st.asked < 3 * 86400000) return; // ask again after 3 days if declined
  setTimeout(() => {
    try {
      tg.requestWriteAccess((allowed) => {
        try { localStorage.setItem(KEY, JSON.stringify(allowed ? { ok: 1 } : { asked: now })); } catch {}
        if (allowed) report(true);
      });
    } catch {}
  }, 5000);
})();
