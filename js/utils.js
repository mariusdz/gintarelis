/**
 * Shared utilities for the public website.
 */

export function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function nl2br(str) {
  return escapeHtml(str).replace(/\n/g, "<br>");
}

/**
 * Map legacy Font Awesome icon classes (stored in content.json)
 * to premium Lucide icon names.
 */
const FA_TO_LUCIDE = {
  "chalkboard-user": "presentation",
  "palette": "palette",
  "graduation-cap": "graduation-cap",
  "users": "users",
  "water": "waves",
  "ship": "ship",
  "file-pdf": "file-text",
  "jar": "shapes",
  "music": "music",
  "hand-fist": "medal",
  "masks-theater": "drama",
  "language": "languages",
  "robot": "bot",
  "person-running": "footprints",
  "paintbrush": "paintbrush",
  "guitar": "guitar",
  "comments": "speech",
  "house-chimney": "house",
  "bed": "bed-double",
  "utensils": "utensils",
  "dumbbell": "dumbbell",
  "star": "star",
  "tree": "tree-pine",
  "sun": "sun",
  "phone": "phone",
  "envelope": "mail",
  "location-dot": "map-pin",
  "arrow-up-right-from-square": "arrow-up-right",
  "facebook-f": "facebook",
  "facebook": "facebook",
};

/**
 * Accepts a Font Awesome class string (e.g. "fa-solid fa-phone") or a plain
 * Lucide name and returns a valid Lucide icon name with a graceful fallback.
 */
export function lucideName(iconClass, fallback = "sparkles") {
  if (!iconClass) return fallback;
  const raw = String(iconClass).trim();
  // Already a plain lucide name (no "fa" prefixes and no spaces)?
  if (!/\s/.test(raw) && !raw.startsWith("fa-") && !raw.startsWith("fa ")) {
    return FA_TO_LUCIDE[raw] || raw;
  }
  const parts = raw.split(/\s+/);
  // Last "fa-xxx" token is the icon name.
  const faName = parts.filter((p) => p.startsWith("fa-")).pop();
  if (!faName) return fallback;
  const key = faName.slice(3);
  return FA_TO_LUCIDE[key] || fallback;
}

/** Render a Lucide icon placeholder (hydrated by lucide.createIcons()).
 *  Brand icons (facebook) are rendered as inline SVG because lucide 1.x
 *  no longer ships brand logos. */
export function icon(iconClass, cls = "") {
  const name = lucideName(iconClass);
  if (name === "facebook") return brandIcon("facebook");
  return `<i data-lucide="${escapeHtml(name)}"${cls ? ` class="${escapeHtml(cls)}"` : ""}></i>`;
}

/** Inline brand icons (lucide 1.x no longer ships brand logos). */
const BRAND_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="width:1em;height:1em"><path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7V11H8.3v3h2.4v7h2.8z"/></svg>',
};

/** Render a brand icon by platform key (e.g. "facebook"). */
export function brandIcon(platform) {
  return BRAND_ICONS[String(platform || "").toLowerCase()] || BRAND_ICONS.facebook;
}

export function renderStars(rating, max = 5) {
  let html = '<span class="inline-flex gap-1" role="img" aria-label="' + rating + " iš " + max + ' žvaigždžių">';
  for (let i = 1; i <= max; i++) {
    const cls = i <= Math.round(rating) ? "star-icon star-fill" : "star-icon star-empty";
    html += `<i data-lucide="star" class="${cls}"></i>`;
  }
  html += "</span>";
  return html;
}

/**
 * Scroll-triggered reveal for both `.reveal` (legacy/hero) and `.rise`
 * (premium sections) elements.
 */
export function observeReveal(container = document) {
  const items = container.querySelectorAll(".reveal, .rise");
  if (!items.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((item) => observer.observe(item));
}

/**
 * Animate `[data-count]` numbers counting up when they become visible.
 * Supports decimals via data-count="4.9" and a suffix via data-suffix.
 */
export function observeCounters(container = document) {
  const items = container.querySelectorAll("[data-count]");
  if (!items.length) return;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const format = (el, value) => {
    const decimals = (String(el.dataset.count).split(".")[1] || "").length;
    el.textContent = value.toFixed(decimals) + (el.dataset.suffix || "");
  };

  const animate = (el) => {
    const target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    if (prefersReduced) {
      format(el, target);
      return;
    }
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      format(el, target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  items.forEach((item) => observer.observe(item));
}

export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (targetId === "#") return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        // Close mobile menu if open
        const mobileMenu = document.getElementById("mobileMenu");
        const burger = document.getElementById("burger");
        if (mobileMenu && !mobileMenu.classList.contains("max-h-0")) {
          mobileMenu.style.maxHeight = "0";
          mobileMenu.classList.add("opacity-0");
          burger?.classList.remove("active");
        }
      }
    });
  });
}
