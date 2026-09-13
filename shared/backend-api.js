/* RhythmIN backend adapter: local/demo by default, remote when configured. */
(function () {
  const KEY = 'rhythmin.backendUrl';
  const DEFAULT = '';
  function baseUrl() {
    return (localStorage.getItem(KEY) || window.RHYTHMIN_BACKEND_URL || DEFAULT).replace(/\/$/, '');
  }
  function isConfigured() { return Boolean(baseUrl()); }
  async function request(path, options = {}) {
    const response = await fetch(baseUrl() + path, { ...options, headers: { ...(options.headers || {}) } });
    if (!response.ok) {
      let message = `Request failed (${response.status})`;
      try { const data = await response.json(); message = data.detail || data.error?.message || message; } catch (_) {}
      throw new Error(message);
    }
    return response.json();
  }
  async function health() { return request('/api/health'); }
  async function upload(file, sessionId = 'anonymous') {
    const form = new FormData(); form.append('file', file);
    return request('/api/upload', { method: 'POST', body: form, headers: { 'X-RhythmIN-Session': sessionId } });
  }
  async function separate(payload) { return request('/api/separate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); }
  async function job(id) { return request(`/api/jobs/${encodeURIComponent(id)}`); }
  async function cancel(id) { return request(`/api/jobs/${encodeURIComponent(id)}/cancel`, { method: 'POST' }); }
  function stream(id, onMessage, onError) {
    if (!isConfigured() || !window.EventSource) return null;
    const source = new EventSource(`${baseUrl()}/api/jobs/${encodeURIComponent(id)}/stream`);
    source.onmessage = (event) => onMessage(JSON.parse(event.data));
    source.onerror = (error) => { source.close(); if (onError) onError(error); };
    return source;
  }
  function resolveUrl(url) { return url && url.startsWith('/') && isConfigured() ? baseUrl() + url : url; }
  window.RhythmInBackend = { KEY, baseUrl, isConfigured, health, upload, separate, job, cancel, stream, resolveUrl };
})();
