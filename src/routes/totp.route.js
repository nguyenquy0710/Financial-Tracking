const express = require('express');
const router = express.Router();

const CURRENT_PAGE = 'totp';

// GET: /totp
router.get('/', (req, res) => {
  res.render('totp', {
    title: 'Xác thực 2 yếu tố (TOTP)',
    currentPage: CURRENT_PAGE
  });
});

module.exports = router;
