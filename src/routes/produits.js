const express = require('express');
const { body } = require('express-validator');
const {
  createProduit,
  getProduits,
  getProduitById,
  updateProduit,
  toggleArchiveProduit
} = require('../controllers/produitController');
const { authenticate, isGestionnaire } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

router.post('/', authenticate, isGestionnaire, upload.single('image'), handleUploadError, [
  body('code').notEmpty().withMessage('Le code est requis'),
  body('designation').notEmpty().withMessage('La désignation est requise'),
  body('quantiteStock').isInt({ min: 0 }).withMessage('Quantité en stock invalide'),
  body('prixUnitaire').isFloat({ min: 0 }).withMessage('Prix unitaire invalide'),
  body('sousCategorie').isMongoId().withMessage('ID sous-catégorie invalide')
], createProduit);

router.get('/', authenticate, getProduits);
router.get('/:id', authenticate, getProduitById);

router.put('/:id', authenticate, isGestionnaire, upload.single('image'), handleUploadError, [
  body('code').optional().notEmpty().withMessage('Le code ne peut pas être vide'),
  body('designation').optional().notEmpty().withMessage('La désignation ne peut pas être vide'),
  body('quantiteStock').optional().isInt({ min: 0 }).withMessage('Quantité en stock invalide'),
  body('prixUnitaire').optional().isFloat({ min: 0 }).withMessage('Prix unitaire invalide'),
  body('sousCategorie').optional().isMongoId().withMessage('ID sous-catégorie invalide')
], updateProduit);

router.patch('/:id/archive', authenticate, isGestionnaire, toggleArchiveProduit);

module.exports = router;