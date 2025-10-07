const express = require('express');
const router = express.Router();
const systemConfigController = require('../controllers/systemConfigController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: SystemConfig
 *   description: System configuration management
 */

/**
 * @swagger
 * /api/system-config:
 *   get:
 *     summary: 🔧 Lấy cấu hình hệ thống
 *     description: Lấy các cấu hình hệ thống của người dùng hiện tại
 *     tags: [SystemConfig]
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
 *                     misa:
 *                       type: object
 *                       properties:
 *                         username:
 *                           type: string
 *                           example: user@example.com
 *                         isConfigured:
 *                           type: boolean
 *                           example: true
 *                         lastValidated:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, systemConfigController.getSystemConfig);

/**
 * @swagger
 * /api/system-config/misa:
 *   post:
 *     summary: 💾 Lưu cấu hình MISA
 *     description: Lưu thông tin đăng nhập MISA Money Keeper. API sẽ tự động kiểm tra tính hợp lệ của thông tin đăng nhập.
 *     tags: [SystemConfig]
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
 *                 description: Email/Username đăng nhập MISA
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: Mật khẩu MISA
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Lưu cấu hình thành công
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
 *                   example: Cấu hình MISA đã được lưu thành công
 *                 data:
 *                   type: object
 *       400:
 *         description: Thông tin không hợp lệ hoặc đăng nhập MISA thất bại
 *       401:
 *         description: Unauthorized
 */
router.post('/misa', auth, systemConfigController.saveMisaConfig);

/**
 * @swagger
 * /api/system-config/misa/test:
 *   post:
 *     summary: ✅ Kiểm tra thông tin đăng nhập MISA
 *     description: Kiểm tra tính hợp lệ của thông tin đăng nhập MISA mà không lưu vào database
 *     tags: [SystemConfig]
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
 *                 description: Email/Username đăng nhập MISA
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 description: Mật khẩu MISA
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Thông tin đăng nhập hợp lệ
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
 *                   example: Thông tin đăng nhập MISA hợp lệ
 *                 valid:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Thông tin đăng nhập không hợp lệ
 *       401:
 *         description: Unauthorized
 */
router.post('/misa/test', auth, systemConfigController.testMisaConfig);

/**
 * @swagger
 * /api/system-config/misa:
 *   delete:
 *     summary: 🗑️ Xóa cấu hình MISA
 *     description: Xóa thông tin đăng nhập MISA đã lưu
 *     tags: [SystemConfig]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Xóa cấu hình thành công
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
 *                   example: Đã xóa cấu hình MISA
 *       404:
 *         description: Không tìm thấy cấu hình MISA
 *       401:
 *         description: Unauthorized
 */
router.delete('/misa', auth, systemConfigController.deleteMisaConfig);

module.exports = router;
