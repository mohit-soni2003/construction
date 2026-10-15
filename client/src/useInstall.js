import { useEffect, useState } from 'react';

// Captures the browser's "install app" offer (Android Chrome / Edge / desktop Chrome)
// so we can show our own Install button. Returns null when installing isn't possible
// (already installed, iPhone Safari, or browser hasn't offered it yet).
let deferred = null;
const listeners = new Set();

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferred = e;
  listeners.forEach((fn) => fn());
});
window.addEventListener('appinstalled', () => {
  deferred = null;
  listeners.forEach((fn) => fn());
});

// Facts used to pick the right manual install instructions
export function installInfo() {
  return {
    standalone: window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true,
    ios: /iPhone|iPad|iPod/i.test(navigator.userAgent),
    secure: window.isSecureContext,
  };
}

export default function useInstall() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const fn = () => rerender((n) => n + 1);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);

  if (!deferred) return null;
  return async () => {
    const prompt = deferred;
    deferred = null;
    prompt.prompt();
    await prompt.userChoice.catch(() => {});
    listeners.forEach((fn) => fn());
  };
}
