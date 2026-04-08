const express = require('express');
const tagController = require('../controllers/tagController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

/**
 * @openapi
 * /api/tags:
 *   get:
 *     summary: List tags
 *     tags:
 *       - Tags
 *     responses:
 *       200:
 *         description: Tag list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tag'
 */
router.get('/', tagController.listTags);

/**
 * @openapi
 * /api/tags:
 *   post:
 *     summary: Create a tag
 *     tags:
 *       - Tags
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tag created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Tag'
 */
router.post('/', requireAuth, requireAdmin, tagController.createTag);

/**
 * @openapi
 * /api/tags/{tagId}:
 *   put:
 *     summary: Update a tag
 *     tags:
 *       - Tags
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tag updated
 */
router.put('/:tagId', requireAuth, requireAdmin, tagController.updateTag);

/**
 * @openapi
 * /api/tags/{tagId}:
 *   delete:
 *     summary: Delete a tag
 *     tags:
 *       - Tags
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Tag deleted
 */
router.delete('/:tagId', requireAuth, requireAdmin, tagController.deleteTag);

module.exports = router;
