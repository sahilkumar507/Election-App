const express = require('express');
const router = express.Router();

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

// GET: Render vote submission form for authenticated voters using voteForm.hbs
router.get('/', isAuthenticated, (req, res) => {
  res.render('voteForm', { user: req.session.user });
});

// POST: Process the vote submission with a check for existing votes
router.post('/', isAuthenticated, (req, res) => {
  const { candidate } = req.body; // The candidate selected by the voter
  const db = req.app.locals.db;
  const userId = req.session.user.id;

  // Check if the user has already voted
  db.get('SELECT * FROM votes WHERE userId = ?', [userId], (err, row) => {
    if (err) {
      console.error("Error checking for existing vote:", err.message);
      return res.send("An error occurred while processing your vote.");
    }

    if (row) {
      // User has already voted
      return res.send("You have already voted.");
    }

    // If no previous vote is found, insert the new vote
    db.run('INSERT INTO votes (userId, candidate) VALUES (?, ?)', [userId, candidate], function(err) {
      if (err) {
        console.error("Error inserting vote:", err.message);
        return res.send("An error occurred while submitting your vote.");
      }
      res.send("Your vote has been recorded. <a href='/dashboard'>Return to dashboard</a>");
    });
  });
});

module.exports = router;
