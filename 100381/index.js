(() => {
  const routes = {
    account: "/account",
    wishlist: "/index.php?route=account/wishlist"
  };

  // helper: face un element clickabil (wrap în <a> sau add click)
  function makeClickable(el, href) {
    if (!el || el.dataset.ddLinked === "1") return;

    // dacă e deja <a>, doar îi setăm href
    const a = el.closest("a");
    if (a) {
      a.setAttribute("href", href);
      a.dataset.ddLinked = "1";
      el.dataset.ddLinked = "1";
      return;
    }

    // altfel îl învelim în <a>
    const link = document.createElement("a");
    link.href = href;
    link.style.display = "inline-flex";
    link.style.alignItems = "center";
    link.style.justifyContent = "center";
    link.style.textDecoration = "none";

    el.parentNode.insertBefore(link, el);
    link.appendChild(el);

    link.dataset.ddLinked = "1";
    el.dataset.ddLinked = "1";
  }

  // încearcă să identifice iconițele user/heart în header
  function findHeaderIcons() {
    // zona asta e de obicei în header widgets
    const root =
      document.querySelector(".header_widgets") ||
      document.querySelector(".header-widgets") ||
      document.querySelector(".header-widgets-wrapper") ||
      document.querySelector("header");

    if (!root) return { user: null, heart: null };

    // Strategy 1: caută după aria-label / title
    const userByAttr = root.querySelector('[aria-label*="account" i], [title*="account" i], [aria-label*="login" i], [title*="login" i]');
    const heartByAttr = root.querySelector('[aria-label*="wish" i], [title*="wish" i], [aria-label*="favour" i], [title*="favour" i]');

    // Strategy 2: fallback pe icon fonts / svg paths (mai robust)
    // user: fa-user, user, account, profile
    const userByClass = root.querySelector(".fa-user, .fa-user-o, .icon-user, .icon-account, [class*='user'], [class*='account']");
    // heart: fa-heart, wishlist, favourite
    const heartByClass = root.querySelector(".fa-heart, .fa-heart-o, .icon-heart, [class*='wish'], [class*='favour']");

    return {
      user: userByAttr || userByClass,
      heart: heartByAttr || heartByClass
    };
  }

  // Search bar: doar dacă vrei să forțăm un search input în header
  function ensureSearchBar() {
    // dacă deja există search în header, nu ne băgăm
    const existing =
      document.querySelector("header input[type='search']") ||
      document.querySelector("header input[name='search']") ||
      document.querySelector("header .search input");

    if (existing) return;

    const headerContainer =
      document.querySelector(".header-wrapper .container-fluid") ||
      document.querySelector(".header-wrapper .container") ||
      document.querySelector("header .container-fluid") ||
      document.querySelector("header");

    if (!headerContainer) return;

    // creează un form simplu /search
    const form = document.createElement("form");
    form.action = "/index.php?route=product/search";
    form.method = "get";
    form.className = "dd-search";
    form.innerHTML = `
      <input type="text" name="search" placeholder="Search" autocomplete="off">
      <button type="submit" aria-label="Search">🔍</button>
    `;

    // îl punem la stânga (înainte de logo, dacă există)
    const logo = headerContainer.querySelector(".logo") || headerContainer.querySelector("[class*='logo']");
    if (logo) headerContainer.insertBefore(form, logo);
    else headerContainer.prepend(form);
  }

  // CSS mic pentru search bar (ca în poza ta)
  function injectSearchCSS() {
    if (document.getElementById("dd-search-css")) return;
    const style = document.createElement("style");
    style.id = "dd-search-css";
    style.textContent = `
      body.dd-theme form.dd-search{
        width:261px;
        height:44px;
        display:flex;
        align-items:center;
        gap:10px;
        padding:0 12px;
        background:#F5F5F5;
        border:1px solid #F0F0F0;
      }
      body.dd-theme form.dd-search input{
        flex:1;
        border:0;
        outline:none;
        background:transparent;
        font-family:'Jost', system-ui, -apple-system, "Segoe UI", sans-serif;
        font-size:14px;
        line-height:20px;
        color:#7E7E7E;
      }
      body.dd-theme form.dd-search button{
        border:0;
        background:transparent;
        cursor:pointer;
        font-size:16px;
        line-height:1;
      }
      @media(max-width: 992px){
        body.dd-theme form.dd-search{ width: 200px; }
      }
      @media(max-width: 768px){
        body.dd-theme form.dd-search{ display:none; }
      }
    `;
    document.head.appendChild(style);
  }

  function apply() {
    const { user, heart } = findHeaderIcons();

    // 1) user -> /account
    if (user) makeClickable(user, routes.account);

    // 2) wishlist -> /index.php?route=account/wishlist
    if (heart) makeClickable(heart, routes.wishlist);

    // 3) search bar (opțional)
    // dacă vrei să-l forțăm “ca în Figma”, lasă activ:
    ensureSearchBar();
    injectSearchCSS();
  }

  // rulează acum + la rerender
  apply();

  const mo = new MutationObserver(() => apply());
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();
