import { escapeHtml, nl2br, renderStars, icon } from "./utils.js";

/* ------------------------------------------------------------------ */
/* Shared building blocks                                              */
/* ------------------------------------------------------------------ */

/**
 * Premium section heading: eyebrow chip, title, intro, gradient divider.
 */
function sectionTitle(title, intro, opts = {}) {
  const { eyebrow = "", eyebrowIcon = "sparkles", eyebrowTone = "", titleId = "" } = opts;
  return `
    <div class="text-center max-w-3xl mx-auto mb-14 md:mb-20 rise">
      ${eyebrow ? `<span class="section-eyebrow ${eyebrowTone}"><i data-lucide="${eyebrowIcon}"></i>${escapeHtml(eyebrow)}</span>` : ""}
      <h2${titleId ? ` id="${escapeHtml(titleId)}"` : ""} class="section-title text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold mb-5">${escapeHtml(title)}</h2>
      ${intro ? `<p class="section-intro text-lg md:text-xl leading-relaxed">${nl2br(intro)}</p>` : ""}
      <div class="section-divider" aria-hidden="true"></div>
    </div>
  `;
}

/**
 * Decorative background layer: soft blurred radial accents + light noise.
 */
function decor(kind = "sky") {
  const blobs = {
    sky: `
      <div class="blob blob-sky float-slow" style="width:36rem;height:36rem;top:-12rem;right:-10rem"></div>
      <div class="blob blob-mint float-slower" style="width:28rem;height:28rem;bottom:-10rem;left:-12rem"></div>`,
    sand: `
      <div class="blob blob-amber float-slow" style="width:34rem;height:34rem;top:-10rem;left:-8rem"></div>
      <div class="blob blob-sky float-slower" style="width:26rem;height:26rem;bottom:-12rem;right:-10rem"></div>`,
    white: `
      <div class="blob blob-sky float-slow" style="width:30rem;height:30rem;top:-12rem;left:50%;margin-left:-15rem;opacity:0.35"></div>`,
  };
  return `<div class="section-decor" aria-hidden="true">${blobs[kind] || blobs.white}<div class="bg-noise"></div></div>`;
}

/** Format an ISO date as Lithuanian text. Accepts YYYY-MM-DD, YYYY-MM or YYYY. */
function formatDate(iso) {
  if (!iso) return "";
  const s = String(iso);
  if (s.length === 7) {
    return new Intl.DateTimeFormat("lt-LT", { year: "numeric", month: "long" }).format(new Date(`${s}-01T00:00:00`));
  }
  if (s.length === 4) {
    return new Intl.DateTimeFormat("lt-LT", { year: "numeric" }).format(new Date(`${s}-01-01T00:00:00`));
  }
  const d = new Date(s.length === 10 ? `${s}T00:00:00` : s);
  if (isNaN(d.getTime())) return s;
  return new Intl.DateTimeFormat("lt-LT", { year: "numeric", month: "long", day: "numeric" }).format(d);
}

/* ------------------------------------------------------------------ */
/* Header & Hero — DO NOT MODIFY (kept exactly as they are)            */
/* ------------------------------------------------------------------ */

export function renderHeader(data) {
  const header = document.getElementById("mainHeader");
  if (!header || !data.header) return;
  const nav = data.header.nav || [];
  header.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <a href="./" class="flex items-center gap-3 group focus:outline-none" aria-label="${escapeHtml(data.header.siteName)}">
          <img src="${escapeHtml(data.header.logo)}" alt="" class="h-12 w-12 object-contain" loading="eager">
          <span class="font-extrabold text-lg text-[#005f88] group-hover:text-[#2596be] transition">${escapeHtml(data.header.siteName)}</span>
        </a>
        <nav class="hidden lg:flex gap-8 font-bold" aria-label="Pagrindinis meniu">
          ${nav.map((item) => `
            <a href="${escapeHtml(item.href)}" class="relative group text-[#005f88] hover:text-[#2596be] transition-colors py-2">
              ${escapeHtml(item.label)}
              <span class="absolute left-0 bottom-0 h-0.5 w-0 bg-[#2596be] transition-all duration-300 group-hover:w-full"></span>
            </a>
          `).join("")}
          <a href="#kontaktai" class="btn btn-primary text-sm py-2 px-5">Susisiekime</a>
        </nav>
        <button id="burger" class="lg:hidden flex flex-col gap-1.5 p-2 rounded-lg focus:outline-none" aria-label="Atidaryti meniu" aria-expanded="false" aria-controls="mobileMenu">
          <span class="burger-line"></span>
          <span class="burger-line"></span>
          <span class="burger-line"></span>
        </button>
      </div>
    </div>
    <nav id="mobileMenu" class="lg:hidden overflow-hidden max-h-0 opacity-0 transition-all duration-300 bg-white/95 backdrop-blur border-t border-slate-100" aria-label="Mobilus meniu">
      <div class="px-6 py-6 flex flex-col gap-3 font-bold text-center">
        ${nav.map((item) => `
          <a href="${escapeHtml(item.href)}" class="block py-3 px-4 rounded-full bg-[#2596be]/10 text-[#005f88] hover:bg-[#2596be] hover:text-white transition" onclick="window.closeMobile && window.closeMobile()">${escapeHtml(item.label)}</a>
        `).join("")}
        <a href="#kontaktai" class="btn btn-primary mt-2" onclick="window.closeMobile && window.closeMobile()">Susisiekime</a>
      </div>
    </nav>
  `;
}

export function renderHero(data) {
  const section = document.getElementById("hero");
  if (!section || !data.hero?.enabled) {
    if (section) section.style.display = "none";
    return;
  }
  const h = data.hero;
  const contentHtml = `
    <h1 class="hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold max-w-5xl mb-6 reveal">${escapeHtml(h.headline)}</h1>
    <p class="text-lg sm:text-xl md:text-2xl max-w-3xl mb-10 text-white/95 reveal reveal-delay-1">${escapeHtml(h.subheadline)}</p>
    <div class="flex flex-col sm:flex-row gap-4 reveal reveal-delay-2">
      ${h.buttons.map((b) => `
        <a href="${escapeHtml(b.link)}" target="${b.target || '_self'}" class="btn ${b.primary ? 'btn-primary' : 'btn-secondary'} text-lg px-8 py-3.5">${escapeHtml(b.text)}</a>
      `).join("")}
    </div>
  `;
  const waveHtml = `
    <svg class="wave wave-delay" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
      <path fill="rgba(255,255,255,0.25)" d="M0,40 C240,100 720,0 1440,60 L1440,120 L0,120 Z"></path>
    </svg>
    <svg class="wave" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
      <path fill="#ffffff" d="M0,70 C360,120 900,20 1440,80 L1440,120 L0,120 Z"></path>
    </svg>
  `;

  // If HTML already contains the optimized background video, just fill content.
  if (section.querySelector("video")) {
    let overlay = section.querySelector("#heroOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "heroOverlay";
      overlay.className = "absolute inset-0";
      overlay.setAttribute("aria-hidden", "true");
      section.appendChild(overlay);
    }
    overlay.style.background = h.overlay || "rgba(0,60,90,0.35)";

    let content = section.querySelector(".hero-content");
    if (!content) {
      content = document.createElement("div");
      content.className = "hero-content relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 sm:px-6";
      section.appendChild(content);
    }
    content.innerHTML = contentHtml;

    if (!section.querySelector(".wave")) {
      section.insertAdjacentHTML("beforeend", waveHtml);
    }
    return;
  }

  // Fallback: build the whole hero from content.json (also emits the exact markup when no HTML video is present).
  section.innerHTML = `
    <video autoplay muted loop playsinline preload="metadata" poster="${escapeHtml(h.backgroundImage || '/assets/images/poster.webp')}" class="absolute inset-0 w-full h-full object-cover" aria-hidden="true">
      <source src="/assets/video/hero.webm" type="video/webm">
      <source src="${escapeHtml(h.backgroundVideo || '/assets/video/hero.mp4')}" type="video/mp4">
    </video>
    <div class="absolute inset-0" style="background:${h.overlay || 'rgba(0,60,90,0.35)'}" aria-hidden="true"></div>
    <div class="hero-content relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 sm:px-6">
      ${contentHtml}
    </div>
    ${waveHtml}
  `;
}

/* ------------------------------------------------------------------ */
/* Why us (Apie)                                                       */
/* ------------------------------------------------------------------ */

export function renderWhyUs(data) {
  const section = document.getElementById("apie");
  if (!section || !data.whyUs?.enabled) {
    if (section) section.style.display = "none";
    return;
  }
  const d = data.whyUs;
  section.innerHTML = `
    ${decor("white")}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      ${sectionTitle(d.title, d.intro, { eyebrow: "Kodėl mes", eyebrowIcon: "sparkles", titleId: "apie-title" })}
      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
        ${d.items.map((item, i) => `
          <div class="p-card p-card-hover p-card-accent p-8 rise rise-delay-${Math.min(i + 1, 6)}">
            <div class="p-card-icon mb-6">${icon(item.icon)}</div>
            <h3 class="text-xl font-extrabold text-[#0f2b3a] mb-3">${escapeHtml(item.title)}</h3>
            <p class="text-slate-600 leading-relaxed">${escapeHtml(item.text)}</p>
          </div>
        `).join("")}
      </div>
      ${d.highlight ? `
        <div class="relative overflow-hidden rounded-[1.375rem] p-8 md:p-12 text-white rise tint-sea-deep shadow-[0_28px_60px_-16px_rgba(0,95,136,0.45)]">
          <div class="bg-noise"></div>
          <div class="relative flex flex-col md:flex-row items-start md:items-center gap-8">
            <div class="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center text-4xl shrink-0 border border-white/25">
              ${icon(d.highlight.icon)}
            </div>
            <div>
              <h3 class="text-2xl md:text-3xl font-extrabold mb-3 text-white">${escapeHtml(d.highlight.title)}</h3>
              <p class="text-white/85 text-lg leading-relaxed max-w-3xl">${escapeHtml(d.highlight.text)}</p>
            </div>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

/* ------------------------------------------------------------------ */
/* Philosophy (Ugdymas)                                                */
/* ------------------------------------------------------------------ */

export function renderPhilosophy(data) {
  const section = document.getElementById("ugdymas");
  if (!section || !data.philosophy?.enabled) {
    if (section) section.style.display = "none";
    return;
  }
  const d = data.philosophy;
  const programIcons = ["baby", "school", "heart"];
  section.innerHTML = `
    ${decor("sky")}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      ${sectionTitle(d.title, d.intro, { eyebrow: "Programos", eyebrowIcon: "book-open", titleId: "ugdymas-title" })}
      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
        ${d.programs.map((prog, i) => `
          <div class="p-card p-card-hover p-card-accent p-8 flex flex-col rise rise-delay-${Math.min(i + 1, 6)}">
            <div class="p-card-icon ${i === 2 ? "icon-amber" : ""} mb-6">${icon(programIcons[i] || "sparkles")}</div>
            <h3 class="text-2xl font-extrabold text-[#0f2b3a] mb-4">${escapeHtml(prog.title)}</h3>
            <p class="text-slate-600 leading-relaxed mb-6">${escapeHtml(prog.text)}</p>
            <ul class="space-y-3 mt-auto">
              ${prog.items.map((li) => `
                <li class="flex gap-3 items-start">
                  <span class="mt-0.5 w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0" style="font-size:0.7rem"><i data-lucide="check"></i></span>
                  <span class="text-slate-600 text-[0.95rem] leading-relaxed">${escapeHtml(li)}</span>
                </li>
              `).join("")}
            </ul>
          </div>
        `).join("")}
      </div>

      <div class="p-card p-8 md:p-12 mb-16 rise">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
          <div>
            <span class="p-chip mb-4"><i data-lucide="badge-check"></i>${d.achievementAreas.items.length} sričių</span>
            <h3 class="text-2xl md:text-3xl font-extrabold text-[#0f2b3a] mb-3">${escapeHtml(d.achievementAreas.title)}</h3>
            <p class="text-slate-600 max-w-2xl leading-relaxed">${escapeHtml(d.achievementAreas.intro)}</p>
          </div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          ${d.achievementAreas.items.map((area, i) => `
            <div class="group p-5 rounded-2xl border border-transparent bg-slate-50/80 hover:bg-[#eaf5fb] hover:border-[#2596be]/20 hover:-translate-y-0.5 transition-all duration-300 rise rise-delay-${(i % 6) + 1}">
              <span class="inline-block text-xs font-extrabold tracking-wider text-[#2596be] bg-[#2596be]/10 rounded-lg px-2 py-1 mb-3">${String(i + 1).padStart(2, "0")}</span>
              <h4 class="font-bold text-[#0f2b3a] mb-2 leading-snug">${escapeHtml(area.title)}</h4>
              <p class="text-sm text-slate-600 leading-relaxed">${escapeHtml(area.description)}</p>
            </div>
          `).join("")}
        </div>
      </div>

      ${d.pdfs?.length ? `
        <div class="flex flex-wrap justify-center gap-4 rise">
          ${d.pdfs.map((pdf) => `
            <a href="${escapeHtml(pdf.file)}" download class="pbtn pbtn-outline text-base px-7 py-3.5">
              <i data-lucide="file-text"></i>
              ${escapeHtml(pdf.label)}
            </a>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

/* ------------------------------------------------------------------ */
/* Clubs (Būreliai)                                                    */
/* ------------------------------------------------------------------ */

export function renderClubs(data) {
  const section = document.getElementById("bureliai");
  if (!section || !data.clubs?.enabled) {
    if (section) section.style.display = "none";
    return;
  }
  const d = data.clubs;
  section.innerHTML = `
    ${decor("white")}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      ${sectionTitle(d.title, d.intro, { eyebrow: "Veiklos", eyebrowIcon: "puzzle", titleId: "bureliai-title" })}
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-16">
        ${d.items.map((club, i) => `
          <div class="p-card p-card-hover p-card-accent p-8 text-center rise rise-delay-${Math.min(i + 1, 6)}">
            <div class="p-card-icon ${club.comingSoon ? "icon-amber" : ""} mx-auto mb-6">${icon(club.icon)}</div>
            <h3 class="text-xl font-extrabold text-[#0f2b3a] mb-3">${escapeHtml(club.name)}</h3>
            <p class="text-slate-600 leading-relaxed ${club.comingSoon ? "mb-5" : ""}">${escapeHtml(club.description)}</p>
            ${club.comingSoon ? '<span class="p-chip chip-amber"><i data-lucide="rocket"></i>Jau ruošiama</span>' : ""}
          </div>
        `).join("")}
      </div>
      ${d.extras?.length ? `
        <div class="p-card p-8 md:p-10 rise">
          <h3 class="text-2xl font-extrabold text-[#0f2b3a] text-center mb-10">Papildomos veiklos</h3>
          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            ${d.extras.map((extra) => `
              <div class="flex items-start gap-4 p-5 rounded-2xl border border-transparent bg-slate-50/80 hover:bg-[#eaf5fb] hover:border-[#2596be]/20 hover:-translate-y-0.5 transition-all duration-300">
                <div class="p-card-icon shrink-0" style="width:2.75rem;height:2.75rem;border-radius:0.85rem;font-size:1.15rem">${icon(extra.icon)}</div>
                <div>
                  <h4 class="font-bold text-[#0f2b3a] mb-1">${escapeHtml(extra.name)}</h4>
                  <p class="text-sm text-slate-600 leading-relaxed">${escapeHtml(extra.description)}</p>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}
    </div>
  `;
}

/* ------------------------------------------------------------------ */
/* History (Istorija)                                                  */
/* ------------------------------------------------------------------ */

export function renderHistory(data) {
  const section = document.getElementById("istorija");
  if (!section || !data.history?.enabled) {
    if (section) section.style.display = "none";
    return;
  }
  const d = data.history;
  const foundedYear = d.foundedDate ? new Date(d.foundedDate).getFullYear() : null;
  const years = foundedYear && !isNaN(foundedYear) ? Math.max(new Date().getFullYear() - foundedYear, 0) : null;
  section.innerHTML = `
    ${decor("sand")}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      ${sectionTitle(d.title, d.intro, { eyebrow: foundedYear ? `Nuo ${foundedYear} m.` : "Istorija", eyebrowIcon: "anchor", eyebrowTone: "eyebrow-amber", titleId: "istorija-title" })}
      <div class="flex flex-col lg:flex-row gap-12 items-start mb-16">
        <div class="lg:w-1/3 w-full lg:sticky lg:top-28 rise">
          <div class="relative overflow-hidden rounded-[1.375rem] p-10 text-white text-center tint-sea-deep shadow-[0_28px_60px_-16px_rgba(0,95,136,0.45)]">
            <div class="bg-noise"></div>
            <div class="relative">
              ${years ? `
                <div class="stat-num text-7xl md:text-8xl font-extrabold leading-none mb-3" data-count="${years}">0</div>
                <div class="text-white/90 font-extrabold text-lg mb-6">metų patirtis</div>
              ` : ""}
              <div class="w-14 h-14 mx-auto rounded-2xl bg-white/15 border border-white/25 backdrop-blur flex items-center justify-center text-2xl mb-5">${icon("anchor")}</div>
              <p class="text-white font-bold mb-2">${escapeHtml(d.foundedText)}</p>
              <p class="text-white/80 leading-relaxed text-[0.95rem]">${escapeHtml(d.experienceText)}</p>
            </div>
          </div>
        </div>
        <div class="lg:w-2/3 timeline pl-4 md:pl-0">
          ${d.timeline.map((item, i) => `
            <div class="relative mb-10 md:w-1/2 ${i % 2 === 0 ? "md:ml-auto md:pl-12" : "md:mr-auto md:pr-12 md:text-right"} rise">
              <div class="timeline-dot" aria-hidden="true"></div>
              <div class="ml-12 md:ml-0 p-card p-card-hover group overflow-hidden">
                <div class="h-44 overflow-hidden">
                  <img src="${escapeHtml(item.image)}" alt="" class="img-cover transition-transform duration-700 group-hover:scale-105" loading="lazy">
                </div>
                <div class="p-6">
                  <span class="p-chip chip-amber mb-3">${escapeHtml(item.year)}</span>
                  <h3 class="text-xl font-extrabold text-[#0f2b3a] mb-2">${escapeHtml(item.title)}</h3>
                  <p class="text-slate-600 leading-relaxed">${escapeHtml(item.text)}</p>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="p-card p-8 md:p-10 rise">
        <h3 class="text-2xl font-extrabold text-[#0f2b3a] text-center mb-10">Mūsų pranašumai</h3>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          ${d.advantages.map((adv) => `
            <div class="flex items-start gap-4 p-5 rounded-2xl border border-transparent bg-slate-50/80 hover:bg-[#eaf5fb] hover:border-[#2596be]/20 hover:-translate-y-0.5 transition-all duration-300">
              <div class="p-card-icon shrink-0" style="width:2.75rem;height:2.75rem;border-radius:0.85rem;font-size:1.15rem">${icon(adv.icon)}</div>
              <div>
                <h4 class="font-bold text-[#0f2b3a] mb-1">${escapeHtml(adv.title)}</h4>
                <p class="text-sm text-slate-600 leading-relaxed">${escapeHtml(adv.text)}</p>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------------ */
/* Testimonials & Google reviews (Atsiliepimai)                        */
/* ------------------------------------------------------------------ */

export function renderTestimonialsAndReviews(data) {
  const section = document.getElementById("atsiliepimai");
  if (!section) return;
  const testimonials = data.testimonials;
  const reviews = data.reviews;
  let html = `
    ${decor("sky")}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
  `;

  if (testimonials?.enabled) {
    html += sectionTitle(testimonials.title, testimonials.intro, { eyebrow: "Atsiliepimai", eyebrowIcon: "quote", titleId: "atsiliepimai-title" });
    html += `<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-20">`;
    html += testimonials.items.map((t, i) => `
      <figure class="p-card p-card-hover p-card-accent p-8 flex flex-col rise rise-delay-${Math.min(i + 1, 6)}">
        <div class="flex items-center justify-between mb-5">
          <div class="p-card-icon icon-amber" style="width:2.75rem;height:2.75rem;border-radius:0.85rem;font-size:1.15rem"><i data-lucide="quote"></i></div>
          ${renderStars(t.rating)}
        </div>
        <blockquote class="text-slate-700 leading-relaxed mb-8 flex-1">„${escapeHtml(t.text)}“</blockquote>
        <figcaption class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-white shrink-0 shadow-md" style="background:linear-gradient(135deg,#2596be,#005f88)" aria-hidden="true">${escapeHtml(t.author.charAt(0))}</div>
          <div>
            <div class="font-extrabold text-[#0f2b3a]">${escapeHtml(t.author)}</div>
            <div class="text-sm text-slate-500">${escapeHtml(t.relation)}</div>
          </div>
        </figcaption>
      </figure>
    `).join("");
    html += `</div>`;
  }

  if (reviews?.enabled) {
    html += `
      <div class="p-card p-8 md:p-12 rise">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <span class="p-chip mb-4"><i data-lucide="star"></i>Google</span>
            <h3 class="text-2xl md:text-3xl font-extrabold text-[#0f2b3a] mb-3">${escapeHtml(reviews.title)}</h3>
            <p class="text-slate-600 leading-relaxed max-w-xl">${escapeHtml(reviews.intro)}</p>
          </div>
          <div class="flex items-center gap-5 rounded-2xl p-6 border border-[#2596be]/15" style="background:linear-gradient(135deg,#f2f9fd,#ffffff)">
            <div class="stat-num stat-dark text-6xl font-extrabold leading-none" data-count="${escapeHtml(String(reviews.average))}">0</div>
            <div>
              <div class="mb-1.5">${renderStars(reviews.average)}</div>
              ${reviews.totalReviews ? `<div class="text-slate-500 text-sm font-semibold"><span data-count="${escapeHtml(String(reviews.totalReviews))}">0</span> atsiliepimų</div>` : ""}
            </div>
          </div>
        </div>
        <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          ${reviews.reviews.slice(0, 6).map((r) => `
            <div class="p-6 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-[#2596be]/25 hover:-translate-y-0.5 transition-all duration-300">
              <div class="flex items-center justify-between gap-3 mb-3">
                <span class="font-extrabold text-[#0f2b3a]">${escapeHtml(r.author)}</span>
                ${renderStars(r.rating)}
              </div>
              <p class="text-slate-600 text-sm leading-relaxed">„${escapeHtml(r.text)}“</p>
              <div class="text-xs text-slate-400 mt-4 font-semibold">${escapeHtml(formatDate(r.date))}</div>
            </div>
          `).join("")}
        </div>
        <div class="text-center mt-10">
          <a href="${escapeHtml(reviews.link)}" target="_blank" rel="noopener" class="pbtn pbtn-outline">
            Žiūrėti visus „Google“ atsiliepimus
            <i data-lucide="arrow-up-right"></i>
          </a>
        </div>
      </div>
    `;
  }

  html += `</div>`;
  section.innerHTML = html;
}

/* ------------------------------------------------------------------ */
/* Gallery (Galerija)                                                  */
/* ------------------------------------------------------------------ */

function gallerySlide(img) {
  return `
    <figure class="gallery-slide group relative inline-block h-64 sm:h-72 md:h-80 lg:h-96 overflow-hidden cursor-pointer"
      data-src="${escapeHtml(img.src)}"
      data-category="${escapeHtml(img.category)}"
      tabindex="0" role="button"
      aria-label="Atidaryti nuotrauką: ${escapeHtml(img.caption)}">
      <img src="${escapeHtml(img.src)}" alt=""
        class="h-full w-auto max-w-none object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy">
      <figcaption class="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 group-focus:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-[#005f88]/90 to-transparent p-4 text-white">
        <span class="font-bold text-sm">${escapeHtml(img.caption)}</span>
      </figcaption>
    </figure>
  `;
}

export function initGallery(data) {
  const section = document.getElementById("galerija");
  if (!section || !data.gallery?.enabled) {
    if (section) section.style.display = "none";
    return;
  }
  const d = data.gallery;
  const images = d.images || [];
  if (!images.length) {
    section.style.display = "none";
    return;
  }

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  section.innerHTML = `
    ${decor("white")}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      ${sectionTitle(d.title, d.intro, { eyebrow: "Akimirkos", eyebrowIcon: "camera", titleId: "galerija-title" })}
      <div class="gallery-slider rise" role="region" aria-label="Galerijos skaidrių juosta" tabindex="0">
        <div class="gallery-track" id="galleryTrack">
          ${images.map((img) => gallerySlide(img)).join("")}
          ${images.map((img) => gallerySlide(img)).join("")}
        </div>
      </div>
      <p class="text-center text-slate-500 text-sm mt-6 rise">
        Užveskite pelę arba palieskite juostą, kad sustabdytumėte.
      </p>
    </div>
  `;

  const track = document.getElementById("galleryTrack");
  const slider = section.querySelector(".gallery-slider");
  if (!track || !slider) return;

  // Lightbox
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lightboxImg");
  const lbCaption = document.getElementById("lightboxCaption");
  const lbClose = document.getElementById("closeLightbox");
  const lbPrev = document.getElementById("lightboxPrev");
  const lbNext = document.getElementById("lightboxNext");
  const lbCounter = document.getElementById("lightboxCounter");

  let lbLastFocused = null;
  let lbIndex = -1;

  function showLightbox(i) {
    lbIndex = (i + images.length) % images.length;
    const img = images[lbIndex];
    lbImg.src = img.src;
    lbImg.alt = img.caption || "";
    lbCaption.textContent = img.caption || "";
    if (lbCounter) lbCounter.textContent = `${lbIndex + 1} / ${images.length}`;
  }
  function openLightbox(i) {
    if (!lightbox || !lbImg) return;
    lbLastFocused = document.activeElement;
    showLightbox(i);
    lightbox.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    if (lbClose) lbClose.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.add("hidden");
    lbImg.removeAttribute("src");
    lbImg.alt = "";
    document.body.style.overflow = "";
    if (lbLastFocused && typeof lbLastFocused.focus === "function") lbLastFocused.focus();
  }

  track.querySelectorAll(".gallery-slide").forEach((slide) => {
    const idx = Math.max(0, images.findIndex((im) => im.src === slide.dataset.src));
    slide.addEventListener("click", () => openLightbox(idx));
    slide.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(idx);
      }
    });
  });

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    // Scroll wheel navigates between photos
    let wheelLock = false;
    lightbox.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (wheelLock) return;
      wheelLock = true;
      setTimeout(() => { wheelLock = false; }, 350);
      showLightbox(lbIndex + (e.deltaY > 0 || e.deltaX > 0 ? 1 : -1));
    }, { passive: false });
  }
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbPrev) lbPrev.addEventListener("click", () => showLightbox(lbIndex - 1));
  if (lbNext) lbNext.addEventListener("click", () => showLightbox(lbIndex + 1));
  document.addEventListener("keydown", (e) => {
    if (!lightbox || lightbox.classList.contains("hidden")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
    else if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
  });

  // Auto-scroll with pause on hover / touch / focus
  let scrollPos = 0;
  let isPaused = false;
  let rafId = null;
  const speed = prefersReduced ? 0 : 0.75;
  const half = () => track.scrollWidth / 2;

  function step() {
    const limit = half();
    if (limit > 0 && !isPaused && speed > 0) {
      scrollPos += speed;
      if (scrollPos >= limit) scrollPos -= limit;
      slider.scrollLeft = scrollPos;
    }
    rafId = requestAnimationFrame(step);
  }

  function pause() { isPaused = true; }
  function resume() { isPaused = false; }

  slider.addEventListener("mouseenter", pause);
  slider.addEventListener("mouseleave", resume);
  slider.addEventListener("touchstart", pause, { passive: true });
  slider.addEventListener("touchend", resume);
  slider.addEventListener("focusin", pause);
  slider.addEventListener("focusout", resume);

  // Pause when the page is hidden to save resources.
  document.addEventListener("visibilitychange", () => {
    isPaused = document.hidden;
  });

  rafId = requestAnimationFrame(step);
}

/* ------------------------------------------------------------------ */
/* Prices (Kainos)                                                     */
/* ------------------------------------------------------------------ */

export function renderPrices(data) {
  const section = document.getElementById("kainos");
  if (!section || !data.prices?.enabled) {
    if (section) section.style.display = "none";
    return;
  }
  const d = data.prices;
  const cardIcons = ["wallet", "utensils", "puzzle"];
  section.innerHTML = `
    ${decor("sand")}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      ${sectionTitle(d.title, d.intro, { eyebrow: "Informacija", eyebrowIcon: "wallet", eyebrowTone: "eyebrow-amber", titleId: "kainos-title" })}
      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        ${d.priceCards.map((card, i) => `
          <div class="p-card p-card-hover p-card-accent p-8 text-center rise rise-delay-${Math.min(i + 1, 6)}">
            <div class="p-card-icon ${i === 1 ? "icon-amber" : ""} mx-auto mb-6">${icon(cardIcons[i] || "wallet")}</div>
            <div class="text-sm font-extrabold uppercase tracking-widest text-[#2596be] mb-3">${escapeHtml(card.label)}</div>
            <div class="text-2xl md:text-3xl font-extrabold text-[#0f2b3a] mb-3 leading-tight">${escapeHtml(String(card.value).trim())}</div>
            <p class="text-slate-600 text-sm leading-relaxed">${escapeHtml(card.note)}</p>
          </div>
        `).join("")}
      </div>
      <div class="p-card p-8 md:p-12 text-center rise">
        <div class="p-card-icon icon-mint mx-auto mb-6">${icon("info")}</div>
        <p class="text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">${escapeHtml(d.notes)}</p>
        <a href="${escapeHtml(d.pdf)}" download class="pbtn pbtn-primary text-lg px-9 py-4">
          <i data-lucide="download"></i> ${escapeHtml(d.pdfLabel)}
        </a>
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------------ */
/* News (Naujienos)                                                    */
/* ------------------------------------------------------------------ */

export async function renderNews(data) {
  const section = document.getElementById("naujienos");
  if (!section || !data.news?.enabled) {
    if (section) section.style.display = "none";
    return;
  }
  const d = data.news;
  const newsPageUrl = d.newsPageUrl || d.facebookUrl || "#";
  const maxPosts = d.maxPosts || 6;

  function buildCard(item, i) {
    const link = item.link || newsPageUrl;
    const external = link.startsWith("http");
    const category = item.category || "Naujienos";
    return `
      <a href="${escapeHtml(link)}" ${external ? 'target="_blank" rel="noopener"' : ""} class="news-card rise rise-delay-${Math.min(i + 1, 6)}" aria-label="${escapeHtml(item.title)}">
        <div class="news-img-wrap">
          <div class="news-img-fallback" aria-hidden="true"><i data-lucide="newspaper"></i></div>
          ${item.image ? `<img src="${escapeHtml(item.image)}" alt="" loading="lazy" onerror="this.remove()">` : ""}
          <span class="news-chip p-chip chip-white">${escapeHtml(category)}</span>
        </div>
        <div class="flex flex-col flex-1 p-6">
          ${item.date ? `
            <span class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2596be] mb-3">
              <i data-lucide="calendar-days" style="font-size:0.95rem"></i>${escapeHtml(formatDate(item.date))}
            </span>` : ""}
          <h3 class="text-lg font-extrabold text-[#0f2b3a] leading-snug mb-2.5 line-clamp-2">${escapeHtml(item.title)}</h3>
          ${item.excerpt ? `<p class="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-5">${escapeHtml(item.excerpt)}</p>` : ""}
          <span class="news-readmore mt-auto text-sm">
            Skaityti daugiau <i data-lucide="arrow-right" style="font-size:1rem"></i>
          </span>
        </div>
      </a>
    `;
  }

  const skeletonCards = Array.from({ length: 3 }).map(() => `
    <div class="p-card overflow-hidden" aria-hidden="true">
      <div class="skeleton" style="aspect-ratio:16/10;border-radius:0"></div>
      <div class="p-6 space-y-3">
        <div class="skeleton h-3 w-1/3"></div>
        <div class="skeleton h-5 w-4/5"></div>
        <div class="skeleton h-3 w-full"></div>
        <div class="skeleton h-3 w-2/3"></div>
      </div>
    </div>
  `).join("");

  const emptyState = `
    <div class="col-span-full max-w-2xl mx-auto w-full">
      <div class="p-card p-10 md:p-14 text-center">
        <div class="p-card-icon mx-auto mb-6" style="width:4rem;height:4rem;font-size:1.75rem"><i data-lucide="inbox"></i></div>
        <h3 class="text-2xl font-extrabold text-[#0f2b3a] mb-3">Šiuo metu naujienų nėra</h3>
        <p class="text-slate-600 leading-relaxed mb-8">${escapeHtml(d.fallbackMessage)}</p>
        <a href="${escapeHtml(newsPageUrl)}" target="_blank" rel="noopener" class="pbtn pbtn-primary">
          Atidaryti „Giliuko“ naujienas <i data-lucide="arrow-up-right"></i>
        </a>
      </div>
    </div>
  `;

  section.innerHTML = `
    ${decor("sky")}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      ${sectionTitle(d.title, d.intro, { eyebrow: "Aktualijos", eyebrowIcon: "newspaper", titleId: "naujienos-title" })}
      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch" id="newsGrid">
        ${skeletonCards}
      </div>
      <div class="text-center mt-12" id="newsMore" hidden>
        <a href="${escapeHtml(newsPageUrl)}" target="_blank" rel="noopener" class="pbtn pbtn-outline">
          Visos naujienos „Giliuko“ svetainėje <i data-lucide="arrow-up-right"></i>
        </a>
      </div>
    </div>
  `;

  const grid = document.getElementById("newsGrid");
  let liveItems = [];
  try {
    const res = await fetch("/api/news");
    if (res.ok) {
      const json = await res.json();
      liveItems = (json.items || []).slice(0, maxPosts);
    }
  } catch (err) {
    console.error("Naujienų srauto klaida:", err);
  }

  if (liveItems.length > 0) {
    grid.innerHTML = liveItems.map(buildCard).join("");
    document.getElementById("newsMore")?.removeAttribute("hidden");
  } else if (d.items && d.items.length) {
    grid.innerHTML = d.items.slice(0, maxPosts).map(buildCard).join("");
    document.getElementById("newsMore")?.removeAttribute("hidden");
  } else {
    grid.innerHTML = emptyState;
  }
}

/* ------------------------------------------------------------------ */
/* Visit us (Apsilankymas)                                             */
/* ------------------------------------------------------------------ */

export function renderVisitUs(data) {
  const section = document.getElementById("apsilankymas");
  if (!section || !data.visitUs?.enabled) {
    if (section) section.style.display = "none";
    return;
  }
  const d = data.visitUs;
  section.innerHTML = `
    <div class="relative py-28 md:py-36 overflow-hidden">
      <img src="/img/gamta-paveiksliukas.jpeg" alt="" class="absolute inset-0 w-full h-full object-cover" loading="lazy">
      <div class="absolute inset-0" style="background:linear-gradient(120deg, rgba(0,60,90,0.88) 0%, rgba(0,95,136,0.72) 55%, rgba(37,150,190,0.55) 100%)" aria-hidden="true"></div>
      <div class="bg-noise"></div>
      <div class="relative z-10 max-w-3xl mx-auto px-4 text-center text-white rise">
        <h2 id="apsilankymas-title" class="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight" style="color:#ffffff">${escapeHtml(d.title)}</h2>
        <p class="text-xl md:text-2xl mb-10 text-white/90 leading-relaxed">${escapeHtml(d.text)}</p>
        <a href="${escapeHtml(d.link)}" class="pbtn pbtn-primary text-lg px-10 py-4">
          ${escapeHtml(d.cta)} <i data-lucide="arrow-right"></i>
        </a>
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------------ */
/* Contacts (Kontaktai)                                                */
/* ------------------------------------------------------------------ */

export function renderContacts(data) {
  const section = document.getElementById("kontaktai");
  if (!section || !data.contacts?.enabled) {
    if (section) section.style.display = "none";
    return;
  }
  const d = data.contacts;
  section.innerHTML = `
    ${decor("white")}
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      ${sectionTitle(d.title, "", { eyebrow: "Susisiekime", eyebrowIcon: "mail", titleId: "kontaktai-title" })}
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-14">
        ${d.cards.map((card, i) => `
          <a href="${escapeHtml(card.link)}" class="p-card p-card-hover p-card-accent p-7 text-center block rise rise-delay-${Math.min(i + 1, 6)}">
            <div class="p-card-icon mx-auto mb-5">${icon(card.icon)}</div>
            <h3 class="font-extrabold text-[#0f2b3a] mb-1.5">${escapeHtml(card.title)}</h3>
            <p class="text-slate-600 text-sm leading-relaxed break-words">${escapeHtml(card.value)}</p>
          </a>
        `).join("")}
      </div>
      <div class="grid lg:grid-cols-3 gap-8">
        <div class="lg:col-span-1 space-y-6">
          <div class="p-card p-8 rise">
            <div class="flex items-center gap-3 mb-6">
              <div class="p-card-icon" style="width:2.75rem;height:2.75rem;border-radius:0.85rem;font-size:1.15rem"><i data-lucide="clock"></i></div>
              <h3 class="text-xl font-extrabold text-[#0f2b3a]">Darbo laikas</h3>
            </div>
            <ul class="space-y-4">
              ${d.hours.map((h) => `
                <li class="flex justify-between items-center gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <span class="font-bold text-slate-700">${escapeHtml(h.days)}</span>
                  <span class="text-slate-600 font-semibold">${escapeHtml(h.time)}</span>
                </li>
              `).join("")}
            </ul>
          </div>
          <div class="p-card p-8 rise rise-delay-1">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-card-icon icon-amber" style="width:2.75rem;height:2.75rem;border-radius:0.85rem;font-size:1.15rem"><i data-lucide="map-pin"></i></div>
              <h3 class="text-xl font-extrabold text-[#0f2b3a]">Adresas</h3>
            </div>
            <p class="text-slate-600 leading-relaxed">${escapeHtml(d.address)}</p>
          </div>
        </div>
        <div class="lg:col-span-2 relative h-96 lg:h-auto min-h-[400px] rounded-[1.375rem] overflow-hidden border border-[rgba(15,43,58,0.08)] shadow-[0_2px_4px_rgba(15,43,58,0.05),0_14px_34px_-10px_rgba(0,95,136,0.14)] rise rise-delay-2 map-container" id="map">
          <iframe data-cookie-category="embeds" data-cookie-src="${escapeHtml(d.mapEmbed)}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="„Gintarėlis“ žemėlapyje"></iframe>
          <div class="cb-embed-placeholder">
            <p>Žemėlapis įkeliamas tik gavus jūsų sutikimą dėl trečiųjų šalių turinio – „Google“ gali naudoti savo slapukus.</p>
            <button type="button" class="cb-btn cb-btn-primary" data-cookie-allow-embeds>Įkelti žemėlapį</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export function renderFooter(data) {
  const footer = document.getElementById("footer");
  if (!footer || !data.footer) return;
  const d = data.footer;
  footer.innerHTML = `
    <div class="section-decor" aria-hidden="true">
      <div class="blob" style="width:38rem;height:38rem;top:-14rem;right:-10rem;background:radial-gradient(circle at center, rgba(37,150,190,0.28), transparent 70%)"></div>
      <div class="blob" style="width:30rem;height:30rem;bottom:-14rem;left:-12rem;background:radial-gradient(circle at center, rgba(245,158,11,0.12), transparent 70%)"></div>
      <div class="bg-noise"></div>
    </div>
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
        <div class="lg:col-span-4">
          <a href="./" class="flex items-center gap-3 mb-6">
            <img src="${escapeHtml(data.header.logo)}" alt="" class="h-12 w-12 object-contain" loading="lazy">
            <span class="font-extrabold text-lg text-white">${escapeHtml(data.header.siteName)}</span>
          </a>
          <p class="text-slate-200 text-sm leading-relaxed max-w-xs mb-8">${escapeHtml(data.site.description)}</p>
          <div class="flex gap-3">
            ${d.socialLinks.map((s) => `
              <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener" aria-label="${escapeHtml(s.label)}" class="footer-social">
                ${icon(s.icon)}
              </a>
            `).join("")}
          </div>
        </div>
        ${d.columns.map((col) => `
          <div class="lg:col-span-2">
            <h3 class="text-sm font-extrabold uppercase tracking-widest text-white/90 mb-5">${escapeHtml(col.title)}</h3>
            ${col.links ? `
              <ul class="space-y-3">
                ${col.links.map((l) => `
                  <li>
                    ${l.href === "#cookie-settings"
                      ? `<button type="button" data-cookie-settings class="footer-link text-slate-200 hover:text-white text-sm inline-block">${escapeHtml(l.label)}</button>`
                      : `<a href="${escapeHtml(l.href)}" class="footer-link text-slate-200 hover:text-white text-sm inline-block">${escapeHtml(l.label)}</a>`}
                  </li>
                `).join("")}
              </ul>
            ` : `<p class="text-slate-200 text-sm leading-relaxed whitespace-pre-line">${nl2br(col.text)}</p>`}
          </div>
        `).join("")}
      </div>
      <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-200">
        <p>${escapeHtml(d.copyright)}</p>
        <p class="max-w-md md:text-right">${escapeHtml(d.legal)}</p>
      </div>
      <p class="mt-6 text-center text-xs text-slate-300">Svetainę sukūrė <span class="font-semibold text-slate-200">Memelcode</span></p>
    </div>
  `;
}
