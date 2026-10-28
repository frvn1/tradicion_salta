(() => {
  let installPrompt = null;
  const installButton = document.getElementById('install-app-btn');

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    installPrompt = event;
    if (installButton) installButton.textContent = '＋ Instalar nuestra app';
  });

  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    if (installButton) {
      installButton.textContent = '✓ Aplicación instalada';
      installButton.disabled = true;
    }
  });

  if (installButton) {
    installButton.addEventListener('click', async () => {
      if (installPrompt) {
        installPrompt.prompt();
        await installPrompt.userChoice;
        installPrompt = null;
        return;
      }

      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const isInStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      if (isInStandalone) {
        alert('Tradición de Salta ya está instalada en este dispositivo.');
      } else if (isIOS) {
        alert('Para instalar Tradición de Salta en tu iPhone: tocá el botón Compartir de Safari y elegí “Agregar a pantalla de inicio”.');
      } else {
        alert('Para instalar Tradición de Salta, abrí esta página desde Chrome o Edge y buscá “Instalar aplicación” en el menú del navegador. Si todavía no aparece, primero hay que publicar la web con HTTPS.');
      }
    });
  }

  if ('serviceWorker' in navigator && /^https?:$/.test(window.location.protocol)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch((error) => {
        console.warn('No se pudo registrar el service worker:', error);
      });
    });
  }
})();
