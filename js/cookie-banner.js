/**
 * Cookie consent banner – GDPR / ePrivacy (ERĮ 69 str.) compliant.
 *
 * - Blocks all optional cookies and third-party embeds until explicit consent.
 * - Loads Google Analytics 4 only after "analytics" consent.
 * - Activates deferred embeds ([data-cookie-category][data-cookie-src],
 *   e.g. Google Maps) only after "embeds" consent.
 * - Stores consent in localStorage; consent can be changed anytime
 *   via any element with the [data-cookie-settings] attribute.
 * - Any [data-cookie-allow-embeds] element grants embeds consent on click
 *   (used by per-embed "load this content" placeholders).
 *
 * Plain script (no modules) – load with `defer` on every page.
 */
(function () {
  "use strict";

  /** Replace with the real GA4 measurement ID before going live. */
  var GA_MEASUREMENT_ID = "G-XXXXXXXXXX";
  var STORAGE_KEY = "gintarelis_cookie_consent";
  var CONSENT_VERSION = 2;

  /* ---------- consent storage ---------- */

  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || data.version !== CONSENT_VERSION) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(prefs) {
    var data = {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: !!prefs.analytics,
      embeds: !!prefs.embeds,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      /* storage unavailable – consent applies to this page view only */
    }
    applyConsent(data);
    return data;
  }

  /* ---------- Google Analytics (loaded only after consent) ---------- */

  function gaConfigured() {
    return /^G-[A-Z0-9]{4,}$/i.test(GA_MEASUREMENT_ID) && GA_MEASUREMENT_ID !== "G-XXXXXXXXXX";
  }

  function loadGA() {
    if (!gaConfigured() || document.getElementById("ga-script")) return;
    window["ga-disable-" + GA_MEASUREMENT_ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
    var s = document.createElement("script");
    s.id = "ga-script";
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(s);
  }

  function disableGA() {
    window["ga-disable-" + GA_MEASUREMENT_ID] = true;
    // Delete any previously set GA cookies after consent is withdrawn.
    var names = [];
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (n === "_ga" || n.indexOf("_ga_") === 0 || n === "_gid" || n === "_gat") names.push(n);
    });
    names.forEach(function (n) {
      document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + location.hostname;
      document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=." + location.hostname;
    });
  }

  /* ---------- deferred third-party embeds ---------- */

  function setEmbeds(category, allow) {
    document
      .querySelectorAll('[data-cookie-category="' + category + '"][data-cookie-src]')
      .forEach(function (el) {
        if (allow) {
          el.setAttribute("src", el.getAttribute("data-cookie-src"));
        } else {
          el.removeAttribute("src");
        }
      });
  }

  function applyConsent(consent) {
    var analytics = !!(consent && consent.analytics);
    var embeds = !!(consent && consent.embeds);

    if (analytics) {
      loadGA();
      setEmbeds("analytics", true);
    } else {
      disableGA();
      setEmbeds("analytics", false);
    }

    setEmbeds("embeds", embeds);
    document.documentElement.classList.toggle("cb-embeds-on", embeds);
  }

  // Sections rendered after this script runs (async content) still get
  // the current consent applied to their deferred embeds.
  function observeLateEmbeds() {
    if (!window.MutationObserver) return;
    var pending = false;
    new MutationObserver(function (mutations) {
      if (pending) return;
      var found = mutations.some(function (m) {
        return Array.prototype.some.call(m.addedNodes, function (n) {
          return (
            n.nodeType === 1 &&
            (n.hasAttribute("data-cookie-src") || (n.querySelector && n.querySelector("[data-cookie-src]")))
          );
        });
      });
      if (!found) return;
      pending = true;
      // Let the rendering framework finish its DOM batch first.
      setTimeout(function () {
        pending = false;
        applyConsent(getConsent());
      }, 50);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  /* ---------- banner UI ---------- */

  var banner = null;
  var lastFocused = null;

  function buildBanner() {
    banner = document.createElement("div");
    banner.className = "cb-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "true");
    banner.setAttribute("aria-labelledby", "cb-title");
    banner.setAttribute("aria-describedby", "cb-text");
    banner.innerHTML =
      '<div class="cb-inner">' +
      '  <div class="cb-content">' +
      '    <h2 class="cb-title" id="cb-title">Slapukai</h2>' +
      '    <p class="cb-text" id="cb-text">' +
      "      Svetainėje naudojami būtinieji slapukai, užtikrinantys jos veikimą. " +
      "      Su jūsų sutikimu taip pat būtų naudojami analitiniai slapukai " +
      "      („Google Analytics“) ir įkeliamas trečiųjų šalių turinys („Google“ žemėlapiai). " +
      '      Sutikimą galite bet kada pakeisti arba atšaukti. Daugiau – ' +
      '      <a href="/cookies.html">slapukų politikoje</a> ir ' +
      '      <a href="/privacy.html">privatumo pranešime</a>.' +
      "    </p>" +
      '    <div class="cb-settings" id="cb-settings" hidden>' +
      '      <label class="cb-option">' +
      '        <input type="checkbox" checked disabled />' +
      "        <span>Būtinieji slapukai <small>(visada aktyvūs)</small></span>" +
      "      </label>" +
      '      <label class="cb-option">' +
      '        <input type="checkbox" id="cb-analytics" />' +
      "        <span>Analitiniai slapukai <small>(„Google Analytics“)</small></span>" +
      "      </label>" +
      '      <label class="cb-option">' +
      '        <input type="checkbox" id="cb-embeds" />' +
      "        <span>Trečiųjų šalių turinys <small>(„Google“ žemėlapiai)</small></span>" +
      "      </label>" +
      "    </div>" +
      "  </div>" +
      '  <div class="cb-actions">' +
      '    <button type="button" class="cb-btn cb-btn-primary" id="cb-accept-all">Priimti visus</button>' +
      '    <button type="button" class="cb-btn cb-btn-secondary" id="cb-reject">Tik būtinieji</button>' +
      '    <button type="button" class="cb-btn cb-btn-ghost" id="cb-toggle-settings">Nustatymai</button>' +
      '    <button type="button" class="cb-btn cb-btn-primary" id="cb-save" hidden>Išsaugoti pasirinkimą</button>' +
      "  </div>" +
      "</div>";

    document.body.appendChild(banner);

    var settings = banner.querySelector("#cb-settings");
    var toggleBtn = banner.querySelector("#cb-toggle-settings");
    var saveBtn = banner.querySelector("#cb-save");
    var analyticsBox = banner.querySelector("#cb-analytics");
    var embedsBox = banner.querySelector("#cb-embeds");

    var current = getConsent();
    analyticsBox.checked = !!(current && current.analytics);
    embedsBox.checked = !!(current && current.embeds);

    toggleBtn.addEventListener("click", function () {
      var open = settings.hidden;
      settings.hidden = !open;
      saveBtn.hidden = !open;
      toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
      toggleBtn.textContent = open ? "Slėpti nustatymus" : "Nustatymai";
    });
    toggleBtn.setAttribute("aria-expanded", "false");

    banner.querySelector("#cb-accept-all").addEventListener("click", function () {
      saveConsent({ analytics: true, embeds: true });
      closeBanner();
    });
    banner.querySelector("#cb-reject").addEventListener("click", function () {
      saveConsent({ analytics: false, embeds: false });
      closeBanner();
    });
    saveBtn.addEventListener("click", function () {
      saveConsent({ analytics: analyticsBox.checked, embeds: embedsBox.checked });
      closeBanner();
    });
  }

  function openBanner() {
    if (!banner) buildBanner();
    lastFocused = document.activeElement;
    banner.classList.add("cb-visible");
    var focusTarget = banner.querySelector("#cb-accept-all");
    if (focusTarget) focusTarget.focus();
  }

  function closeBanner() {
    if (!banner) return;
    banner.classList.remove("cb-visible");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  /* ---------- global triggers ---------- */

  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    var settingsTrigger = e.target.closest("[data-cookie-settings]");
    if (settingsTrigger) {
      e.preventDefault();
      openBanner();
      return;
    }
    var embedTrigger = e.target.closest("[data-cookie-allow-embeds]");
    if (embedTrigger) {
      e.preventDefault();
      // Grant embeds consent, preserving the analytics choice.
      var current = getConsent();
      saveConsent({ analytics: !!(current && current.analytics), embeds: true });
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && banner && banner.classList.contains("cb-visible")) {
      // Dismissing without a choice = strictly necessary cookies only.
      saveConsent({ analytics: false, embeds: false });
      closeBanner();
    }
  });

  /* ---------- init ---------- */

  function init() {
    var consent = getConsent();
    applyConsent(consent);
    observeLateEmbeds();
    if (!consent) openBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* Public API (e.g. window.cookieConsent.open()) */
  window.cookieConsent = {
    open: openBanner,
    get: getConsent,
    acceptAll: function () { saveConsent({ analytics: true, embeds: true }); },
    rejectAll: function () { saveConsent({ analytics: false, embeds: false }); },
    save: saveConsent,
  };
})();
