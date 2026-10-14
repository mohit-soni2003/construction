import mongoose from 'mongoose';

export const KINDS = ['material', 'labour', 'misc'];
export const DEFAULT_SECTION = {
  material: 'Other materials',
  labour: 'Labour charges',
  misc: 'Small expenses',
};

// A category is also a budget line: expenses are tracked against budgetMin/budgetMax.
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, unique: true },
    kind: { type: String, enum: KINDS, required: true },
    section: { type: String, trim: true, default: '' },
    requiredQty: { type: String, trim: true, default: '' },
    unitRate: { type: String, trim: true, default: '' },
    unit: { type: String, trim: true, default: '' }, // default unit for expenses
    budgetMin: { type: Number, min: 0, default: null },
    budgetMax: { type: Number, min: 0, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function (next) {
  if (!this.section) this.section = DEFAULT_SECTION[this.kind] || '';
  // Allow entering just one of min/max
  if (this.budgetMin == null && this.budgetMax != null) this.budgetMin = this.budgetMax;
  if (this.budgetMax == null && this.budgetMin != null) this.budgetMax = this.budgetMin;
  if (this.budgetMin != null && this.budgetMin > this.budgetMax)
    this.invalidate('budgetMin', 'Minimum budget cannot be more than maximum');
  next();
});

export default mongoose.model('Category', categorySchema);
