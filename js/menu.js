// menu.js — mobile burger menu
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

function openMobile() {
  mobileMenu.classList.remove('hidden');
}
function closeMobile() {
  mobileMenu.classList.add('hidden');
}
if (burger) {
  burger.addEventListener('click', () => {
    if (mobileMenu.classList.contains('hidden')) openMobile();
    else closeMobile();
  });
}

// SHOW NAV ONLY AFTER HERO BUTTON PRESS
const discoverBtn = document.getElementById('discoverBtn');
const mainHeader = document.getElementById('mainHeader');

if (discoverBtn) {
  discoverBtn.addEventListener('click', () => {
    mainHeader.classList.remove('hidden');
  });
}

// expose closeMobile so links can call it inline
window.closeMobile = closeMobile;
