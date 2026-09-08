(function () {
  function resizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  function wrapTextarea(el) {
    if (el.closest('.doc-autotextarea-wrap')) return;

    const originalValue = el.value;
    el.dataset.originalValue = originalValue;

    const wrap = document.createElement('div');
    wrap.className = 'doc-autotextarea-wrap';

    const toolbar = document.createElement('div');
    toolbar.className = 'doc-autotextarea-toolbar';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'doc-autotextarea-btn';
    copyBtn.setAttribute('aria-label', '복사');
    copyBtn.setAttribute('title', '복사');
    copyBtn.innerHTML = '<i data-lucide="copy" class="h-4 w-4"></i>';

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'doc-autotextarea-btn';
    resetBtn.setAttribute('aria-label', '취소');
    resetBtn.setAttribute('title', '취소');
    resetBtn.innerHTML = '<i data-lucide="undo-2" class="h-4 w-4"></i>';

    toolbar.append(copyBtn, resetBtn);

    el.parentNode.insertBefore(wrap, el);
    wrap.append(toolbar, el);

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(el.value);
        copyBtn.classList.add('is-success');
        window.setTimeout(() => copyBtn.classList.remove('is-success'), 1200);
      } catch (error) {
        el.select();
        document.execCommand('copy');
      }
    });

    resetBtn.addEventListener('click', () => {
      el.value = el.dataset.originalValue || originalValue;
      resizeTextarea(el);
      el.focus();
    });
  }

  function initAutoTextareas() {
    document.querySelectorAll('.autotextarea').forEach((el) => {
      wrapTextarea(el);
      resizeTextarea(el);
      el.addEventListener('input', () => resizeTextarea(el));
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  window.initAutoTextareas = initAutoTextareas;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoTextareas);
  } else {
    initAutoTextareas();
  }

  window.addEventListener('resize', () => {
    document.querySelectorAll('.autotextarea').forEach(resizeTextarea);
  });
})();
