const Rental = require('../models/Rental');

/**
 * @desc    Get all rentals for a user
 * @route   GET /api/rentals
 * @access  Private
 */
exports.getRentals = async (req, res, next) => {
  try {
    const { startDate, endDate, propertyName } = req.query;
    const query = { userId: req.user.id };

    if (startDate || endDate) {
      query.month = {};
      if (startDate) query.month.$gte = new Date(startDate);
      if (endDate) query.month.$lte = new Date(endDate);
    }

    if (propertyName) {
      query.propertyName = new RegExp(propertyName, 'i');
    }

    const rentals = await Rental.find(query).sort({ month: -1 });

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single rental
 * @route   GET /api/rentals/:id
 * @access  Private
 */
exports.getRental = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    // Check ownership
    if (rental.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this rental'
      });
    }

    res.status(200).json({
      success: true,
      data: rental
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create rental
 * @route   POST /api/rentals
 * @access  Private
 */
exports.createRental = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;
    const rental = await Rental.create(req.body);

    res.status(201).json({
      success: true,
      data: rental
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update rental
 * @route   PUT /api/rentals/:id
 * @access  Private
 */
exports.updateRental = async (req, res, next) => {
  try {
    let rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    // Check ownership
    if (rental.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this rental'
      });
    }

    rental = await Rental.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: rental
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete rental
 * @route   DELETE /api/rentals/:id
 * @access  Private
 */
exports.deleteRental = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental not found'
      });
    }

    // Check ownership
    if (rental.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this rental'
      });
    }

    await rental.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get rental statistics
 * @route   GET /api/rentals/stats/summary
 * @access  Private
 */
exports.getRentalStats = async (req, res, next) => {
  try {
    const stats = await Rental.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$propertyName',
          totalRent: { $sum: '$total' },
          avgRent: { $avg: '$total' },
          count: { $sum: 1 },
          avgElectricity: { $avg: '$electricity.amount' },
          avgWater: { $avg: '$water.amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
