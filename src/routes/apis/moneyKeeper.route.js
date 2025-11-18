const express = require('express');
const router = express.Router();
const moneyKeeperController = require('../../controllers/moneyKeeper.controller');
const { apiAuthHandler } = require('../../middleware/authHandler');

/**
 * @swagger
 * tags:
 *   name: Money Keeper
 *   description: Money Keeper configuration and integration APIs
 */

// All routes require authentication
router.use(apiAuthHandler);

/**
 * @swagger
 * /api/money-keeper/validate:
 *   post:
 *     summary: 🔐 Xác thực tài khoản Money Keeper và lấy danh sách ví
 *     description: Xác thực thông tin đăng nhập Money Keeper và trả về danh sách ví nếu hợp lệ
 *     tags: [Money Keeper]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Money Keeper username/email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: Money Keeper password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Xác thực thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Xác thực thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     validated:
 *                       type: boolean
 *                       example: true
 *                     wallets:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Thiếu thông tin đăng nhập
 *       401:
 *         description: Thông tin đăng nhập không hợp lệ
 */
router.post('/validate', moneyKeeperController.validateAndFetchWallets);

/**
 * @swagger
 * /api/money-keeper/config:
 *   post:
 *     summary: 💾 Lưu cấu hình Money Keeper
 *     description: Lưu thông tin cấu hình Money Keeper cho người dùng
 *     tags: [Money Keeper]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Money Keeper username/email
 *               password:
 *                 type: string
 *                 description: Money Keeper password
 *               selectedWallets:
 *                 type: array
 *                 description: Danh sách ví đã chọn
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Lưu cấu hình thành công
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       401:
 *         description: Thông tin đăng nhập không hợp lệ
 *   get:
 *     summary: 📋 Lấy cấu hình Money Keeper
 *     description: Lấy thông tin cấu hình Money Keeper hiện tại của người dùng
 *     tags: [Money Keeper]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy cấu hình thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     configured:
 *                       type: boolean
 *                     username:
 *                       type: string
 *                     lastValidated:
 *                       type: string
 *                       format: date-time
 */
router.get('/config', moneyKeeperController.getConfig);
router.post('/config', moneyKeeperController.saveConfig);

module.exports = router;
