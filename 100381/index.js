(function () {
  "use strict";

  // Debug (îl poți lăsa, nu doare)
  console.log("✅ SV 100381 custom header icons script loaded");

  // Bullet-proof assets base: din URL-ul acestui script
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

  const LINKS = {
    account: "/account",
    wishlist: "/index.php?route=account/wishlist",
  };

  const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();

  function isVisible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return !!(r.width && r.height);
  }

  function findHeaderWidgets() {
    return document.querySelector(".header_widgets") ||
           document.querySelector("header .header_widgets") ||
           null;
  }

  // Găsim elementul Coș în header fără să depindem de clase specifice
  function findCartTarget(widgets) {
    const els = Array.from(widgets.querySelectorAll("a,button,div,span")).filter(isVisible);

    let best = null;
    let bestScore = 0;

    for (const el of els) {
      const t = norm(el.textContent);
      const href = norm(el.getAttribute?.("href"));
      const cls = norm(el.className);

      let score = 0;

      // semnale puternice
      if (t === "coș" || t === "cos" || t.includes(" coș") || t.includes(" cos")) score += 10;
      if (href.includes("checkout/cart") || href.includes("route=checkout/cart")) score += 9;

      // semnale medii
      if (href.includes("cart")) score += 3;
      if (cls.includes("cart")) score += 3;

      // preferăm clickable
      if (el.tagName === "A" || el.tagName === "BUTTON") score += 2;

      if (score > bestScore) {
        bestScore = score;
        best = el;
      }
    }

    // dacă a găsit ceva slab, return null ca să nu stricăm altceva
    return bestScore >= 6 ? best : null;
  }

  function ensureIconsBar(widgets, beforeEl) {
    if (widgets.querySelector(".sv-hdr-icons")) return;

    const bar = document.createElement("div");
    bar.className = "sv-hdr-icons";
    bar.innerHTML = `
      <a class="sv-ico-link" href="${LINKS.account}" aria-label="Cont">
        <img src="${ICONS.account}" alt="">
      </a>
      <a class="sv-ico-link" href="${LINKS.wishlist}" aria-label="Wishlist">
        <img src="${ICONS.wishlist}" alt="">
      </a>
    `;

    // inserăm înainte de Coș (sau la final dacă nu putem)
    if (beforeEl && beforeEl.parentElement) {
      beforeEl.parentElement.insertBefore(bar, beforeEl);
    } else {
      widgets.appendChild(bar);
    }

    // abia acum ascundem login-ul default
    document.documentElement.classList.add("sv-icons-ready");
  }

  function restyleCart(cartEl) {
    if (!cartEl || cartEl.classList.contains("sv-cart-ready")) return;

    // încercăm să modificăm elementul clickable (dacă e span/div în interior, urcăm la link)
    let target = cartEl;
    const clickable = cartEl.closest?.("a,button");
    if (clickable && isVisible(clickable)) target = clickable;

    // păstrăm conținutul vechi, dar îl ascundem
    const old = document.createElement("span");
    old.className = "sv-cart-old";
    while (target.firstChild) old.appendChild(target.firstChild);
    target.appendChild(old);

    // injectăm noul vizual
    const img = document.createElement("img");
    img.className = "sv-cart-ico";
    img.src = ICONS.cart;
    img.alt = "";

    const label = document.createElement("span");
    label.className = "sv-cart-label";
    label.textContent = "Coș";

    target.insertBefore(label, target.firstChild);
    target.insertBefore(img, target.firstChild);

    target.classList.add("sv-cart-ready");
  }

  function mount() {
    const widgets = findHeaderWidgets();
    if (!widgets) return false;

    const cart = findCartTarget(widgets);
    // bar-ul îl punem chiar înainte de cart (dacă există)
    ensureIconsBar(widgets, cart);

    // restyle cart dacă l-am găsit
    if (cart) restyleCart(cart);

    return true;
  }

  function init() {
    // retry agresiv (headerul se poate încărca după)
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (mount() || tries >= 80) clearInterval(timer); // ~8 sec
    }, 100);

    // și observer în caz de rerender
    const mo = new MutationObserver(() => mount());
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
