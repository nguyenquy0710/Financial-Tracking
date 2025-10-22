const express = require('express');
const router = express.Router();
const {
  getRentals,
  getRental,
  createRental,
  updateRental,
  deleteRental,
  getRentalStats
} = require('../../controllers/rental.controller');
const { apiAuthHandler } = require('../../middleware/authHandler');

/**
 * @swagger
 * tags:
 *  name: Rentals
 *  description: API for managing rentals
 */

// All routes require authentication
router.use(apiAuthHandler);

router.route('/').get(getRentals).post(createRental);

router.route('/stats/summary').get(getRentalStats);

router.route('/:id').get(getRental).put(updateRental).delete(deleteRental);

module.exports = router;
