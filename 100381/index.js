(function () {
  "use strict";

  // === DEBUG ===
  const LOG = (...a) => console.log("[SV-100381]", ...a);

  // Assets base robust (merge și când currentScript e null)
  function getAssetsBase() {
    const byCurrent = document.currentScript && document.currentScript.src ? document.currentScript.src : "";
    const byScan = [...document.scripts]
      .map(s => s.src || "")
      .filter(src => src.includes("/ROSTORE/100381/index.js")) // îl găsește chiar cu ?v=
      .pop() || "";

    const src = byCurrent || byScan;
    const clean = src.split("?")[0]; // fără query
    const base = clean.split("/").slice(0, -1).join("/");
    return `${base}/assets/icons`;
  }

  const ASSETS_BASE = getAssetsBase();
  const ICONS = {
    account: `${ASSETS_BASE}/account.png`,
    wishlist: `${ASSETS_BASE}/wishlist.png`,
    cart: `${ASSETS_BASE}/cart.png`,
  };

  LOG("loaded ✅", { ASSETS_BASE, ICONS });

  const LINKS = {
    account: "/account",
    wishlist: "/index.php?route=account/wishlist",
  };

  const qs = (sel, root = document) => root.querySelector(sel);
  const norm = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();

  function isVisible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  // găsește coșul din header (după selectorii tăi + fallback)
  function findCart(widgets) {
    // 1) varianta “din theme” (ce ai arătat în inspect)
    const drop = qs(".header-cart.sticky .dropdown_cart_drop_down", widgets)
      || qs(".header-cart .dropdown_cart_drop_down", widgets);
    if (drop) return drop;

    // 2) fallback: link/button cu cart
    const els = [...widgets.querySelectorAll("a,button,div,span")].filter(isVisible);
    let best = null, bestScore = 0;

    for (const el of els) {
      const t = norm(el.textContent);
      const href = norm(el.getAttribute?.("href"));
      const cls = norm(el.className);

      let score = 0;
      if (t.includes("coș") || t.includes("cos")) score += 10;
      if (href.includes("checkout/cart") || href.includes("route=checkout/cart")) score += 9;
      if (href.includes("cart")) score += 3;
      if (cls.includes("cart")) score += 3;
      if (el.tagName === "A" || el.tagName === "BUTTON") score += 2;

      if (score > bestScore) { bestScore = score; best = el; }
    }

    return bestScore >= 6 ? best : null;
  }

  function ensureIconsBar(widgets, beforeEl) {
    if (qs(".sv-hdr-icons", widgets)) return qs(".sv-hdr-icons", widgets);

    const bar = document.createElement("div");
    bar.className = "sv-hdr-icons";
    // mic debug vizual: contur discret (poți scoate după)
    bar.style.outline = "1px dashed rgba(0,0,0,.12)";
    bar.style.outlineOffset = "2px";

    bar.innerHTML = `
      <a class="sv-ico-link" href="${LINKS.account}" aria-label="Cont">
        <img src="${ICONS.account}" alt="">
      </a>
      <a class="sv-ico-link" href="${LINKS.wishlist}" aria-label="Wishlist">
        <img src="${ICONS.wishlist}" alt="">
      </a>
    `;

    // pune-l înainte de coș dacă se poate
    if (beforeEl && beforeEl.parentElement) {
      beforeEl.parentElement.insertBefore(bar, beforeEl);
    } else {
      widgets.appendChild(bar);
    }

    return bar;
  }

  function restyleCart(cartEl) {
    if (!cartEl || cartEl.classList.contains("sv-cart-ready")) return;

    // dacă e un div/span în interior, urcă la link dacă există
    const clickable = cartEl.closest?.("a,button") || cartEl;
    const target = clickable;

    // păstrează conținutul vechi dar îl ascunde
    const old = document.createElement("span");
    old.className = "sv-cart-old";
    while (target.firstChild) old.appendChild(target.firstChild);
    target.appendChild(old);

    // inject vizual nou
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
    const widgets = qs(".header_widgets") || qs("header .header_widgets");
    if (!widgets) { LOG("no .header_widgets yet"); return false; }

    const cart = findCart(widgets);
    LOG("widgets found ✅", { cart });

    // inject icons bar
    ensureIconsBar(widgets, cart);

    // restyle cart
    if (cart) restyleCart(cart);

    // ascunde login/register doar DUPĂ ce există icon bar
    const login = qs(".header_login", widgets);
    if (login && qs(".sv-hdr-icons", widgets)) {
      document.documentElement.classList.add("sv-icons-ready");
    }

    return true;
  }

  function init() {
    // retry (header poate apărea după load)
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (mount() || tries >= 100) clearInterval(timer); // ~10 sec
    }, 100);

    // rerender safe
    const mo = new MutationObserver(() => mount());
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
