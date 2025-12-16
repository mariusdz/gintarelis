// education.js

// ----------------------
// ACCORDION
// ----------------------
export function toggleAccordion(btn) {
  const content = btn.querySelector(".accordion-content");
  const isOpen = content.style.maxHeight && content.style.maxHeight !== "0px";

  // Uždaryti visus accordion
  document.querySelectorAll(".accordion-content").forEach((el) => {
    el.style.maxHeight = null;
  });

  // Atidaryti tik paspaustą
  if (!isOpen) {
    content.style.maxHeight = content.scrollHeight + "px";
  }
}

// ----------------------
// SCROLL REVEAL (Tailwind + ScrollReveal.js)
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  // Jei nori paprasto Tailwind reveal
  const reveals = document.querySelectorAll(".reveal");

  const revealOnScroll = () => {
    const trigger = window.innerHeight * 0.85;

    reveals.forEach((el) => {
      const top = el.getBoundingClientRect().top;
      if (top < trigger) {
        el.classList.add("opacity-100", "translate-y-0");
      }
    });
  };

  window.addEventListener("scroll", revealOnScroll);
  window.addEventListener("load", revealOnScroll);

  // ----------------------
  // ScrollReveal.js animacijos kortelėms
  // ----------------------
  if (window.ScrollReveal) {
    ScrollReveal().reveal(".ugd-card", {
      distance: "40px",
      duration: 900,
      easing: "ease-out",
      interval: 150,
      origin: "bottom",
      opacity: 0,
      reset: false, // pasikeičia tik pirmą kartą
    });
  }
});

