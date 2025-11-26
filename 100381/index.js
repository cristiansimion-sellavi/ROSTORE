// Theme bootstrap pentru AdminSellavi - safe version
document.addEventListener("DOMContentLoaded", function () {
  // Adaugăm clasa principală pe body
  document.body.classList.add("dd-theme");

  // Fade-in DOAR pe secțiuni mari, fără să stricăm layout-ul
  const fadeTargets = document.querySelectorAll("section, .content, .page-wrapper, main");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("dd-in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  fadeTargets.forEach((el) => {
    el.classList.add("dd-fade");
    observer.observe(el);
  });

  console.log("Safe Digidop-style theme loaded for store 100381");
});
