const express = require('express');
const router = express.Router();

// Middleware: Check if user is an admin
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') return next();
  res.status(403).send("Access denied: Admins only");
}

// GET: Admin dashboard (protected)
// Query both vote counts and the list of registered users and render the view
router.get('/', isAdmin, (req, res) => {
  const db = req.app.locals.db;
  const voteQuery = `SELECT candidate, COUNT(*) as count FROM votes GROUP BY candidate`;
  
  db.all(voteQuery, [], (err, voteRows) => {
    if (err) {
      console.error(err.message);
      return res.send("Error retrieving vote counts.");
    }
    
    // Query for the list of registered users
    const userQuery = 'SELECT id, username, role FROM users';
    db.all(userQuery, [], (err, userRows) => {
      if (err) {
        console.error(err.message);
        return res.send("Error retrieving user list.");
      }
      
      // Render the admin view with both vote and user data
      res.render('admin', { 
        user: req.session.user, 
        votes: voteRows, 
        users: userRows 
      });
    });
  });
});

module.exports = router;
