document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const stats = document.querySelectorAll(".stat-number");
  const questionButtons = document.querySelectorAll(".question-options button");

  window.addEventListener("scroll", () => {
    if (!header) return;

    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.5
    }
  );

  stats.forEach(stat => observer.observe(stat));

});