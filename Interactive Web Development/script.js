/* =========================================================
   Nebula — Interactive behaviour (vanilla JS)
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Theme toggle (persisted) ---------- */
  const root = document.documentElement;
  const themeToggle = $("#themeToggle");
  const savedTheme = localStorage.getItem("nebula-theme");
  if (savedTheme) root.setAttribute("data-theme", savedTheme);
  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("nebula-theme", next);
    drawBarChart();
    drawLineChart();
  });

  /* ---------- Navbar scroll state + mobile menu ---------- */
  const nav = $("#nav");
  const burger = $("#navBurger");
  const navLinks = $("#navLinks");
  window.addEventListener("scroll", () => nav.classList.toggle("is-scrolled", window.scrollY > 20));
  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("#navLinks a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- Scroll progress bar ---------- */
  const progress = $("#scrollProgress");
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    progress.style.width = pct + "%";
  });

  /* ---------- Cursor glow ---------- */
  const glow = $("#cursorGlow");
  window.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });

  /* ---------- Back to top ---------- */
  const toTop = $("#toTop");
  window.addEventListener("scroll", () => toTop.classList.toggle("is-visible", window.scrollY > 600));
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- 3D tilt on hero frame ---------- */
  $$("[data-tilt]").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    el.addEventListener("mouseleave", () => (el.style.transform = "rotateY(0) rotateX(0)"));
  });

  /* ---------- Feature cards (data-driven) ---------- */
  const features = [
    { t: "Real-time analytics", d: "Watch every metric update live with sub-second latency across all your data sources.", i: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 4-6"/>' },
    { t: "No-code automations", d: "Drag, drop, and connect. Build powerful workflows without writing a single line of code.", i: '<path d="M12 2v6m0 8v6m10-10h-6M8 12H2"/><circle cx="12" cy="12" r="3"/>' },
    { t: "Team collaboration", d: "Comments, mentions, and shared dashboards keep everyone on the same page.", i: '<circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="2"/><path d="M2 21v-2a5 5 0 015-5h4a5 5 0 015 5v2"/>' },
    { t: "Enterprise security", d: "SOC 2 Type II, SSO, and role-based access control baked in from day one.", i: '<path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/>' },
    { t: "Smart alerts", d: "Get notified the moment something matters — in Slack, email, or your inbox.", i: '<path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 004 0"/>' },
    { t: "Open API & SDKs", d: "A clean REST API and typed SDKs for every language your stack speaks.", i: '<path d="M8 6L2 12l6 6"/><path d="M16 6l6 6-6 6"/>' },
  ];
  $("#featuresGrid").innerHTML = features
    .map(
      (f) => `
    <article class="feature">
      <div class="feature__icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${f.i}</svg></div>
      <h3>${f.t}</h3>
      <p>${f.d}</p>
    </article>`
    )
    .join("");

  /* ---------- Gallery (data-driven) + filter + lightbox ---------- */
  const gallery = [
    { src: "assets/gallery-1.png", label: "Analytics overview", cat: "analytics" },
    { src: "assets/gallery-2.png", label: "Kanban board", cat: "workflow" },
    { src: "assets/gallery-3.png", label: "Mobile app", cat: "mobile" },
    { src: "assets/gallery-4.png", label: "Automation builder", cat: "workflow" },
    { src: "assets/gallery-5.png", label: "Reports & tables", cat: "analytics" },
    { src: "assets/gallery-6.png", label: "Integrations", cat: "workflow" },
  ];
  const galleryEl = $("#gallery");
  galleryEl.innerHTML = gallery
    .map(
      (g, idx) => `
    <figure class="gallery__item" data-cat="${g.cat}" data-index="${idx}" data-label="${g.label}">
      <img src="${g.src}" alt="${g.label} screen of the Nebula product" loading="lazy" />
    </figure>`
    )
    .join("");

  $$("#filters .chip").forEach((chip) =>
    chip.addEventListener("click", () => {
      $$("#filters .chip").forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const f = chip.dataset.filter;
      $$(".gallery__item").forEach((item) => {
        item.classList.toggle("is-hidden", !(f === "all" || item.dataset.cat === f));
      });
    })
  );

  // Lightbox
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  let currentIndex = 0;
  const visibleItems = () => $$(".gallery__item").filter((i) => !i.classList.contains("is-hidden"));
  function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = gallery[index].src;
    lightboxImg.alt = gallery[index].label;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  }
  function stepLightbox(dir) {
    const items = visibleItems();
    const indices = items.map((i) => Number(i.dataset.index));
    let pos = indices.indexOf(currentIndex);
    pos = (pos + dir + indices.length) % indices.length;
    openLightbox(indices[pos]);
  }
  galleryEl.addEventListener("click", (e) => {
    const item = e.target.closest(".gallery__item");
    if (item) openLightbox(Number(item.dataset.index));
  });
  $("#lightboxClose").addEventListener("click", closeLightbox);
  $("#lightboxNext").addEventListener("click", () => stepLightbox(1));
  $("#lightboxPrev").addEventListener("click", () => stepLightbox(-1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
  }
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") stepLightbox(1);
    if (e.key === "ArrowLeft") stepLightbox(-1);
  });

  /* ---------- Pricing ---------- */
  const plans = [
    { name: "Starter", monthly: 0, yearly: 0, desc: "For individuals getting started.", features: ["Up to 3 dashboards", "10k events / mo", "Community support"], featured: false, cta: "Start free" },
    { name: "Growth", monthly: 29, yearly: 23, desc: "For growing teams that need more.", features: ["Unlimited dashboards", "1M events / mo", "No-code automations", "Priority support"], featured: true, cta: "Start free trial" },
    { name: "Scale", monthly: 79, yearly: 63, desc: "For organizations at scale.", features: ["Everything in Growth", "Unlimited events", "SSO & RBAC", "Dedicated manager"], featured: false, cta: "Contact sales" },
  ];
  const pricingGrid = $("#pricingGrid");
  let yearly = false;
  function renderPricing() {
    pricingGrid.innerHTML = plans
      .map((p) => {
        const price = yearly ? p.yearly : p.monthly;
        const suffix = price === 0 ? "" : `<span>/mo</span>`;
        return `
        <article class="price-card ${p.featured ? "is-featured" : ""}">
          <h3>${p.name}</h3>
          <div class="price">$${price}${suffix}</div>
          <p class="desc">${p.desc}${yearly && price > 0 ? " Billed annually." : ""}</p>
          <ul>${p.features.map((f) => `<li><span class="check">&#10003;</span> ${f}</li>`).join("")}</ul>
          <a href="#contact" class="btn ${p.featured ? "btn--primary" : "btn--ghost"} btn--full">${p.cta}</a>
        </article>`;
      })
      .join("");
  }
  renderPricing();
  const billingSwitch = $("#billingSwitch");
  billingSwitch.addEventListener("click", () => {
    yearly = !yearly;
    billingSwitch.classList.toggle("is-on", yearly);
    billingSwitch.setAttribute("aria-checked", String(yearly));
    $("#labelMonthly").classList.toggle("is-muted", yearly);
    $("#labelYearly").classList.toggle("is-muted", !yearly);
    renderPricing();
  });
  $("#labelYearly").classList.add("is-muted");

  /* ---------- Testimonials carousel ---------- */
  const testimonials = [
    { q: "Nebula replaced four separate tools and cut our reporting time by 90%. It just works.", n: "Maya Chen", r: "VP Growth, Orbit", a: "MC" },
    { q: "The automation builder is genuinely magical. Our ops team ships workflows in minutes now.", n: "Diego Ramos", r: "Head of Ops, Fathom", a: "DR" },
    { q: "Best onboarding I&apos;ve ever had for a SaaS product. We were live the same afternoon.", n: "Priya Nair", r: "CTO, Sable", a: "PN" },
    { q: "The dashboards are gorgeous and fast. Leadership finally trusts our numbers.", n: "Tom Becker", r: "Data Lead, Kite", a: "TB" },
  ];
  const track = $("#tTrack");
  const dotsWrap = $("#tDots");
  let tIndex = 0;
  track.innerHTML = testimonials
    .map(
      (t) => `
    <div class="tcard"><div class="tcard__inner">
      <p class="tcard__quote">&ldquo;${t.q}&rdquo;</p>
      <div class="tcard__author">
        <span class="tcard__avatar">${t.a}</span>
        <span><span class="tcard__name">${t.n}</span><br><span class="tcard__role">${t.r}</span></span>
      </div>
    </div></div>`
    )
    .join("");
  dotsWrap.innerHTML = testimonials.map((_, i) => `<button data-dot="${i}" aria-label="Go to testimonial ${i + 1}"></button>`).join("");
  function goTo(i) {
    tIndex = (i + testimonials.length) % testimonials.length;
    track.style.transform = `translateX(-${tIndex * 100}%)`;
    $$("#tDots button").forEach((d, di) => d.classList.toggle("is-active", di === tIndex));
  }
  $("#tNext").addEventListener("click", () => goTo(tIndex + 1));
  $("#tPrev").addEventListener("click", () => goTo(tIndex - 1));
  dotsWrap.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) goTo(Number(b.dataset.dot));
  });
  goTo(0);
  let tAuto = setInterval(() => goTo(tIndex + 1), 6000);
  $("#tcarousel").addEventListener("mouseenter", () => clearInterval(tAuto));
  $("#tcarousel").addEventListener("mouseleave", () => (tAuto = setInterval(() => goTo(tIndex + 1), 6000)));

  /* ---------- Contact form validation ---------- */
  const form = $("#contactForm");
  const validators = {
    name: (v) => (v.trim().length >= 2 ? "" : "Please enter your full name."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email address."),
    company: (v) => (v.trim().length >= 2 ? "" : "Please enter your company."),
    message: (v) => (v.trim().length >= 10 ? "" : "Tell us a bit more (10+ characters)."),
  };
  function validateField(input) {
    const err = validators[input.name](input.value);
    const field = input.closest(".field");
    field.classList.toggle("is-invalid", !!err);
    field.classList.toggle("is-valid", !err && input.value.length > 0);
    $(`[data-error-for="${input.name}"]`).textContent = err;
    return !err;
  }
  $$("#contactForm input, #contactForm textarea").forEach((input) => {
    input.addEventListener("input", () => validateField(input));
    input.addEventListener("blur", () => validateField(input));
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    $$("#contactForm input, #contactForm textarea").forEach((input) => {
      if (!validateField(input)) ok = false;
    });
    if (ok) {
      form.reset();
      $$("#contactForm .field").forEach((f) => f.classList.remove("is-valid", "is-invalid"));
      $("#formSuccess").hidden = false;
      setTimeout(() => ($("#formSuccess").hidden = true), 5000);
    }
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          if (entry.target.id === "stats") animateCounters();
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  $$("[data-reveal]").forEach((el) => io.observe(el));

  /* ---------- Animated counters ---------- */
  let countersDone = false;
  function animateCounters() {
    if (countersDone) return;
    countersDone = true;
    $$(".stat__num").forEach((el) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const dur = 1600;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.floor(eased * target);
        el.textContent = val.toLocaleString() + (p === 1 ? suffix : "");
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  /* ---------- Charts (pure canvas) ---------- */
  function themeColors() {
    const cs = getComputedStyle(document.documentElement);
    return {
      primary: cs.getPropertyValue("--primary").trim(),
      accent: cs.getPropertyValue("--accent").trim(),
      border: cs.getPropertyValue("--border").trim(),
      muted: cs.getPropertyValue("--muted").trim(),
    };
  }
  function setupCanvas(canvas) {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = 240 * ratio;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { ctx, w: rect.width, h: 240 };
  }

  const barData = [42, 58, 47, 71, 63, 88];
  const barLabels = ["Q1", "Q2", "Q3", "Q4", "Q1", "Q2"];
  let barProgress = 0;
  function drawBarChart(animate) {
    const canvas = $("#barChart");
    if (!canvas) return;
    const { ctx, w, h } = setupCanvas(canvas);
    const c = themeColors();
    const pad = 30;
    const max = Math.max(...barData) * 1.15;
    const bw = (w - pad * 2) / barData.length;
    ctx.clearRect(0, 0, w, h);
    // gridlines
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad + ((h - pad * 2) / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
    }
    barData.forEach((val, i) => {
      const bh = ((val / max) * (h - pad * 2)) * barProgress;
      const x = pad + i * bw + bw * 0.2;
      const y = h - pad - bh;
      const grad = ctx.createLinearGradient(0, y, 0, h - pad);
      grad.addColorStop(0, c.accent);
      grad.addColorStop(1, c.primary);
      ctx.fillStyle = grad;
      const bwidth = bw * 0.6;
      const r = 6;
      ctx.beginPath();
      ctx.moveTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.arcTo(x + bwidth, y, x + bwidth, y + r, r);
      ctx.lineTo(x + bwidth, h - pad);
      ctx.lineTo(x, h - pad);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = c.muted;
      ctx.font = "12px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(barLabels[i], x + bwidth / 2, h - pad + 18);
    });
    if (animate && barProgress < 1) {
      barProgress = Math.min(barProgress + 0.04, 1);
      requestAnimationFrame(() => drawBarChart(true));
    }
  }

  const lineData = [20, 35, 30, 50, 48, 66, 72, 90];
  let lineProgress = 0;
  function drawLineChart(animate) {
    const canvas = $("#lineChart");
    if (!canvas) return;
    const { ctx, w, h } = setupCanvas(canvas);
    const c = themeColors();
    const pad = 30;
    const max = Math.max(...lineData) * 1.15;
    const stepX = (w - pad * 2) / (lineData.length - 1);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad + ((h - pad * 2) / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
    }
    const count = Math.max(2, Math.floor(lineData.length * lineProgress));
    const pts = lineData.slice(0, count).map((v, i) => ({
      x: pad + i * stepX,
      y: h - pad - (v / max) * (h - pad * 2),
    }));
    // area fill
    const fill = ctx.createLinearGradient(0, pad, 0, h - pad);
    fill.addColorStop(0, "color-mix" in window ? c.primary : c.primary);
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = c.primary;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, h - pad);
    pts.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, h - pad);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    // line
    ctx.strokeStyle = c.primary;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
    // dots
    pts.forEach((p) => {
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    if (animate && lineProgress < 1) {
      lineProgress = Math.min(lineProgress + 0.03, 1);
      requestAnimationFrame(() => drawLineChart(true));
    }
  }

  // Kick off charts when the metrics section appears
  const chartObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          drawBarChart(true);
          drawLineChart(true);
          chartObserver.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );
  chartObserver.observe($("#metrics"));
  window.addEventListener("resize", () => { drawBarChart(); drawLineChart(); });

  /* ---------- Hero particle field ---------- */
  const canvas = $("#particles");
  const pctx = canvas.getContext("2d");
  let particles = [];
  let raf;
  function resizeParticles() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const count = Math.min(70, Math.floor(canvas.width / 18));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.6,
    }));
  }
  function drawParticles() {
    const c = themeColors();
    pctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      pctx.fillStyle = c.primary;
      pctx.globalAlpha = 0.6;
      pctx.beginPath();
      pctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 120) {
          pctx.globalAlpha = (1 - dist / 120) * 0.25;
          pctx.strokeStyle = c.primary;
          pctx.lineWidth = 1;
          pctx.beginPath();
          pctx.moveTo(p.x, p.y);
          pctx.lineTo(q.x, q.y);
          pctx.stroke();
        }
      }
    });
    pctx.globalAlpha = 1;
    raf = requestAnimationFrame(drawParticles);
  }
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    resizeParticles();
    drawParticles();
    window.addEventListener("resize", resizeParticles);
  }
})();
