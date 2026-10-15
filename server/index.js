// Local / normal Node hosting entry (npm start). On Vercel, api/index.js is used instead.
import app, { connectDB } from './app.js';
import { PORT } from './keys.js';

connectDB()
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API server on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
