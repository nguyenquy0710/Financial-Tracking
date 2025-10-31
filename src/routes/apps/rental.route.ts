import express, { Request, Response } from 'express';
const rentalRoute = express.Router();

import { webAuthHandler } from '../../middleware/authHandler';
import { rentalDomain } from '@/domains/rental.domain';
import { APP_ROUTE_PREFIX } from '@/constants/route_prefix.constant';

const { RENTAL: RENTAL_PREFIX } = APP_ROUTE_PREFIX;
const CURRENT_PAGE = RENTAL_PREFIX.MENU_NAME; // 'Rentals'

/**
 * Rental Routes
 * These routes render EJS templates for rental management
 */

// All routes require authentication
rentalRoute.use(webAuthHandler);

// GET: /rentals
// Render the rentals page listing all rentals.
rentalRoute.get(RENTAL_PREFIX.WEB_PAGE.INDEX, (req: Request, res: Response) => {
  res.render('rentals', {
    title: 'Thuê phòng',
    currentPage: CURRENT_PAGE
  });
});

// GET: /rentals/:id/detail
// Render the rental detail page for a specific rentalId.
rentalRoute.get(RENTAL_PREFIX.WEB_PAGE.DETAIL, async (req: Request, res: Response) => {
  const rentalId: string = req.params.id ?? ''; // Ensure rentalId is treated as a string
  console.log("🚀 QuyNH: rentalId", rentalId);

  // In a real application, you might want to fetch rental details from the database here
  const rental = await rentalDomain.getRentalById(rentalId);

  res.render('rental-detail', {
    title: 'Chi tiết thuê phòng',
    currentPage: CURRENT_PAGE,
    rentalId: rentalId,
    rental: rental || {}
  });
});

export default rentalRoute;
