const express = require('express');
const router = express.Router();
const {
  getRentalProperties,
  getRentalProperty,
  getRentalPropertyDetails,
  createRentalProperty,
  updateRentalProperty,
  deleteRentalProperty,
  deactivateRentalProperty,
} = require('../../controllers/rental-property.controller');
const { apiAuthHandler } = require('../../middleware/authHandler');

/**
 * @swagger
 * tags:
 *  name: Rental Properties
 *  description: API for managing rental properties
 */

// All routes require authentication
router.use(apiAuthHandler);

router.route('/').get(getRentalProperties).post(createRentalProperty);

router.route('/:id').get(getRentalProperty).put(updateRentalProperty).delete(deleteRentalProperty);

router.route('/:id/details').get(getRentalPropertyDetails);

router.route('/:id/deactivate').put(deactivateRentalProperty);

module.exports = router;
