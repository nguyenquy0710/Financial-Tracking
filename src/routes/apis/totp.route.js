const express = require('express');
const router = express.Router();

const {
  getTotpAccounts,
  getTotpAccount,
  generateTotpCode,
  createTotpAccount,
  updateTotpAccount,
  deleteTotpAccount,
} = require('../../controllers/totp.controller');
const { apiAuthHandler } = require('../../middleware/authHandler');

/**
 * @swagger
 * tags:
 *  name: TOTP
 *  description: API for managing TOTP (Time-based One-Time Password) accounts
 */

// All routes require authentication
router.use(apiAuthHandler);

/**
 * @swagger
 * /api/totp:
 *   get:
 *     summary: Get all TOTP accounts
 *     tags: [TOTP]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of TOTP accounts
 *   post:
 *     summary: Create a new TOTP account
 *     tags: [TOTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceName
 *               - accountName
 *               - secret
 *             properties:
 *               serviceName:
 *                 type: string
 *               accountName:
 *                 type: string
 *               secret:
 *                 type: string
 *               issuer:
 *                 type: string
 *               algorithm:
 *                 type: string
 *                 enum: [SHA1, SHA256, SHA512]
 *               digits:
 *                 type: number
 *               period:
 *                 type: number
 *     responses:
 *       201:
 *         description: TOTP account created successfully
 */
router.route('/').get(getTotpAccounts).post(createTotpAccount);

/**
 * @swagger
 * /api/totp/{id}/generate:
 *   get:
 *     summary: Generate TOTP code for an account
 *     tags: [TOTP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: TOTP code generated successfully
 */
router.route('/:id/generate').get(generateTotpCode);

/**
 * @swagger
 * /api/totp/{id}:
 *   get:
 *     summary: Get a single TOTP account
 *     tags: [TOTP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: TOTP account details
 *   put:
 *     summary: Update a TOTP account
 *     tags: [TOTP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: TOTP account updated successfully
 *   delete:
 *     summary: Delete a TOTP account
 *     tags: [TOTP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: TOTP account deleted successfully
 */
router.route('/:id').get(getTotpAccount).put(updateTotpAccount).delete(deleteTotpAccount);

module.exports = router;
