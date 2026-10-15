import { API_URL } from './keys.js';

// The PIN is remembered on this device after the first successful unlock
const PIN_KEY = 'pin';

export function getPin() {
  try {
    return localStorage.getItem(PIN_KEY) || '';
  } catch {
    return '';
  }
}

export function clearPin() {
  try {
    localStorage.removeItem(PIN_KEY);
  } catch {}
}

function savePin(pin) {
  try {
    localStorage.setItem(PIN_KEY, pin);
  } catch {}
}

// App.jsx listens for this and shows the PIN screen
export const AUTH_EVENT = 'auth-required';

async function req(url, options) {
  const res = await fetch(API_URL + url, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'x-pin': getPin() },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    clearPin();
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

const resource = (base) => ({
  list: () => req(base),
  create: (body) => req(base, { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => req(`${base}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => req(`${base}/${id}`, { method: 'DELETE' }),
});

export const api = {
  expenses: resource('/api/expenses'),
  categories: resource('/api/categories'),
  units: resource('/api/units'),
  budget: () => req('/api/budget'),

  async login(pin) {
    const res = await fetch(API_URL + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Request failed');
    savePin(pin);
  },
};
