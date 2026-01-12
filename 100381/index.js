/* =========================================================
   Sellavi Header Icons (Account / Wishlist / Cart restyle)
   Bullet-proof assets base + resilient mount + no hardcoding
   ========================================================= */

(function () {
  "use strict";

  /* ---------- Helpers ---------- */

  function debounce(fn, wait) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  function isVisible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return !!(r.width && r.height);
  }

  function normText(s) {
    return (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  /* ---------- Bullet-proof ASSETS BASE ---------- */
  // If index.js is loaded from:
  // https://.../ROSTORE/100381/index.js
  // then ASSETS_BASE becomes:
  // https://.../ROSTORE/100381/assets/icons
  const ASSETS_BASE = (() => {
    const src = document.currentScript?.src || "";
    const base = src ? src.split("/").slice(0, -1).join("/") : "";
    return `${base}/assets/icons`;
  })();

  const ICONS = {
    account: `${ASSETS_BASE}/account.png`,
    wishlist: `${ASSETS_BASE}/wishlist.png`,
    cart: `${ASSETS_BASE}/cart.png`,
  };

  /* ---------- Finders (robust) ---------- */

  function findCartElement() {
    const candidates = Array.from(document.querySelectorAll("a,button")).map((el) => {
      const txt = normText(el.textContent);
      const href = normText(el.getAttribute("href"));
      const cls = normText(el.className);

      let score = 0;

      // strong signals
      if (txt === "coș" || txt === "cos" || txt.includes(" coș") || txt.includes(" cos")) score += 10;
      if (href.includes("route=checkout/cart") || href.includes("checkout/cart")) score += 9;

      // weak signals
      if (href.includes("cart")) score += 3;
      if (cls.includes("cart")) score += 3;

      // visible bias
      if (isVisible(el)) score += 2;

      return { el, score };
    });

    candidates.sort((a, b) => b.score - a.score);
    const best = candidates.find((c) => c.score >= 8); // threshold to avoid random matches
    return best ? best.el : null;
  }

  function findRightHeaderContainerFromCart(cartEl) {
    if (!cartEl) return null;

    // Try a few reasonable ancestors
    let p = cartEl.parentElement;
    for (let i = 0; i < 6 && p; i++) {
      // choose a container that has multiple header controls (links/buttons)
      const controls = p.querySelectorAll("a,button");
      if (controls && controls.length >= 2) return p;
      p = p.parentElement;
    }
    return cartEl.parentElement || null;
  }

  function hideOldAuthRegister(nearEl) {
    // We try to hide only small text nodes around the right area,
    // not whole header blocks.
    const scope = nearEl?.parentElement || document;
    const nodes = Array.from(scope.querySelectorAll("a,span,div"));

    nodes.forEach((n) => {
      if (n.closest(".sv-header-icons")) return;
      if (n.closest(".sv-cart-btn")) return;

      const t = normText(n.textContent);
      if (!t) return;

      const hasAuth = t.includes("autentificare");
      const hasReg = t.includes("înregistrare") || t.includes("inregistrare");

      // keep it safe: hide only if it's a short chunk
      if ((hasAuth || hasReg) && t.length <= 45) {
        n.classList.add("sv-hide-old-auth");
      }
    });
  }

  /* ---------- Builders ---------- */

  function buildIconsBar() {
    const bar = document.createElement("div");
    bar.className = "sv-header-icons";

    const account = document.createElement("a");
    account.className = "sv-icon-link sv-account";
    account.href = "/account";
    account.setAttribute("aria-label", "Autentificare / Înregistrare");
    account.innerHTML = `<img src="${ICONS.account}" alt="" />`;

    const wishlist = document.createElement("a");
    wishlist.className = "sv-icon-link sv-wishlist";
    wishlist.href = "/index.php?route=account/wishlist";
    wishlist.setAttribute("aria-label", "Wishlist");
    wishlist.innerHTML = `<img src="${ICONS.wishlist}" alt="" />`;

    bar.appendChild(account);
    bar.appendChild(wishlist);

    return bar;
  }

  function cloneBadge(cartEl) {
    // Keep any quantity badge/count if present
    const badge =
      cartEl.querySelector(".badge, .count, [class*='badge'], [class*='count']") ||
      null;

    return badge ? badge.cloneNode(true) : null;
  }

  function restyleCart(cartEl) {
    if (!cartEl || cartEl.classList.contains("sv-cart-btn")) return;

    const badge = cloneBadge(cartEl);

    cartEl.classList.add("sv-cart-btn");

    // Preserve original href/onclick by not replacing the element, only its inner content
    cartEl.innerHTML = `
      <img class="sv-cart-ico" src="${ICONS.cart}" alt="" />
      <span class="sv-cart-label">Coș</span>
    `;

    if (badge) cartEl.appendChild(badge);
  }

  /* ---------- Mount logic ---------- */

  function mount() {
    // Avoid duplicates
    if (document.querySelector(".sv-header-icons")) return;

    const cartEl = findCartElement();
    if (!cartEl) return;

    const container = findRightHeaderContainerFromCart(cartEl);
    if (!container) return;

    // Insert icons bar right before cart element if possible,
    // otherwise append in the container.
    const bar = buildIconsBar();

    try {
      if (cartEl.parentElement === container) {
        container.insertBefore(bar, cartEl);
      } else {
        container.appendChild(bar);
      }
    } catch (e) {
      // Fallback: append to cart parent
      cartEl.parentElement && cartEl.parentElement.insertBefore(bar, cartEl);
    }

    restyleCart(cartEl);
    hideOldAuthRegister(container);
  }

  function ensureCssClassnamesExist() {
    // If your CSS already exists in style.css, ignore this.
    // This is only a safety net to keep layout OK if CSS isn't loaded.
    if (document.getElementById("sv-header-icons-fallback-css")) return;

    const style = document.createElement("style");
    style.id = "sv-header-icons-fallback-css";
    style.textContent = `
      .sv-header-icons{display:inline-flex;align-items:center;gap:16px;}
      .sv-icon-link{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;text-decoration:none;transition:transform .12s ease, background-color .12s ease;}
      .sv-icon-link:hover{transform:translateY(-1px);background:rgba(0,0,0,.04);}
      .sv-icon-link img{width:20px;height:20px;display:block;}
      .sv-cart-btn{display:inline-flex!important;align-items:center;gap:10px;padding:10px 14px!important;border-radius:8px!important;text-decoration:none!important;line-height:1!important;}
      .sv-cart-ico{width:18px;height:18px;display:block;}
      .sv-hide-old-auth{display:none!important;}
    `;
    document.head.appendChild(style);
  }

  function init() {
    ensureCssClassnamesExist();
    mount();

    const mo = new MutationObserver(
      debounce(() => {
        mount();
      }, 150)
    );

    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
