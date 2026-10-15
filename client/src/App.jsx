import React, { useCallback, useEffect, useState } from 'react';
import { api, getPin, clearPin, AUTH_EVENT } from './api.js';
import { useLang } from './i18n.jsx';
import ExpensesPage from './ExpensesPage.jsx';
import BudgetPage from './BudgetPage.jsx';
import SettingsPage from './SettingsPage.jsx';
import PinScreen from './PinScreen.jsx';
import useInstall from './useInstall.js';

const TABS = { expenses: 'Expenses', budget: 'Budget', settings: 'Settings' };
const TAB_ICONS = { expenses: '🧾', budget: '📊', settings: '⚙️' };

export default function App() {
  const { t, tErr, lang, toggle } = useLang();
  const install = useInstall();
  const [tab, setTab] = useState(() => (location.hash.slice(1) in TABS ? location.hash.slice(1) : 'expenses'));
  const [data, setData] = useState({
    expenses: [],
    categories: [],
    units: [],
    budget: { categories: [], uncategorized: {} },
  });
  const [loadError, setLoadError] = useState('');
  const [locked, setLocked] = useState(() => !getPin());

  const load = useCallback(async () => {
    try {
      const [expenses, categories, units, budget] = await Promise.all([
        api.expenses.list(),
        api.categories.list(),
        api.units.list(),
        api.budget(),
      ]);
      setData({ expenses, categories, units, budget });
      setLoadError('');
    } catch (err) {
      setLoadError(err.message);
    }
  }, []);

  useEffect(() => {
    if (!locked) load();
  }, [locked, load]);

  // Any request rejected for a wrong/missing PIN brings back the PIN screen
  useEffect(() => {
    const lock = () => setLocked(true);
    window.addEventListener(AUTH_EVENT, lock);
    return () => window.removeEventListener(AUTH_EVENT, lock);
  }, []);

  function lockNow() {
    clearPin();
    setLocked(true);
  }

  useEffect(() => {
    history.replaceState(null, '', '#' + tab);
  }, [tab]);

  // Every change reloads everything so totals stay in sync
  const after = (fn) => async (...args) => {
    const result = await fn(...args);
    await load();
    return result;
  };

  const actions = {
    createExpense: after(api.expenses.create),
    updateExpense: after(api.expenses.update),
    removeExpense: after(api.expenses.remove),
    createCategory: after(api.categories.create),
    updateCategory: after(api.categories.update),
    removeCategory: after(api.categories.remove),
    createUnit: after((name) => api.units.create({ name })),
    removeUnit: after(api.units.remove),

    // Quick add from the expense form dropdowns
    async addCategory(kind) {
      const name = prompt(t('New category name:'))?.trim();
      if (!name) return null;
      try {
        return await actions.createCategory({ name, kind });
      } catch (err) {
        alert(tErr(err.message));
        return null;
      }
    },
    async addUnit() {
      const name = prompt(t('New unit (e.g. bag, kg, trolley):'))?.trim();
      if (!name) return null;
      try {
        await actions.createUnit(name);
        return name;
      } catch (err) {
        alert(tErr(err.message));
        return null;
      }
    },
  };

  if (locked) return <PinScreen onUnlock={() => setLocked(false)} />;

  return (
    <div className="container">
      <header>
        <h1>🏠 {t('House Construction')}</h1>
        <div className="header-right">
          <nav className="tabs">
            {Object.entries(TABS).map(([k, v]) => (
              <button
                key={k}
                className={tab === k ? 'on' : ''}
                onClick={() => { setTab(k); window.scrollTo(0, 0); }}
              >
                <span className="icon">{TAB_ICONS[k]}</span>
                <span>{t(v)}</span>
              </button>
            ))}
          </nav>
          {install && (
            <button className="install" onClick={install} title={t('Install app')}>
              📲<span>{t('Install app')}</span>
            </button>
          )}
          <button className="lang" onClick={toggle} title={lang === 'hi' ? 'Switch to English' : 'हिंदी में देखें'}>
            {lang === 'hi' ? 'English' : 'हिंदी'}
          </button>
          <button className="lock" onClick={lockNow} title={t('Lock')} aria-label={t('Lock')}>🔒</button>
        </div>
      </header>

      {loadError && (
        <p className="error card">{t('Could not load data: {err}. Is the server / MongoDB running?', { err: tErr(loadError) })}</p>
      )}

      {tab === 'expenses' && <ExpensesPage {...data} actions={actions} />}
      {tab === 'budget' && <BudgetPage budget={data.budget} />}
      {tab === 'settings' && <SettingsPage categories={data.categories} units={data.units} actions={actions} />}
    </div>
  );
}
