const express = require('express');
const viewAdminRoutes = express.Router();

const { ADMIN_ROUTE_PREFIX } = require('@/constants/route_prefix.constant');

/**
 * Web UI Routes
 * These routes render EJS templates for the web interface
 */

// GET: /admin -> redirect to /admin/dashboard
viewAdminRoutes.get('/', (req, res) => {
  res.redirect(`${ADMIN_ROUTE_PREFIX.BASE}/${ADMIN_ROUTE_PREFIX.DASHBOARD.BASE}`);
});

// GET: /admin/dashboard
// Admin dashboard page
viewAdminRoutes.get(ADMIN_ROUTE_PREFIX.DASHBOARD.BASE, (req, res) => {
  res.render('admin/dashboard', {
    title: 'Dashboard',
    currentPage: ADMIN_ROUTE_PREFIX.DASHBOARD.MENU_NAME
  });
});

// GET: /admin/settings
// Admin settings page
viewAdminRoutes.get(ADMIN_ROUTE_PREFIX.SETTINGS.BASE, (req, res) => {
  res.render('admin/settings', {
    title: 'Cài đặt',
    currentPage: ADMIN_ROUTE_PREFIX.SETTINGS.MENU_NAME
  });
});

module.exports = viewAdminRoutes;
