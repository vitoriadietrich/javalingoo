(() => {
  'use strict';
  const dialog = document.getElementById('installDialog');
  const content = document.getElementById('installInstructions');
  const action = dialog.querySelector('[data-confirm-install]');
  let pendingPrompt = null;
  const installed = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const english = () => typeof settings !== 'undefined' && settings.language === 'en';
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function refresh() {
    document.querySelectorAll('[data-install-app]').forEach(button => {
      button.hidden = installed();
    });
    document.querySelector('.mobile-install span').textContent = english() ? 'Install app' : 'Instalar aplicativo';
  }
  function showInstructions() {
    const en = english();
    dialog.querySelector('#installTitle').textContent = en ? 'Install JavaLingo' : 'Instale o JavaLingo';
    if (pendingPrompt) {
      content.innerHTML = en
        ? '<p>Keep JavaLingo on your home screen and open it like an app. Lessons you have opened can also be used offline.</p>'
        : '<p>Deixe o JavaLingo na tela inicial e abra como um aplicativo. As lições carregadas também podem funcionar sem internet.</p>';
      action.textContent = en ? 'Install now' : 'Instalar agora';
      action.hidden = false;
    } else if (ios) {
      content.innerHTML = en
        ? '<p>In Safari, tap <strong>Share</strong> (square with an arrow), then <strong>Add to Home Screen</strong> and confirm.</p><p>If you opened this link in another app, open it in Safari first.</p>'
        : '<p>No Safari, toque em <strong>Compartilhar</strong> (quadrado com seta), depois em <strong>Adicionar à Tela de Início</strong> e confirme.</p><p>Se abriu o link dentro de outro aplicativo, abra no Safari primeiro.</p>';
      action.hidden = true;
    } else {
      content.innerHTML = en
        ? '<p>Open this page in Chrome, tap the browser menu ⋮ and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>'
        : '<p>Abra esta página no Chrome, toque no menu ⋮ do navegador e escolha <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.</p>';
      action.hidden = true;
    }
    dialog.showModal();
  }
  document.querySelectorAll('[data-install-app]').forEach(button => {
    button.addEventListener('click', showInstructions);
  });
  dialog.querySelector('[data-close-install]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  action.addEventListener('click', async () => {
    if (!pendingPrompt) return;
    const prompt = pendingPrompt;
    pendingPrompt = null;
    dialog.close();
    await prompt.prompt();
    await prompt.userChoice;
    refresh();
  });
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    pendingPrompt = event;
  });
  window.addEventListener('appinstalled', () => {
    pendingPrompt = null;
    dialog.close();
    refresh();
  });
  document.getElementById('languageToggle').addEventListener('click', () => queueMicrotask(refresh));
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    });
  }
  refresh();
})();
