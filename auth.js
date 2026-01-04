const express = require('express');
const router = express.Router();

// Middleware: Check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

// GET: Render login form
router.get('/login', (req, res) => {
  res.render('login'); // This will use views/login.hbs
});

// POST: Process login credentials
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log("Login attempt:", username, password);  // Temporary log
    const db = req.app.locals.db;
  
    db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, user) => {
      if (err) {
        console.error("Error during login query:", err.message);
        return res.send("An error occurred.");
      }
      if (user) {
        req.session.user = { id: user.id, username: user.username, role: user.role };
        res.redirect('/dashboard');
      } else {
        res.send('Invalid credentials. <a href="/login">Try again</a>');
      }
    });
});  

// GET: Render registration form
router.get('/register', (req, res) => {
  res.render('register'); // This will use views/register.hbs
});

// POST: Process user registration (default role is guest)
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  const db = req.app.locals.db;

  // Check if username is already taken
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.send('An error occurred. Please try again later.');
    }
    if (row) {
      return res.send('Username is already taken. Please choose another one.');
    }
    // Insert new user with default role 'guest'
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
      [username, password, 'guest'], function(err) {
        if (err) {
          console.error(err.message);
          return res.send('An error occurred during registration.');
        }
        res.send('Registration successful! You can now <a href="/login">login</a>.');
      }
    );
  });
});

// GET: Protected dashboard route
router.get('/dashboard', isAuthenticated, (req, res) => {
    const isAdmin = (req.session.user.role === 'admin');
    res.render('dashboard', { user: req.session.user, isAdmin });
  });  

// GET: Logout route
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send("Error logging out.");
    res.redirect('/login');
  });
});

// Default route: Redirect to login
router.get('/', (req, res) => {
  res.redirect('/login');
});

module.exports = router;
