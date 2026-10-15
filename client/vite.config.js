import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // host: true = also reachable from phones on the same Wi-Fi (http://<this-PC-IP>:5173)
  server: { host: true, port: 5173, proxy: { '/api': 'http://localhost:5000' } },
});
