import mongoose from 'mongoose';

export const LABOUR_TYPES = ['Thakedar', 'Electrician', 'Painter', 'Plumber', 'Tiling', 'Other'];

const expenseSchema = new mongoose.Schema(
  {
    // misc = small expenses like sponge, sand paper
    type: { type: String, enum: ['material', 'labour', 'misc'], required: true },
    date: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true, min: 0 },

    // Budget line this expense counts against
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },

    // material/misc: item name or details. labour: person's name (required only when labourType is Other)
    name: { type: String, trim: true, default: '' },
    // material/misc only
    qty: { type: String, trim: true, default: '' },
    unit: { type: String, trim: true, default: '' },
    // labour only
    labourType: { type: String, enum: [...LABOUR_TYPES, null], default: null },

    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

expenseSchema.pre('validate', function (next) {
  if (this.type === 'material') {
    if (!this.category && !this.name) this.invalidate('category', 'Choose a material category');
    this.labourType = null;
  } else if (this.type === 'misc') {
    if (!this.name) this.invalidate('name', 'Item name is required');
    this.labourType = null;
  } else if (this.type === 'labour') {
    if (!this.labourType) this.invalidate('labourType', 'Labour type is required');
    if (this.labourType === 'Other' && !this.name)
      this.invalidate('name', 'Name is required when type is Other');
    this.qty = '';
    this.unit = '';
  }
  next();
});

export default mongoose.model('Expense', expenseSchema);
