// db.js (ESM version)
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// simulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize database
const db = new sqlite3.Database(join(__dirname, 'users.db'));

// Create users table and insert sample user
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`, ['neha', '1234']);
});

// User validation function
function validateUser(username, password, callback) {
  db.get(
    `SELECT * FROM users WHERE username = ? AND password = ?`,
    [username, password],
    (err, row) => {
      if (err) return callback(err);
      callback(null, !!row);
    }
  );
}

// ESM-style export
export { validateUser };
