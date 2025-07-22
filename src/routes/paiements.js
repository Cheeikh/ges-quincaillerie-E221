const express = require('express');
const { body } = require('express-validator');
const {
  createPaiement,
  getPaiements,
  getHistoriqueVersements,
  getCommandesEnCours,
  getDetteParFournisseur
} = require('../controllers/paiementController');
const { 
  authenticate, 
  isResponsablePaiement, 
  isGestionnaireOrResponsablePaiement 
} = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /paiements:
 *   post:
 *     summary: Enregistrer un paiement
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commande
 *               - montant
 *               - numeroVersement
 *             properties:
 *               commande:
 *                 type: string
 *               montant:
 *                 type: number
 *                 minimum: 0
 *               numeroVersement:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 3
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paiement enregistré avec succès
 */
router.post('/', authenticate, isResponsablePaiement, [
  body('commande').isMongoId().withMessage('ID commande invalide'),
  body('montant').isFloat({ min: 0 }).withMessage('Montant invalide'),
  body('numeroVersement').isInt({ min: 1, max: 3 }).withMessage('Numéro de versement invalide'),
  body('notes').optional().isString().withMessage('Les notes doivent être une chaîne de caractères')
], createPaiement);

/**
 * @swagger
 * /paiements:
 *   get:
 *     summary: Obtenir tous les paiements
 *     tags: [Paiements]
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
 *         name: commande
 *         schema:
 *           type: string
 *       - in: query
 *         name: dateDebut
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateFin
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fournisseur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des paiements
 */
router.get('/', authenticate, isGestionnaireOrResponsablePaiement, getPaiements);

/**
 * @swagger
 * /paiements/commandes-en-cours:
 *   get:
 *     summary: Obtenir les commandes en cours (livrées mais non entièrement payées)
 *     tags: [Paiements]
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
 *         name: fournisseur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des commandes en cours
 */
router.get('/commandes-en-cours', authenticate, isGestionnaireOrResponsablePaiement, getCommandesEnCours);

/**
 * @swagger
 * /paiements/dette-fournisseurs:
 *   get:
 *     summary: Obtenir la dette par fournisseur
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dette par fournisseur
 */
router.get('/dette-fournisseurs', authenticate, isGestionnaireOrResponsablePaiement, getDetteParFournisseur);

/**
 * @swagger
 * /paiements/historique/{commandeId}:
 *   get:
 *     summary: Obtenir l'historique des versements d'une commande
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commandeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historique des versements
 *       404:
 *         description: Commande non trouvée
 */
router.get('/historique/:commandeId', authenticate, isGestionnaireOrResponsablePaiement, getHistoriqueVersements);

module.exports = router;