const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
const header = document.getElementById('mainHeader');
const hero = document.getElementById('hero');

function openMobile() {
  mobileMenu.style.maxHeight = mobileMenu.scrollHeight + 'px';
  mobileMenu.classList.remove('opacity-0');
  burger.classList.add('active');
}

function closeMobile() {
  mobileMenu.style.maxHeight = '0';
  mobileMenu.classList.add('opacity-0');
  burger.classList.remove('active');
}

burger.addEventListener('click', () => {
  const isOpen = mobileMenu.style.maxHeight && mobileMenu.style.maxHeight !== '0px';
  isOpen ? closeMobile() : openMobile();
});

window.closeMobile = closeMobile;

window.addEventListener('scroll', () => {
  if (!hero) return;

  const heroFadePoint = hero.offsetHeight * 0.6; // pradeda keistis dar hero viduje
  const scrollY = window.scrollY;

  if (scrollY > heroFadePoint) {
    header.classList.remove('bg-white/30', 'backdrop-blur-md');
    header.classList.add('bg-white/95', 'shadow-md');
  } else {
    header.classList.add('bg-white/30', 'backdrop-blur-md');
    header.classList.remove('bg-white/95', 'shadow-md');
  }
});

