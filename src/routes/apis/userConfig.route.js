const express = require('express');
const router = express.Router();
const userConfigController = require('../../controllers/userConfig.controller');
const { apiAuthHandler } = require('../../middleware/authHandler');

/**
 * @swagger
 * tags:
 *   name: UserConfig
 *   description: User configuration management
 */
router.use(apiAuthHandler);

/**
 * @swagger
 * /api/user-config:
 *   get:
 *     summary: 🔧 Lấy cấu hình người dùng
 *     description: Lấy các cấu hình người dùng của người dùng hiện tại
 *     tags: [UserConfig]
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
router.get('/', apiAuthHandler, userConfigController.getUserConfig);

/**
 * @swagger
 * /api/system-config/misa:
 *   post:
 *     summary: 💾 Lưu cấu hình MISA
 *     description: Lưu thông tin đăng nhập MISA Money Keeper. API sẽ tự động kiểm tra tính hợp lệ của thông tin đăng nhập.
 *     tags: [UserConfig]
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
router.post('/misa', apiAuthHandler, userConfigController.saveMisaConfig);

/**
 * @swagger
 * /api/system-config/misa/test:
 *   post:
 *     summary: ✅ Kiểm tra thông tin đăng nhập MISA
 *     description: Kiểm tra tính hợp lệ của thông tin đăng nhập MISA mà không lưu vào database
 *     tags: [UserConfig]
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
router.post('/misa/test', apiAuthHandler, userConfigController.testMisaConfig);

/**
 * @swagger
 * /api/system-config/misa:
 *   delete:
 *     summary: 🗑️ Xóa cấu hình MISA
 *     description: Xóa thông tin đăng nhập MISA đã lưu
 *     tags: [UserConfig]
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
router.delete('/misa', apiAuthHandler, userConfigController.deleteMisaConfig);

module.exports = router;
