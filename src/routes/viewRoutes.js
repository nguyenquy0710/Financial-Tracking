const express = require('express');
const router = express.Router();

/**
 * Web UI Routes
 * These routes render EJS templates for the web interface
 */

// Home page
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Người bạn đồng hành tài chính thông minh'
  });
});

// Authentication pages
router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Đăng nhập'
  });
});

router.get('/register', (req, res) => {
  res.render('register', {
    title: 'Đăng ký'
  });
});

// Dashboard and main app pages
router.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard',
    currentPage: 'dashboard'
  });
});

router.get('/rentals', (req, res) => {
  res.render('rentals', {
    title: 'Thuê phòng',
    currentPage: 'rentals'
  });
});

router.get('/salaries', (req, res) => {
  res.render('salaries', {
    title: 'Lương',
    currentPage: 'salaries'
  });
});

router.get('/expenses', (req, res) => {
  res.render('expenses', {
    title: 'Chi tiêu',
    currentPage: 'expenses'
  });
});

router.get('/savings', (req, res) => {
  res.render('savings', {
    title: 'Tiết kiệm',
    currentPage: 'savings'
  });
});

router.get('/deposits', (req, res) => {
  res.render('deposits', {
    title: 'Tiền gửi',
    currentPage: 'deposits'
  });
});

router.get('/recurring-bills', (req, res) => {
  res.render('recurring-bills', {
    title: 'Hóa đơn định kỳ',
    currentPage: 'recurring-bills'
  });
});

router.get('/excel', (req, res) => {
  res.render('excel', {
    title: 'Excel Import/Export',
    currentPage: 'excel'
  });
});

router.get('/settings', (req, res) => {
  res.render('settings', {
    title: 'Cài đặt',
    currentPage: 'settings'
  });
});

module.exports = router;
