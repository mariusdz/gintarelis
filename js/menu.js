/**
 * Mobile menu and header scroll behaviour.
 */

export function initMenu() {
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");
  const header = document.getElementById("mainHeader");

  if (!burger || !mobileMenu) return;

  function openMobile() {
    mobileMenu.style.maxHeight = mobileMenu.scrollHeight + "px";
    mobileMenu.classList.remove("opacity-0", "max-h-0");
    burger.classList.add("active");
    burger.setAttribute("aria-expanded", "true");
  }

  function closeMobile() {
    mobileMenu.style.maxHeight = "0";
    mobileMenu.classList.add("opacity-0", "max-h-0");
    burger.classList.remove("active");
    burger.setAttribute("aria-expanded", "false");
  }

  burger.addEventListener("click", () => {
    const isOpen = mobileMenu.style.maxHeight && mobileMenu.style.maxHeight !== "0px";
    isOpen ? closeMobile() : openMobile();
  });

  // Header background transition when scrolling past hero
  window.addEventListener("scroll", () => {
    if (!header) return;
    const scrollY = window.scrollY;
    if (scrollY > 60) {
      header.classList.remove("bg-white/40", "backdrop-blur-md");
      header.classList.add("bg-white/95", "shadow-md");
    } else {
      header.classList.add("bg-white/40", "backdrop-blur-md");
      header.classList.remove("bg-white/95", "shadow-md");
    }
  }, { passive: true });

  window.closeMobile = closeMobile;
}
