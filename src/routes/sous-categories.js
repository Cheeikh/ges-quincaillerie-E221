const express = require('express');
const { body } = require('express-validator');
const {
  createSousCategorie,
  getSousCategories,
  getSousCategorieById,
  updateSousCategorie,
  toggleArchiveSousCategorie,
  deleteSousCategorie
} = require('../controllers/sousCategorieController');
const { authenticate, isGestionnaire } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, isGestionnaire, [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('categorie').isMongoId().withMessage('ID catégorie invalide'),
  body('description').optional().isString()
], createSousCategorie);

router.get('/', authenticate, getSousCategories);
router.get('/:id', authenticate, getSousCategorieById);

router.put('/:id', authenticate, isGestionnaire, [
  body('nom').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('categorie').optional().isMongoId().withMessage('ID catégorie invalide'),
  body('description').optional().isString()
], updateSousCategorie);

router.patch('/:id/archive', authenticate, isGestionnaire, toggleArchiveSousCategorie);
router.delete('/:id', authenticate, isGestionnaire, deleteSousCategorie);

module.exports = router;