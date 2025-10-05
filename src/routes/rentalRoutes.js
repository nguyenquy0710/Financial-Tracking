const express = require('express');
const router = express.Router();
const {
  getRentals,
  getRental,
  createRental,
  updateRental,
  deleteRental,
  getRentalStats
} = require('../controllers/rentalController');
const auth = require('../middleware/auth');

router.use(auth);

router.route('/').get(getRentals).post(createRental);

router.route('/stats/summary').get(getRentalStats);

router.route('/:id').get(getRental).put(updateRental).delete(deleteRental);

module.exports = router;
