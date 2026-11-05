(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const cfg = window.VIDEOSPACE_CONFIG || {};
  // UI gate for the designated Telegram administrator. Server-side authorization remains required.
  const DESIGNATED_ADMIN_TELEGRAM_ID = "8990600784";
  const isDesignatedTelegramAdmin = () => {
    const id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    return id != null && String(id) === DESIGNATED_ADMIN_TELEGRAM_ID;
  };

  const configured = Boolean(
    typeof cfg.SUPABASE_URL === "string" &&
    cfg.SUPABASE_URL.startsWith("https://") &&
    typeof cfg.SUPABASE_ANON_KEY === "string" &&
    (
      cfg.SUPABASE_ANON_KEY.startsWith("sb_publishable_") ||
      cfg.SUPABASE_ANON_KEY.startsWith("eyJ")
    )
  );

  // ---- Speed: start VIP requests the moment the script loads ----
  // Render free servers sleep when idle; the first request wakes them (can take 30-50 s).
  // Firing it here, before Supabase/session setup, saves several seconds every open.
  const EARLY_API = (cfg.VIP_API_URL || "").replace(/\/$/, "");
  const EARLY_INIT_DATA = window.Telegram?.WebApp?.initData || "";
  function fetchWithTimeout(url, options = {}, ms = 20000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(t));
  }
  // Retry once: the first call may time out while the server is waking up.
  async function fetchJsonRetry(url, options) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await fetchWithTimeout(url, options, attempt === 0 ? 20000 : 45000);
        const body = await r.json().catch(() => ({}));
        return { ok: r.ok, status: r.status, body };
      } catch (e) {
        if (attempt === 1) throw e;
      }
    }
  }
  let earlyVipStatus = null;
  if (EARLY_API && EARLY_INIT_DATA) {
    const headers = { "X-Telegram-Init-Data": EARLY_INIT_DATA };
    earlyVipStatus = fetchJsonRetry(`${EARLY_API}/api/vip-status`, { headers, cache: "no-store" });
    earlyVipStatus.catch(() => {});
  } else if (EARLY_API) {
    fetch(`${EARLY_API}/health`, { cache: "no-store" }).catch(() => {});
  }
  const takeEarlyStatus = () => { const p = earlyVipStatus; earlyVipStatus = null; return p; };

  let authMode = "signin";
  let toastTimer;
  let db = null;
  let currentUser = null;
  let isAdmin = false;
  let activePlayerVideo = null;
  let controlsHideTimer = null;
  let videos = [];
  let categories = ["All"];
  let activeCategory = "All";
  let activeVideoView = "regular";
  let vipMembershipActive = false;
  let videosLoadPromise = null;
  const VIDEO_CACHE_KEY = "videospace_public_videos_v1";
  const VIDEO_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
  // Avoid logging configuration details in production.

  const escapeHTML = (value = "") =>
    String(value).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[c]);

  const niceDate = (value) => {
    try {
      if (!value) return "";
      return new Intl.DateTimeFormat(undefined, {
        month: "short", day: "numeric", year: "numeric"
      }).format(new Date(value));
    } catch {
      return "";
    }
  };

  const toast = (message) => {
    const el = $("toast");
    if (!el) {
      console.log(message);
      return;
    }
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
  };

  function syncModalAdIsolation() {
    const modalIds = ["auth-modal", "upload-modal", "player-modal"];
    const modalOpen = modalIds.some((id) => {
      const el = $(id);
      return el && !el.classList.contains("hidden");
    });
    if (document.body) {
      document.body.classList.toggle("modal-active", modalOpen);
    }
  }

  const showModal = (name) => {
    const modal = $(name + "-modal");
    if (!modal) {
      console.error("Modal not found:", name + "-modal");
      return;
    }
    modal.classList.remove("hidden");
    syncModalAdIsolation();
  };

  const hideModal = (name) => {
    const modal = $(name + "-modal");
    if (!modal) return;
    modal.classList.add("hidden");
    syncModalAdIsolation();
  };

  const setNotice = (message) => {
    const el = $("notice");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("hidden", !message);
  };

  const setConnection = (text, good = false) => {
    const el = $("connection-status");
    if (!el) return;
    el.innerHTML =
      `<i style="background:${good ? "#73c99a" : "#caa45d"}"></i>` +
      escapeHTML(text);
  };

  const year = $("year");
  if (year) year.textContent = new Date().getFullYear();

  function renderCategories() {
    const wrap = $("categories");
    if (!wrap) return;
    wrap.innerHTML = categories.map((c) =>
      `<button class="category ${c === activeCategory ? "active" : ""}" ` +
      `data-category="${escapeHTML(c)}">` +
      `${c === "All" ? "✦ " : ""}${escapeHTML(c)}</button>`
    ).join("");
  }

  function renderVideos() {
    const search = $("search");
    const grid = $("video-grid");
    const empty = $("empty-state");
    const count = $("result-count");
    if (!grid || !search) return;

    const q = search.value.trim().toLowerCase();
    const filtered = videos.filter((v) =>
      !v.is_vip &&
      (activeCategory === "All" ||
        (v.category || "Entertainment") === activeCategory) &&
      `${v.title || ""} ${v.description || ""} ${v.category || ""}`
        .toLowerCase().includes(q)
    );

    if (count) {
      count.textContent =
        `${filtered.length} video${filtered.length === 1 ? "" : "s"}`;
    }

    grid.innerHTML = filtered.map((v, index) => {
      const thumbnail = v.thumbnail_url
        ? `<img src="${escapeHTML(v.thumbnail_url)}" alt="" loading="${index < 4 ? "eager" : "lazy"}" fetchpriority="${index < 2 ? "high" : "auto"}" decoding="async" onerror="this.remove()">`
        : "";
      return `
        <article class="video-card" tabindex="0" role="button"
          data-video-id="${escapeHTML(v.id)}"
          aria-label="Play ${escapeHTML(v.title || "video")}">
          <div class="thumbnail">
            ${thumbnail}
            <span class="thumbnail-placeholder">F<span style="color:#e1c17d">✦</span></span>
            <span class="play-badge">▶</span>
          </div>
          <div class="card-content">
            <span class="card-category">${escapeHTML(v.category || "Entertainment")}</span>
            <h3 class="card-title">${escapeHTML(v.title || "Untitled video")}</h3>
            <p class="card-description">${escapeHTML(v.description || "Ready when you are. Press play to watch.")}</p>
            <div class="card-meta"><span>▶ ${Number(v.views || 0).toLocaleString()} views</span><span>${niceDate(v.created_at)}</span></div>
          </div>
        </article>`;
    }).join("");

    if (empty) empty.classList.toggle("hidden", filtered.length !== 0);
  }

  function updateAuthUI() {
    const authOpen = $("auth-open");
    const signOut = $("sign-out");
    const adminOpen = $("admin-open");
    const designatedAdmin = isDesignatedTelegramAdmin();
    if (authOpen) authOpen.classList.toggle("hidden", !!currentUser || !designatedAdmin);
    if (signOut) signOut.classList.toggle("hidden", !currentUser || !designatedAdmin);
    if (adminOpen) adminOpen.classList.toggle("hidden", !isAdmin || !designatedAdmin);
    const authToggle = $("auth-toggle");
    if (authToggle) authToggle.classList.add("hidden");

    if (currentUser) {
      setConnection(isAdmin ? "Admin signed in" : "Signed in", true);
    } else {
      setConnection(configured ? "Connected" : "Demo mode", configured);
    }
  }

  async function refreshAdmin() {
    isAdmin = false;
    if (db && currentUser && isDesignatedTelegramAdmin()) {
      try {
        const { data, error } = await db.rpc("is_admin");
        if (!error) isAdmin = !!data;
        else console.warn("Admin check failed:", error.message);
      } catch (err) {
        console.warn("Admin check failed:", err.message);
      }
    }
    updateAuthUI();
  }

  function readCachedFreeVideos() {
    try {
      const cached = JSON.parse(localStorage.getItem(VIDEO_CACHE_KEY) || "null");
      if (!cached || !Array.isArray(cached.videos)) return [];
      // Ignore stale or malformed cache entries; only public/free metadata is cached.
      if (!Number.isFinite(cached.savedAt) || (Date.now() - cached.savedAt) > VIDEO_CACHE_TTL_MS) {
        localStorage.removeItem(VIDEO_CACHE_KEY);
        return [];
      }
      // Only public/free video metadata is cached to avoid leaking VIP-only records
      // between users sharing the same browser/device.
      return cached.videos
        .filter((v) => v && v.id && v.is_vip === false)
        .map((v) => ({ ...v, is_vip: false }));
    } catch {
      return [];
    }
  }

  function cacheFreeVideos(list) {
    try {
      localStorage.setItem(VIDEO_CACHE_KEY, JSON.stringify({
        savedAt: Date.now(),
        videos: list.filter((v) => !v.is_vip).slice(0, 100)
      }));
    } catch (error) {
      // Storage can be unavailable or full; video loading must still work.
      console.warn("Video cache unavailable:", error);
    }
  }

  function loadVideos() {
    // Reuse the in-flight catalogue request to avoid duplicate loads.
    if (videosLoadPromise) return videosLoadPromise;
    videosLoadPromise = loadVideosInternal().finally(() => {
      videosLoadPromise = null;
    });
    return videosLoadPromise;
  }

  async function loadVideosInternal() {
    // Paint cached catalogue immediately, then refresh in the background.
    const cachedFreeVideos = readCachedFreeVideos();
    const cachedVideos = cachedFreeVideos;
    if (cachedVideos.length) {
      videos = cachedVideos;
      categories = ["All", ...new Set(videos.map((v) => v.category || "Entertainment"))];
      renderCategories();
      renderVideos();
      setNotice("");
    }

    if (!configured || !db) {
      // Do not replace the owner's real library with demo/sample videos.
      // Show an empty state and a clear connection warning until Supabase is available.
      videos = [];
      categories = ["All"];
      renderCategories();
      renderVideos();
      setNotice("Supabase is not connected. Your saved videos have not been deleted; check config.js and the Supabase client connection.");
      const count = $("result-count");
      if (count) count.textContent = "0 videos — connection needed";
      setConnection("Database connection needed", false);
      return;
    }

    const grid = $("video-grid");
    if (grid && cachedFreeVideos.length === 0) {
      grid.innerHTML = '<div class="loading-card"><span class="spinner"></span><p>Loading collection…</p></div>';
    }
    setNotice("");

    // VIP membership (games perks) is still checked; the VIP video library was removed (Fix 22).
    const tg = window.Telegram?.WebApp;
    const api = (cfg.VIP_API_URL || "").replace(/\/$/, "");
    vipMembershipActive = false;
    const vipStatusTask = (async () => {
      if (!tg?.initData || !api) return false;
      try {
        const res = await (takeEarlyStatus() || fetchJsonRetry(`${api}/api/vip-status`, {
          headers: { "X-Telegram-Init-Data": tg.initData },
          cache: "no-store"
        }));
        if (res.ok) return res.body.active === true;
        console.warn("VIP status request failed:", res.status);
      } catch (statusError) {
        console.warn("VIP status unavailable:", statusError);
      }
      return false;
    })();

    try {
      // The browser's public Supabase query intentionally returns Free videos only
      // under RLS.
      const { data, error } = await db.from("videos")
        .select("id,title,description,category,video_path,thumbnail_url,views,created_at,is_vip")
        .eq("published", true)
        .eq("is_vip", false)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      const freeVideos = (data || []).map((v) => ({ ...v, is_vip: false }));
      cacheFreeVideos(freeVideos);
      vipMembershipActive = await vipStatusTask;
      videos = freeVideos.slice(0, 100);
      categories = ["All", ...new Set(
        videos.map((v) => v.category || "Entertainment")
      )];
      renderCategories();
      renderVideos();
    } catch (err) {
      // Keep cached public/free videos visible if refreshing fails.
      console.error("Load videos failed:", err);
      const detail = String(err?.message || err || "Unknown error").slice(0, 220);
      if (cachedVideos.length === 0) {
        videos = [];
        categories = ["All"];
        renderCategories();
        renderVideos();
        setNotice("Could not load videos: " + detail + ". Check the Supabase public key, RLS policy, and network connection.");
        setConnection("Video loading failed", false);
      } else {
        videos = cachedVideos;
        categories = ["All", ...new Set(videos.map((v) => v.category || "Entertainment"))];
        renderCategories();
        renderVideos();
        setNotice("Showing saved videos. Refresh failed: " + detail);
        setConnection("Showing saved videos", false);
      }
    }
  }

  async function openVideo(id) {
    const v = videos.find((item) => String(item.id) === String(id));
    if (!v) return;

    window.dispatchEvent(new CustomEvent("fetishsocial:video-open", {
      detail: { videoId: String(v.id) }
    }));

    let playbackUrl = "";

    {
      // Derive Free URLs from storage paths; never fetch a raw video_url column.
      const path = v.video_path;
      if (path && db) {
        playbackUrl = db.storage
          .from(cfg.VIDEO_BUCKET || "videos")
          .getPublicUrl(path).data?.publicUrl || "";
      }
      if (!playbackUrl) {
        toast("This video has no usable storage path. Re-upload or migrate this video.");
        return;
      }
    }

    activePlayerVideo = v;
    const player = $("video-player");
    if (!player) {
      toast("Video player element is missing from index.html.");
      return;
    }

    player.src = playbackUrl;
    if (deleteButton) deleteButton.classList.toggle("hidden", !isAdmin);
    const downloadButton = $("player-download");
    if (downloadButton) downloadButton.classList.remove("hidden");
    if (stageEl) { stageEl.classList.remove("controls-hidden", "menu-open"); }
    // Leave fullscreen when the player closes.
    if (stageEl?.classList.contains("pseudo-fullscreen") || document.fullscreenElement) window.__exitPlayerFullscreen?.();
    if (menuEl) menuEl.classList.add("hidden");
    const category = $("player-category");
    const title = $("player-title");
    const description = $("player-description");
    const views = $("player-views");

    if (category) category.textContent = v.category || "Entertainment";
    if (title) title.textContent = v.title || "Untitled video";
    if (description) description.textContent = v.description || "";
    if (views) views.textContent = `${Number(v.views || 0).toLocaleString()} views`;

    showModal("player");

    if (db) {
      try {
        const { error } = await db.rpc("increment_video_views", {
          video_id_input: v.id
        });
        if (error) console.warn("View count update failed:", error.message);
      } catch (err) {
        console.warn("View count update failed:", err);
      }
      v.views = Number(v.views || 0) + 1;
      if (views) views.textContent = `${v.views.toLocaleString()} views`;
    }

    try {
      await player.play();
    } catch {
      // Some mobile browsers require a user tap to start playback.
    }
  }

  const demoVideos = [
    {id:"demo-1",title:"Golden Hour Sessions",description:"A warm, cinematic collection for your next slow evening.",category:"Entertainment",views:12840,created_at:"2026-09-21"},
    {id:"demo-2",title:"The Sound of the City",description:"Discover new sounds and hidden corners of the city.",category:"Music",views:8432,created_at:"2026-09-18"},
    {id:"demo-3",title:"Play Beyond the Ordinary",description:"Highlights, creative plays, and friendly competition.",category:"Gaming",views:6241,created_at:"2026-09-14"},
    {id:"demo-4",title:"A Weekend Away",description:"A short travel diary from a place worth remembering.",category:"Travel",views:5027,created_at:"2026-09-10"},
    {id:"demo-5",title:"Small Things, Big Ideas",description:"Quick ideas and useful things to learn today.",category:"Education",views:4210,created_at:"2026-09-06"},
    {id:"demo-6",title:"A Little More Laughter",description:"A light-hearted pick to brighten up your day.",category:"Comedy",views:3914,created_at:"2026-09-02"}
  ];

  function switchVideoView() {
    activeVideoView = "regular";
    activeCategory = "All";
    $("regular-videos-btn")?.classList.add("active");
    $("vip-hero")?.classList.add("hidden");
    const heading = document.querySelector(".section-heading h2");
    if (heading) heading.innerHTML = 'Explore <span class="gold-text">Videos</span>';
    renderCategories();
    renderVideos();
  }
  $("regular-videos-btn")?.addEventListener("click", () => switchVideoView());
  $("vip-page-buy")?.addEventListener("click", () => {
    const buy = $("vip-buy");
    if (buy) buy.click();
    else document.dispatchEvent(new CustomEvent("videospace:open-vip-plans"));
  });

  const categoriesEl = $("categories");
  if (categoriesEl) {
    categoriesEl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-category]");
      if (!b) return;
      activeCategory = b.dataset.category;
      renderCategories();
      renderVideos();
    });
  }

  const grid = $("video-grid");
  if (grid) {
    grid.addEventListener("click", (e) => {
      const card = e.target.closest("[data-video-id]");
      if (card) openVideo(card.dataset.videoId);
    });
    grid.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") &&
          e.target.matches("[data-video-id]")) {
        e.preventDefault();
        openVideo(e.target.dataset.videoId);
      }
    });
  }

  const search = $("search");
  if (search) search.addEventListener("input", renderVideos);
  const refresh = $("refresh");
  if (refresh) refresh.addEventListener("click", loadVideos);

  const authOpen = $("auth-open");
  if (authOpen) {
    authOpen.addEventListener("click", () => {
      authMode = "signin";
      const title = $("auth-title");
      const submit = $("auth-submit");
      const toggle = $("auth-toggle");
      const message = $("auth-message");
      if (title) title.innerHTML = 'Your space.<br><span class="gold-text">Your watchlist.</span>';
      if (submit) submit.textContent = "Sign in";
      if (toggle) toggle.textContent = "Need an account? Create one";
      if (message) message.textContent = "";
      showModal("auth");
    });
  }

  const authToggle = $("auth-toggle");
  if (authToggle) {
    authToggle.addEventListener("click", () => {
      authMode = authMode === "signin" ? "signup" : "signin";
      const title = $("auth-title");
      const submit = $("auth-submit");
      const toggle = $("auth-toggle");
      const message = $("auth-message");

      if (title) {
        title.innerHTML = authMode === "signup"
          ? 'Join the <span class="gold-text">community.</span>'
          : 'Your space.<br><span class="gold-text">Your watchlist.</span>';
      }
      if (submit) submit.textContent = authMode === "signup" ? "Create account" : "Sign in";
      if (toggle) toggle.textContent = authMode === "signup"
        ? "Already have an account? Sign in"
        : "Need an account? Create one";
      if (message) message.textContent = "";
    });
  }

  const authForm = $("auth-form");
  if (authForm) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!isDesignatedTelegramAdmin()) {
        hideModal("auth");
        return;
      }
      const message = $("auth-message");

      if (!db) {
        if (message) message.textContent = "Supabase is not initialized. Check config.js and reload.";
        return;
      }

      const emailEl = $("auth-email");
      const passwordEl = $("auth-password");
      const btn = $("auth-submit");
      if (!emailEl || !passwordEl || !btn) {
        if (message) message.textContent = "Login form fields are missing.";
        return;
      }

      const email = emailEl.value.trim();
      const password = passwordEl.value;
      btn.disabled = true;
      btn.textContent = "Please wait…";
      if (message) message.textContent = "";

      try {
        const result = authMode === "signup"
          ? await db.auth.signUp({ email, password })
          : await db.auth.signInWithPassword({ email, password });

        if (result.error) throw result.error;

        if (authMode === "signup" && !result.data.session) {
          if (message) message.textContent = "Account created. Check your email to confirm, then sign in.";
        } else {
          currentUser = result.data.user;
          await refreshAdmin();
          hideModal("auth");
          toast(isAdmin ? "Admin signed in successfully" : "Signed in successfully");
        }
      } catch (err) {
        if (message) message.textContent = err.message || "Authentication failed.";
      } finally {
        btn.disabled = false;
        btn.textContent = authMode === "signup" ? "Create account" : "Sign in";
      }
    });
  }

  const signOut = $("sign-out");
  if (signOut) {
    signOut.addEventListener("click", async () => {
      try {
        if (db) {
          const { error } = await db.auth.signOut();
          if (error) throw error;
        }
        currentUser = null;
        isAdmin = false;
        updateAuthUI();
        toast("Signed out");
      } catch (err) {
        toast("Sign out failed: " + (err.message || "Unknown error"));
      }
    });
  }

  const adminOpen = $("admin-open");
  if (adminOpen) {
    adminOpen.addEventListener("click", () => {
      if (!isAdmin || !isDesignatedTelegramAdmin()) {
        toast("Administrator access required.");
        return;
      }
      const message = $("upload-message");
      const form = $("upload-form");
      if (message) message.textContent = "";
      if (form) form.reset();
      showModal("upload");
    });
  }

  const uploadForm = $("upload-form");
  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const message = $("upload-message");

      if (!db || !isAdmin || !currentUser || !isDesignatedTelegramAdmin()) {
        if (message) message.textContent = "Only an authenticated administrator can upload.";
        return;
      }

      const file = $("video-file")?.files?.[0];
      const thumb = $("video-thumbnail")?.files?.[0];
      if (!file) {
        if (message) message.textContent = "Choose a video file first.";
        return;
      }
      if (!$("video-rights")?.checked) {
        if (message) message.textContent = "Confirm you own this video or have the creator's permission.";
        return;
      }

      if (file.size > 500 * 1024 * 1024) {
        if (message) message.textContent = "This file is over the 500 MB starter limit. Compress it first.";
        return;
      }

      const btn = $("upload-submit");
      const progress = $("upload-progress");
      const bar = progress?.querySelector("span");
      if (!btn || !progress || !bar) {
        if (message) message.textContent = "Upload form is missing required elements.";
        return;
      }

      btn.disabled = true;
      btn.textContent = "Uploading…";
      progress.classList.remove("hidden");
      bar.style.width = "8%";

      try {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const videoPath = `${currentUser.id}/${crypto.randomUUID()}-${safeName}`;

        const videoBucket = cfg.VIDEO_BUCKET || "videos";

        let result = await db.storage
          .from(videoBucket)
          .upload(videoPath, file, {
            contentType: file.type || "video/mp4",
            upsert: false
          });
        if (result.error) throw result.error;
        bar.style.width = "60%";

        const videoPublicUrl = db.storage.from(videoBucket).getPublicUrl(videoPath).data?.publicUrl || null;

        let thumbnailUrl = null;
        let thumbPath = null;

        if (thumb) {
          if (!thumb.type.startsWith("image/")) {
            throw new Error("Thumbnail must be an image.");
          }
          const safeThumb = thumb.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          thumbPath = `${currentUser.id}/${crypto.randomUUID()}-${safeThumb}`;

          result = await db.storage
            .from(cfg.THUMBNAIL_BUCKET || "thumbnails")
            .upload(thumbPath, thumb, {
              contentType: thumb.type,
              upsert: false
            });
          if (result.error) throw result.error;

          thumbnailUrl = db.storage
            .from(cfg.THUMBNAIL_BUCKET || "thumbnails")
            .getPublicUrl(thumbPath).data.publicUrl;
        }

        bar.style.width = "85%";
        const row = {
          title: $("video-title")?.value.trim() || "",
          description: $("video-description")?.value.trim() || "",
          category: $("video-category")?.value || "Entertainment",
          video_url: videoPublicUrl || videoPath,
          video_path: videoPath,
          thumbnail_url: thumbnailUrl,
          thumbnail_path: thumbPath,
          published: true,
          is_vip: false,
          storage_bucket: videoBucket,
          uploaded_by: currentUser.id
        };

        const { error } = await db.from("videos").insert(row);
        if (error) throw error;

        bar.style.width = "100%";
        hideModal("upload");
        toast("Video published successfully");
        await loadVideos();
      } catch (err) {
        if (message) {
          message.textContent = (err.message || "Upload failed.") +
            " Check Supabase Storage and videos table policies.";
        }
        bar.style.width = "0%";
        console.error("Upload failed:", err);
      } finally {
        btn.disabled = false;
        btn.textContent = "Upload and publish";
        setTimeout(() => progress.classList.add("hidden"), 700);
      }
    });
  }

  // Compact custom controls/menu for the video player.
  const playerEl = $("video-player");
  const stageEl = $("video-stage");
  const menuEl = $("player-menu");
  const menuButton = $("player-menu-button");
  const playButton = $("custom-play");
  const controlsEl = $("custom-controls");
  const seekEl = $("player-seek");
  const timeEl = $("player-current-time");
  const deleteButton = $("player-delete");
  function formatPlayerTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    const n = Math.max(0, Math.floor(seconds));
    return `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
  }
  function showPlayerControls() {
    if (!stageEl) return;
    stageEl.classList.remove("controls-hidden");
    clearTimeout(controlsHideTimer);
    if (playerEl && !playerEl.paused && !(stageEl.classList.contains("menu-open"))) {
      controlsHideTimer = setTimeout(() => stageEl.classList.add("controls-hidden"), 2600);
    }
  }
  function closePlayerMenu() {
    if (menuEl) menuEl.classList.add("hidden");
    if (stageEl) stageEl.classList.remove("menu-open");
    if (menuButton) menuButton.setAttribute("aria-expanded", "false");
    const speeds = $("player-speed-options");
    if (speeds) speeds.classList.add("hidden");
    showPlayerControls();
  }
  if (playerEl && stageEl) {
    playButton?.addEventListener("click", () => { if (playerEl.paused) playerEl.play().catch(() => {}); else playerEl.pause(); showPlayerControls(); });
    playerEl.addEventListener("click", () => { if (playerEl.paused) playerEl.play().catch(() => {}); else showPlayerControls(); });
    playerEl.addEventListener("play", () => { if (playButton) playButton.textContent = "Ⅱ"; showPlayerControls(); });
    playerEl.addEventListener("pause", () => { if (playButton) playButton.textContent = "▶"; stageEl.classList.remove("controls-hidden"); clearTimeout(controlsHideTimer); });
    playerEl.addEventListener("timeupdate", () => {
      if (timeEl) timeEl.textContent = `${formatPlayerTime(playerEl.currentTime)} / ${formatPlayerTime(playerEl.duration)}`;
      if (seekEl && Number.isFinite(playerEl.duration) && playerEl.duration > 0 && !seekEl.matches(":active")) seekEl.value = String(Math.round(playerEl.currentTime / playerEl.duration * 1000));
    });
    playerEl.addEventListener("loadedmetadata", () => { if (timeEl) timeEl.textContent = `0:00 / ${formatPlayerTime(playerEl.duration)}`; if (seekEl) seekEl.value = "0"; });
    stageEl.addEventListener("pointermove", showPlayerControls);
    stageEl.addEventListener("touchstart", showPlayerControls, { passive: true });
    seekEl?.addEventListener("input", () => { if (Number.isFinite(playerEl.duration)) playerEl.currentTime = Number(seekEl.value) / 1000 * playerEl.duration; showPlayerControls(); });
    $("player-mute")?.addEventListener("click", (e) => { playerEl.muted = !playerEl.muted; e.currentTarget.textContent = playerEl.muted ? "🔇" : "🔊"; showPlayerControls(); });
    // Fullscreen that works inside Telegram on Android/iOS.
    // Telegram's in-app WebView usually blocks the browser Fullscreen API, so we:
    //  1) try the real Fullscreen API,
    //  2) else ask Telegram itself to go fullscreen (Bot API 8.0+),
    //  3) and always fall back to a CSS fullscreen that fills the whole screen.
    const fsButton = $("player-fullscreen");
    const tgApp = window.Telegram?.WebApp;
    const tgSupports = (v) => { try { return !!tgApp?.isVersionAtLeast?.(v); } catch { return false; } };
    const nativeFsElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;
    const isPlayerFullscreen = () => stageEl.classList.contains("pseudo-fullscreen") || !!nativeFsElement();
    const updateFsButton = () => { if (fsButton) { const on = isPlayerFullscreen(); fsButton.textContent = on ? "🗗" : "⛶"; fsButton.setAttribute("aria-label", on ? "Exit fullscreen" : "Fullscreen"); } };
    async function enterPlayerFullscreen() {
      let native = false;
      try {
        if (stageEl.requestFullscreen) { await stageEl.requestFullscreen(); native = true; }
        else if (stageEl.webkitRequestFullscreen) { stageEl.webkitRequestFullscreen(); native = true; }
      } catch { native = false; }
      if (!native) {
        if (tgSupports("8.0")) { try { tgApp.requestFullscreen(); } catch {} }
        else { try { tgApp?.expand?.(); } catch {} }
        stageEl.classList.add("pseudo-fullscreen");
        document.body.classList.add("player-fullscreen-open");
      }
      // Landscape for wide videos (ignored where not allowed).
      try { if (playerEl.videoWidth > playerEl.videoHeight) await screen.orientation?.lock?.("landscape"); } catch {}
      updateFsButton();
    }
    async function exitPlayerFullscreen() {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (document.webkitFullscreenElement) document.webkitExitFullscreen?.();
      } catch {}
      if (stageEl.classList.contains("pseudo-fullscreen")) {
        stageEl.classList.remove("pseudo-fullscreen");
        document.body.classList.remove("player-fullscreen-open");
        if (tgSupports("8.0") && tgApp?.isFullscreen) { try { tgApp.exitFullscreen(); } catch {} }
      }
      try { screen.orientation?.unlock?.(); } catch {}
      updateFsButton();
    }
    window.__exitPlayerFullscreen = exitPlayerFullscreen;
    fsButton?.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (isPlayerFullscreen()) await exitPlayerFullscreen(); else await enterPlayerFullscreen();
      showPlayerControls();
    });
    document.addEventListener("fullscreenchange", updateFsButton);
    document.addEventListener("webkitfullscreenchange", updateFsButton);
    menuButton?.addEventListener("click", (e) => {
      e.stopPropagation();
      const opening = menuEl.classList.contains("hidden");
      menuEl.classList.toggle("hidden", !opening);
      stageEl.classList.toggle("menu-open", opening);
      menuButton.setAttribute("aria-expanded", String(opening));
      if (opening) { stageEl.classList.remove("controls-hidden"); clearTimeout(controlsHideTimer); }
      else showPlayerControls();
    });
    $("player-download")?.addEventListener("click", () => {
      const url = playerEl.currentSrc || playerEl.src;
      if (!url) { toast("Video download is unavailable."); return; }
      const a = document.createElement("a"); a.href = url; a.download = (activePlayerVideo?.title || "video") + ".mp4"; a.target = "_blank"; a.rel = "noopener"; document.body.appendChild(a); a.click(); a.remove(); closePlayerMenu();
    });
    $("player-speed-button")?.addEventListener("click", () => $("player-speed-options")?.classList.toggle("hidden"));
    document.querySelectorAll("[data-speed]").forEach((b) => b.addEventListener("click", () => { playerEl.playbackRate = Number(b.dataset.speed); closePlayerMenu(); toast(`Playback speed: ${b.textContent}`); }));
    const deleteConfirmDialog = $("delete-confirm-dialog");
    const deleteConfirmMessage = $("delete-confirm-message");
    const confirmDelete = (title) => new Promise((resolve) => {
      if (!deleteConfirmDialog) { resolve(window.confirm(`Delete “${title}”? This cannot be undone.`)); return; }
      if (deleteConfirmMessage) deleteConfirmMessage.textContent = `Are you sure you want to delete “${title}”?`;
      deleteConfirmDialog.classList.remove("hidden");
      const cancel = $("delete-confirm-cancel");
      const accept = $("delete-confirm-accept");
      const finish = (answer) => {
        deleteConfirmDialog.classList.add("hidden");
        cancel?.removeEventListener("click", onCancel);
        accept?.removeEventListener("click", onAccept);
        deleteConfirmDialog.removeEventListener("click", onBackdrop);
        document.removeEventListener("keydown", onKey);
        resolve(answer);
      };
      const onCancel = () => finish(false);
      const onAccept = () => finish(true);
      const onBackdrop = (event) => { if (event.target === deleteConfirmDialog) finish(false); };
      const onKey = (event) => { if (event.key === "Escape") finish(false); };
      cancel?.addEventListener("click", onCancel);
      accept?.addEventListener("click", onAccept);
      deleteConfirmDialog.addEventListener("click", onBackdrop);
      document.addEventListener("keydown", onKey);
      accept?.focus();
    });
    deleteButton?.addEventListener("click", async () => {
      if (!activePlayerVideo || !isAdmin || !currentUser || !db || !isDesignatedTelegramAdmin()) { toast("Only the authorized Telegram administrator can delete videos."); return; }
      const v = activePlayerVideo;
      if (!(await confirmDelete(v.title || "this video"))) return;
      deleteButton.disabled = true;
      try {
        const bucket = cfg.VIDEO_BUCKET || "videos";
        const { error } = await db.from("videos").delete().eq("id", v.id);
        if (error) throw error;
        let storageWarning = false;
        if (v.video_path) {
          const { error: storageError } = await db.storage.from(bucket).remove([v.video_path]);
          if (storageError) { storageWarning = true; console.warn("Video row deleted, but storage cleanup failed:", storageError.message); }
        }
        playerEl.pause(); playerEl.removeAttribute("src"); playerEl.load(); hideModal("player");
        toast(storageWarning ? "Video record deleted; storage cleanup needs admin review." : "Video deleted successfully."); await loadVideos();
      } catch (err) {
        console.error("Video delete failed:", err);
        toast(err?.message || "Delete failed. Check administrator permissions and storage policies.");
      } finally { deleteButton.disabled = false; }
    });
    document.addEventListener("click", (e) => { if (menuEl && !menuEl.classList.contains("hidden") && !menuEl.contains(e.target) && e.target !== menuButton) closePlayerMenu(); });
  }

  document.querySelectorAll("[data-close]").forEach((el) => {
    el.addEventListener("click", () => {
      const name = el.dataset.close;
      if (name === "player") {
        const player = $("video-player");
        if (player) {
          player.pause();
          closePlayerMenu();
          if (stageEl) stageEl.classList.remove("controls-hidden", "menu-open");
          window.__exitPlayerFullscreen?.();
          player.removeAttribute("src");
          player.load();
        }
      }
      hideModal(name);
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    ["auth", "upload", "player"].forEach(hideModal);
    const player = $("video-player");
    if (player) player.pause();
  });

  const adIsolationObserver = new MutationObserver(() => {
    if (document.body.classList.contains("modal-active")) {
      syncModalAdIsolation();
    }
  });

  adIsolationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  syncModalAdIsolation();

  async function init() {
    if (!configured || !window.supabase) {
      updateAuthUI();
      await loadVideos();
      return;
    }

    try {
      db = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
      const { data, error } = await db.auth.getSession();
      if (error) throw error;

      currentUser = data.session?.user || null;
      await refreshAdmin();

      db.auth.onAuthStateChange((_event, session) => {
        currentUser = session?.user || null;
        setTimeout(() => refreshAdmin(), 0);
      });

      await loadVideos();
    } catch (err) {
      updateAuthUI();
      setNotice("Supabase could not initialize: " + (err.message || "Unknown error"));
      videos = [];
      renderCategories();
      renderVideos();
      console.error("Initialization failed:", err);
    }
  }

  init();
})();
