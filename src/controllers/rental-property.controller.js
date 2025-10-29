const { default: RentalProperty } = require("@/models/rental-property.model");
const { default: Rental } = require("@/models/rental.model");

/**
 * @desc    Get all rental properties for a user
 * @route   GET /api/rental-properties
 * @access  Private
 */
exports.getRentalProperties = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const query = { userId: req.user.id, isDeleted: { $ne: true } };

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const properties = await RentalProperty.find(query).sort({ isActive: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single rental property
 * @route   GET /api/rental-properties/:id
 * @access  Private
 */
exports.getRentalProperty = async (req, res, next) => {
  try {
    const property = await RentalProperty.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Rental property not found'
      });
    }

    // Check ownership
    if (property.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this property'
      });
    }

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get rental property with monthly records
 * @route   GET /api/rental-properties/:id/details
 * @access  Private
 */
exports.getRentalPropertyDetails = async (req, res, next) => {
  try {
    const property = await RentalProperty.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Rental property not found'
      });
    }

    // Check ownership
    if (property.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this property'
      });
    }

    // Get all monthly rental records for this property
    const monthlyRecords = await Rental.find({
      userId: req.user.id,
      propertyId: property._id
    }).sort({ month: -1 });

    // Calculate statistics
    const stats = {
      totalMonths: monthlyRecords.length,
      totalPaid: 0,
      totalUnpaid: 0,
      avgMonthlyRent: 0,
      totalElectricity: 0,
      totalWater: 0,
      totalOther: 0,
      grandTotal: 0
    };

    monthlyRecords.forEach(record => {
      const total = record.total || 0;
      stats.grandTotal += total;
      
      if (record.isPaid) {
        stats.totalPaid += total;
      } else {
        stats.totalUnpaid += total;
      }

      stats.totalElectricity += record.electricity?.amount || 0;
      stats.totalWater += record.water?.amount || 0;
      stats.totalOther += (record.internet || 0) + (record.parking || 0) + (record.garbage || 0);
    });

    if (monthlyRecords.length > 0) {
      stats.avgMonthlyRent = stats.grandTotal / monthlyRecords.length;
    }

    res.status(200).json({
      success: true,
      data: {
        property,
        monthlyRecords,
        statistics: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create rental property
 * @route   POST /api/rental-properties
 * @access  Private
 */
exports.createRentalProperty = async (req, res, next) => {
  try {
    // Only allow specific fields for creation
    const allowedFields = [
      'roomCode', 'propertyName', 'address', 'rentAmount',
      'initialElectricityReading', 'electricityRate',
      'initialWaterReading', 'waterRate',
      'internetFee', 'parkingFee', 'garbageFee',
      'startDate', 'notes'
    ];

    const propertyData = { 
      userId: req.user.id,
      createdBy: req.user._id 
    };

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        propertyData[field] = req.body[field];
      }
    });
    
    const property = await RentalProperty.create(propertyData);

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update rental property
 * @route   PUT /api/rental-properties/:id
 * @access  Private
 */
exports.updateRentalProperty = async (req, res, next) => {
  try {
    let property = await RentalProperty.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Rental property not found'
      });
    }

    // Check ownership
    if (property.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    // Only update allowed fields
    const allowedUpdates = [
      'roomCode', 'propertyName', 'address', 'rentAmount',
      'initialElectricityReading', 'electricityRate',
      'initialWaterReading', 'waterRate',
      'internetFee', 'parkingFee', 'garbageFee',
      'startDate', 'endDate', 'isActive', 'notes'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    updates.updatedBy = req.user._id;
    
    property = await RentalProperty.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete rental property
 * @route   DELETE /api/rental-properties/:id
 * @access  Private
 */
exports.deleteRentalProperty = async (req, res, next) => {
  try {
    const property = await RentalProperty.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Rental property not found'
      });
    }

    // Check ownership
    if (property.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property'
      });
    }

    // Soft delete
    property.isDeleted = true;
    property.isActive = false;
    await property.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deactivate rental property (stop renting)
 * @route   PUT /api/rental-properties/:id/deactivate
 * @access  Private
 */
exports.deactivateRentalProperty = async (req, res, next) => {
  try {
    const property = await RentalProperty.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Rental property not found'
      });
    }

    // Check ownership
    if (property.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property'
      });
    }

    property.isActive = false;
    if (req.body.endDate) {
      property.endDate = new Date(req.body.endDate);
    } else {
      property.endDate = new Date();
    }
    
    await property.save();

    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    next(error);
  }
};
