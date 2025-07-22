/**
 * Documentation Swagger centralisée pour l'API Gestion Quincaillerie
 * Ce fichier contient toutes les définitions de schémas et réponses d'erreur
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - nom
 *         - prenom
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique de l'utilisateur
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse email de l'utilisateur
 *         nom:
 *           type: string
 *           description: Nom de famille
 *         prenom:
 *           type: string
 *           description: Prénom
 *         role:
 *           type: string
 *           enum: [GESTIONNAIRE, RESPONSABLE_ACHAT, RESPONSABLE_PAIEMENT]
 *           description: Rôle de l'utilisateur
 *         isActive:
 *           type: boolean
 *           description: Statut d'activation du compte
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
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
 *     
 *     Commande:
 *       type: object
 *       required:
 *         - fournisseur
 *         - articles
 *         - dateLivraisonPrevue
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique de la commande
 *         numero:
 *           type: string
 *           description: Numéro de commande
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         fournisseur:
 *           type: string
 *           description: ID du fournisseur
 *         articles:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               produit:
 *                 type: string
 *                 description: ID du produit
 *               quantite:
 *                 type: number
 *                 minimum: 1
 *                 description: Quantité commandée
 *               prixAchat:
 *                 type: number
 *                 minimum: 0
 *                 description: Prix d'achat unitaire
 *               sousTotal:
 *                 type: number
 *                 description: Sous-total pour cet article
 *         montant:
 *           type: number
 *           description: Montant total de la commande
 *         dateLivraisonPrevue:
 *           type: string
 *           format: date
 *           description: Date de livraison prévue
 *         dateLivraisonReelle:
 *           type: string
 *           format: date
 *           description: Date de livraison réelle
 *         statut:
 *           type: string
 *           enum: [EN_COURS, LIVRE, PAYE, ANNULE]
 *           description: Statut de la commande
 *         responsableAchat:
 *           type: string
 *           description: ID du responsable achat
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Fournisseur:
 *       type: object
 *       required:
 *         - nom
 *         - email
 *         - telephone
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique du fournisseur
 *         nom:
 *           type: string
 *           description: Nom du fournisseur
 *         email:
 *           type: string
 *           format: email
 *           description: Email du fournisseur
 *         telephone:
 *           type: string
 *           description: Téléphone du fournisseur
 *         adresse:
 *           type: string
 *           description: Adresse du fournisseur
 *         isArchived:
 *           type: boolean
 *           description: Statut d'archivage
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Categorie:
 *       type: object
 *       required:
 *         - nom
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique de la catégorie
 *         nom:
 *           type: string
 *           description: Nom de la catégorie
 *         description:
 *           type: string
 *           description: Description de la catégorie
 *         isArchived:
 *           type: boolean
 *           description: Statut d'archivage
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     SousCategorie:
 *       type: object
 *       required:
 *         - nom
 *         - categorieId
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique de la sous-catégorie
 *         nom:
 *           type: string
 *           description: Nom de la sous-catégorie
 *         description:
 *           type: string
 *           description: Description de la sous-catégorie
 *         categorieId:
 *           type: string
 *           description: ID de la catégorie parente
 *         isArchived:
 *           type: boolean
 *           description: Statut d'archivage
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     Paiement:
 *       type: object
 *       required:
 *         - commandeId
 *         - montant
 *         - methodePaiement
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique du paiement
 *         commandeId:
 *           type: string
 *           description: ID de la commande
 *         montant:
 *           type: number
 *           minimum: 0
 *           description: Montant du paiement
 *         methodePaiement:
 *           type: string
 *           enum: [VIREMENT, CHEQUE, ESPECES]
 *           description: Méthode de paiement
 *         datePaiement:
 *           type: string
 *           format: date-time
 *           description: Date du paiement
 *         reference:
 *           type: string
 *           description: Référence du paiement
 *         statut:
 *           type: string
 *           enum: [EN_ATTENTE, VALIDE, ANNULE]
 *           description: Statut du paiement
 *         responsablePaiement:
 *           type: string
 *           description: ID du responsable paiement
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *   
 *   responses:
 *     UnauthorizedError:
 *       description: Erreur d'authentification
 *       content:
 *         'application/json':
 *           schema:
 *             type: 'object'
 *             properties:
 *               success:
 *                 type: 'boolean'
 *                 example: false
 *               message:
 *                 type: 'string'
 *                 examples: [
 *                   'Accès refusé. Token manquant.',
 *                   'Token invalide ou utilisateur inactif.',
 *                   'Token invalide.',
 *                   'Utilisateur non authentifié.'
 *                 ]
 *     
 *     ForbiddenError:
 *       description: Erreur d'autorisation
 *       content:
 *         'application/json':
 *           schema:
 *             type: 'object'
 *             properties:
 *               success:
 *                 type: 'boolean'
 *                 example: false
 *               message:
 *                 type: 'string'
 *                 example: 'Accès refusé. Permissions insuffisantes.'
 *     
 *     ValidationError:
 *       description: Erreur de validation
 *       content:
 *         'application/json':
 *           schema:
 *             type: 'object'
 *             properties:
 *               success:
 *                 type: 'boolean'
 *                 example: false
 *               message:
 *                 type: 'string'
 *                 example: 'Données invalides'
 *               errors:
 *                 type: 'array'
 *                 items:
 *                   type: 'object'
 *                   properties:
 *                     field:
 *                       type: 'string'
 *                     message:
 *                       type: 'string'
 *     
 *     NotFoundError:
 *       description: Ressource non trouvée
 *       content:
 *         'application/json':
 *           schema:
 *             type: 'object'
 *             properties:
 *               success:
 *                 type: 'boolean'
 *                 example: false
 *               message:
 *                 type: 'string'
 *                 example: 'Ressource non trouvée'
 *     
 *     ConflictError:
 *       description: Conflit de données
 *       content:
 *         'application/json':
 *           schema:
 *             type: 'object'
 *             properties:
 *               success:
 *                 type: 'boolean'
 *                 example: false
 *               message:
 *                 type: 'string'
 *                 example: 'Conflit de données'
 *     
 *     ServerError:
 *       description: Erreur serveur
 *       content:
 *         'application/json':
 *           schema:
 *             type: 'object'
 *             properties:
 *               success:
 *                 type: 'boolean'
 *                 example: false
 *               message:
 *                 type: 'string'
 *                 example: 'Erreur interne du serveur'
 */

module.exports = {}; 