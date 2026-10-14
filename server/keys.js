// All secrets and settings for the server (used locally and on Vercel).
// This file is committed to git — keep the GitHub repository PRIVATE.

export const MONGO_URI =
  'mongodb+srv://mohitsonip1847_db_user:8pK3ATZyMWjl4AQ7@cluster0.gnunly0.mongodb.net/construction?retryWrites=true&w=majority&appName=Cluster0';

// Old local database (kept as backup):
// export const MONGO_URI = 'mongodb://127.0.0.1:27017/construction';

export const PORT = 5000;

// PIN to open the app (asked once per device)
export const APP_PIN = '979700';
