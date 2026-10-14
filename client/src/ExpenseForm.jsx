import React, { useState } from 'react';
import { LABOUR_TYPES, TYPE_LABEL, inr, range, remainingText, today } from './utils.js';
import { useLang } from './i18n.jsx';

const NEW = '__new__';

const blank = (type, categories) => ({
  type,
  date: today(),
  amount: '',
  category: defaultCategory(type, categories),
  name: '',
  qty: '',
  unit: '',
  labourType: 'Thakedar',
  notes: '',
});

// Small expenses default to the first "misc" category; others must be picked
function defaultCategory(type, categories) {
  return type === 'misc' ? categories.find((c) => c.kind === 'misc')?._id || '' : '';
}

export default function ExpenseForm({ editing, categories, units, budgetById, onSave, onCancel, onAddCategory, onAddUnit }) {
  const { t, td, tErr } = useLang();
  const [form, setForm] = useState(() =>
    editing
      ? {
          ...blank(editing.type, categories),
          ...editing,
          category: editing.category || '',
          labourType: editing.labourType || 'Thakedar',
          date: editing.date.slice(0, 10),
        }
      : blank('material', categories)
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const { type } = form;
  const kindCats = categories.filter((c) => c.kind === type);
  const selected = categories.find((c) => c._id === form.category);
  const budget = selected && budgetById[selected._id];

  function setType(t) {
    setForm((f) => ({ ...f, type: t, category: defaultCategory(t, categories), unit: '' }));
  }

  async function changeCategory(e) {
    let id = e.target.value;
    if (id === NEW) {
      const created = await onAddCategory(type);
      if (!created) return;
      id = created._id;
      setForm((f) => ({ ...f, category: id, unit: created.unit || f.unit }));
      return;
    }
    const cat = categories.find((c) => c._id === id);
    setForm((f) => ({ ...f, category: id, unit: cat?.unit || f.unit }));
  }

  async function changeUnit(e) {
    let unit = e.target.value;
    if (unit === NEW) {
      unit = await onAddUnit();
      if (!unit) return;
    }
    setForm((f) => ({ ...f, unit }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave({ ...form, amount: Number(form.amount) });
      if (!editing) setForm({ ...blank(type, categories), date: form.date, category: type === 'misc' ? form.category : '' });
    } catch (err) {
      setError(tErr(err.message));
    } finally {
      setSaving(false);
    }
  }

  const nameLabel =
    t(
    type === 'material' ? 'Item / brand / details (optional)'
    : type === 'misc' ? 'Item name'
    : form.labourType === 'Other' ? 'Name / work'
    : 'Name (optional)'
  );

  return (
    <form className="card form" onSubmit={submit}>
      <h2>{t(editing ? 'Edit expense' : 'Add expense')}</h2>

      <div className="toggle">
        {Object.keys(TYPE_LABEL).map((k) => (
          <button type="button" key={k} className={type === k ? 'on' : ''} onClick={() => setType(k)}>
            {t(TYPE_LABEL[k])}
          </button>
        ))}
      </div>

      <div className="grid">
        <label className="half">
          {t('Date')}
          <input type="date" value={form.date} onChange={set('date')} required />
        </label>
        <label className="half">
          {t('Amount (₹)')}
          <input type="number" min="0" step="any" inputMode="decimal" value={form.amount} onChange={set('amount')} required />
        </label>

        {type === 'labour' && (
          <label>
            {t('Labour type')}
            <select value={form.labourType} onChange={set('labourType')}>
              {LABOUR_TYPES.map((l) => <option key={l} value={l}>{td(l)}</option>)}
            </select>
          </label>
        )}

        <label>
          {t(type === 'labour' ? 'Work (budget head)' : 'Category')}
          <select value={form.category} onChange={changeCategory} required={type === 'material' && !editing?.name}>
            <option value="">{t(type === 'labour' ? '— Not linked —' : '— Select —')}</option>
            {kindCats.map((c) => <option key={c._id} value={c._id}>{td(c.name)}</option>)}
            <option value={NEW}>{t('+ Add new…')}</option>
          </select>
        </label>

        <label>
          {nameLabel}
          <input
            value={form.name}
            onChange={set('name')}
            required={type === 'misc' || (type === 'labour' && form.labourType === 'Other')}
            placeholder={type === 'misc' ? t('e.g. Sponge, sand paper') : type === 'material' ? t('e.g. UltraTech, 53 grade') : ''}
          />
        </label>

        {type !== 'labour' && (
          <label>
            {t('Quantity')}
            <div className="qty">
              <input value={form.qty} onChange={set('qty')} placeholder={t('e.g. 50')} />
              <select value={form.unit} onChange={changeUnit}>
                <option value="">{t('unit')}</option>
                {/* keep an old unit visible even if it was deleted from the list */}
                {form.unit && !units.some((u) => u.name === form.unit) && <option value={form.unit}>{td(form.unit)}</option>}
                {units.map((u) => <option key={u._id} value={u.name}>{td(u.name)}</option>)}
                <option value={NEW}>{t('+ Add new…')}</option>
              </select>
            </div>
          </label>
        )}
      </div>

      {budget && budget.budgetMax != null && (
        <p className="hint">
          {td(selected.name)}: {t('budget')} {range(budget.budgetMin, budget.budgetMax)} · {t('spent')} {inr(budget.spent)} ·{' '}
          {(() => {
            const r = remainingText(budget.budgetMin, budget.budgetMax, budget.spent, t);
            return <span className={r.over ? 'over' : ''}>{r.over ? r.text : t('{x} left', { x: r.text })}</span>;
          })()}
          {selected.requiredQty && ` · ${t('needed')}: ${td(selected.requiredQty)}`}
        </p>
      )}

      <label>
        {t('Description / notes')}
        <textarea rows="2" value={form.notes} onChange={set('notes')} />
      </label>

      {error && <p className="error">{error}</p>}

      <div className="actions">
        <button className="primary" disabled={saving}>{t(saving ? 'Saving…' : editing ? 'Update' : 'Add')}</button>
        {editing && <button type="button" onClick={onCancel}>{t('Cancel')}</button>}
      </div>
    </form>
  );
}
