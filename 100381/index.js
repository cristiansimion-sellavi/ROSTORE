(function () {
  "use strict";

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
    if (!widgets) return false;

    // coșul (în structura ta e .header-cart.sticky -> .dropdown_cart_drop_down)
    const cartWrap = qs(".header-cart.sticky", widgets) || qs(".header-cart", widgets);
    const cartDrop = cartWrap ? qs(".dropdown_cart_drop_down", cartWrap) : null;

    if (!cartWrap || !cartDrop) return false;

    // dacă există deja bar-ul nostru, doar asigură-te că login-ul e ascuns
    if (!qs(".sv-hdr-icons", widgets)) {
      const bar = document.createElement("div");
      bar.className = "sv-hdr-icons";
      bar.innerHTML = `
        <a class="sv-ico-link" href="${ACCOUNT_LINK}" aria-label="Cont">
          <img src="${ICONS.account}" alt="">
        </a>
        <a class="sv-ico-link" href="${WISHLIST_LINK}" aria-label="Wishlist">
          <img src="${ICONS.wishlist}" alt="">
        </a>
      `;

      // pune iconițele înainte de coș
      cartWrap.parentElement.insertBefore(bar, cartWrap);
    }

    // Restyle cart: păstrează funcționalitatea, schimbă doar conținutul vizual
    if (!cartDrop.classList.contains("sv-cart-ready")) {
      // ascunde conținutul vechi, dar îl păstrează în DOM
      const old = document.createElement("span");
      old.className = "sv-cart-old";
      while (cartDrop.firstChild) old.appendChild(cartDrop.firstChild);
      cartDrop.appendChild(old);

      // inject new visual
      const img = document.createElement("img");
      img.className = "sv-cart-ico";
      img.src = ICONS.cart;
      img.alt = "";

      const label = document.createElement("span");
      label.className = "sv-cart-label";
      label.textContent = "Coș";

      cartDrop.insertBefore(label, cartDrop.firstChild);
      cartDrop.insertBefore(img, cartDrop.firstChild);

      cartDrop.classList.add("sv-cart-ready");
    }

    // ascundem login-ul default abia acum (după montare)
    document.documentElement.classList.add("sv-icons-ready");

    return true;
  }

  function init() {
    // hard retry: headerul poate apărea după load
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      const ok = mount();
      if (ok || tries >= 60) clearInterval(timer); // ~6 sec max
    }, 100);

    // re-mount dacă tema re-randează headerul
    const mo = new MutationObserver(() => mount());
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
