(function () {
  "use strict";

  console.log("✅ SV 100381 header script running");

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

  const ACCOUNT_LINK = "/account";
  const WISHLIST_LINK = "/index.php?route=account/wishlist";

  function qs(sel, root = document) { return root.querySelector(sel); }

  function mount() {
    const widgets = qs(".header_widgets");
    if (!widgets) return;

    // stop duplicates
    if (qs(".sv-hdr-icons", widgets)) return;

    // hide default auth/register
    const login = qs(".header_login", widgets);
    if (login) login.style.display = "none";

    // find cart dropdown
    const cartDrop = qs(".header-cart.sticky .dropdown_cart_drop_down", widgets);
    const cartWrap = qs(".header-cart.sticky", widgets);
    if (!cartDrop || !cartWrap) return;

    // build our icons
    const wrap = document.createElement("div");
    wrap.className = "sv-hdr-icons";

    wrap.innerHTML = `
      <a class="sv-ico-link" href="${ACCOUNT_LINK}" aria-label="Cont">
        <img src="${ICONS.account}" alt="">
      </a>
      <a class="sv-ico-link" href="${WISHLIST_LINK}" aria-label="Wishlist">
        <img src="${ICONS.wishlist}" alt="">
      </a>
    `;

    // insert before cart
    cartWrap.parentElement.insertBefore(wrap, cartWrap);

    // keep old cart content but hide
    if (!qs(".sv-cart-old", cartDrop)) {
      const old = document.createElement("span");
      old.className = "sv-cart-old";
      while (cartDrop.firstChild) old.appendChild(cartDrop.firstChild);
      cartDrop.appendChild(old);

      // inject new cart visual
      const img = document.createElement("img");
      img.className = "sv-cart-ico";
      img.src = ICONS.cart;
      img.alt = "";

      const label = document.createElement("span");
      label.className = "sv-cart-label";
      label.textContent = "Coș";

      cartDrop.insertBefore(label, cartDrop.firstChild);
      cartDrop.insertBefore(img, cartDrop.firstChild);
    }
  }

  function init() {
    mount();

    const mo = new MutationObserver(() => {
      clearTimeout(window.__sv_t);
      window.__sv_t = setTimeout(mount, 120);
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
