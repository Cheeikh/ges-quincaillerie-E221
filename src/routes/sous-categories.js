const express = require('express');
const { body } = require('express-validator');
const {
  createSousCategorie,
  getSousCategories,
  getSousCategorieById,
  updateSousCategorie,
  archiveSousCategorie,
  unarchiveSousCategorie,
  deleteSousCategorie
} = require('../controllers/sousCategorieController');
const { authenticate, isGestionnaire } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, isGestionnaire, [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('categorieId').notEmpty().withMessage('ID catégorie requis'),
  body('description').optional().isString()
], createSousCategorie);

router.get('/', authenticate, getSousCategories);
router.get('/:id', authenticate, getSousCategorieById);

router.put('/:id', authenticate, isGestionnaire, [
  body('nom').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('categorieId').optional().notEmpty().withMessage('ID catégorie requis'),
  body('description').optional().isString()
], updateSousCategorie);

router.patch('/:id/archive', authenticate, isGestionnaire, archiveSousCategorie);
router.patch('/:id/unarchive', authenticate, isGestionnaire, unarchiveSousCategorie);
router.delete('/:id', authenticate, isGestionnaire, deleteSousCategorie);

module.exports = router;