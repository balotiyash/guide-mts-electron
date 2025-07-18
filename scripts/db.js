const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('users.db');

// Run only once to create users table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  // Insert a sample user
  db.run(`INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`, ['neha', '1234']);
});

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

module.exports = { validateUser };
