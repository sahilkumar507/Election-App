const express = require('express');
const router = express.Router();

// GET: Query NewsAPI for election news data (about Donald Trump and Joe Biden) and render the result
router.get('/', async (req, res) => {
  try {
    // Replace 'YOUR_API_KEY' with your actual key from https://newsapi.org
    const apiKey = 'a230aba574c147f1bf5987fe7a3a6409';
    const url = `https://newsapi.org/v2/everything?` +
      new URLSearchParams({
        q: 'Donald Trump Joe Biden', // Search for articles mentioning both candidates
        sortBy: 'publishedAt',        // Sort by most recent articles
        language: 'en',               // Use only English articles
        apiKey: apiKey
      });
    
    // Fetch data from NewsAPI
    const response = await fetch(url);
    const data = await response.json();
    
    // Check if the response status is ok
    if (data.status !== 'ok') {
      console.error('Error from NewsAPI:', data);
      return res.send('Error fetching election news.');
    }
    
    // Render the 'public' template, passing in the array of articles
    res.render('public', { articles: data.articles });
  } catch (error) {
    console.error('Error fetching public API data:', error);
    res.send("Error fetching election news.");
  }
});

module.exports = router;
