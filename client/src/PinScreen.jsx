import React, { useState } from 'react';
import { api } from './api.js';
import { useLang } from './i18n.jsx';

const LENGTH = 6;

export default function PinScreen({ onUnlock }) {
  const { t, tErr, lang, toggle } = useLang();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function tryPin(value) {
    setBusy(true);
    setError('');
    try {
      await api.login(value);
      onUnlock();
    } catch (err) {
      setError(tErr(err.message));
      setPin('');
    } finally {
      setBusy(false);
    }
  }

  function change(e) {
    const value = e.target.value.replace(/\D/g, '').slice(0, LENGTH);
    setPin(value);
    setError('');
    if (value.length === LENGTH) tryPin(value);
  }

  return (
    <div className="pin-page">
      <button className="lang pin-lang" onClick={toggle}>{lang === 'hi' ? 'English' : 'हिंदी'}</button>
      <form
        className="card pin-card"
        onSubmit={(e) => { e.preventDefault(); if (pin.length === LENGTH) tryPin(pin); }}
      >
        <div className="pin-icon">🏠</div>
        <h1>{t('House Construction')}</h1>
        <p className="muted">{t('Enter the 6-digit PIN')}</p>
        <label className="pin-wrap">
          <input
            className="pin-input"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            value={pin}
            onChange={change}
            disabled={busy}
            aria-label={t('Enter the 6-digit PIN')}
          />
          <span className="pin-dots" aria-hidden="true">
            {Array.from({ length: LENGTH }, (_, i) => (
              <span key={i} className={i < pin.length ? 'dot on' : 'dot'} />
            ))}
          </span>
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={busy || pin.length !== LENGTH}>
          {busy ? t('Checking…') : t('Unlock')}
        </button>
      </form>
    </div>
  );
}
