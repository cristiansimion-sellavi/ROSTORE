(() => {
  const header = document.querySelector(".header-wrapper .container-fluid");
  if (!header) return;

  // dacă există deja un search, nu băgăm altul
  const existing =
    header.querySelector("input[type='search']") ||
    header.querySelector("input[name='search']") ||
    header.querySelector("form.search") ||
    header.querySelector(".search-form");

  if (existing) return;

  const form = document.createElement("form");
  form.className = "dd-search";
  form.action = "/index.php?route=product/search";
  form.method = "get";
  form.innerHTML = `
    <input type="text" name="search" placeholder="Search" autocomplete="off">
    <button type="submit" aria-label="Search">🔍</button>
  `;

  // pune search în stânga
  header.prepend(form);
})();
