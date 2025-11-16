const { VietQR } = require('vietqr');
const { default: config } = require('../config/config');

// @desc    API danh sách ngân hàng
// @route   GET /api/externals/vietqr/banks
// @access  Private
exports.getVietQrBanks = async (req, res, next) => {
  try {
    const { bank, isActive, page = 1, limit = 20 } = req.query;

    let vietQR = new VietQR({
      clientID: config.externalAPIs.vietQR.clientID,
      apiKey: config.externalAPIs.vietQR.apiKey
    });

    // list banks are supported create QR code by Vietqr
    const getBanks = await vietQR.getBanks(),
      dataBanks = (getBanks?.data ?? []).filter(b => {
        if (bank && !b.name.toLowerCase().includes(bank.toLowerCase())) return false;
        if (isActive !== undefined && String(b.isActive) !== String(isActive)) return false;
        return true;
      });
    console.log('🚀 QuyNH: exports.getVietQrBanks -> dataBanks', dataBanks);

    // Filtering
    const total = dataBanks.length;

    res.status(200).json({
      success: getBanks?.code === '00',
      data: dataBanks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};
