const express = require('express');
const { body } = require('express-validator');
const {
  createCommande,
  getCommandes,
  getCommandeById,
  marquerLivree,
  annulerCommande,
  getStatistiques
} = require('../controllers/commandeController');
const { 
  authenticate, 
  isResponsableAchat, 
  isGestionnaireOrResponsableAchat 
} = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Commande:
 *       type: object
 *       required:
 *         - fournisseur
 *         - articles
 *         - dateLivraisonPrevue
 *       properties:
 *         _id:
 *           type: string
 *         numero:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         fournisseur:
 *           type: string
 *         articles:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               produit:
 *                 type: string
 *               quantite:
 *                 type: number
 *               prixAchat:
 *                 type: number
 *               sousTotal:
 *                 type: number
 *         montant:
 *           type: number
 *         dateLivraisonPrevue:
 *           type: string
 *           format: date
 *         dateLivraisonReelle:
 *           type: string
 *           format: date
 *         statut:
 *           type: string
 *           enum: [en_cours, livre, paye, annule]
 *         responsableAchat:
 *           type: string
 */

/**
 * @swagger
 * /commandes:
 *   post:
 *     summary: Créer une nouvelle commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fournisseur
 *               - articles
 *               - dateLivraisonPrevue
 *             properties:
 *               fournisseur:
 *                 type: string
 *                 description: ID du fournisseur
 *               articles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     produit:
 *                       type: string
 *                     quantite:
 *                       type: number
 *                       minimum: 1
 *                     prixAchat:
 *                       type: number
 *                       minimum: 0
 *               dateLivraisonPrevue:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Commande créée avec succès
 */
router.post('/', authenticate, isResponsableAchat, [
  body('fournisseur').isMongoId().withMessage('ID fournisseur invalide'),
  body('articles').isArray({ min: 1 }).withMessage('Au moins un article est requis'),
  body('articles.*.produit').isMongoId().withMessage('ID produit invalide'),
  body('articles.*.quantite').isInt({ min: 1 }).withMessage('Quantité invalide'),
  body('articles.*.prixAchat').isFloat({ min: 0 }).withMessage('Prix d\'achat invalide'),
  body('dateLivraisonPrevue').isISO8601().withMessage('Date de livraison invalide')
], createCommande);

/**
 * @swagger
 * /commandes:
 *   get:
 *     summary: Obtenir toutes les commandes
 *     tags: [Commandes]
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
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [en_cours, livre, paye, annule]
 *       - in: query
 *         name: fournisseur
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
 *     responses:
 *       200:
 *         description: Liste des commandes
 */
router.get('/', authenticate, isGestionnaireOrResponsableAchat, getCommandes);

/**
 * @swagger
 * /commandes/statistiques:
 *   get:
 *     summary: Obtenir les statistiques des commandes
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques des commandes
 */
router.get('/statistiques', authenticate, getStatistiques);

/**
 * @swagger
 * /commandes/{id}:
 *   get:
 *     summary: Obtenir une commande par ID
 *     tags: [Commandes]
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
 *         description: Détails de la commande
 *       404:
 *         description: Commande non trouvée
 */
router.get('/:id', authenticate, isGestionnaireOrResponsableAchat, getCommandeById);

/**
 * @swagger
 * /commandes/{id}:
 *   put:
 *     summary: Mettre à jour une commande
 *     tags: [Commandes]
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
 *             properties:
 *               articles:
 *                 type: array
 *               dateLivraisonPrevue:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Commande mise à jour avec succès
 */
// Route de mise à jour supprimée - les commandes ne peuvent pas être modifiées après création

/**
 * @swagger
 * /commandes/{id}/livrer:
 *   patch:
 *     summary: Marquer une commande comme livrée
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dateLivraisonReelle:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Commande marquée comme livrée
 */
router.patch('/:id/livrer', authenticate, isGestionnaireOrResponsableAchat, [
  body('dateLivraisonReelle').optional().isISO8601().withMessage('Date de livraison invalide')
], marquerLivree);

/**
 * @swagger
 * /commandes/{id}/annuler:
 *   patch:
 *     summary: Annuler une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motif:
 *                 type: string
 *     responses:
 *       200:
 *         description: Commande annulée avec succès
 */
router.patch('/:id/annuler', authenticate, isResponsableAchat, [
  body('motif').optional().isString().withMessage('Le motif doit être une chaîne de caractères')
], annulerCommande);

module.exports = router;