const express = require('express');
const router = express.Router();
const externalController = require('../controllers/externalController');

/**
 * @swagger
 * tags:
 *   name: Externals
 *   description: External API integrations
 */

/**
 * @swagger
 * /api/externals/vietqr/banks:
 *   get:
 *     summary: 🏦 API danh sách ngân hàng
 *     description: Lấy danh sách các ngân hàng mà VietQR hỗ trợ để tạo mã QR thanh toán.
 *     tags: [Externals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Api trả về danh sách các ngân hàng mà VietQR hỗ trợ.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VietQrBank'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/vietqr/banks', externalController.getVietQrBanks);

module.exports = router;
