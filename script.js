(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rootNode = document.documentElement;
  const themeStorageKey = "bs-theme";
  const themeChangeEvent = "bs-theme-change";
  const themeDark = "dark";
  const themeLight = "light";

  const getStoredTheme = () => {
    try {
      const saved = window.localStorage.getItem(themeStorageKey);
      return saved === themeDark || saved === themeLight ? saved : null;
    } catch {
      return null;
    }
  };

  let storedTheme = getStoredTheme();

  const applyTheme = (nextTheme, persist = false) => {
    const normalizedTheme = nextTheme === themeDark ? themeDark : themeLight;
    rootNode.dataset.theme = normalizedTheme;
    rootNode.style.colorScheme = normalizedTheme;

    if (persist) {
      try {
        window.localStorage.setItem(themeStorageKey, normalizedTheme);
        storedTheme = normalizedTheme;
      } catch {
        // Ignore storage write issues and continue with in-memory theme state.
      }
    }

    document.dispatchEvent(
      new CustomEvent(themeChangeEvent, {
        detail: { theme: normalizedTheme }
      })
    );
  };

  const isDarkTheme = () => rootNode.dataset.theme === themeDark;

  // Default to light theme unless the user has explicitly chosen one.
  applyTheme(storedTheme || themeLight);

  const topSpacer = document.querySelector(".site-header .top-spacer");
  let themeToggleBtn = null;

  if (topSpacer) {
    topSpacer.removeAttribute("aria-hidden");
    topSpacer.textContent = "";
    themeToggleBtn = document.createElement("button");
    themeToggleBtn.type = "button";
    themeToggleBtn.className = "theme-toggle toggle";
    themeToggleBtn.setAttribute("aria-live", "polite");
    themeToggleBtn.innerHTML = `
      <span class="toggle__content" aria-hidden="true">
        <svg class="toggle__backdrop toggle__backdrop--day" viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg">
          <g class="clouds">
            <path class="cloud cloud--base" d="M46 86h228c18 0 32-13 32-30s-14-30-32-30c-4 0-8 .8-12 2-8-12-22-20-38-20-8 0-16 2-22 6-9-9-21-14-34-14-19 0-36 10-45 26-4-1-8-2-13-2-15 0-29 8-36 20-3-1-6-1-9-1-18 0-32 13-32 30s14 30 32 30z"/>
            <path class="cloud cloud--highlight" d="M74 70h166c11 0 20-8 20-18s-9-18-20-18c-3 0-6 .5-9 1.5-6-8-16-13-28-13-7 0-13 2-18 5-7-6-16-10-26-10-14 0-27 8-33 20-3-.8-6-1.5-9-1.5-11 0-20 8-20 18s9 18 20 18z"/>
          </g>
        </svg>
        <svg class="toggle__backdrop toggle__backdrop--night stars" viewBox="0 0 320 120" xmlns="http://www.w3.org/2000/svg">
          <g class="star star--dot"><circle cx="30" cy="22" r="2.8"/></g>
          <g class="star star--dot"><circle cx="72" cy="14" r="2.2"/></g>
          <g class="star star--spark"><path d="M112 26l2.2-5.1 2.2 5.1 5.1 2.2-5.1 2.2-2.2 5.1-2.2-5.1-5.1-2.2z"/></g>
          <g class="star star--dot"><circle cx="156" cy="15" r="2.1"/></g>
          <g class="star star--spark"><path d="M198 28l2.4-5.4 2.4 5.4 5.4 2.4-5.4 2.4-2.4 5.4-2.4-5.4-5.4-2.4z"/></g>
          <g class="star star--dot"><circle cx="236" cy="16" r="2.2"/></g>
          <g class="star star--dot"><circle cx="270" cy="24" r="2.7"/></g>
          <g class="star star--dot"><circle cx="300" cy="18" r="2.4"/></g>
          <g class="star star--dot"><circle cx="54" cy="34" r="1.8"/></g>
        </svg>
        <span class="toggle__indicator-wrapper">
          <span class="toggle__indicator">
            <span class="toggle__star">
              <span class="sun"></span>
              <span class="moon">
                <span class="moon__crater"></span>
                <span class="moon__crater"></span>
                <span class="moon__crater"></span>
              </span>
            </span>
          </span>
        </span>
      </span>
    `;

    topSpacer.appendChild(themeToggleBtn);

    const syncThemeToggle = () => {
      if (!themeToggleBtn) return;
      const darkActive = isDarkTheme();
      const nextTheme = darkActive ? themeLight : themeDark;
      const label = `Switch to ${nextTheme} theme`;

      themeToggleBtn.setAttribute("aria-pressed", String(darkActive));
      themeToggleBtn.setAttribute("aria-label", label);
      themeToggleBtn.setAttribute("title", label);
    };

    themeToggleBtn.addEventListener("click", () => {
      const nextTheme = isDarkTheme() ? themeLight : themeDark;
      applyTheme(nextTheme, true);
      syncThemeToggle();
    });

    document.addEventListener(themeChangeEvent, syncThemeToggle);
    syncThemeToggle();
  }

  const canUseCustomCursor = window.matchMedia("(pointer:fine)").matches && !reduceMotion;

  if (canUseCustomCursor) {
    const body = document.body;
    document.querySelectorAll(".custom-cursor").forEach((node) => node.remove());
    const ring = document.createElement("div");
    const dot = document.createElement("div");
    ring.className = "custom-cursor custom-cursor-ring";
    dot.className = "custom-cursor custom-cursor-dot";
    body.append(ring, dot);
    body.classList.add("has-custom-cursor");

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let ringX = pointerX;
    let ringY = pointerY;
    let dotX = pointerX;
    let dotY = pointerY;
    let raf = 0;

    const interactiveSelector = [
      "a",
      "button",
      ".button",
      "[role='button']",
      "summary",
      ".card",
      ".stat-card",
      ".interactive-tilt",
      ".matrix li",
      "input[type='submit']",
      "input[type='button']"
    ].join(",");

    const textFieldSelector = [
      "input:not([type='submit']):not([type='button']):not([type='checkbox']):not([type='radio'])",
      "textarea",
      "select",
      "[contenteditable='true']"
    ].join(",");
    const darkZoneSelector = [
      ".home-hero",
      ".sub-hero",
      ".dark-panel",
      ".cta-band",
      ".mega-footer",
      ".route-transition-layer.is-active"
    ].join(",");

    const setVisible = (visible) => {
      ring.classList.toggle("is-visible", visible);
      dot.classList.toggle("is-visible", visible);
    };

    const setHover = (hovering) => {
      ring.classList.toggle("is-hover", hovering);
      dot.classList.toggle("is-hover", hovering);
    };

    const setHidden = (hidden) => {
      ring.classList.toggle("is-hidden", hidden);
      dot.classList.toggle("is-hidden", hidden);
    };

    const setTone = (dark) => {
      ring.classList.toggle("tone-dark", dark);
      ring.classList.toggle("tone-light", !dark);
      dot.classList.toggle("tone-dark", dark);
      dot.classList.toggle("tone-light", !dark);
    };

    const render = () => {
      ringX += (pointerX - ringX) * 0.17;
      ringY += (pointerY - ringY) * 0.17;
      dotX += (pointerX - dotX) * 0.34;
      dotY += (pointerY - dotY) * 0.34;

      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;

      dot.style.left = `${dotX}px`;
      dot.style.top = `${dotY}px`;
      raf = requestAnimationFrame(render);
    };

    const onMove = (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      setVisible(true);

      const overTextField = !!event.target.closest(textFieldSelector);
      const overInteractive = !!event.target.closest(interactiveSelector);
      setHidden(overTextField);
      setHover(overInteractive && !overTextField);
      setTone(isDarkTheme() || !!event.target.closest(darkZoneSelector));
    };

    const onLeave = () => {
      setVisible(false);
      setHover(false);
      setHidden(false);
      setTone(isDarkTheme());
    };

    const onDown = () => {
      ring.classList.add("is-down");
      dot.classList.add("is-down");
    };

    const onUp = () => {
      ring.classList.remove("is-down");
      dot.classList.remove("is-down");
    };

    setTone(isDarkTheme());
    render();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onLeave);
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener(themeChangeEvent, () => {
      setTone(isDarkTheme());
    });

    window.addEventListener("beforeunload", () => {
      if (raf) cancelAnimationFrame(raf);
    });
  }

  const menuBtn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");
  const menuClose = menu ? menu.querySelector(".menu-close") : null;
  const menuPanel = menu ? menu.querySelector(".menu-panel") : null;
  const topBar = document.querySelector(".site-header .top");

  if (menuBtn && menu) {
    const syncMenuGeometry = () => {
      if (!menuPanel || !topBar) return;
      const rect = topBar.getBoundingClientRect();
      menu.style.setProperty("--menu-origin-top", `${rect.top}px`);
      menu.style.setProperty("--menu-origin-width", `${rect.width}px`);
      menu.style.setProperty("--menu-origin-height", `${rect.height}px`);
      menu.style.setProperty("--menu-origin-radius", getComputedStyle(topBar).borderRadius || "40px");
    };

    const setMenuOpen = (open) => {
      syncMenuGeometry();
      menu.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("menu-open", open);
      if (open) requestAnimationFrame(syncMenuGeometry);
    };

    syncMenuGeometry();
    setMenuOpen(false);

    menuBtn.addEventListener("click", () => {
      setMenuOpen(!menu.classList.contains("open"));
    });

    if (menuClose) {
      menuClose.addEventListener("click", () => {
        setMenuOpen(false);
      });
    }

    menu.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        setMenuOpen(false);
      });
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    });

    menu.addEventListener("click", (event) => {
      if (event.target === menu) setMenuOpen(false);
    });

    window.addEventListener(
      "resize",
      () => {
        syncMenuGeometry();
      },
      { passive: true }
    );

    window.addEventListener(
      "scroll",
      () => {
        if (!menu.classList.contains("open")) syncMenuGeometry();
      },
      { passive: true }
    );
  }

  if (!reduceMotion) {
    const routeTransitionKey = "bs-route-transition";
    let routeTransitionBusy = false;

    const ensureRouteTransitionLayer = () => {
      let layer = document.getElementById("routeTransitionLayer");
      if (layer) return layer;

      layer = document.createElement("div");
      layer.id = "routeTransitionLayer";
      layer.className = "route-transition-layer";
      layer.setAttribute("aria-hidden", "true");

      const pill = document.createElement("div");
      pill.className = "route-transition-pill";
      layer.appendChild(pill);
      document.body.appendChild(layer);
      return layer;
    };

    const syncRoutePillGeometry = (layer) => {
      const topBarEl = document.querySelector(".site-header .top");
      if (!topBarEl || !(layer instanceof HTMLElement)) return;
      const rect = topBarEl.getBoundingClientRect();
      layer.style.setProperty("--route-pill-top", `${Math.max(8, rect.top)}px`);
      layer.style.setProperty("--route-pill-width", `${rect.width}px`);
      layer.style.setProperty("--route-pill-height", `${rect.height}px`);
    };

    const shouldTransitionLink = (link, event) => {
      if (!(link instanceof HTMLAnchorElement)) return false;
      if (event.defaultPrevented) return false;
      if (event.button !== 0) return false;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
      if (link.target && link.target !== "_self") return false;
      if (link.hasAttribute("download")) return false;

      const rawHref = link.getAttribute("href");
      if (!rawHref) return false;
      if (
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:") ||
        rawHref.startsWith("javascript:")
      ) {
        return false;
      }

      let nextUrl;
      try {
        nextUrl = new URL(rawHref, window.location.href);
      } catch {
        return false;
      }

      if (nextUrl.origin !== window.location.origin) return false;
      if (nextUrl.href === window.location.href) return false;
      return true;
    };

    if (sessionStorage.getItem(routeTransitionKey) === "1") {
      document.body.classList.add("route-transition-enter");
      sessionStorage.removeItem(routeTransitionKey);
      window.setTimeout(() => {
        document.body.classList.remove("route-transition-enter");
      }, 460);
    }

    document.addEventListener("click", (event) => {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!shouldTransitionLink(link, event) || routeTransitionBusy) return;

      event.preventDefault();
      routeTransitionBusy = true;

      const nextUrl = new URL(link.getAttribute("href"), window.location.href);
      const layer = ensureRouteTransitionLayer();
      syncRoutePillGeometry(layer);

      document.body.classList.add("route-transitioning");
      layer.classList.add("is-active");
      requestAnimationFrame(() => {
        layer.classList.add("is-exiting");
      });

      sessionStorage.setItem(routeTransitionKey, "1");

      window.setTimeout(() => {
        window.location.href = nextUrl.href;
      }, 360);
    });
  } else {
    sessionStorage.removeItem("bs-route-transition");
  }

  const siteHeader = document.querySelector(".site-header");
  if (siteHeader) {
    const syncHeaderState = () => {
      siteHeader.classList.toggle("is-scrolled", window.scrollY > 22);
    };

    syncHeaderState();
    window.addEventListener("scroll", syncHeaderState, { passive: true });
  }

  const syncBrandWidth = (containerSelector, wordmarkSelector, taglineSelector, adjustLetterSpacing = true) => {
    const brands = document.querySelectorAll(containerSelector);
    brands.forEach((brand) => {
      const wordmark = brand.querySelector(wordmarkSelector);
      const tagline = brand.querySelector(taglineSelector);
      if (!(wordmark instanceof HTMLElement) || !(tagline instanceof HTMLElement)) return;

      if (adjustLetterSpacing) {
        wordmark.style.removeProperty("letter-spacing");
      }
      wordmark.style.removeProperty("width");
      tagline.style.removeProperty("width");

      const chars = (wordmark.textContent || "").trim().length;
      const gaps = Math.max(chars - 1, 1);

      if (adjustLetterSpacing) {
        let letterSpacingPx = (() => {
          const parsed = parseFloat(window.getComputedStyle(wordmark).letterSpacing);
          return Number.isFinite(parsed) ? parsed : 0;
        })();

        // Iterate a few times to converge despite sub-pixel rounding.
        for (let i = 0; i < 4; i += 1) {
          const wordWidth = wordmark.getBoundingClientRect().width;
          const tagWidth = tagline.getBoundingClientRect().width;
          if (!wordWidth || !tagWidth) return;

          const delta = tagWidth - wordWidth;
          if (Math.abs(delta) <= 0.05) break;

          letterSpacingPx += delta / gaps;
          wordmark.style.letterSpacing = `${letterSpacingPx.toFixed(4)}px`;
        }
      }

      // Lock both rows to the same rendered width, especially useful in footer blocks.
      const finalWordWidth = wordmark.getBoundingClientRect().width;
      const finalTagWidth = tagline.getBoundingClientRect().width;
      if (finalWordWidth && finalTagWidth) {
        const sharedWidth = Math.max(finalWordWidth, finalTagWidth);
        wordmark.style.width = `${sharedWidth.toFixed(3)}px`;
        tagline.style.width = `${sharedWidth.toFixed(3)}px`;
      }
    });
  };

  const syncNavbarBrandWidth = () => {
    syncBrandWidth(".center-brand .brand-copy", ".brand-wordmark", ".brand-tagline");
  };

  const syncFooterBrandWidth = () => {
    syncBrandWidth(".footer-brand-copy", ".footer-brand-name", ".footer-brand-tagline", false);
  };

  const syncAllBrandWidths = () => {
    syncNavbarBrandWidth();
    syncFooterBrandWidth();
  };

  syncAllBrandWidths();
  let navbarBrandRaf = 0;
  window.addEventListener(
    "resize",
    () => {
      if (navbarBrandRaf) cancelAnimationFrame(navbarBrandRaf);
      navbarBrandRaf = requestAnimationFrame(() => {
        syncAllBrandWidths();
        navbarBrandRaf = 0;
      });
    },
    { passive: true }
  );

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready
      .then(() => {
        syncAllBrandWidths();
      })
      .catch(() => {
        // Ignore font readiness errors and keep current layout.
      });
  }

  window.addEventListener(
    "load",
    () => {
      syncAllBrandWidths();
    },
    { once: true }
  );

  const backToTopBtn = (() => {
    let node = document.getElementById("backToTop");
    if (node) return node;

    node = document.createElement("button");
    node.type = "button";
    node.id = "backToTop";
    node.className = "back-to-top";
    node.setAttribute("aria-label", "Back to top");
    node.innerHTML = `
      <span class="back-to-top-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </span>
    `;
    document.body.appendChild(node);
    return node;
  })();

  if (backToTopBtn) {
    const syncBackToTopState = () => {
      const shouldShow = window.scrollY > 420 && !document.body.classList.contains("menu-open");
      backToTopBtn.classList.toggle("is-visible", shouldShow);
    };

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });

    window.addEventListener("scroll", syncBackToTopState, { passive: true });
    window.addEventListener("resize", syncBackToTopState, { passive: true });

    const bodyObserver = new MutationObserver(syncBackToTopState);
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    syncBackToTopState();

    window.addEventListener("beforeunload", () => {
      bodyObserver.disconnect();
    });
  }

  const revealNodes = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealNodes.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );

    revealNodes.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i * 70, 420)}ms`;
      io.observe(el);
    });
  }

  const counters = [...document.querySelectorAll("[data-count]")];
  if (counters.length) {
    const anchor = counters[0].closest(".stat-grid, .kpis") || counters[0];

    const formatCounterValue = (node, value) => {
      const suffix = node.dataset.suffix ?? "";
      const prefix = node.dataset.prefix ?? "";
      node.textContent = `${prefix}${value}${suffix}`;
    };

    const triggerCounterConfetti = () => {
      if (reduceMotion || !(anchor instanceof HTMLElement)) return;
      if (anchor.dataset.confettiDone === "true") return;
      anchor.dataset.confettiDone = "true";

      const layer = document.createElement("div");
      layer.className = "counter-confetti-layer";

      const colors = ["#2b6cf4", "#2b88ff", "#15b7c5", "#7cc2ff", "#19346c", "#edf2d1"];
      const sourceCards = [...anchor.querySelectorAll(".stat-card, .kpi")];
      const anchorRect = anchor.getBoundingClientRect();
      const origins = sourceCards.length
        ? sourceCards.map((card) => {
            const rect = card.getBoundingClientRect();
            const x = ((rect.left + rect.width * 0.5 - anchorRect.left) / Math.max(anchorRect.width, 1)) * 100;
            const y = ((rect.top + rect.height * 0.42 - anchorRect.top) / Math.max(anchorRect.height, 1)) * 100;
            return { x, y };
          })
        : [{ x: 50, y: 44 }];

      const piecesPerOrigin = 12;

      origins.forEach((origin) => {
        for (let i = 0; i < piecesPerOrigin; i += 1) {
          const piece = document.createElement("span");
          piece.className = "counter-confetti-piece";

          const originX = origin.x + (Math.random() * 8 - 4);
          const originY = origin.y + (Math.random() * 7 - 3.5);
          const angle = Math.random() * Math.PI * 2;
          const distance = 86 + Math.random() * 156;
          const dx = Math.cos(angle) * distance;
          const dy = Math.sin(angle) * distance;
          const rot = Math.random() * 820 - 410;
          const size = 4.5 + Math.random() * 5.5;
          const delay = Math.random() * 130;
          const duration = 1300 + Math.random() * 520;
          const color = colors[Math.floor(Math.random() * colors.length)];

          piece.style.left = `${originX}%`;
          piece.style.top = `${originY}%`;
          piece.style.width = `${size}px`;
          piece.style.height = `${(size * (0.55 + Math.random() * 0.85)).toFixed(2)}px`;
          piece.style.setProperty("--dx", `${dx.toFixed(2)}px`);
          piece.style.setProperty("--dy", `${dy.toFixed(2)}px`);
          piece.style.setProperty("--rot", `${rot.toFixed(2)}deg`);
          piece.style.setProperty("--c", color);
          piece.style.animationDelay = `${delay.toFixed(0)}ms`;
          piece.style.animationDuration = `${duration.toFixed(0)}ms`;

          layer.appendChild(piece);
        }
      });

      anchor.appendChild(layer);
      window.setTimeout(() => layer.remove(), 3000);
    };

    const runCounters = () => {
      const validCounters = counters.filter((node) => Number.isFinite(Number(node.dataset.count)));
      if (!validCounters.length) return;

      let completed = 0;

      validCounters.forEach((node, index) => {
        const end = Number(node.dataset.count);
        const delay = index * 120;

        const startCounter = () => {
          const start = performance.now();
          const duration = 1500;

          const frame = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const value = Math.floor(eased * end);
            formatCounterValue(node, value);

            if (p < 1) {
              requestAnimationFrame(frame);
              return;
            }

            formatCounterValue(node, end);
            completed += 1;
            if (completed === validCounters.length) {
              triggerCounterConfetti();
            }
          };

          requestAnimationFrame(frame);
        };

        window.setTimeout(startCounter, delay);
      });
    };

    counters.forEach((node) => formatCounterValue(node, 0));
    let started = false;
    let hasScrolled = window.scrollY > 24;
    let io = null;
    let tickRaf = 0;

    const cleanup = () => {
      window.removeEventListener("scroll", onViewportCheck);
      window.removeEventListener("resize", onViewportCheck);
      if (io) io.disconnect();
      if (tickRaf) cancelAnimationFrame(tickRaf);
    };

    const isAnchorVisibleEnough = () => {
      const rect = anchor.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const visiblePx = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
      const visibleRatio = visiblePx / Math.max(rect.height, 1);
      return visibleRatio >= 0.15 || rect.top <= viewportHeight * 0.82;
    };

    const tryStartCounters = () => {
      if (started) return;
      if (!hasScrolled) return;
      if (!isAnchorVisibleEnough()) return;
      started = true;
      runCounters();
      cleanup();
    };

    const onViewportCheck = () => {
      if (window.scrollY > 24) {
        hasScrolled = true;
      }
      if (started) return;
      if (tickRaf) return;
      tickRaf = requestAnimationFrame(() => {
        tickRaf = 0;
        tryStartCounters();
      });
    };

    window.addEventListener("scroll", onViewportCheck, { passive: true });
    window.addEventListener("resize", onViewportCheck, { passive: true });

    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (started) return;
          if (!hasScrolled) return;
          if (!entries.some((entry) => entry.isIntersecting)) return;
          tryStartCounters();
        },
        {
          threshold: [0, 0.1, 0.2, 0.35],
          rootMargin: "0px 0px -8% 0px"
        }
      );
      io.observe(anchor);
    }
  }

  const homeHero = document.getElementById("homeHero");
  const heroCanvas = document.getElementById("heroCanvas");

  if (homeHero && heroCanvas && !reduceMotion) {
    const ctx = heroCanvas.getContext("2d", { alpha: true });
    if (ctx) {
      const particles = [];
      const ribbons = [];
      const pointer = {
        x: 0,
        y: 0,
        targetX: 0,
        targetY: 0,
        active: false,
        intensity: 0
      };
      let raf = 0;
      let w = 0;
      let h = 0;
      let dpr = 1;
      let particleCount = 0;

      const random = (min, max) => Math.random() * (max - min) + min;

      const buildRibbons = () => {
        ribbons.length = 0;
        const count = Math.max(3, Math.min(6, Math.round(w / 320)));

        for (let i = 0; i < count; i += 1) {
          ribbons.push({
            baseY: h * (0.2 + i * 0.12),
            amplitude: random(12, 28),
            freq: random(0.008, 0.016),
            speed: random(1.1, 2.3),
            phase: random(0, Math.PI * 2),
            width: random(1.2, 2.6),
            alpha: random(0.18, 0.34),
            shift: (i % 2 === 0 ? 1 : -1) * random(8, 18)
          });
        }
      };

      const buildParticles = () => {
        particles.length = 0;
        for (let i = 0; i < particleCount; i += 1) {
          particles.push({
            x: random(0, w),
            y: random(0, h),
            vx: random(-0.12, 0.12),
            vy: random(-0.1, 0.1),
            r: random(0.7, 2.0),
            o: random(0.32, 0.85),
            seed: random(0, Math.PI * 2)
          });
        }
      };

      const resize = () => {
        const rect = homeHero.getBoundingClientRect();
        w = Math.max(320, rect.width);
        h = Math.max(320, rect.height);
        dpr = Math.min(window.devicePixelRatio || 1, 1.8);

        heroCanvas.width = Math.floor(w * dpr);
        heroCanvas.height = Math.floor(h * dpr);
        heroCanvas.style.width = `${w}px`;
        heroCanvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        particleCount = Math.max(42, Math.min(96, Math.floor((w * h) / 17000)));
        buildRibbons();
        buildParticles();

        if (!pointer.active) {
          pointer.targetX = w * 0.72;
          pointer.targetY = h * 0.28;
          homeHero.style.setProperty("--mx", "0");
          homeHero.style.setProperty("--my", "0");
        }
      };

      const drawRibbons = (timeMs) => {
        const t = timeMs * 0.001;

        ribbons.forEach((ribbon, index) => {
          ctx.beginPath();

          for (let x = -30; x <= w + 30; x += 14) {
            const waveA = Math.sin(x * ribbon.freq + t * ribbon.speed + ribbon.phase) * ribbon.amplitude;
            const waveB = Math.cos(x * ribbon.freq * 0.58 - t * ribbon.speed * 1.35 + ribbon.phase) * ribbon.amplitude * 0.42;
            const drift = ((pointer.x / w) - 0.5) * ribbon.shift * pointer.intensity;
            const y = ribbon.baseY + waveA + waveB + drift + index * 8;

            if (x === -30) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          const gradient = ctx.createLinearGradient(0, ribbon.baseY - 80, w, ribbon.baseY + 70);
          gradient.addColorStop(0, `rgba(183, 226, 255, ${(ribbon.alpha * 0.38).toFixed(3)})`);
          gradient.addColorStop(0.5, `rgba(239, 250, 255, ${ribbon.alpha.toFixed(3)})`);
          gradient.addColorStop(1, `rgba(136, 199, 255, ${(ribbon.alpha * 0.44).toFixed(3)})`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = ribbon.width;
          ctx.lineCap = "round";
          ctx.stroke();
        });
      };

      const drawParticles = (timeMs) => {
        const t = timeMs * 0.001;

        for (let i = 0; i < particles.length; i += 1) {
          const p = particles[i];
          const dx = pointer.x - p.x;
          const dy = pointer.y - p.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 52000) {
            const dist = Math.sqrt(distSq) || 1;
            const force = ((52000 - distSq) / 52000) * 0.03 * pointer.intensity;
            p.vx -= (dx / dist) * force;
            p.vy -= (dy / dist) * force;
          }

          p.vx += Math.sin(t * 1.1 + p.seed) * 0.0018;
          p.vy += Math.cos(t * 0.9 + p.seed) * 0.0014;

          p.vx *= 0.993;
          p.vy *= 0.993;
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -14) p.x = w + 14;
          if (p.x > w + 14) p.x = -14;
          if (p.y < -14) p.y = h + 14;
          if (p.y > h + 14) p.y = -14;

          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${p.o})`;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }

        for (let i = 0; i < particles.length; i += 1) {
          const a = particles[i];
          for (let j = i + 1; j < particles.length; j += 1) {
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const distSq = dx * dx + dy * dy;
            if (distSq > 6800) continue;

            const alpha = 0.11 - (distSq / 6800) * 0.09;
            if (alpha <= 0) continue;

            ctx.strokeStyle = `rgba(230, 246, 255, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      };

      const draw = (timeMs) => {
        ctx.clearRect(0, 0, w, h);

        pointer.intensity += ((pointer.active ? 1 : 0) - pointer.intensity) * 0.05;
        const idleX = w * 0.72;
        const idleY = h * 0.28;
        const tx = pointer.active ? pointer.targetX : idleX;
        const ty = pointer.active ? pointer.targetY : idleY;

        pointer.x += (tx - pointer.x) * 0.08;
        pointer.y += (ty - pointer.y) * 0.08;

        const flare = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, Math.max(w, h) * 0.6);
        flare.addColorStop(0, "rgba(255, 255, 255, 0.16)");
        flare.addColorStop(0.45, "rgba(170, 220, 255, 0.12)");
        flare.addColorStop(1, "rgba(120, 185, 255, 0)");
        ctx.fillStyle = flare;
        ctx.fillRect(0, 0, w, h);

        drawRibbons(timeMs);
        drawParticles(timeMs);

        raf = requestAnimationFrame(draw);
      };

      const updateHeroVars = () => {
        const nx = w ? (pointer.targetX / w - 0.5) * 2 : 0;
        const ny = h ? (pointer.targetY / h - 0.5) * 2 : 0;
        homeHero.style.setProperty("--mx", nx.toFixed(3));
        homeHero.style.setProperty("--my", ny.toFixed(3));
      };

      const onMove = (event) => {
        const rect = homeHero.getBoundingClientRect();
        pointer.targetX = event.clientX - rect.left;
        pointer.targetY = event.clientY - rect.top;
        pointer.active = true;
        updateHeroVars();
      };

      const onLeave = () => {
        pointer.active = false;
        pointer.targetX = w * 0.72;
        pointer.targetY = h * 0.28;
        homeHero.style.setProperty("--mx", "0");
        homeHero.style.setProperty("--my", "0");
      };

      resize();
      pointer.x = pointer.targetX;
      pointer.y = pointer.targetY;
      draw(0);

      window.addEventListener("resize", resize, { passive: true });
      homeHero.addEventListener("pointermove", onMove);
      homeHero.addEventListener("pointerleave", onLeave);

      window.addEventListener("beforeunload", () => {
        if (raf) cancelAnimationFrame(raf);
      });
    }
  }

  const homeTilt = document.querySelector(".home-hero .interactive-tilt");
  if (homeTilt && !reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    let raf = 0;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const render = () => {
      x += (targetX - x) * 0.15;
      y += (targetY - y) * 0.15;

      const strength = Number(homeTilt.dataset.tiltStrength || 4.4);
      const rotateX = (-y * strength).toFixed(2);
      const rotateY = (x * strength).toFixed(2);
      const moveX = (x * 9).toFixed(2);
      const moveY = (y * 9).toFixed(2);

      homeTilt.style.transform = `perspective(1100px) translate3d(${moveX}px, ${moveY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      homeTilt.style.setProperty("--glare-x", `${((x * 0.5 + 0.5) * 100).toFixed(2)}%`);
      homeTilt.style.setProperty("--glare-y", `${((y * 0.5 + 0.5) * 100).toFixed(2)}%`);

      const stillMoving = Math.abs(targetX - x) > 0.002 || Math.abs(targetY - y) > 0.002;
      raf = stillMoving ? requestAnimationFrame(render) : 0;
    };

    const handleMove = (event) => {
      const rect = homeTilt.getBoundingClientRect();
      targetX = clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
      targetY = clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
      homeTilt.classList.add("is-active");
      if (!raf) raf = requestAnimationFrame(render);
    };

    const reset = () => {
      targetX = 0;
      targetY = 0;
      homeTilt.classList.remove("is-active");
      if (!raf) raf = requestAnimationFrame(render);
    };

    homeTilt.addEventListener("pointermove", handleMove);
    homeTilt.addEventListener("pointerleave", reset);
    homeTilt.addEventListener("pointercancel", reset);
  }

  const pulseBadges = document.querySelectorAll(".hero-pulse-row span");
  pulseBadges.forEach((badge, index) => {
    badge.style.setProperty("--pulse-delay", `${index * 220}ms`);
  });

  const yearNode = document.getElementById("year");
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());
})();
