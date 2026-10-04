/* Revframe — site behaviour
   1. Smooth scrolling (Lenis)
   2. Hero showreel: cycles through the niche loops
   3. Work reel: background video crossfades as you scroll each niche
   4. Mobile menu, timecode, reveal-on-scroll
   5. Brief form (Formspree)
*/
(function () {
  document.documentElement.classList.add("js");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- CONFIG: edit these ---------- */
  const BOOKING_URL = "https://cal.com/revframe"; // your Cal.com or Calendly link
  const NICHES = [ // order = hero showreel order. Files live in /videos
    { id: "automotive", label: "Automotive" },
    { id: "concerts",   label: "Concerts" },
    { id: "music",      label: "Music Videos" },
    { id: "events",     label: "Events" },
    { id: "fashion",    label: "Fashion" },
    { id: "commercial", label: "Commercial" },
    { id: "social",     label: "Social" },
  ];
  const HERO_SECONDS = 4; // how long each clip shows in the hero
  /* ---------------------------------------- */
  document.querySelectorAll("#bookLink").forEach(a => (a.href = BOOKING_URL));

  /* 1. Smooth scroll */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      lenis ? lenis.scrollTo(el, { offset: el.classList.contains("panel") ? 0 : -70 })
            : el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* 2. Hero showreel */
  const hero = document.getElementById("heroReel");
  const heroLabel = document.getElementById("heroLabel");
  if (hero) {
    const vids = NICHES.map((n, i) => {
      const v = document.createElement("video");
      v.className = "hero__vid";
      v.muted = true; v.loop = true; v.playsInline = true;
      v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
      v.preload = i === 0 ? "auto" : "metadata";
      v.src = `videos/${n.id}.mp4`;
      v.dataset.label = n.label;
      v.addEventListener("error", () => { v.dataset.bad = "1"; }, { once: true });
      hero.insertBefore(v, hero.querySelector(".hero__cap"));
      return v;
    });
    let cur = -1, timer = null;
    const show = i => {
      const ok = vids.filter(v => !v.dataset.bad);
      if (!ok.length) return;
      const next = ok[i % ok.length];
      vids.forEach(v => { if (v !== next) { v.classList.remove("on"); setTimeout(() => v.pause(), 1000); } });
      next.currentTime = 0;
      next.play().catch(() => {});
      next.classList.add("on");
      if (heroLabel) heroLabel.textContent = "Showreel 2026 · " + next.dataset.label;
      cur = i;
    };
    const start = () => { show(0); if (!reduce) timer = setInterval(() => show(cur + 1), HERO_SECONDS * 1000); };
    // pause the hero when it scrolls off screen
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!timer) start(); }
      else { clearInterval(timer); timer = null; vids.forEach(v => v.pause()); }
    }, { threshold: 0.2 }).observe(hero);
  }

  /* 3. Work reel: crossfade background per niche */
  const reel = document.getElementById("work");
  if (reel) {
    const layers = {}, links = {};
    reel.querySelectorAll(".reel__layer").forEach(l => {
      const v = l.querySelector("video");
      v.addEventListener("error", () => v.remove(), { once: true }); // missing file -> gradient stays
      layers[l.dataset.id] = { el: l, v };
    });
    reel.querySelectorAll(".reel__index a").forEach(a => (links[a.dataset.id] = a));
    let active = null;
    const load = id => { const L = layers[id]; if (L && L.v && !L.v.src && L.v.dataset.src) { L.v.src = L.v.dataset.src; } };
    const setActive = id => {
      if (id === active) return;
      active = id;
      Object.entries(layers).forEach(([k, L]) => {
        const on = k === id;
        L.el.classList.toggle("on", on);
        if (!L.v || !L.v.isConnected) return;
        if (on) { load(k); L.v.play().catch(() => {}); } else { L.v.pause(); }
      });
      Object.entries(links).forEach(([k, a]) => a.classList.toggle("on", k === id));
      // preload the next niche so the crossfade is instant
      const ids = Object.keys(layers), n = ids[ids.indexOf(id) + 1];
      if (n) load(n);
    };
    const panelIO = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) setActive(e.target.dataset.id);
    }), { rootMargin: "-50% 0px -50% 0px" });
    reel.querySelectorAll(".panel").forEach(p => panelIO.observe(p));
    setActive(reel.querySelector(".panel").dataset.id);

    // show the side index only while inside the reel
    new IntersectionObserver(([e]) => {
      document.body.classList.toggle("reel-active", e.isIntersecting);
      if (!e.isIntersecting) Object.values(layers).forEach(L => L.v && L.v.isConnected && L.v.pause());
      else if (active && layers[active].v && layers[active].v.isConnected) layers[active].v.play().catch(() => {});
    }, { rootMargin: "-40% 0px -40% 0px" }).observe(reel);
  }

  /* 4a. Mobile menu */
  const btn = document.getElementById("menuBtn");
  const nav = document.getElementById("mobileNav");
  function closeMenu() { if (!nav) return; nav.hidden = true; btn.setAttribute("aria-expanded", "false"); lenis && lenis.start(); }
  if (btn) btn.addEventListener("click", () => {
    const open = nav.hidden;
    nav.hidden = !open; btn.setAttribute("aria-expanded", String(open));
    open ? lenis && lenis.stop() : lenis && lenis.start();
  });

  /* 4b. Timecode on the hero */
  const tc = document.getElementById("tc");
  const t0 = performance.now();
  const pad = n => String(Math.floor(n)).padStart(2, "0");
  if (tc && !reduce) (function tick(now) {
    const s = (now - t0) / 1000;
    tc.textContent = `${pad(s / 3600)}:${pad((s / 60) % 60)}:${pad(s % 60)}:${pad((s % 1) * 25)}`;
    requestAnimationFrame(tick);
  })(t0);

  /* 4c. Reveal on scroll */
  const rv = document.querySelectorAll(".statement p, .panel > *, .tier, .services div, .steps li, .about .serif-lg, .huge");
  rv.forEach(el => el.classList.add("rv"));
  const rvIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); rvIO.unobserve(e.target); }
  }), { threshold: 0.12 });
  rv.forEach(el => rvIO.observe(el));
  requestAnimationFrame(() => rv.forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add("in"); }));

  /* 5. Brief form -> Formspree */
  const form = document.getElementById("briefForm");
  const status = document.getElementById("formStatus");
  if (form) form.addEventListener("submit", async e => {
    e.preventDefault();
    if (form.action.includes("YOUR_FORM_ID")) { status.textContent = "Form not connected yet. Email hello@revframestudio.com"; return; }
    status.textContent = "Sending…";
    try {
      const r = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (r.ok) { form.reset(); status.textContent = "Thanks. We'll reply within one working day."; }
      else status.textContent = "Couldn't send. Please email hello@revframestudio.com";
    } catch { status.textContent = "Couldn't send. Please email hello@revframestudio.com"; }
  });
})();
