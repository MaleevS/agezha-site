(function () {
  "use strict";

  var COUNTER_ID = 111580923;
  var STORAGE_KEY = "agezha_analytics_consent";
  var TAG_SRC = "https://mc.yandex.ru/metrika/tag.js";
  var GRANTED = "granted";
  var DENIED = "denied";

  var banner = document.getElementById("analytics-consent");
  var allowBtn = document.getElementById("analytics-allow");
  var denyBtn = document.getElementById("analytics-deny");
  var settingsLinks = document.querySelectorAll("[data-analytics-settings]");

  var metrikaLoaded = false;
  var goalsBound = false;

  function getConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      /* ignore storage errors */
    }
  }

  function isGranted() {
    return getConsent() === GRANTED;
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    document.body.classList.add("has-consent-banner");
    allowBtn && allowBtn.focus();
  }

  function hideBanner() {
    if (!banner) return;
    banner.hidden = true;
    document.body.classList.remove("has-consent-banner");
  }

  function cookieDomains() {
    var hostname = window.location.hostname;
    var domains = ["", hostname];

    if (hostname && hostname.indexOf(".") !== -1) {
      domains.push("." + hostname);
    }

    if (hostname === "agezha.ru" || hostname.slice(-10) === ".agezha.ru") {
      domains.push("agezha.ru", ".agezha.ru");
    }

    return domains.filter(function (domain, index, list) {
      return list.indexOf(domain) === index;
    });
  }

  function expireCookie(name, domain) {
    var base = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
    if (domain) {
      document.cookie = base + "; domain=" + domain;
    } else {
      document.cookie = base;
    }
  }

  function clearMetrikaCookies() {
    var known = [
      "_ym_uid",
      "_ym_d",
      "_ym_isad",
      "_ym_visorc",
      "_ym_debug",
      "_ym_metrika_enabled",
    ];
    var names = {};

    known.forEach(function (name) {
      names[name] = true;
    });

    document.cookie.split(";").forEach(function (part) {
      var name = part.split("=")[0].trim();
      if (name.indexOf("_ym_") === 0) {
        names[name] = true;
      }
    });

    var domains = cookieDomains();

    Object.keys(names).forEach(function (name) {
      domains.forEach(function (domain) {
        expireCookie(name, domain);
      });
    });
  }

  function reachGoal(name) {
    if (!isGranted() || !metrikaLoaded) return;
    if (typeof window.ym !== "function") return;
    try {
      window.ym(COUNTER_ID, "reachGoal", name);
    } catch (error) {
      /* ignore goal errors */
    }
  }

  function ensureYmStub() {
    window.ym =
      window.ym ||
      function () {
        (window.ym.a = window.ym.a || []).push(arguments);
      };
    if (!window.ym.l) {
      window.ym.l = Date.now();
    }
  }

  function ensureTagScript() {
    if (document.querySelector('script[src="' + TAG_SRC + '"]')) {
      return;
    }

    var script = document.createElement("script");
    script.src = TAG_SRC;
    script.async = true;
    document.head.appendChild(script);
  }

  function loadMetrika() {
    if (metrikaLoaded) {
      return;
    }

    ensureYmStub();
    ensureTagScript();

    window.ym(COUNTER_ID, "init", {
      clickmap: false,
      trackLinks: false,
      accurateTrackBounce: true,
      webvisor: false,
    });

    metrikaLoaded = true;
  }

  function destroyMetrika() {
    if (metrikaLoaded && typeof window.ym === "function") {
      try {
        window.ym(COUNTER_ID, "destruct");
      } catch (error) {
        /* ignore destruct errors */
      }
    }
    metrikaLoaded = false;
  }

  function bindGoals() {
    if (goalsBound) return;
    goalsBound = true;

    document.addEventListener("click", function (event) {
      var link = event.target.closest("a");
      if (link) {
        var href = link.getAttribute("href") || "";
        if (href.indexOf("t.me/") !== -1 || href.indexOf("telegram.me/") !== -1) {
          reachGoal("telegram_click");
        } else if (href.indexOf("tel:") === 0) {
          reachGoal("phone_click");
        } else if (
          href.indexOf("yandex.ru/maps") !== -1 ||
          link.textContent.replace(/\s+/g, " ").trim() === "Построить маршрут"
        ) {
          reachGoal("route_click");
        }
      }

      var trigger = event.target.closest(".faq-trigger");
      if (trigger) {
        window.setTimeout(function () {
          if (trigger.getAttribute("aria-expanded") === "true") {
            reachGoal("faq_open");
          }
        }, 0);
      }
    });
  }

  function grantConsent() {
    setConsent(GRANTED);
    hideBanner();
    loadMetrika();
    bindGoals();
  }

  function denyConsent() {
    destroyMetrika();
    setConsent(DENIED);
    hideBanner();
    clearMetrikaCookies();
  }

  function openSettings(event) {
    if (event) event.preventDefault();
    showBanner();
  }

  if (allowBtn) {
    allowBtn.addEventListener("click", grantConsent);
  }

  if (denyBtn) {
    denyBtn.addEventListener("click", denyConsent);
  }

  settingsLinks.forEach(function (link) {
    link.addEventListener("click", openSettings);
  });

  bindGoals();

  var consent = getConsent();
  if (consent === GRANTED) {
    hideBanner();
    loadMetrika();
  } else if (consent === DENIED) {
    hideBanner();
  } else {
    showBanner();
  }
})();
