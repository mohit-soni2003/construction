// CLIENT keys: only the address of the backend server. Nothing secret goes here —
// everything in the website is visible to anyone who opens it.

// After hosting the server, put its address here (no slash at the end),
// e.g. 'https://construction-server.vercel.app'
const HOSTED_SERVER_URL = 'https://construction-xfbd.vercel.app';

// `npm run dev` uses '' so requests go through the Vite proxy to http://localhost:5000
// (this also makes it work from a phone on the same Wi-Fi). The built website uses the hosted server.
export const API_URL = import.meta.env.DEV ? '' : HOSTED_SERVER_URL;
