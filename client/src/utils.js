export const LABOUR_TYPES = ['Thakedar', 'Electrician', 'Painter', 'Plumber', 'Tiling', 'Other'];

export const TYPE_LABEL = { material: 'Material', labour: 'Labour', misc: 'Small expense' };
export const KIND_LABEL = { material: 'Material', labour: 'Labour', misc: 'Small expenses' };

export const inr = (n) => (n < 0 ? '-' : '') + '₹' + Math.abs(Number(n || 0)).toLocaleString('en-IN');

export const range = (min, max) => (min === max ? inr(min) : `${inr(min)} – ${inr(max)}`);

// "₹a – ₹b" still left, or "Over by ₹x" (t = translate function from useLang)
export function remainingText(min, max, spent, t) {
  const lo = min - spent;
  const hi = max - spent;
  if (hi < 0) return { text: t('Over by {x}', { x: inr(-hi) }), over: true };
  return { text: range(Math.max(lo, 0), hi), over: false };
}

// Totals over categories that have a budget set
export function budgetTotals(cats) {
  const t = { min: 0, max: 0, spent: 0 };
  for (const c of cats) {
    if (c.budgetMax == null) continue;
    t.min += c.budgetMin;
    t.max += c.budgetMax;
    t.spent += c.spent;
  }
  return t;
}

export const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
