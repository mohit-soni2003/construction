import React from 'react';
import { useLang } from './i18n.jsx';
import { inr, range, remainingText, budgetTotals, TYPE_LABEL } from './utils.js';

function Progress({ min, max, spent }) {
  const { t } = useLang();
  const pct = max > 0 ? Math.min(100, (spent / max) * 100) : spent > 0 ? 100 : 0;
  const level = spent > max ? 'red' : spent > min ? 'amber' : 'green';
  return (
    <div className="bar" title={t('{p}% of max', { p: Math.round(max ? (spent / max) * 100 : 0) })}>
      <div className={`fill ${level}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Left({ min, max, spent }) {
  const { t } = useLang();
  const r = remainingText(min, max, spent, t);
  return <span className={r.over ? 'over' : ''}>{r.text}</span>;
}

export default function BudgetPage({ budget }) {
  const { t, td } = useLang();
  const budgeted = budget.categories.filter((c) => c.budgetMax != null);
  const unbudgeted = budget.categories.filter((c) => c.budgetMax == null && c.spent > 0);
  const uncategorized = Object.entries(budget.uncategorized).filter(([, v]) => v > 0);
  const outside =
    unbudgeted.reduce((s, c) => s + c.spent, 0) + uncategorized.reduce((s, [, v]) => s + v, 0);

  // Group by section, keeping the order items were added in
  const sections = [];
  for (const c of budgeted) {
    let s = sections.find((x) => x.name === c.section);
    if (!s) sections.push((s = { name: c.section, items: [] }));
    s.items.push(c);
  }

  const tot = budgetTotals(budget.categories);

  return (
    <>
      <div className="stats">
        <div className="card stat"><span>{t('Expected cost')}</span><b>{range(tot.min, tot.max)}</b></div>
        <div className="card stat"><span>{t('Spent on budget items')}</span><b>{inr(tot.spent)}</b></div>
        <div className="card stat"><span>{t('Still to spend')}</span><b><Left {...tot} /></b></div>
        <div className="card stat"><span>{t('Spent outside budget')}</span><b>{inr(outside)}</b></div>
        <div className="card stat"><span>{t('Total spent')}</span><b>{inr(tot.spent + outside)}</b></div>
      </div>

      <div className="card overall">
        <Progress {...tot} />
        <p className="muted small">
          {t('{p}% of maximum budget used.', { p: tot.max ? Math.round((tot.spent / tot.max) * 100) : 0 })}{' '}
          {t('Green = under minimum estimate, amber = between min and max, red = over max.')}
        </p>
      </div>

      {sections.map((s) => {
        const st = budgetTotals(s.items);
        return (
          <div className="card" key={s.name}>
            <h2>{td(s.name)}</h2>
            <div className="table-wrap">
              <table className="cards budget">
                <thead>
                  <tr>
                    <th>{t('Item')}</th>
                    <th className="num">{t('Expected')}</th>
                    <th className="num">{t('Spent')}</th>
                    <th className="num">{t('Left')}</th>
                    <th className="bar-col"></th>
                  </tr>
                </thead>
                <tbody>
                  {s.items.map((c) => (
                    <tr key={c._id}>
                      <td className="c-name">
                        {td(c.name)}
                        {(c.requiredQty || c.unitRate) && (
                          <div className="sub">{[td(c.requiredQty), td(c.unitRate)].filter(Boolean).join(' · ')}</div>
                        )}
                      </td>
                      <td className="c-exp num" data-label={t('Expected')}>{range(c.budgetMin, c.budgetMax)}</td>
                      <td className="c-spent num" data-label={t('Spent')}>{inr(c.spent)}</td>
                      <td className="c-left num" data-label={t('Left')}><Left min={c.budgetMin} max={c.budgetMax} spent={c.spent} /></td>
                      <td className="c-bar bar-col"><Progress min={c.budgetMin} max={c.budgetMax} spent={c.spent} /></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="c-name">{t('Section total')}</td>
                    <td className="c-exp num" data-label={t('Expected')}>{range(st.min, st.max)}</td>
                    <td className="c-spent num" data-label={t('Spent')}>{inr(st.spent)}</td>
                    <td className="c-left num" data-label={t('Left')}><Left {...st} /></td>
                    <td className="c-bar bar-col"><Progress {...st} /></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })}

      {(unbudgeted.length > 0 || uncategorized.length > 0) && (
        <div className="card">
          <h2>{t('Spent outside budget')}</h2>
          <p className="muted small">
            {t('Small expenses and categories without a budget amount. Set a budget in Settings to track them above.')}
          </p>
          <table>
            <tbody>
              {unbudgeted.map((c) => (
                <tr key={c._id}>
                  <td>{td(c.name)} <span className="sub">{t('({n} entries)', { n: c.count })}</span></td>
                  <td className="num">{inr(c.spent)}</td>
                </tr>
              ))}
              {uncategorized.map(([type, v]) => (
                <tr key={type}>
                  <td>{t('{type} – no category', { type: t(TYPE_LABEL[type]) })}</td>
                  <td className="num">{inr(v)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td>{t('Total')}</td><td className="num">{inr(outside)}</td></tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}
