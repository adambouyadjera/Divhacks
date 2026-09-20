let toastTimeout;
const toast = document.getElementById('toast');

function showMessage(message) {
  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimeout = setTimeout(() => toast.classList.remove('visible'), 5000);
}

document.querySelectorAll('[data-message]').forEach(card => {
  card.addEventListener('click', () => showMessage(card.dataset.message));
});

document.getElementById('year').textContent = new Date().getFullYear();
