import { apiAuthHandler } from "@/middleware/authHandler";

const express = require('express');
const moneyKeeperRoutes = express.Router();

const moneyKeeperController = require('../../controllers/moneyKeeper.controller');

/**
 * @swagger
 * tags:
 *   name: Money Keeper
 *   description: Money Keeper configuration and integration APIs
 */

// All routes require authentication
moneyKeeperRoutes.use(apiAuthHandler);

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
moneyKeeperRoutes.post('/validate', moneyKeeperController.validateAndFetchWallets);

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
moneyKeeperRoutes.get('/config', moneyKeeperController.getConfig);
moneyKeeperRoutes.post('/config', moneyKeeperController.saveConfig);

/**
 * @swagger
 * /api/money-keeper/sync/wallets:
 *   post:
 *     summary: 🔄 Đồng bộ ví từ Money Keeper
 *     description: Đồng bộ danh sách ví từ Money Keeper về database
 *     tags: [Money Keeper]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: Money Keeper password (optional if already configured)
 *     responses:
 *       200:
 *         description: Đồng bộ thành công
 *       400:
 *         description: Chưa cấu hình Money Keeper
 *       401:
 *         description: Đăng nhập thất bại
 */
moneyKeeperRoutes.post('/sync/wallets', moneyKeeperController.syncWallets);

/**
 * @swagger
 * /api/money-keeper/wallets:
 *   get:
 *     summary: 💰 Lấy danh sách ví đã đồng bộ
 *     description: Lấy danh sách ví từ database
 *     tags: [Money Keeper]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 */
moneyKeeperRoutes.get('/wallets', moneyKeeperController.getWallets);

/**
 * @swagger
 * /api/money-keeper/wallets/summary:
 *   get:
 *     summary: 📊 Lấy tổng hợp ví
 *     description: Lấy thống kê tổng hợp về các ví
 *     tags: [Money Keeper]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy tổng hợp thành công
 */
moneyKeeperRoutes.get('/wallets/summary', moneyKeeperController.getWalletSummary);

export default moneyKeeperRoutes;
