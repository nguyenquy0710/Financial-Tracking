import express, { Request, Response, NextFunction } from 'express';

import { APP_ROUTE_PREFIX } from '@/constants/route_prefix.constant';

import rentalRoute from './rental.route';
import totpRoute from './totp.route';
import moneyKeeperRoute from './money-keeper.route';

// Create a router for view app routes
const viewAppRoutes = express.Router();

// Authentication middleware for protected routes (optional)
// viewRoutes.use(apiAuthHandler);

/**
 * Web UI Routes
 * These routes render EJS templates for the web interface
 */

// GET: /app -> redirect to /app/dashboard
viewAppRoutes.get('/', (req: Request, res: Response) => {
  res.redirect(`${APP_ROUTE_PREFIX.BASE}/${APP_ROUTE_PREFIX.DASHBOARD.BASE}`);
});

// GET: /app/dashboard
// Dashboard and main app pages
viewAppRoutes.get('/dashboard', (req: Request, res: Response) => {
  res.render('apps/dashboard', {
    title: 'Dashboard',
    currentPage: 'dashboard'
  });
});

// Rental module integration
viewAppRoutes.use(APP_ROUTE_PREFIX.RENTAL.BASE, rentalRoute); // e.g., /rentals/*

// Money Keeper module integration
viewAppRoutes.use(APP_ROUTE_PREFIX.MONEY_KEEPER.BASE, moneyKeeperRoute); // e.g., /money-keeper/*

// TOTP (2FA) module integration
viewAppRoutes.use(APP_ROUTE_PREFIX.TOTP.BASE, totpRoute); // e.g., /totp/*

viewAppRoutes.get('/salaries', (req: Request, res: Response) => {
  res.render('apps/salaries', {
    title: 'Lương',
    currentPage: 'salaries'
  });
});

viewAppRoutes.get('/expenses', (req: Request, res: Response) => {
  res.render('apps/expenses', {
    title: 'Chi tiêu',
    currentPage: 'expenses'
  });
});

viewAppRoutes.get('/savings', (req: Request, res: Response) => {
  res.render('apps/savings', {
    title: 'Tiết kiệm',
    currentPage: 'savings'
  });
});

viewAppRoutes.get('/deposits', (req: Request, res: Response) => {
  res.render('apps/deposits', {
    title: 'Tiền gửi',
    currentPage: 'deposits'
  });
});

viewAppRoutes.get('/recurring-bills', (req: Request, res: Response) => {
  res.render('apps/recurring-bills', {
    title: 'Hóa đơn định kỳ',
    currentPage: 'recurring-bills'
  });
});

viewAppRoutes.get('/settings', (req, res) => {
  res.render('apps/settings', {
    title: 'Cài đặt',
    currentPage: 'settings'
  });
});

export default viewAppRoutes;
