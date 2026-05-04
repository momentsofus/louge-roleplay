/**
 * @file public/js/live-reload-client.js
 * @description Development live reload client. CSS changes swap stylesheets; JS/EJS changes reload the page.
 */

(function () {
  const config = window.LOUGE_LIVE_RELOAD;
  if (!config || !config.enabled || typeof EventSource === 'undefined') return;

  let cssVersion = String(config.cssVersion || '');
  let reloadVersion = String(config.reloadVersion || '');
  let reconnectTimer = null;

  function withVersion(url, version) {
    try {
      const parsed = new URL(url, window.location.href);
      parsed.searchParams.set('v', version || String(Date.now()));
      return parsed.toString();
    } catch (_) {
      const sep = String(url || '').includes('?') ? '&' : '?';
      return `${url}${sep}v=${encodeURIComponent(version || String(Date.now()))}`;
    }
  }

  function reloadCss(version) {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .filter((link) => /\/public\/styles\/.*\.css/.test(link.href || ''));

    if (!links.length) {
      window.location.reload();
      return;
    }

    links.forEach((link) => {
      const clone = link.cloneNode(true);
      clone.href = withVersion(link.href, version);
      clone.addEventListener('load', () => {
        link.remove();
      }, { once: true });
      clone.addEventListener('error', () => {
        clone.remove();
      }, { once: true });
      link.after(clone);
    });
  }

  function handlePayload(payload) {
    if (!payload || !payload.kind) return;
    if (payload.kind === 'css') {
      const nextCssVersion = String(payload.cssVersion || Date.now());
      if (nextCssVersion && nextCssVersion !== cssVersion) {
        cssVersion = nextCssVersion;
        reloadCss(cssVersion);
      }
      return;
    }

    if (payload.kind === 'reload') {
      const nextReloadVersion = String(payload.reloadVersion || Date.now());
      if (nextReloadVersion && nextReloadVersion !== reloadVersion) {
        reloadVersion = nextReloadVersion;
        window.location.reload();
      }
    }
  }

  function connect() {
    const source = new EventSource(config.endpoint || '/__live-reload/events');
    source.addEventListener('change', (event) => {
      try {
        handlePayload(JSON.parse(event.data || '{}'));
      } catch (_) {}
    });
    source.onerror = () => {
      source.close();
      if (reconnectTimer) return;
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, 1500);
    };
  }

  connect();
}());
