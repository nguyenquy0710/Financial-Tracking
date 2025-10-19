const express = require('express');
const router = express.Router();

const { rentalDomain } = require('@/domains/rental.domain');

const CURRENT_PAGE = 'rentals';

/**
 * Rental Routes
 * These routes render EJS templates for rental management
 */

// GET: /rentals
// Render the rentals page listing all rentals.
router.get('/', (req, res) => {
  res.render('rentals', {
    title: 'Thuê phòng',
    currentPage: CURRENT_PAGE
  });
});

// GET: /rentals/:id/detail
// Render the rental detail page for a specific rentalId.
router.get('/:id/detail', async (req, res) => {
  const rentalId = req?.params?.id ?? '';
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

module.exports = router;
