// Digidop-inspired theme bootstrap for Sellavi
document.addEventListener("DOMContentLoaded", function () {
  // 1. Adaugă clasa de temă pe body
  document.body.classList.add("dd-theme");

  // 2. Selectează elemente pentru fade-in
  const fadeTargets = document.querySelectorAll(
    "section, .product, .product-item, .product-card, .catalog-item, .blog-post, .article, .banner, .hero, .footer, footer, header"
  );

  fadeTargets.forEach((el) => {
    el.classList.add("dd-fade");
  });

  // 3. IntersectionObserver pentru apariție cu fade-in
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("dd-in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
    }
  );

  fadeTargets.forEach((el) => observer.observe(el));

  // 4. 3D tilt pentru carduri (produse / carduri generice)
  const cardSelectors = [
    ".product",
    ".product-item",
    ".product-card",
    ".catalog-item",
    ".card",
    ".blog-post",
    ".article-card",
  ];

  const cards = document.querySelectorAll(cardSelectors.join(","));
  cards.forEach((card) => {
    card.classList.add("dd-card-3d");
    card.addEventListener("mousemove", handle3DTilt);
    card.addEventListener("mouseleave", reset3DTilt);
  });

  function handle3DTilt(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;

    const rotateX = ((y - midY) / midY) * -6; // înclinare verticală
    const rotateY = ((x - midX) / midX) * 6;  // înclinare orizontală

    card.style.transform = `translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }

  function reset3DTilt(e) {
    const card = e.currentTarget;
    card.style.transform = "";
  }

  console.log("Digidop-style theme loaded for store 100381");
});
