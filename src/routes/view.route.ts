import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

import configApp from '@/config/config';
import { ADMIN_ROUTE_PREFIX, API_ROUTE_PREFIX, APP_ROUTE_PREFIX, ROUTE_PREFIX } from '@/constants/route_prefix.constant';
import { X_DEVICE_ID } from '@/constants/app_key_config.constant';
import { initLocalsMiddleware } from '@/middleware/locals.middleware';
import viewAppRoutes from './apps/view.route';
import viewAdminRoutes from './admin/view.route';
import apiRoutes from './apis/api.route';

const viewRoutes = express.Router();

// Initialize locals constants
initLocalsMiddleware(viewRoutes);

/**
 * Web UI Routes
 * These routes render EJS templates for the web interface
 */

// GET: /
// Home page
viewRoutes.get('/', (req: Request, res: Response) => {
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

// GET: /changelog
// Changelog page - renders CHANGELOG.md content in a styled format
viewRoutes.get(ROUTE_PREFIX.CHANGELOG.BASE, (req: Request, res: Response) => {
  res.render('changelog', {
    title: 'Nhật ký phát triển',
    currentPage: 'changelog',
    turnstile: {
      siteKey: configApp.turnstile.siteKey || ''
    }
  });
});

// GET: /changelog.md
// Serve raw CHANGELOG.md file for direct access or downloads
viewRoutes.get(ROUTE_PREFIX.CHANGELOG.FILE_PATH, (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '..', '..', 'CHANGELOG.md'));
});

// GET: /appInfo
// App Info endpoint - provides app version, build number, and menu bar configuration
viewRoutes.get('/appInfo', (req: Request, res: Response) => {
  // Check for existing device ID in headers or cookies
  let deviceId = req.headers[X_DEVICE_ID] || req.cookies[X_DEVICE_ID] || '';

  // If no device ID, generate a new one
  if (!deviceId) {
    // Generate a simple random device ID (for demonstration purposes)
    deviceId = 'device-' + Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
    // Set device ID in cookie for future requests
    res.cookie(X_DEVICE_ID, deviceId, { httpOnly: true, maxAge: 31536000000 }); // 1 year
  }

  // Respond with app info and menu bar configuration
  res.json({
    success: true,
    deviceId: deviceId,
    appVersion: configApp.app.version,
    buildNumber: configApp.app.buildNumber,
    menuBar: [
      { name: 'home', label: 'Trang chủ', link: '/' },
      { name: ROUTE_PREFIX.CHANGELOG.MENU_NAME, label: 'Nhật ký phát triển', link: ROUTE_PREFIX.CHANGELOG.BASE },
      { name: 'login', label: 'Đăng nhập', link: ROUTE_PREFIX.AUTH.WEB_PAGE.LOGIN },
      { name: 'register', label: 'Đăng ký', link: ROUTE_PREFIX.AUTH.WEB_PAGE.REGISTER },
      // App specific pages
      {
        name: APP_ROUTE_PREFIX.DASHBOARD.MENU_NAME,
        label: 'Bảng điều khiển',
        link: `${APP_ROUTE_PREFIX.BASE}${APP_ROUTE_PREFIX.DASHBOARD.BASE}${APP_ROUTE_PREFIX.DASHBOARD.WEB_PAGE.INDEX}`
      },
    ]
  });
});

// Authentication pages
viewRoutes.get(ROUTE_PREFIX.AUTH.WEB_PAGE.LOGIN, (req: Request, res: Response) => {
  const { redirect, errorMessage, } = req.query || {};

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
      user: { email, password },
      redirectUrl: redirect || '',
      errorMessage: errorMessage || '',
    },
    turnstile: {
      siteKey: configApp.turnstile.siteKey || '',
    },
  });
});

// Registration page - simplified, no invite code required for now
viewRoutes.get(ROUTE_PREFIX.AUTH.WEB_PAGE.REGISTER, (req: Request, res: Response) => {
  res.render('register', {
    title: 'Đăng ký',
    currentPage: 'register',
    turnstile: {
      siteKey: configApp.turnstile.siteKey || ''
    },
  });
});

export default viewRoutes;
