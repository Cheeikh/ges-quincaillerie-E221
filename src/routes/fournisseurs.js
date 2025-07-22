const express = require('express');
const { body } = require('express-validator');
const {
  createFournisseur,
  getFournisseurs,
  getFournisseurById,
  updateFournisseur,
  archiveFournisseur,
  unarchiveFournisseur
} = require('../controllers/fournisseurController');
const { authenticate, isGestionnaire } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, isGestionnaire, [
  body('numero').notEmpty().withMessage('Le numéro est requis'),
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('adresse').notEmpty().withMessage('L\'adresse est requise'),
  body('telephone').optional().isString(),
  body('email').optional().isEmail().withMessage('Email invalide')
], createFournisseur);

router.get('/', authenticate, getFournisseurs);
router.get('/:id', authenticate, getFournisseurById);

router.put('/:id', authenticate, isGestionnaire, [
  body('numero').optional().notEmpty().withMessage('Le numéro ne peut pas être vide'),
  body('nom').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('adresse').optional().notEmpty().withMessage('L\'adresse ne peut pas être vide'),
  body('telephone').optional().isString(),
  body('email').optional().isEmail().withMessage('Email invalide')
], updateFournisseur);

router.patch('/:id/archive', authenticate, isGestionnaire, archiveFournisseur);
router.patch('/:id/unarchive', authenticate, isGestionnaire, unarchiveFournisseur);

module.exports = router;