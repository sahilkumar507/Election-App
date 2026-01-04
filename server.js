const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

// Setup body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Setup session middleware
app.use(session({
  secret: 'your-secret-key', // replace with a secure key
  resave: false,
  saveUninitialized: false
}));

// Set the view engine to hbs (Handlebars)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Serve static assets from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Connect to (or create) the SQLite database (stored in the database folder)
const db = new sqlite3.Database('./database/election.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the election SQLite database.');
  }
});

// Create the users table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT
)`, (err) => {
  if (err) {
    console.error("Error creating users table:", err.message);
  } else {
    // Insert a default admin user if not already present
    const adminUser = { username: 'admin', password: 'adminpass', role: 'admin' };
    db.get(`SELECT * FROM users WHERE username = ?`, [adminUser.username], (err, row) => {
      if (err) { console.error(err.message); }
      if (!row) {
        db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
          [adminUser.username, adminUser.password, adminUser.role],
          (err) => {
            if (err) console.error("Error inserting admin user:", err.message);
            else console.log("Admin user created.");
          }
        );
      }
    });
  }
});

// Create the votes table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER,
  candidate TEXT,
  voteTime DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(userId) REFERENCES users(id)
)`, (err) => {
  if (err) {
    console.error("Error creating votes table:", err.message);
  } else {
    console.log("Votes table created or already exists.");
  }
});

// Make the database accessible in the routes using app.locals
app.locals.db = db;

// Import route modules
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const publicDataRoutes = require('./routes/publicData'); // Public API integration route
const voteRoutes = require('./routes/vote'); // New route for vote submission

// Use the imported routes
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/public', publicDataRoutes); // Mounting the public route
app.use('/vote', voteRoutes); // Mounting the vote route

// Start the server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
