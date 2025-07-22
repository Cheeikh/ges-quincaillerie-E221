const { prisma } = require('../models');
const { validationResult } = require('express-validator');
const { paginer, construireReponsePaginee } = require('../utils/helpers');

// Créer une nouvelle sous-catégorie
const createSousCategorie = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array()
      });
    }

    const { nom, description, categorieId } = req.body;

    // Vérifier que la catégorie parent existe et n'est pas archivée
    const categorie = await prisma.categorie.findUnique({
      where: { id: categorieId }
    });

    if (!categorie || categorie.isArchived) {
      return res.status(400).json({
        success: false,
        message: 'Catégorie parent non trouvée ou archivée'
      });
    }

    const sousCategorie = await prisma.sousCategorie.create({
      data: {
        nom,
        description,
        categorieId
      },
      include: {
        categorie: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Sous-catégorie créée avec succès',
      data: {
        sousCategorie
      }
    });
  } catch (error) {
    if (error.code === 'P2002') { // Unique constraint error (nom + categorieId)
      return res.status(400).json({
        success: false,
        message: 'Une sous-catégorie avec ce nom existe déjà dans cette catégorie'
      });
    }

    console.error('Erreur lors de la création de la sous-catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir toutes les sous-catégories
const getSousCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', categorieId = '', includeArchived = false } = req.query;
    const { skip, limit: limitNum } = paginer(page, limit);

    // Construire le filtre
    const where = {};
    if (!includeArchived || includeArchived === 'false') {
      where.isArchived = false;
    }

    if (search) {
      where.nom = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (categorieId) {
      where.categorieId = categorieId;
    }

    // Compter le total
    const total = await prisma.sousCategorie.count({ where });

    // Récupérer les sous-catégories avec pagination
    const sousCategories = await prisma.sousCategorie.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        nom: 'asc'
      },
      include: {
        categorie: true,
        produits: {
          where: {
            isArchived: false
          },
          select: {
            id: true,
            code: true,
            designation: true,
            quantiteStock: true,
            prixUnitaire: true
          }
        }
      }
    });

    const pagination = construireReponsePaginee(total, page, limitNum);

    res.json({
      success: true,
      data: {
        sousCategories,
        pagination
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des sous-catégories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir une sous-catégorie par ID
const getSousCategorieById = async (req, res) => {
  try {
    const { id } = req.params;

    const sousCategorie = await prisma.sousCategorie.findUnique({
      where: { id },
      include: {
        categorie: true,
        produits: {
          where: {
            isArchived: false
          },
          orderBy: {
            designation: 'asc'
          }
        }
      }
    });

    if (!sousCategorie) {
      return res.status(404).json({
        success: false,
        message: 'Sous-catégorie non trouvée'
      });
    }

    res.json({
      success: true,
      data: {
        sousCategorie
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la sous-catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Mettre à jour une sous-catégorie
const updateSousCategorie = async (req, res) => {
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
    const { nom, description, categorieId } = req.body;

    // Si categorieId est fourni, vérifier que la catégorie existe et n'est pas archivée
    if (categorieId) {
      const categorie = await prisma.categorie.findUnique({
        where: { id: categorieId }
      });

      if (!categorie || categorie.isArchived) {
        return res.status(400).json({
          success: false,
          message: 'Catégorie parent non trouvée ou archivée'
        });
      }
    }

    const sousCategorie = await prisma.sousCategorie.update({
      where: { id },
      data: {
        nom,
        description,
        ...(categorieId && { categorieId })
      },
      include: {
        categorie: true
      }
    });

    res.json({
      success: true,
      message: 'Sous-catégorie mise à jour avec succès',
      data: {
        sousCategorie
      }
    });
  } catch (error) {
    if (error.code === 'P2025') { // Record not found
      return res.status(404).json({
        success: false,
        message: 'Sous-catégorie non trouvée'
      });
    }

    if (error.code === 'P2002') { // Unique constraint error
      return res.status(400).json({
        success: false,
        message: 'Une sous-catégorie avec ce nom existe déjà dans cette catégorie'
      });
    }

    console.error('Erreur lors de la mise à jour de la sous-catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Archiver une sous-catégorie
const archiveSousCategorie = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la sous-catégorie a des produits actifs
    const produitsCount = await prisma.produit.count({
      where: {
        sousCategorieId: id,
        isArchived: false
      }
    });

    if (produitsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible d\'archiver une sous-catégorie qui contient des produits actifs'
      });
    }

    const sousCategorie = await prisma.sousCategorie.update({
      where: { id },
      data: {
        isArchived: true
      }
    });

    res.json({
      success: true,
      message: 'Sous-catégorie archivée avec succès',
      data: {
        sousCategorie
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Sous-catégorie non trouvée'
      });
    }

    console.error('Erreur lors de l\'archivage de la sous-catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Désarchiver une sous-catégorie
const unarchiveSousCategorie = async (req, res) => {
  try {
    const { id } = req.params;

    const sousCategorie = await prisma.sousCategorie.update({
      where: { id },
      data: {
        isArchived: false
      }
    });

    res.json({
      success: true,
      message: 'Sous-catégorie désarchivée avec succès',
      data: {
        sousCategorie
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Sous-catégorie non trouvée'
      });
    }

    console.error('Erreur lors du désarchivage de la sous-catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Supprimer définitivement une sous-catégorie (seulement si aucun produit)
const deleteSousCategorie = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la sous-catégorie a des produits
    const produitsCount = await prisma.produit.count({
      where: {
        sousCategorieId: id
      }
    });

    if (produitsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une sous-catégorie qui contient des produits'
      });
    }

    await prisma.sousCategorie.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Sous-catégorie supprimée avec succès'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Sous-catégorie non trouvée'
      });
    }

    console.error('Erreur lors de la suppression de la sous-catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  createSousCategorie,
  getSousCategories,
  getSousCategorieById,
  updateSousCategorie,
  archiveSousCategorie,
  unarchiveSousCategorie,
  deleteSousCategorie
};