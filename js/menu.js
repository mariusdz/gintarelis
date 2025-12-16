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


// expose closeMobile so links can call it inline
window.closeMobile = closeMobile;
