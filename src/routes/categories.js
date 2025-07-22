const express = require('express');
const { body } = require('express-validator');
const {
  createCategorie,
  getCategories,
  getCategorieById,
  updateCategorie,
  toggleArchiveCategorie,
  deleteCategorie
} = require('../controllers/categorieController');
const { authenticate, isGestionnaire } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Créer une nouvelle catégorie
 *     tags: [Catégories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
 */
router.post('/', authenticate, isGestionnaire, [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('description').optional().isString()
], createCategorie);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Obtenir toutes les catégories
 *     tags: [Catégories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeArchived
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Liste des catégories
 */
router.get('/', authenticate, getCategories);

router.get('/:id', authenticate, getCategorieById);

router.put('/:id', authenticate, isGestionnaire, [
  body('nom').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('description').optional().isString()
], updateCategorie);

router.patch('/:id/archive', authenticate, isGestionnaire, toggleArchiveCategorie);

router.delete('/:id', authenticate, isGestionnaire, deleteCategorie);

module.exports = router;