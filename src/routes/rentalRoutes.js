const express = require('express');
const router = express.Router();

// GET: /rentals
// Render the rentals page
router.get('/', (req, res) => {
  res.render('rentals', {
    title: 'Thuê phòng',
    currentPage: 'rentals'
  });
});

module.exports = router;
