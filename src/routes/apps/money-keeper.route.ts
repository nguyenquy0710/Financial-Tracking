import express, { Request, Response } from 'express';
const moneyKeeperRoute = express.Router();

import { APP_ROUTE_PREFIX } from '@/constants/route_prefix.constant';
import { webAuthHandler } from '@/middleware/authHandler';

const { MONEY_KEEPER: MONEY_KEEPER_PREFIX } = APP_ROUTE_PREFIX;
const CURRENT_PAGE = MONEY_KEEPER_PREFIX.MENU_NAME; // 'Money Keeper'

/**
 * Money Keeper Routes
 * These routes render EJS templates for Money Keeper integration
 */

// All routes require authentication
moneyKeeperRoute.use(webAuthHandler);

// GET: /money-keeper
// Render the Money Keeper index page.
moneyKeeperRoute.get(MONEY_KEEPER_PREFIX.WEB_PAGE.INDEX, (req: Request, res: Response) => {
  res.render('apps/money-keeper/index', {
    title: 'Money Keeper',
    currentPage: CURRENT_PAGE
  });
});

// GET: /money-keeper/setting
// Render the Money Keeper settings page.
moneyKeeperRoute.get(MONEY_KEEPER_PREFIX.WEB_PAGE.SETTING, (req: Request, res: Response) => {
  res.render('apps/money-keeper/setting', {
    title: 'Money Keeper Settings',
    currentPage: CURRENT_PAGE
  });
});

// GET: /money-keeper/:id/detail
// Render the Money Keeper detail page for a specific item.
moneyKeeperRoute.get(MONEY_KEEPER_PREFIX.WEB_PAGE.DETAIL, (req: Request, res: Response) => {
  const itemId: string = req.params.id ?? '';
  res.render('apps/money-keeper/detail', {
    title: 'Money Keeper Detail',
    currentPage: CURRENT_PAGE,
    itemId: itemId
  });
});

// GET: /money-keeper/:id/sync-data
// Render the Money Keeper data synchronization page for a specific item.
moneyKeeperRoute.get(MONEY_KEEPER_PREFIX.WEB_PAGE.SYNC_DATA, (req: Request, res: Response) => {
  const itemId: string = req.params.id ?? '';
  res.render('apps/money-keeper/sync-data', {
    title: 'Money Keeper Sync Data',
    currentPage: CURRENT_PAGE,
    itemId: itemId
  });
});

export default moneyKeeperRoute;
