import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Expense from './models/Expense.js';
import Category from './models/Category.js';
import Unit from './models/Unit.js';
import { seedOnce } from './seed.js';
import { MONGO_URI, PORT } from './keys.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

const wrap = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message });
    }
    if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id or value' });
    if (err.code === 11000) return res.status(400).json({ message: 'That name already exists' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  });

const numOrNull = (v) => (v === '' || v == null ? null : Number(v));

const pickExpense = (b) => ({
  type: b.type,
  date: b.date || undefined,
  amount: b.amount,
  category: b.category || null,
  name: b.name,
  qty: b.qty,
  unit: b.unit,
  labourType: b.labourType || null,
  notes: b.notes,
});

const pickCategory = (b) => ({
  name: b.name,
  kind: b.kind,
  section: b.section,
  requiredQty: b.requiredQty,
  unitRate: b.unitRate,
  unit: b.unit,
  budgetMin: numOrNull(b.budgetMin),
  budgetMax: numOrNull(b.budgetMax),
});

// ---------- Expenses ----------
app.get('/api/expenses', wrap(async (_req, res) => {
  res.json(await Expense.find().sort({ date: -1, createdAt: -1 }));
}));

app.post('/api/expenses', wrap(async (req, res) => {
  res.status(201).json(await Expense.create(pickExpense(req.body)));
}));

app.put('/api/expenses/:id', wrap(async (req, res) => {
  const doc = await Expense.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  doc.set(pickExpense(req.body));
  await doc.save();
  res.json(doc);
}));

app.delete('/api/expenses/:id', wrap(async (req, res) => {
  const doc = await Expense.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
}));

// ---------- Categories (budget lines) ----------
app.get('/api/categories', wrap(async (_req, res) => {
  res.json(await Category.find().sort({ order: 1, name: 1 }));
}));

app.post('/api/categories', wrap(async (req, res) => {
  const last = await Category.findOne().sort({ order: -1 });
  const doc = await Category.create({ ...pickCategory(req.body), order: (last?.order || 0) + 1 });
  res.status(201).json(doc);
}));

app.put('/api/categories/:id', wrap(async (req, res) => {
  const doc = await Category.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  doc.set(pickCategory(req.body));
  await doc.save();
  res.json(doc);
}));

app.delete('/api/categories/:id', wrap(async (req, res) => {
  const used = await Expense.countDocuments({ category: req.params.id });
  if (used)
    return res.status(400).json({
      message: `${used} expense(s) use this category. Change or delete them first.`,
    });
  const doc = await Category.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
}));

// ---------- Units ----------
app.get('/api/units', wrap(async (_req, res) => {
  res.json(await Unit.find().sort({ name: 1 }));
}));

app.post('/api/units', wrap(async (req, res) => {
  res.status(201).json(await Unit.create({ name: req.body.name }));
}));

app.delete('/api/units/:id', wrap(async (req, res) => {
  const doc = await Unit.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
}));

// ---------- Budget: expected vs spent ----------
app.get('/api/budget', wrap(async (_req, res) => {
  const [cats, rows] = await Promise.all([
    Category.find().sort({ order: 1, name: 1 }).lean(),
    Expense.aggregate([
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const spent = {};
  const uncategorized = { material: 0, labour: 0, misc: 0 };
  for (const r of rows) {
    if (r._id.category) {
      const id = String(r._id.category);
      spent[id] ??= { spent: 0, count: 0 };
      spent[id].spent += r.total;
      spent[id].count += r.count;
    } else {
      uncategorized[r._id.type] += r.total;
    }
  }

  res.json({
    categories: cats.map((c) => ({ ...c, ...(spent[String(c._id)] || { spent: 0, count: 0 }) })),
    uncategorized,
  });
}));

// In production, serve the built React app
const dist = path.join(__dirname, '../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

mongoose
  .connect(MONGO_URI)
  .then(seedOnce)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
