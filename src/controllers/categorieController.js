const Categorie = require('../models/Categorie');
const SousCategorie = require('../models/SousCategorie');
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

    const categorie = new Categorie({
      nom,
      description
    });

    await categorie.save();

    res.status(201).json({
      success: true,
      message: 'Catégorie créée avec succès',
      data: {
        categorie
      }
    });
  } catch (error) {
    if (error.code === 11000) {
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
    const filter = {};
    if (!includeArchived || includeArchived === 'false') {
      filter.isArchived = false;
    }
    if (search) {
      filter.nom = { $regex: search, $options: 'i' };
    }

    const [categories, total] = await Promise.all([
      Categorie.find(filter)
        .sort({ nom: 1 })
        .skip(skip)
        .limit(limitNum),
      Categorie.countDocuments(filter)
    ]);

    const response = construireReponsePaginee(categories, total, page, limit);

    res.json({
      success: true,
      message: 'Catégories récupérées avec succès',
      ...response
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

    const categorie = await Categorie.findById(id);
    if (!categorie) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    // Récupérer les sous-catégories associées
    const sousCategories = await SousCategorie.find({ 
      categorie: id, 
      isArchived: false 
    }).sort({ nom: 1 });

    res.json({
      success: true,
      message: 'Catégorie récupérée avec succès',
      data: {
        categorie: {
          ...categorie.toObject(),
          sousCategories
        }
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

    const categorie = await Categorie.findByIdAndUpdate(
      id,
      { nom, description },
      { new: true, runValidators: true }
    );

    if (!categorie) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Catégorie mise à jour avec succès',
      data: {
        categorie
      }
    });
  } catch (error) {
    if (error.code === 11000) {
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

// Archiver/Désarchiver une catégorie
const toggleArchiveCategorie = async (req, res) => {
  try {
    const { id } = req.params;

    const categorie = await Categorie.findById(id);
    if (!categorie) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    categorie.isArchived = !categorie.isArchived;
    await categorie.save();

    // Si on archive la catégorie, archiver aussi ses sous-catégories
    if (categorie.isArchived) {
      await SousCategorie.updateMany(
        { categorie: id },
        { isArchived: true }
      );
    }

    res.json({
      success: true,
      message: `Catégorie ${categorie.isArchived ? 'archivée' : 'désarchivée'} avec succès`,
      data: {
        categorie
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'archivage de la catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Supprimer définitivement une catégorie
const deleteCategorie = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier s'il y a des sous-catégories
    const sousCategories = await SousCategorie.countDocuments({ categorie: id });
    if (sousCategories > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer la catégorie. Elle contient des sous-catégories.'
      });
    }

    const categorie = await Categorie.findByIdAndDelete(id);
    if (!categorie) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
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
  toggleArchiveCategorie,
  deleteCategorie
};