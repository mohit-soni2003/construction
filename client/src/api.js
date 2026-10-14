async function req(url, options) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
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
};
