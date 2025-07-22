const express = require('express');
const { body } = require('express-validator');
const {
  createProduit,
  getProduits,
  getProduitById,
  updateProduit,
  archiveProduit,
  unarchiveProduit
} = require('../controllers/produitController');
const { authenticate, isGestionnaire } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Produit:
 *       type: object
 *       required:
 *         - code
 *         - designation
 *         - quantiteStock
 *         - prixUnitaire
 *         - sousCategorieId
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique du produit
 *         code:
 *           type: string
 *           description: Code du produit
 *         designation:
 *           type: string
 *           description: Désignation du produit
 *         quantiteStock:
 *           type: integer
 *           minimum: 0
 *           description: Quantité en stock
 *         prixUnitaire:
 *           type: number
 *           minimum: 0
 *           description: Prix unitaire
 *         image:
 *           type: string
 *           description: URL de l'image du produit
 *         isArchived:
 *           type: boolean
 *           description: Statut d'archivage
 *         sousCategorieId:
 *           type: string
 *           description: ID de la sous-catégorie
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /produits:
 *   post:
 *     summary: Créer un nouveau produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - designation
 *               - quantiteStock
 *               - prixUnitaire
 *               - sousCategorieId
 *             properties:
 *               code:
 *                 type: string
 *               designation:
 *                 type: string
 *               quantiteStock:
 *                 type: integer
 *                 minimum: 0
 *               prixUnitaire:
 *                 type: number
 *                 minimum: 0
 *               sousCategorieId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Produit créé avec succès
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
 *                   example: 'Produit créé avec succès'
 *                 data:
 *                   $ref: '#/components/schemas/Produit'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/', authenticate, isGestionnaire, upload.single('image'), handleUploadError, [
  body('code').notEmpty().withMessage('Le code est requis'),
  body('designation').notEmpty().withMessage('La désignation est requise'),
  body('quantiteStock').isInt({ min: 0 }).withMessage('Quantité en stock invalide'),
  body('prixUnitaire').isFloat({ min: 0 }).withMessage('Prix unitaire invalide'),
  body('sousCategorieId').notEmpty().withMessage('ID sous-catégorie requis')
], createProduit);

/**
 * @swagger
 * /produits:
 *   get:
 *     summary: Récupérer tous les produits
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: archived
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut d'archivage
 *       - in: query
 *         name: sousCategorieId
 *         schema:
 *           type: string
 *         description: Filtrer par sous-catégorie
 *     responses:
 *       200:
 *         description: Liste des produits récupérée avec succès
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
 *                     $ref: '#/components/schemas/Produit'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', authenticate, getProduits);

/**
 * @swagger
 * /produits/{id}:
 *   get:
 *     summary: Récupérer un produit par ID
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Produit récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Produit'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Produit non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Produit non trouvé'
 */
router.get('/:id', authenticate, getProduitById);

/**
 * @swagger
 * /produits/{id}:
 *   put:
 *     summary: Mettre à jour un produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               designation:
 *                 type: string
 *               quantiteStock:
 *                 type: integer
 *                 minimum: 0
 *               prixUnitaire:
 *                 type: number
 *                 minimum: 0
 *               sousCategorieId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Produit mis à jour avec succès
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
 *                   example: 'Produit mis à jour avec succès'
 *                 data:
 *                   $ref: '#/components/schemas/Produit'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Produit non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Produit non trouvé'
 */
router.put('/:id', authenticate, isGestionnaire, upload.single('image'), handleUploadError, [
  body('code').optional().notEmpty().withMessage('Le code ne peut pas être vide'),
  body('designation').optional().notEmpty().withMessage('La désignation ne peut pas être vide'),
  body('quantiteStock').optional().isInt({ min: 0 }).withMessage('Quantité en stock invalide'),
  body('prixUnitaire').optional().isFloat({ min: 0 }).withMessage('Prix unitaire invalide'),
  body('sousCategorieId').optional().notEmpty().withMessage('ID sous-catégorie requis')
], updateProduit);

/**
 * @swagger
 * /produits/{id}/archive:
 *   patch:
 *     summary: Archiver un produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Produit archivé avec succès
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
 *                   example: 'Produit archivé avec succès'
 *                 data:
 *                   $ref: '#/components/schemas/Produit'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Produit non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Produit non trouvé'
 */
router.patch('/:id/archive', authenticate, isGestionnaire, archiveProduit);

/**
 * @swagger
 * /produits/{id}/unarchive:
 *   patch:
 *     summary: Désarchiver un produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Produit désarchivé avec succès
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
 *                   example: 'Produit désarchivé avec succès'
 *                 data:
 *                   $ref: '#/components/schemas/Produit'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Produit non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: 'Produit non trouvé'
 */
router.patch('/:id/unarchive', authenticate, isGestionnaire, unarchiveProduit);

module.exports = router;