import React, { useState } from 'react';
import ExpenseForm from './ExpenseForm.jsx';
import { useLang } from './i18n.jsx';
import { TYPE_LABEL, inr, budgetTotals, remainingText } from './utils.js';

export default function ExpensesPage({ expenses, categories, units, budget, actions }) {
  const { t, td, fmtDate } = useLang();
  const [filter, setFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('');
  const [editing, setEditing] = useState(null);

  const catById = Object.fromEntries(categories.map((c) => [c._id, c]));
  const budgetById = Object.fromEntries(budget.categories.map((c) => [c._id, c]));

  const totals = { material: 0, labour: 0, misc: 0 };
  const labourByType = {};
  for (const e of expenses) {
    totals[e.type] += e.amount;
    if (e.type === 'labour') labourByType[e.labourType] = (labourByType[e.labourType] || 0) + e.amount;
  }
  const total = totals.material + totals.labour + totals.misc;
  const bt = budgetTotals(budget.categories);
  const left = remainingText(bt.min, bt.max, bt.spent, t);

  async function save(data) {
    if (editing) {
      await actions.updateExpense(editing._id, data);
      setEditing(null);
    } else {
      await actions.createExpense(data);
    }
  }

  async function remove(item) {
    if (!confirm(t('Delete this expense?'))) return;
    await actions.removeExpense(item._id);
    if (editing?._id === item._id) setEditing(null);
  }

  const shown = expenses.filter(
    (i) => (filter === 'all' || i.type === filter) && (!catFilter || i.category === catFilter)
  );
  const shownTotal = shown.reduce((s, i) => s + i.amount, 0);

  return (
    <>
      <div className="stats">
        <div className="card stat"><span>{t('Total spent')}</span><b>{inr(total)}</b></div>
        <div className="card stat"><span>{t('Material')}</span><b>{inr(totals.material)}</b></div>
        <div className="card stat"><span>{t('Labour')}</span><b>{inr(totals.labour)}</b></div>
        <div className="card stat"><span>{t('Small expenses')}</span><b>{inr(totals.misc)}</b></div>
        <div className="card stat">
          <span>{t('Budget left')}</span>
          <b className={left.over ? 'over' : ''}>{left.text}</b>
        </div>
      </div>

      {Object.keys(labourByType).length > 0 && (
        <div className="chips">
          {Object.entries(labourByType).map(([k, v]) => (
            <span key={k} className="chip">{td(k)}: {inr(v)}</span>
          ))}
        </div>
      )}

      <ExpenseForm
        key={editing?._id || 'new'}
        editing={editing}
        categories={categories}
        units={units}
        budgetById={budgetById}
        onSave={save}
        onCancel={() => setEditing(null)}
        onAddCategory={actions.addCategory}
        onAddUnit={actions.addUnit}
      />

      <div className="card">
        <div className="list-head">
          <h2>{t('Expenses')}</h2>
          <div className="filters">
            <div className="toggle small">
              {['all', 'material', 'labour', 'misc'].map((f) => (
                <button key={f} className={filter === f ? 'on' : ''} onClick={() => { setFilter(f); setCatFilter(''); }}>
                  {f === 'all' ? t('All') : f === 'misc' ? t('Small') : t(TYPE_LABEL[f])}
                </button>
              ))}
            </div>
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
              <option value="">{t('All categories')}</option>
              {categories
                .filter((c) => filter === 'all' || c.kind === filter)
                .map((c) => <option key={c._id} value={c._id}>{td(c.name)}</option>)}
            </select>
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="muted">{t('No expenses yet.')}</p>
        ) : (
          <div className="table-wrap">
            <table className="cards expenses">
              <thead>
                <tr>
                  <th>{t('Date')}</th>
                  <th>{t('Type')}</th>
                  <th>{t('Category / Item')}</th>
                  <th>{t('Qty')}</th>
                  <th>{t('Notes')}</th>
                  <th className="num">{t('Amount')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((i) => {
                  const cat = catById[i.category];
                  const qty = [i.qty, td(i.unit)].filter(Boolean).join(' ');
                  return (
                    <tr key={i._id}>
                      <td className="c-date nowrap">{fmtDate(i.date)}</td>
                      <td className="c-type">
                        <span className={`tag ${i.type}`}>
                          {i.type === 'labour' ? td(i.labourType) : i.type === 'misc' ? t('Small') : t('Material')}
                        </span>
                      </td>
                      <td className={`c-item ${cat || i.name ? '' : 'blank'}`}>
                        {cat && <div>{td(cat.name)}</div>}
                        {i.name && <div className={cat ? 'sub' : ''}>{i.name}</div>}
                        {!cat && !i.name && '—'}
                      </td>
                      <td className={`c-qty nowrap ${qty ? '' : 'blank'}`} data-label={t('Qty')}>{qty || '—'}</td>
                      <td className={`c-notes notes ${i.notes ? '' : 'blank'}`}>{i.notes}</td>
                      <td className="c-amt num">{inr(i.amount)}</td>
                      <td className="c-act row-actions">
                        <button onClick={() => { setEditing(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{t('Edit')}</button>
                        <button className="danger" onClick={() => remove(i)}>{t('Delete')}</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5">{t('Total ({n} entries)', { n: shown.length })}</td>
                  <td className="num">{inr(shownTotal)}</td>
                  <td className="blank"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
