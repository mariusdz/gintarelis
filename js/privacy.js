
  const privacyBtn = document.getElementById('privacyBtn');
  const privacyModal = document.getElementById('privacyModal');
  const closePrivacy = document.getElementById('closePrivacy');
  const modalContent = privacyModal.querySelector('div');

  function openModal() {
    privacyModal.classList.remove('pointer-events-none', 'opacity-0');
    setTimeout(() => modalContent.classList.remove('scale-95'), 10);
  }

  function closeModal() {
    modalContent.classList.add('scale-95');
    privacyModal.classList.add('opacity-0');
    setTimeout(() => privacyModal.classList.add('pointer-events-none'), 300);
  }

  privacyBtn.addEventListener('click', openModal);
  closePrivacy.addEventListener('click', closeModal);

  // Close modal by clicking outside content
  privacyModal.addEventListener('click', (e) => {
    if(e.target === privacyModal) closeModal();
  });

