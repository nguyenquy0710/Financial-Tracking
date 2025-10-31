import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

import config from '@/config/config';
import { ADMIN_ROUTE_PREFIX, API_ROUTE_PREFIX, APP_ROUTE_PREFIX, ROUTE_PREFIX } from '@/constants/route_prefix.constant';
import viewAppRoutes from './apps/view.route';
import viewAdminRoutes from './admin/view.route';
import apiRoutes from './apis/api.route';

const viewRoutes = express.Router();

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

// Mount app-specific view routes
viewRoutes.use(APP_ROUTE_PREFIX.BASE, viewAppRoutes); // App web app routes

// Mount admin-specific view routes
viewRoutes.use(ADMIN_ROUTE_PREFIX.BASE, viewAdminRoutes); // Admin web app routes

// Mount API routes under the API route prefix
viewRoutes.use(API_ROUTE_PREFIX.BASE, apiRoutes); // API routes

// Changelog page - renders CHANGELOG.md content in a styled format
viewRoutes.get(ROUTE_PREFIX.CHANGELOG.BASE, (req, res) => {
  res.render('changelog', {
    title: 'Nhật ký phát triển',
    currentPage: 'changelog',
    turnstile: {
      siteKey: config.turnstile.siteKey || ''
    }
  });
});

// Serve raw CHANGELOG.md file for direct access or downloads
viewRoutes.get(ROUTE_PREFIX.CHANGELOG.FILE_PATH, (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'CHANGELOG.md'));
});

// Authentication pages
viewRoutes.get(ROUTE_PREFIX.AUTH.WEB_PAGE.LOGIN, (req, res) => {

  // Load default user data for development environment (if available)
  const defaultDataUserQuyNH = process.env['NODE_ENV'] == 'development'
    ? (require('../scripts/data.quynh.initialize').defaultDataUserQuyNH ?? {})
    : { email: '', password: '' };

  // Destructure email and password for pre-filling the login form (if available)
  const { email, password } = defaultDataUserQuyNH.user || {};

  // Render login page with default data (if any)
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
viewRoutes.get(ROUTE_PREFIX.AUTH.WEB_PAGE.REGISTER, (req, res) => {
  res.render('register', {
    title: 'Đăng ký',
    currentPage: 'register',
    turnstile: {
      siteKey: config.turnstile.siteKey || ''
    },
  });
});

export default viewRoutes;
