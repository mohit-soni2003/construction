import React, { useState } from 'react';
import { useLang } from './i18n.jsx';
import { KIND_LABEL, range } from './utils.js';

const blank = { name: '', kind: 'material', section: '', requiredQty: '', unitRate: '', unit: '', budgetMin: '', budgetMax: '' };

function CategoryForm({ editing, units, sections, onSave, onCancel }) {
  const { t, td, tErr } = useLang();
  const [form, setForm] = useState(() =>
    editing
      ? { ...blank, ...editing, budgetMin: editing.budgetMin ?? '', budgetMax: editing.budgetMax ?? '' }
      : blank
  );
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await onSave(form);
      if (!editing) setForm({ ...blank, kind: form.kind, section: form.section });
    } catch (err) {
      setError(tErr(err.message));
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <h3>{editing ? t('Edit “{name}”', { name: td(editing.name) }) : t('Add category / budget item')}</h3>
      <div className="grid">
        <label>{t('Name')}<input value={form.name} onChange={set('name')} required placeholder={t('e.g. Cement')} /></label>
        <label>
          {t('Section')}
          <input value={form.section} onChange={set('section')} list="sections" placeholder={t('Group on budget page')} />
          <datalist id="sections">{sections.map((s) => <option key={s} value={s} />)}</datalist>
        </label>
        <label className="half">
          {t('Type')}
          <select value={form.kind} onChange={set('kind')}>
            {Object.entries(KIND_LABEL).map(([k, v]) => <option key={k} value={k}>{t(v)}</option>)}
          </select>
        </label>
        <label className="half">
          {t('Default unit')}
          <select value={form.unit} onChange={set('unit')}>
            <option value="">—</option>
            {units.map((u) => <option key={u._id} value={u.name}>{td(u.name)}</option>)}
          </select>
        </label>
        <label>{t('Required quantity')}<input value={form.requiredQty} onChange={set('requiredQty')} placeholder={t('e.g. 80–100 bags')} /></label>
        <label>{t('Unit rate')}<input value={form.unitRate} onChange={set('unitRate')} placeholder={t('e.g. ₹305–310/bag')} /></label>
        <label className="half">{t('Budget min (₹)')}<input type="number" min="0" inputMode="numeric" value={form.budgetMin} onChange={set('budgetMin')} /></label>
        <label className="half">{t('Budget max (₹)')}<input type="number" min="0" inputMode="numeric" value={form.budgetMax} onChange={set('budgetMax')} /></label>
      </div>
      <p className="muted small">{t('Leave budget empty for items you only want to track (no expected amount).')}</p>
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button className="primary">{t(editing ? 'Update' : 'Add')}</button>
        {editing && <button type="button" onClick={onCancel}>{t('Cancel')}</button>}
      </div>
    </form>
  );
}

export default function SettingsPage({ categories, units, actions }) {
  const { t, td, tErr } = useLang();
  const [editing, setEditing] = useState(null);
  const [unitName, setUnitName] = useState('');
  const [unitError, setUnitError] = useState('');
  const sections = [...new Set(categories.map((c) => c.section).filter(Boolean))];

  async function saveCategory(data) {
    if (editing) {
      await actions.updateCategory(editing._id, data);
      setEditing(null);
    } else {
      await actions.createCategory(data);
    }
  }

  async function removeCategory(c) {
    if (!confirm(t('Delete category “{name}”?', { name: td(c.name) }))) return;
    try {
      await actions.removeCategory(c._id);
    } catch (err) {
      alert(tErr(err.message));
    }
  }

  async function addUnit(e) {
    e.preventDefault();
    setUnitError('');
    try {
      await actions.createUnit(unitName.trim());
      setUnitName('');
    } catch (err) {
      setUnitError(tErr(err.message));
    }
  }

  return (
    <>
      <div className="card">
        <CategoryForm
          key={editing?._id || 'new'}
          editing={editing}
          units={units}
          sections={sections}
          onSave={saveCategory}
          onCancel={() => setEditing(null)}
        />
      </div>

      {Object.entries(KIND_LABEL).map(([kind, label]) => {
        const list = categories.filter((c) => c.kind === kind);
        return (
          <div className="card" key={kind}>
            <h2>{t('{kind} categories', { kind: t(label) })}</h2>
            {list.length === 0 ? (
              <p className="muted">{t('None yet.')}</p>
            ) : (
              <div className="table-wrap">
                <table className="cards cats">
                  <thead>
                    <tr>
                      <th>{t('Name')}</th><th>{t('Section')}</th><th>{t('Required')}</th><th>{t('Unit')}</th>
                      <th className="num">{t('Budget')}</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((c) => (
                      <tr key={c._id}>
                        <td className="c-name">{td(c.name)}{c.unitRate && <div className="sub">{td(c.unitRate)}</div>}</td>
                        <td className="c-sec sub">{td(c.section)}</td>
                        <td className="c-req" data-label={t('Required')}>{td(c.requiredQty) || '—'}</td>
                        <td className="c-unit" data-label={t('Unit')}>{td(c.unit) || '—'}</td>
                        <td className="c-bud num">{c.budgetMax != null ? range(c.budgetMin, c.budgetMax) : t('No budget')}</td>
                        <td className="c-act row-actions">
                          <button onClick={() => { setEditing(c); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{t('Edit')}</button>
                          <button className="danger" onClick={() => removeCategory(c)}>{t('Delete')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      <div className="card">
        <h2>{t('Units')}</h2>
        <div className="chips">
          {units.map((u) => (
            <span key={u._id} className="chip">
              {td(u.name)}
              <button className="x" title={t('Delete')} onClick={() => actions.removeUnit(u._id)}>×</button>
            </span>
          ))}
        </div>
        <form className="inline" onSubmit={addUnit}>
          <input value={unitName} onChange={(e) => setUnitName(e.target.value)} placeholder={t('New unit, e.g. quintal')} required />
          <button className="primary">{t('Add unit')}</button>
        </form>
        {unitError && <p className="error">{unitError}</p>}
      </div>
    </>
  );
}
