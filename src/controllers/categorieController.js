const { prisma } = require('../models');
const { validationResult } = require('express-validator');
const { paginer, construireReponsePaginee } = require('../utils/helpers');

// Créer une nouvelle catégorie
const createCategorie = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array()
      });
    }

    const { nom, description } = req.body;

    const categorie = await prisma.categorie.create({
      data: {
        nom,
        description
      }
    });

    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: {
        categorie
      }
    });
  } catch (error) {
    if (error.code === 'P2002') { // Prisma unique constraint error
      return res.status(400).json({
        success: false,
        message: 'Une catégorie avec ce nom existe déjà'
      });
    }

    console.error('Erreur lors de la création de la catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir toutes les catégories
const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', includeArchived = false } = req.query;
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

    // Compter le total
    const total = await prisma.categorie.count({ where });

    // Récupérer les catégories avec pagination
    const categories = await prisma.categorie.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        nom: 'asc'
      },
      include: {
        sousCategories: {
          where: {
            isArchived: false
          },
          select: {
            id: true,
            nom: true,
            description: true
          }
        }
      }
    });

    const pagination = construireReponsePaginee(total, page, limitNum);

    res.json({
      success: true,
      data: {
        categories,
        pagination
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir une catégorie par ID
const getCategorieById = async (req, res) => {
  try {
    const { id } = req.params;

    const categorie = await prisma.categorie.findUnique({
      where: { id },
      include: {
        sousCategories: {
          where: {
            isArchived: false
          },
          orderBy: {
            nom: 'asc'
          }
        }
      }
    });

    if (!categorie) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    res.json({
      success: true,
      data: {
        categorie
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Mettre à jour une catégorie
const updateCategorie = async (req, res) => {
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
    const { nom, description } = req.body;

    const categorie = await prisma.categorie.update({
      where: { id },
      data: {
        nom,
        description
      }
    });

    res.json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: {
        categorie
      }
    });
  } catch (error) {
    if (error.code === 'P2025') { // Record not found
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    if (error.code === 'P2002') { // Unique constraint error
      return res.status(400).json({
        success: false,
        message: 'Une catégorie avec ce nom existe déjà'
      });
    }

    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Archiver une catégorie
const archiveCategorie = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la catégorie a des sous-catégories actives
    const sousCategoriesCount = await prisma.sousCategorie.count({
      where: {
        categorieId: id,
        isArchived: false
      }
    });

    if (sousCategoriesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible d\'archiver une catégorie qui contient des sous-catégories actives'
      });
    }

    const categorie = await prisma.categorie.update({
      where: { id },
      data: {
        isArchived: true
      }
    });

    res.json({
      success: true,
      message: 'Catégorie archivée avec succès',
      data: {
        categorie
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    console.error('Erreur lors de l\'archivage de la catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Désarchiver une catégorie
const unarchiveCategorie = async (req, res) => {
  try {
    const { id } = req.params;

    const categorie = await prisma.categorie.update({
      where: { id },
      data: {
        isArchived: false
      }
    });

    res.json({
      success: true,
      message: 'Catégorie désarchivée avec succès',
      data: {
        categorie
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    console.error('Erreur lors du désarchivage de la catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Supprimer définitivement une catégorie (seulement si aucune sous-catégorie)
const deleteCategorie = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si la catégorie a des sous-catégories
    const sousCategoriesCount = await prisma.sousCategorie.count({
      where: {
        categorieId: id
      }
    });

    if (sousCategoriesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une catégorie qui contient des sous-catégories'
      });
    }

    await prisma.categorie.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    console.error('Erreur lors de la suppression de la catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  createCategorie,
  getCategories,
  getCategorieById,
  updateCategorie,
  archiveCategorie,
  unarchiveCategorie,
  deleteCategorie
};