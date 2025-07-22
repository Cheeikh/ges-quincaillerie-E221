const { prisma, includes, generateNextNumber } = require('../models');
const { validationResult } = require('express-validator');
const { paginer, construireReponsePaginee, estAujourdhui } = require('../utils/helpers');

// Créer une nouvelle commande
const createCommande = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array()
      });
    }

    const { fournisseurId, articles, dateLivraisonPrevue } = req.body;

    // Vérifier que le fournisseur existe
    const fournisseurExist = await prisma.fournisseur.findUnique({
      where: { id: fournisseurId }
    });
    if (!fournisseurExist || fournisseurExist.isArchived) {
      return res.status(400).json({
        success: false,
        message: 'Fournisseur invalide ou archivé'
      });
    }

    // Vérifier et calculer les articles
    let montantTotal = 0;
    const articlesAvecPrix = [];

    for (const article of articles) {
      const produit = await prisma.produit.findUnique({
        where: { id: article.produitId }
      });
      if (!produit || produit.isArchived) {
        return res.status(400).json({
          success: false,
          message: `Produit invalide ou archivé: ${article.produitId}`
        });
      }

      const sousTotal = article.quantite * article.prixAchat;
      montantTotal += sousTotal;

      articlesAvecPrix.push({
        produitId: article.produitId,
        quantite: article.quantite,
        prixAchat: article.prixAchat,
        sousTotal
      });
    }

    // Générer le numéro de commande
    const numero = await generateNextNumber('commande', 'CMD');

    // Créer la commande avec les articles
    const commande = await prisma.commande.create({
      data: {
        numero,
        fournisseurId,
        montant: montantTotal,
        dateLivraisonPrevue: new Date(dateLivraisonPrevue),
        responsableAchatId: req.user.id,
        articles: {
          create: articlesAvecPrix
        }
      },
      include: includes.COMMANDE_INCLUDE
    });

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: {
        commande
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir toutes les commandes avec filtres
const getCommandes = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      statut, 
      fournisseurId, 
      dateDebut, 
      dateFin,
      responsableAchatId 
    } = req.query;
    const { skip, limit: limitNum } = paginer(page, limit);

    // Construire le filtre
    const where = {};

    if (statut) {
      where.statut = statut;
    }

    if (fournisseurId) {
      where.fournisseurId = fournisseurId;
    }

    if (responsableAchatId) {
      where.responsableAchatId = responsableAchatId;
    }

    if (dateDebut || dateFin) {
      where.date = {};
      if (dateDebut) {
        where.date.gte = new Date(dateDebut);
      }
      if (dateFin) {
        where.date.lte = new Date(dateFin);
      }
    }

    // Compter le total
    const total = await prisma.commande.count({ where });

    // Récupérer les commandes avec pagination
    const commandes = await prisma.commande.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        date: 'desc'
      },
      include: includes.COMMANDE_INCLUDE
    });

    const pagination = construireReponsePaginee(total, page, limitNum);

    res.json({
      success: true,
      message: 'Commandes récupérées avec succès',
      data: {
        commandes,
        pagination
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir une commande par ID
const getCommandeById = async (req, res) => {
  try {
    const { id } = req.params;

    const commande = await prisma.commande.findUnique({
      where: { id },
      include: includes.COMMANDE_INCLUDE
    });

    if (!commande) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Commande récupérée avec succès',
      data: {
        commande
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Marquer une commande comme livrée
const marquerLivree = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que la commande existe
    const commande = await prisma.commande.findUnique({
      where: { id },
      include: {
        articles: {
          include: {
            produit: true
          }
        }
      }
    });

    if (!commande) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    if (commande.statut !== 'EN_COURS') {
      return res.status(400).json({
        success: false,
        message: 'Seules les commandes en cours peuvent être marquées comme livrées'
      });
    }

    // Mettre à jour les stocks des produits
    for (const article of commande.articles) {
      await prisma.produit.update({
        where: { id: article.produitId },
        data: {
          quantiteStock: {
            increment: article.quantite
          }
        }
      });
    }

    // Marquer la commande comme livrée
    const commandeLivree = await prisma.commande.update({
      where: { id },
      data: {
        statut: 'LIVRE',
        dateLivraisonReelle: new Date()
      },
      include: includes.COMMANDE_INCLUDE
    });

    res.json({
      success: true,
      message: 'Commande marquée comme livrée avec succès',
      data: {
        commande: commandeLivree
      }
    });
  } catch (error) {
    console.error('Erreur lors de la livraison de la commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Annuler une commande
const annulerCommande = async (req, res) => {
  try {
    const { id } = req.params;

    const commande = await prisma.commande.findUnique({
      where: { id }
    });

    if (!commande) {
      return res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
    }

    if (commande.statut !== 'EN_COURS') {
      return res.status(400).json({
        success: false,
        message: 'Seules les commandes en cours peuvent être annulées'
      });
    }

    const commandeAnnulee = await prisma.commande.update({
      where: { id },
      data: {
        statut: 'ANNULE'
      },
      include: includes.COMMANDE_INCLUDE
    });

    res.json({
      success: true,
      message: 'Commande annulée avec succès',
      data: {
        commande: commandeAnnulee
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir les statistiques des commandes
const getStatistiques = async (req, res) => {
  try {
    const aujourdhui = new Date();
    const debutJour = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate());
    const finJour = new Date(debutJour.getTime() + 24 * 60 * 60 * 1000);

    // Commandes en cours
    const commandesEnCours = await prisma.commande.count({
      where: {
        statut: 'EN_COURS'
      }
    });

    // Commandes à livrer aujourd'hui
    const commandesALivrerAujourdhui = await prisma.commande.count({
      where: {
        dateLivraisonPrevue: {
          gte: debutJour,
          lt: finJour
        },
        statut: 'EN_COURS'
      }
    });

    // Dette totale (commandes livrées mais non payées)
    const detteTotale = await prisma.commande.aggregate({
      where: {
        statut: 'LIVRE'
      },
      _sum: {
        montant: true
      }
    });

    // Versements d'aujourd'hui
    const versementsAujourdhui = await prisma.paiement.aggregate({
      where: {
        date: {
          gte: debutJour,
          lt: finJour
        }
      },
      _sum: {
        montant: true
      }
    });

    res.json({
      success: true,
      message: 'Statistiques récupérées avec succès',
      data: {
        commandesEnCours,
        commandesALivrerAujourdhui,
        detteTotale: detteTotale._sum.montant || 0,
        versementsAujourdhui: versementsAujourdhui._sum.montant || 0
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  createCommande,
  getCommandes,
  getCommandeById,
  marquerLivree,
  annulerCommande,
  getStatistiques
};