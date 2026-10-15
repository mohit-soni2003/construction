// SERVER keys: database, PIN and port. Used locally and wherever the server is hosted.
// This file is committed to git — keep the GitHub repository PRIVATE.

export const MONGO_URI =
  'mongodb+srv://mohitsonip1847_db_user:8pK3ATZyMWjl4AQ7@cluster0.gnunly0.mongodb.net/construction?retryWrites=true&w=majority&appName=Cluster0';

// Old local database (kept as backup):
// export const MONGO_URI = 'mongodb://127.0.0.1:27017/construction';

// Hosts like Render/Railway choose the port themselves; locally it is 5000
export const PORT = process.env.PORT || 5000;

// PIN to open the app (asked once per device)
export const APP_PIN = '979700';
