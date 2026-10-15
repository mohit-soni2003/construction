import React from 'react';
import { useLang } from './i18n.jsx';
import useInstall, { installInfo } from './useInstall.js';

// Shows an Install button when the browser offers it, otherwise step-by-step
// instructions for adding the app icon to the home screen.
export default function InstallHelp({ compact = false }) {
  const { t } = useLang();
  const install = useInstall();
  const { standalone, ios, secure } = installInfo();

  if (standalone) return null; // already opened as an installed app

  if (install) {
    return (
      <button type="button" className="install-big" onClick={install}>
        📲 {t('Install app on this phone')}
      </button>
    );
  }

  return (
    <div className={`install-help ${compact ? 'compact' : ''}`}>
      <b>📲 {t('Add app icon to your home screen')}</b>
      {ios ? (
        <p>{t('In Safari, tap Share (□↑) → “Add to Home Screen” → Add.')}</p>
      ) : (
        <p>{t('In Chrome, tap the ⋮ menu (top right) → “Add to Home screen” or “Install app” → Add.')}</p>
      )}
      {!secure && <p className="muted">{t('Full app install works only on the https (Vercel) link. On the Wi-Fi link you get a shortcut icon.')}</p>}
    </div>
  );
}
