// Local server: API + (after `npm run build`) the React app on one port.
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import app, { connectDB } from './app.js';
import { PORT } from './keys.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dist = path.join(__dirname, '../client/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

connectDB()
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
