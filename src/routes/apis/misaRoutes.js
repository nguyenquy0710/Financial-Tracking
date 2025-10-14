const express = require('express');
const router = express.Router();
const misaController = require('../../controllers/misaController');
const auth = require('../../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: MISA
 *   description: MISA Money Keeper API integration
 */

/**
 * @swagger
 * /api/misa/login:
 *   post:
 *     summary: 🔐 Đăng nhập vào MISA Money Keeper
 *     description: Đăng nhập vào MISA Money Keeper để lấy token xác thực cho các API khác.
 *     tags: [MISA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - UserName
 *               - Password
 *             properties:
 *               UserName:
 *                 type: string
 *                 description: Email/Username đăng nhập MISA
 *                 example: username@gmail.com
 *               Password:
 *                 type: string
 *                 description: Mật khẩu MISA
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   description: Dữ liệu trả về từ MISA API, bao gồm token
 *       400:
 *         description: Thiếu thông tin đăng nhập
 *       401:
 *         description: Thông tin đăng nhập không hợp lệ
 */
router.post('/login', auth, misaController.loginForWeb);

/**
 * @swagger
 * /api/misa/users:
 *   get:
 *     summary: 👤 Lấy thông tin người dùng MISA
 *     description: Lấy thông tin chi tiết người dùng từ MISA Money Keeper.
 *     tags: [MISA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - misaToken
 *             properties:
 *               misaToken:
 *                 type: string
 *                 description: Token từ MISA sau khi đăng nhập
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
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
 *                   example: User information retrieved successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Thiếu MISA token
 *       401:
 *         description: Token không hợp lệ hoặc hết hạn
 */
router.get('/users', auth, misaController.getUsers);

/**
 * @swagger
 * /api/misa/wallets/accounts:
 *   post:
 *     summary: 💰 Lấy danh sách ví/tài khoản
 *     description: Lấy danh sách các ví và tài khoản từ MISA Money Keeper.
 *     tags: [MISA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - misaToken
 *             properties:
 *               misaToken:
 *                 type: string
 *                 description: Token từ MISA sau khi đăng nhập
 *               searchText:
 *                 type: string
 *                 description: Tìm kiếm theo tên ví/tài khoản
 *                 default: ""
 *               walletType:
 *                 type: number
 *                 nullable: true
 *                 description: Loại ví (null = tất cả)
 *               inActive:
 *                 type: boolean
 *                 nullable: true
 *                 description: Lọc theo trạng thái hoạt động
 *               excludeReport:
 *                 type: boolean
 *                 nullable: true
 *                 description: Loại trừ báo cáo
 *               skip:
 *                 type: integer
 *                 description: Số bản ghi bỏ qua (phân trang)
 *                 default: 0
 *               take:
 *                 type: integer
 *                 description: Số bản ghi lấy về
 *                 default: 10
 *     responses:
 *       200:
 *         description: Lấy danh sách ví thành công
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
 *                   example: Wallet accounts retrieved successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Thiếu MISA token
 *       401:
 *         description: Token không hợp lệ
 */
router.post('/wallets/accounts', auth, misaController.getWalletAccounts);

/**
 * @swagger
 * /api/misa/wallets/summary:
 *   post:
 *     summary: 📊 Lấy tổng quan ví/tài khoản
 *     description: Lấy thông tin tổng quan về các ví và tài khoản từ MISA Money Keeper.
 *     tags: [MISA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - misaToken
 *             properties:
 *               misaToken:
 *                 type: string
 *                 description: Token từ MISA sau khi đăng nhập
 *               searchText:
 *                 type: string
 *                 description: Tìm kiếm theo tên ví/tài khoản
 *                 default: ""
 *               walletType:
 *                 type: number
 *                 nullable: true
 *                 description: Loại ví (null = tất cả)
 *               inActive:
 *                 type: boolean
 *                 nullable: true
 *                 description: Lọc theo trạng thái hoạt động
 *               excludeReport:
 *                 type: boolean
 *                 nullable: true
 *                 description: Loại trừ báo cáo
 *     responses:
 *       200:
 *         description: Lấy tổng quan thành công
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
 *                   example: Wallet account summary retrieved successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Thiếu MISA token
 *       401:
 *         description: Token không hợp lệ
 */
router.post('/wallets/summary', auth, misaController.getWalletAccountSummary);

/**
 * @swagger
 * /api/misa/transactions/addresses:
 *   get:
 *     summary: 📍 Lấy danh sách địa chỉ giao dịch
 *     description: Lấy danh sách các địa chỉ giao dịch từ MISA Money Keeper.
 *     tags: [MISA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - misaToken
 *             properties:
 *               misaToken:
 *                 type: string
 *                 description: Token từ MISA sau khi đăng nhập
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Lấy danh sách địa chỉ thành công
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
 *                   example: Transaction addresses retrieved successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Thiếu MISA token
 *       401:
 *         description: Token không hợp lệ
 */
router.get('/transactions/addresses', auth, misaController.getTransactionAddresses);

/**
 * @swagger
 * /api/misa/transactions/search:
 *   post:
 *     summary: 🔍 Tìm kiếm giao dịch thu/chi
 *     description: Tìm kiếm và lấy danh sách các giao dịch thu nhập và chi tiêu từ MISA Money Keeper.
 *     tags: [MISA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - misaToken
 *             properties:
 *               misaToken:
 *                 type: string
 *                 description: Token từ MISA sau khi đăng nhập
 *               fromDate:
 *                 type: string
 *                 format: date
 *                 description: Từ ngày (ISO 8601)
 *                 example: "2024-01-01"
 *               toDate:
 *                 type: string
 *                 format: date
 *                 description: Đến ngày (ISO 8601)
 *                 example: "2024-01-31"
 *               transactionType:
 *                 type: integer
 *                 nullable: true
 *                 description: Loại giao dịch (0 = chi tiêu, 1 = thu nhập, null = tất cả)
 *                 example: null
 *               searchText:
 *                 type: string
 *                 description: Tìm kiếm theo nội dung giao dịch
 *                 default: ""
 *               walletAccountIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *                 description: Danh sách ID ví/tài khoản
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 nullable: true
 *                 description: Danh sách ID danh mục
 *               skip:
 *                 type: integer
 *                 description: Số bản ghi bỏ qua (phân trang)
 *                 default: 0
 *               take:
 *                 type: integer
 *                 description: Số bản ghi lấy về
 *                 default: 20
 *     responses:
 *       200:
 *         description: Tìm kiếm giao dịch thành công
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
 *                   example: Transactions retrieved successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Thiếu MISA token
 *       401:
 *         description: Token không hợp lệ
 */
router.post('/transactions/search', auth, misaController.searchTransactions);

/**
 * @swagger
 * /api/misa/transactions/import/income:
 *   post:
 *     summary: 💰 Import giao dịch thu nhập vào hệ thống
 *     description: Import các giao dịch thu nhập từ MISA Money Keeper vào bảng Salary của FinTrack.
 *     tags: [MISA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - misaToken
 *               - transactions
 *             properties:
 *               misaToken:
 *                 type: string
 *                 description: Token từ MISA sau khi đăng nhập
 *               transactions:
 *                 type: array
 *                 description: Danh sách giao dịch thu nhập cần import
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID giao dịch từ MISA
 *                     transactionDate:
 *                       type: string
 *                       format: date
 *                       description: Ngày giao dịch
 *                     amount:
 *                       type: number
 *                       description: Số tiền
 *                     note:
 *                       type: string
 *                       description: Ghi chú
 *     responses:
 *       200:
 *         description: Import thành công
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
 *                   example: Imported 5 income transactions
 *                 data:
 *                   type: object
 *                   properties:
 *                     imported:
 *                       type: array
 *                       items:
 *                         type: object
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       401:
 *         description: Token không hợp lệ
 */
router.post('/transactions/import/income', auth, misaController.importIncomeTransactions);

/**
 * @swagger
 * /api/misa/transactions/import/expense:
 *   post:
 *     summary: 💸 Import giao dịch chi tiêu vào hệ thống
 *     description: Import các giao dịch chi tiêu từ MISA Money Keeper vào bảng Expense của FinTrack.
 *     tags: [MISA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - misaToken
 *               - transactions
 *             properties:
 *               misaToken:
 *                 type: string
 *                 description: Token từ MISA sau khi đăng nhập
 *               transactions:
 *                 type: array
 *                 description: Danh sách giao dịch chi tiêu cần import
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID giao dịch từ MISA
 *                     transactionDate:
 *                       type: string
 *                       format: date
 *                       description: Ngày giao dịch
 *                     amount:
 *                       type: number
 *                       description: Số tiền
 *                     category:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           description: Tên danh mục
 *                     note:
 *                       type: string
 *                       description: Ghi chú
 *     responses:
 *       200:
 *         description: Import thành công
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
 *                   example: Imported 10 expense transactions
 *                 data:
 *                   type: object
 *                   properties:
 *                     imported:
 *                       type: array
 *                       items:
 *                         type: object
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       401:
 *         description: Token không hợp lệ
 */
router.post('/transactions/import/expense', auth, misaController.importExpenseTransactions);

module.exports = router;
