// Mobile burger toggle pentru nav
document.addEventListener("DOMContentLoaded", function () {
  const burger = document.querySelector(".shuffle-burger");
  const mobileNav = document.querySelector(".shuffle-nav-mobile");
  const viewCollectionBtn = document.querySelector("[data-shuffle-view-collection]");

  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      mobileNav.classList.toggle("show");
    });
  }

  // Scroll la secțiunea de produse
  if (viewCollectionBtn) {
    viewCollectionBtn.addEventListener("click", function (e) {
      const target = document.querySelector("#shuffle-products");
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
});
