const express = require('express');
const router = express.Router();
const goalController = require('../../controllers/goalController');
const auth = require('../../middleware/auth');
const { goalValidation } = require('../../middleware/validator');

/**
 * @swagger
 * tags:
 *   name: Goals
 *   description: Financial goal management and tracking
 */

router.use(auth);

/**
 * @swagger
 * /api/goals:
 *   get:
 *     summary: Get all financial goals for the authenticated user
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, cancelled]
 *         description: Filter by goal status
 *     responses:
 *       200:
 *         description: Goals retrieved successfully
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
 *                     $ref: '#/components/schemas/Goal'
 */
router.get('/', goalController.getGoals);

/**
 * @swagger
 * /api/goals/summary:
 *   get:
 *     summary: Get summary of all goals
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Goals summary retrieved successfully
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
 *                     totalGoals:
 *                       type: integer
 *                     activeGoals:
 *                       type: integer
 *                     completedGoals:
 *                       type: integer
 *                     totalTargetAmount:
 *                       type: number
 *                     totalCurrentAmount:
 *                       type: number
 *                     averageProgress:
 *                       type: number
 */
router.get('/summary', goalController.getGoalsSummary);

/**
 * @swagger
 * /api/goals/{id}:
 *   get:
 *     summary: Get a specific goal by ID
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     responses:
 *       200:
 *         description: Goal retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 *       404:
 *         description: Goal not found
 */
router.get('/:id', goalController.getGoal);

/**
 * @swagger
 * /api/goals:
 *   post:
 *     summary: Create a new financial goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - targetAmount
 *               - deadline
 *             properties:
 *               name:
 *                 type: string
 *                 example: Emergency Fund
 *               targetAmount:
 *                 type: number
 *                 example: 50000000
 *               currentAmount:
 *                 type: number
 *                 example: 5000000
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-31T23:59:59Z
 *               description:
 *                 type: string
 *                 example: Save for 6 months of expenses
 *     responses:
 *       201:
 *         description: Goal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 */
router.post('/', goalValidation.create, goalController.createGoal);

/**
 * @swagger
 * /api/goals/{id}:
 *   put:
 *     summary: Update a goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *               currentAmount:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [active, completed, cancelled]
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Goal updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 */
router.put('/:id', goalValidation.update, goalController.updateGoal);

/**
 * @swagger
 * /api/goals/{id}:
 *   delete:
 *     summary: Delete a goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     responses:
 *       200:
 *         description: Goal deleted successfully
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
 *                   example: Goal deleted successfully
 */
router.delete('/:id', goalController.deleteGoal);

/**
 * @swagger
 * /api/goals/{id}/contribute:
 *   post:
 *     summary: Add a contribution to a goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000000
 *               note:
 *                 type: string
 *                 example: Monthly contribution
 *     responses:
 *       200:
 *         description: Contribution added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 */
router.post('/:id/contribute', goalController.addContribution);

module.exports = router;
