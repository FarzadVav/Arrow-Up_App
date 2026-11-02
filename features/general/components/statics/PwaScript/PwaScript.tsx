const script = `
  (function() {
    window.__pwaPrompt = null;
    window.addEventListener('beforeinstallprompt', function(e) {
      e.preventDefault();
      window.__pwaPrompt = e;
      window.dispatchEvent(new CustomEvent('pwa-prompt-captured'));
    });
    window.addEventListener('appinstalled', function() {
      window.__pwaPrompt = null;
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    });
  })();
`;

function PwaScript() {
  return (
    <script
      id="pwa-prompt-init"
      dangerouslySetInnerHTML={{
        __html: script,
      }}
    />
  );
}

export default PwaScript;
