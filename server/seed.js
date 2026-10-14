// Initial budget taken from house_construction_budget_with_unit_rates.pdf
import mongoose from 'mongoose';
import Category from './models/Category.js';
import Unit from './models/Unit.js';

const GEN = 'General construction materials';
const HARD = 'Hard / finishing materials';
const LAB = 'Labour charges';
const SMALL = 'Small expenses';

const categories = [
  // 1. General construction materials
  { name: 'Reti (sand)', kind: 'material', section: GEN, requiredQty: '10–15 m³', unitRate: 'Lump sum', unit: 'm³', budgetMin: 20000, budgetMax: 30000 },
  { name: 'Bricks', kind: 'material', section: GEN, requiredQty: '2,000 units', unitRate: '₹8.50–9/unit', unit: 'pcs', budgetMin: 17000, budgetMax: 18000 },
  { name: 'Cement', kind: 'material', section: GEN, requiredQty: '80–100 bags', unitRate: '₹305–310/bag', unit: 'bag', budgetMin: 24400, budgetMax: 31000 },
  { name: 'Churi (aggregate)', kind: 'material', section: GEN, requiredQty: '10 m³', unitRate: 'Lump sum', unit: 'm³', budgetMin: 10000, budgetMax: 12000 },
  { name: 'Tiles', kind: 'material', section: GEN, requiredQty: '1,000 sq. ft.', unitRate: '₹40–47/sq. ft.', unit: 'sq. ft.', budgetMin: 40000, budgetMax: 47000 },
  { name: 'Sanitary fittings', kind: 'material', section: GEN, requiredQty: 'As required', unitRate: 'Lump sum', unit: '', budgetMin: 10000, budgetMax: 12000 },
  { name: 'Tin', kind: 'material', section: GEN, requiredQty: 'As required', unitRate: 'Lump sum', unit: '', budgetMin: 5000, budgetMax: 6000 },
  { name: 'Wash basin', kind: 'material', section: GEN, requiredQty: '1 unit', unitRate: 'Lump sum', unit: 'pcs', budgetMin: 2000, budgetMax: 3000 },
  { name: 'Sink', kind: 'material', section: GEN, requiredQty: '1 unit', unitRate: 'Lump sum', unit: 'pcs', budgetMin: 2000, budgetMax: 2000 },
  { name: 'Zhiri box material', kind: 'material', section: GEN, requiredQty: 'As required', unitRate: 'Lump sum', unit: '', budgetMin: 5000, budgetMax: 5000 },
  { name: 'Marble', kind: 'material', section: GEN, requiredQty: 'As required', unitRate: 'Lump sum', unit: 'sq. ft.', budgetMin: 10000, budgetMax: 12000 },
  { name: 'Terrace ventilation jali + lantern box jalis', kind: 'material', section: GEN, requiredQty: '5 jalis', unitRate: 'Lump sum', unit: 'pcs', budgetMin: 3000, budgetMax: 4000 },
  { name: 'Gitti and sariya', kind: 'material', section: GEN, requiredQty: 'Combined', unitRate: 'Lump sum', unit: '', budgetMin: 5000, budgetMax: 5000 },
  // 2. Hard / finishing materials
  { name: 'Electrical wiring material', kind: 'material', section: HARD, requiredQty: 'As required', unitRate: 'Lump sum', unit: '', budgetMin: 25000, budgetMax: 30000 },
  { name: 'Putty', kind: 'material', section: HARD, requiredQty: '9 bags', unitRate: '~₹444–556/bag', unit: 'bag', budgetMin: 4000, budgetMax: 5000 },
  { name: 'Colour / paint', kind: 'material', section: HARD, requiredQty: '40 litres', unitRate: '₹375/litre', unit: 'litre', budgetMin: 15000, budgetMax: 15000 },
  { name: 'Shutter', kind: 'material', section: HARD, requiredQty: 'As required', unitRate: 'Lump sum', unit: '', budgetMin: 15000, budgetMax: 15000 },
  // 3. Labour charges
  { name: 'Plaster, paracoat and terrace finishing', kind: 'labour', section: LAB, requiredQty: 'Complete work', unitRate: 'Lump sum', unit: '', budgetMin: 100000, budgetMax: 100000 },
  { name: 'Tile fitting', kind: 'labour', section: LAB, requiredQty: '700 sq. ft.', unitRate: '₹70–80/sq. ft.', unit: 'sq. ft.', budgetMin: 49000, budgetMax: 56000 },
  { name: 'Plumbing fitting', kind: 'labour', section: LAB, requiredQty: 'Complete work', unitRate: 'Lump sum', unit: '', budgetMin: 5000, budgetMax: 5000 },
  { name: 'Tin fitting', kind: 'labour', section: LAB, requiredQty: 'Complete work', unitRate: 'Lump sum', unit: '', budgetMin: 5000, budgetMax: 5000 },
  { name: 'Zhiri box work', kind: 'labour', section: LAB, requiredQty: 'Complete work', unitRate: 'Lump sum', unit: '', budgetMin: 4000, budgetMax: 5000 },
  // Small expenses (no budget in the PDF)
  { name: 'Small items', kind: 'misc', section: SMALL, requiredQty: '', unitRate: '', unit: '', budgetMin: null, budgetMax: null },
];

const units = ['bag', 'pcs', 'sq. ft.', 'm³', 'cu. ft.', 'litre', 'kg', 'ton', 'trolley', 'ft', 'meter', 'box', 'packet', 'set', 'lump sum'];

// Runs once per database; deleting items later won't bring them back.
export async function seedOnce() {
  const meta = mongoose.connection.db.collection('meta');
  if (await meta.findOne({ _id: 'seeded' })) return;
  if ((await Category.countDocuments()) === 0)
    await Category.insertMany(categories.map((c, i) => ({ ...c, order: i + 1 })));
  if ((await Unit.countDocuments()) === 0) await Unit.insertMany(units.map((name) => ({ name })));
  await meta.insertOne({ _id: 'seeded', at: new Date() });
  console.log('Seeded budget categories and units');
}
