const { prisma } = require('../models');
const { validationResult } = require('express-validator');
const { paginer, construireReponsePaginee } = require('../utils/helpers');

// Créer un nouveau fournisseur
const createFournisseur = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array()
      });
    }

    const { numero, nom, adresse, telephone, email } = req.body;

    const fournisseur = await prisma.fournisseur.create({
      data: {
        numero,
        nom,
        adresse,
        telephone,
        email
      }
    });

    res.status(201).json({
      success: true,
      message: 'Fournisseur créé avec succès',
      data: {
        fournisseur
      }
    });
  } catch (error) {
    if (error.code === 'P2002') { // Unique constraint error
      return res.status(400).json({
        success: false,
        message: 'Un fournisseur avec ce numéro existe déjà'
      });
    }

    console.error('Erreur lors de la création du fournisseur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir tous les fournisseurs
const getFournisseurs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', includeArchived = false } = req.query;
    const { skip, limit: limitNum } = paginer(page, limit);

    // Construire le filtre
    const where = {};
    if (!includeArchived || includeArchived === 'false') {
      where.isArchived = false;
    }

    if (search) {
      where.OR = [
        {
          nom: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          numero: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Compter le total
    const total = await prisma.fournisseur.count({ where });

    // Récupérer les fournisseurs avec pagination
    const fournisseurs = await prisma.fournisseur.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        nom: 'asc'
      },
      include: {
        commandes: {
          where: {
            statut: {
              not: 'ANNULE'
            }
          },
          select: {
            id: true,
            numero: true,
            date: true,
            montant: true,
            statut: true
          },
          orderBy: {
            date: 'desc'
          },
          take: 5 // Dernières 5 commandes
        }
      }
    });

    const pagination = construireReponsePaginee(total, page, limitNum);

    res.json({
      success: true,
      data: {
        fournisseurs,
        pagination
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir un fournisseur par ID
const getFournisseurById = async (req, res) => {
  try {
    const { id } = req.params;

    const fournisseur = await prisma.fournisseur.findUnique({
      where: { id },
      include: {
        commandes: {
          orderBy: {
            date: 'desc'
          },
          include: {
            articles: {
              include: {
                produit: {
                  select: {
                    id: true,
                    code: true,
                    designation: true
                  }
                }
              }
            },
            paiements: {
              select: {
                id: true,
                numero: true,
                montant: true,
                date: true,
                numeroVersement: true
              }
            }
          }
        }
      }
    });

    if (!fournisseur) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }

    res.json({
      success: true,
      data: {
        fournisseur
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du fournisseur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Mettre à jour un fournisseur
const updateFournisseur = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { numero, nom, adresse, telephone, email } = req.body;

    const fournisseur = await prisma.fournisseur.update({
      where: { id },
      data: {
        numero,
        nom,
        adresse,
        telephone,
        email
      }
    });

    res.json({
      success: true,
      message: 'Fournisseur mis à jour avec succès',
      data: {
        fournisseur
      }
    });
  } catch (error) {
    if (error.code === 'P2025') { // Record not found
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }

    if (error.code === 'P2002') { // Unique constraint error
      return res.status(400).json({
        success: false,
        message: 'Un fournisseur avec ce numéro existe déjà'
      });
    }

    console.error('Erreur lors de la mise à jour du fournisseur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Archiver un fournisseur
const archiveFournisseur = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le fournisseur a des commandes en cours
    const commandesEnCours = await prisma.commande.count({
      where: {
        fournisseurId: id,
        statut: {
          in: ['EN_COURS', 'LIVRE']
        }
      }
    });

    if (commandesEnCours > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible d\'archiver un fournisseur qui a des commandes en cours'
      });
    }

    const fournisseur = await prisma.fournisseur.update({
      where: { id },
      data: {
        isArchived: true
      }
    });

    res.json({
      success: true,
      message: 'Fournisseur archivé avec succès',
      data: {
        fournisseur
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }

    console.error('Erreur lors de l\'archivage du fournisseur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Désarchiver un fournisseur
const unarchiveFournisseur = async (req, res) => {
  try {
    const { id } = req.params;

    const fournisseur = await prisma.fournisseur.update({
      where: { id },
      data: {
        isArchived: false
      }
    });

    res.json({
      success: true,
      message: 'Fournisseur désarchivé avec succès',
      data: {
        fournisseur
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }

    console.error('Erreur lors du désarchivage du fournisseur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Supprimer définitivement un fournisseur (seulement si aucune commande)
const deleteFournisseur = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si le fournisseur a des commandes
    const commandesCount = await prisma.commande.count({
      where: {
        fournisseurId: id
      }
    });

    if (commandesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un fournisseur qui a des commandes'
      });
    }

    await prisma.fournisseur.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Fournisseur supprimé avec succès'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }

    console.error('Erreur lors de la suppression du fournisseur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  createFournisseur,
  getFournisseurs,
  getFournisseurById,
  updateFournisseur,
  archiveFournisseur,
  unarchiveFournisseur,
  deleteFournisseur
};