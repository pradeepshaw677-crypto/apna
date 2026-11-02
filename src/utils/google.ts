/**
 * Loads Google Identity Services exactly once and resolves when it is ready.
 * The script tag in index.html is only a hint — ad blockers and slow networks
 * can leave it unavailable, so callers must await this loader.
 */
type GoogleWindow = Window & { google?: any };

let pending: Promise<void> | null = null;

export function loadGoogleScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Sign-In is only available in a browser.'));
  }

  const googleWindow = window as GoogleWindow;
  if (googleWindow.google?.accounts) return Promise.resolve();
  if (pending) return pending;

  pending = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://accounts.google.com/gsi/client"]',
    );

    const finish = () => {
      if (googleWindow.google?.accounts) resolve();
      else reject(new Error('Google Sign-In failed to initialise.'));
    };

    if (existing) {
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener('error', () => reject(new Error('Google Sign-In script failed to load.')), {
        once: true,
      });
      let attempts = 0;
      const timer = window.setInterval(() => {
        attempts += 1;
        if (googleWindow.google?.accounts) {
          window.clearInterval(timer);
          resolve();
        } else if (attempts > 50) {
          window.clearInterval(timer);
          reject(new Error('Google Sign-In is unavailable. Please check your connection or ad blocker.'));
        }
      }, 200);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = finish;
    script.onerror = () => reject(new Error('Google Sign-In script failed to load.'));
    document.head.appendChild(script);
  }).catch((error) => {
    pending = null;
    throw error;
  });

  return pending;
}
