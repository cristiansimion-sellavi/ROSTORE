(function () {
  "use strict";

  // --- bullet-proof assets base: ia baza din URL-ul lui index.js ---
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

  function qs(sel, root = document) { return root.querySelector(sel); }
  function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

  function mountHeaderIcons() {
    const headerWidgets = qs(".header_widgets");
    if (!headerWidgets) return;

    // prevent duplicate
    if (qs(".sv-hdr-icons", headerWidgets)) return;

    // 1) Hide default login/register (extra safety, chiar dacă e deja în CSS)
    const loginBlock = qs(".header_login", headerWidgets);
    if (loginBlock) loginBlock.style.display = "none";

    // 2) Find cart element
    const cartDrop = qs(".header-cart.sticky .dropdown_cart_drop_down", headerWidgets);
    if (!cartDrop) return;

    // 3) Build our icons container
    const wrap = document.createElement("div");
    wrap.className = "sv-hdr-icons";

    const aAccount = document.createElement("a");
    aAccount.className = "sv-ico-link sv-ico-account";
    aAccount.href = "/account";
    aAccount.setAttribute("aria-label", "Cont");
    aAccount.innerHTML = `<img src="${ICONS.account}" alt="">`;

    const aWish = document.createElement("a");
    aWish.className = "sv-ico-link sv-ico-wishlist";
    aWish.href = "/index.php?route=account/wishlist";
    aWish.setAttribute("aria-label", "Wishlist");
    aWish.innerHTML = `<img src="${ICONS.wishlist}" alt="">`;

    wrap.appendChild(aAccount);
    wrap.appendChild(aWish);

    // 4) Insert icons BEFORE cart block (so it becomes: account, wishlist, cart)
    // cartDrop is inside headerWidgets; we insert our wrap right before header-cart container if possible
    const cartContainer = qs(".header-cart.sticky", headerWidgets) || cartDrop.parentElement;
    if (cartContainer && cartContainer.parentElement) {
      cartContainer.parentElement.insertBefore(wrap, cartContainer);
    } else {
      headerWidgets.insertBefore(wrap, cartDrop);
    }

    // 5) Restyle cart visually WITHOUT breaking click handlers
    // Keep existing cart content but hide it
    const old = document.createElement("span");
    old.className = "sv-cart-old";
    while (cartDrop.firstChild) old.appendChild(cartDrop.firstChild);
    cartDrop.appendChild(old);

    // Inject our new visual: icon + label
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

  function init() {
    mountHeaderIcons();

    // re-mount if header re-renders
    const mo = new MutationObserver(() => {
      clearTimeout(window.__sv_hdr_t);
      window.__sv_hdr_t = setTimeout(mountHeaderIcons, 120);
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
