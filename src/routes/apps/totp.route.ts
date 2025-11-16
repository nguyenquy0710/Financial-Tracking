import express, { Request, Response, NextFunction } from 'express';
const totpRoute = express.Router();

import { APP_ROUTE_PREFIX } from '@/constants/route_prefix.constant';
import { webAuthHandler } from '@/middleware/authHandler';

// Define route prefixes and current page
const { TOTP: TOTP_PREFIX } = APP_ROUTE_PREFIX;
const CURRENT_PAGE = TOTP_PREFIX.MENU_NAME;

// All routes require authentication
totpRoute.use(webAuthHandler);

// GET: /totp
totpRoute.get(TOTP_PREFIX.WEB_PAGE.INDEX, (req: Request, res: Response) => {
  const { query, headers } = req;

  res.render('apps/totp', {
    title: 'Xác thực 2 yếu tố (TOTP)',
    currentPage: CURRENT_PAGE
  });
});

export default totpRoute;
