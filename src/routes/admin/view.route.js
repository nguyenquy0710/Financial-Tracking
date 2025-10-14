const express = require('express');
const router = express.Router();

/**
 * Web UI Routes
 * These routes render EJS templates for the web interface
 */

// Home page
router.get('/', (req, res) => {
  res.redirect('/admin/dashboard');
});

// Dashboard and main app pages
router.get('/dashboard', (req, res) => {
  res.render('admin/dashboard', {
    title: 'Dashboard',
    currentPage: 'dashboard'
  });
});

router.get('/settings', (req, res) => {
  res.render('admin/settings', {
    title: 'Cài đặt',
    currentPage: 'settings'
  });
});

module.exports = router;
