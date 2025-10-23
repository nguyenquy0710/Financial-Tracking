const express = require('express');
const viewRoutes = express.Router();

const { ROUTE_PREFIX } = require('@/constants/route_prefix.constant');
const { default: config } = require('@/config/config');
const { default: totpRoute } = require('./totp.route');
const { default: rentalRoute } = require('./rental.route');

/**
 * Web UI Routes
 * These routes render EJS templates for the web interface
 */

// Home page
viewRoutes.get('/', (req, res) => {
  res.render('index', {
    title: 'Người bạn đồng hành tài chính thông minh',
    currentPage: 'home'
  });
});

// Changelog page - renders CHANGELOG.md content in a styled format
viewRoutes.get('/changelog', (req, res) => {
  res.render('changelog', {
    title: 'Nhật ký phát triển',
    currentPage: 'changelog',
    turnstile: {
      siteKey: config.turnstile.siteKey || ''
    }
  });
});

// Authentication pages
viewRoutes.get('/login', (req, res) => {
  const defaultDataUserQuyNH = require('../scripts/data.quynh.initialize').defaultDataUserQuyNH ?? {};
  const { email, password } = defaultDataUserQuyNH.user || {};

  res.render('login', {
    title: 'Đăng nhập',
    currentPage: 'login',
    defaultData: {
      user: { email, password }
    },
    turnstile: {
      siteKey: config.turnstile.siteKey || ''
    },
  });
});

// Registration page - simplified, no invite code required for now
viewRoutes.get('/register', (req, res) => {
  res.render('register', {
    title: 'Đăng ký',
    currentPage: 'register',
    turnstile: {
      siteKey: config.turnstile.siteKey || ''
    },
  });
});

// Dashboard and main app pages
viewRoutes.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard',
    currentPage: 'dashboard'
  });
});

// Rental module integration
viewRoutes.use(ROUTE_PREFIX.RENTAL.BASE, rentalRoute); // e.g., /rentals/*

// TOTP 2FA page integration
viewRoutes.use(ROUTE_PREFIX.TOTP.BASE, totpRoute); // e.g., /totp/*

viewRoutes.get('/salaries', (req, res) => {
  res.render('salaries', {
    title: 'Lương',
    currentPage: 'salaries'
  });
});

viewRoutes.get('/expenses', (req, res) => {
  res.render('expenses', {
    title: 'Chi tiêu',
    currentPage: 'expenses'
  });
});

viewRoutes.get('/savings', (req, res) => {
  res.render('savings', {
    title: 'Tiết kiệm',
    currentPage: 'savings'
  });
});

viewRoutes.get('/deposits', (req, res) => {
  res.render('deposits', {
    title: 'Tiền gửi',
    currentPage: 'deposits'
  });
});

viewRoutes.get('/recurring-bills', (req, res) => {
  res.render('recurring-bills', {
    title: 'Hóa đơn định kỳ',
    currentPage: 'recurring-bills'
  });
});

viewRoutes.get('/excel', (req, res) => {
  res.render('excel', {
    title: 'Excel Import/Export',
    currentPage: 'excel'
  });
});

viewRoutes.get('/settings', (req, res) => {
  res.render('settings', {
    title: 'Cài đặt',
    currentPage: 'settings'
  });
});

module.exports = viewRoutes;
