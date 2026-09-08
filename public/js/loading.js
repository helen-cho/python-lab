(function () {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;

  const messageEl = overlay.querySelector('[data-loading-message]');
  let activeCount = 0;

  function show(message) {
    activeCount += 1;
    if (messageEl && message) {
      messageEl.textContent = message;
    }
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    overlay.setAttribute('aria-hidden', 'false');
  }

  function hide() {
    activeCount = Math.max(0, activeCount - 1);
    if (activeCount === 0) {
      overlay.classList.add('hidden');
      overlay.classList.remove('flex');
      overlay.setAttribute('aria-hidden', 'true');
    }
  }

  window.AppLoading = { show, hide };

  document.querySelectorAll('[data-loading-trigger]').forEach((el) => {
    el.addEventListener('click', () => {
      const message = el.getAttribute('data-loading-message') || '잠시만 기다려 주세요...';
      show(message);
      window.setTimeout(hide, 1200);
    });
  });

  document.querySelectorAll('form[data-loading-form]').forEach((form) => {
    form.addEventListener('submit', () => {
      const message =
        form.getAttribute('data-loading-message') || '요청을 처리하고 있습니다...';
      show(message);
    });
  });
})();
