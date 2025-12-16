
  document.addEventListener("DOMContentLoaded", () => {
    const section = document.querySelector("#naujienos");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          section.classList.remove("opacity-0", "translate-y-10");
          observer.unobserve(section);
        }
      });
    });

    observer.observe(section);
  });

