document.addEventListener('DOMContentLoaded', () => {
    // Dynamically load the vote form when "Vote Now" is clicked 
    const loadVoteButton = document.getElementById('loadVote');
    if (loadVoteButton) {
      loadVoteButton.addEventListener('click', async () => {
        try {
          // Fetch only the vote form HTML from the /vote GET route
          const response = await fetch('/vote');
          const formHtml = await response.text();
          // Inject the form HTML into the designated container
          document.getElementById('voteContainer').innerHTML = formHtml;
          // Optionally update the browser URL without a full reload
          history.pushState({ page: 'vote' }, 'Vote', '/vote');
        } catch (error) {
          console.error('Error loading vote form:', error);
        }
      });
    }
    
    // Handle vote form submission via AJAX using event delegation 
    document.addEventListener('submit', async (event) => {
      // Check if the submitted form is the vote form (by checking its id)
      if (event.target && event.target.id === 'voteForm') {
        event.preventDefault(); // Prevent full page reload
        
        // Create a FormData object from the vote form
        const formData = new FormData(event.target);
        const candidate = formData.get('candidate');
        
        try {
          // Use fetch to send a POST request with the candidate data
          const response = await fetch('/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ candidate }) // Convert data to URL-encoded format
          });
          
          // Read the text response from the server
          const resultText = await response.text();
          
          // Update the voteResult div with the server response
          document.getElementById('voteResult').innerHTML = resultText;
        } catch (error) {
          console.error('Error submitting vote:', error);
          document.getElementById('voteResult').innerHTML = 'An error occurred while submitting your vote.';
        }
      }
    });
  });
  