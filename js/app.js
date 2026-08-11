/**
 * Main application entry point for the public website.
 */
import { loadContent } from "./api.js";
import { initMenu } from "./menu.js";
import { observeReveal, observeCounters, initSmoothScroll } from "./utils.js";
import {
  renderHeader,
  renderHero,
  renderWhyUs,
  renderPhilosophy,
  renderClubs,
  renderHistory,
  renderTestimonialsAndReviews,
  initGallery,
  renderPrices,
  renderNews,
  renderVisitUs,
  renderContacts,
  renderFooter,
} from "./sections.js";

function updateMeta(data) {
  if (!data.site) return;
  const s = data.site;
  const set = (selector, attr, value) => {
    const el = document.querySelector(selector);
    if (el && value) el.setAttribute(attr, value);
  };
  document.title = s.title || document.title;
  set('meta[name="description"]', "content", s.description);
  set('meta[name="keywords"]', "content", s.keywords);
  set('meta[name="author"]', "content", s.author);
  set('link[rel="canonical"]', "href", s.canonical);
  set('meta[property="og:title"]', "content", s.title);
  set('meta[property="og:description"]', "content", s.description);
  set('meta[property="og:url"]', "content", s.url);
  set('meta[property="og:image"]', "content", s.ogImage);
  set('meta[property="og:locale"]', "content", s.locale);
  set('meta[name="twitter:card"]', "content", s.twitterCard);
  set('meta[name="twitter:title"]', "content", s.title);
  set('meta[name="twitter:description"]', "content", s.description);
  set('meta[name="twitter:image"]', "content", s.ogImage);
  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && s.favicon) favicon.href = s.favicon;
}

async function init() {
  try {
    const data = await loadContent();
    updateMeta(data);
    renderHeader(data);
    initMenu();
    renderHero(data);
    renderWhyUs(data);
    renderPhilosophy(data);
    renderClubs(data);
    renderHistory(data);
    renderTestimonialsAndReviews(data);
    initGallery(data);
    renderPrices(data);
    await renderNews(data);
    renderVisitUs(data);
    renderContacts(data);
    renderFooter(data);
    initSmoothScroll();
    // Hydrate Lucide icons only after every section (incl. async news) is in the DOM.
    if (window.lucide) window.lucide.createIcons();
    observeReveal();
    observeCounters();
  } catch (err) {
    console.error("Svetainės klaida:", err);
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div class="fixed inset-0 z-50 flex items-center justify-center bg-white/90 p-6 text-center">
        <div>
          <h2 class="text-2xl font-bold text-[#005f88] mb-2">Įvyko klaida</h2>
          <p class="text-slate-600">Nepavyko užkrauti svetainės turinio. Bandykite atnaujinti puslapį.</p>
        </div>
      </div>`
    );
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
