import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Unit name is required'], trim: true, unique: true },
});

export default mongoose.model('Unit', unitSchema);
