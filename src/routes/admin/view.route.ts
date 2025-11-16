import express, { Request, Response, NextFunction } from 'express';

import { ADMIN_ROUTE_PREFIX } from '@/constants/route_prefix.constant';

// Create a router for view admin routes
const viewAdminRoutes = express.Router();


// Authentication middleware for protected routes (optional)
// viewRoutes.use(apiAuthHandler);

/**
 * Web UI Routes
 * These routes render EJS templates for the web interface
 */

// GET: /admin -> redirect to /admin/dashboard
viewAdminRoutes.get('/', (req: Request, res: Response) => {
  res.redirect(`${ADMIN_ROUTE_PREFIX.BASE}/${ADMIN_ROUTE_PREFIX.DASHBOARD.BASE}`);
});

// GET: /admin/dashboard
// Admin dashboard page
viewAdminRoutes.get(ADMIN_ROUTE_PREFIX.DASHBOARD.BASE, (req: Request, res: Response) => {
  res.render('admin/dashboard', {
    title: 'Dashboard',
    currentPage: ADMIN_ROUTE_PREFIX.DASHBOARD.MENU_NAME
  });
});

// GET: /admin/settings
// Admin settings page
viewAdminRoutes.get(ADMIN_ROUTE_PREFIX.SETTINGS.BASE, (req: Request, res: Response) => {
  res.render('admin/settings', {
    title: 'Cài đặt',
    currentPage: ADMIN_ROUTE_PREFIX.SETTINGS.MENU_NAME
  });
});

export default viewAdminRoutes;
