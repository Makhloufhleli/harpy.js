/**
 * Harpy Live Reload Client
 * Connects to the dev server via SSE and reloads the page when changes are detected
 */
(function () {
  if (typeof window === 'undefined') return;

  const eventSource = new EventSource('/__harpy/live-reload');

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'reload') {
        console.log('[Harpy] Reloading page...');
        window.location.reload();
      } else if (data.type === 'connected') {
        console.log('[Harpy] Live reload connected');
      }
    } catch (err) {
      console.error('[Harpy] Failed to parse message:', err);
    }
  };

  eventSource.onerror = () => {
    console.log('[Harpy] Live reload disconnected, retrying...');
    eventSource.close();
    // Retry connection after 1 second
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
})();
