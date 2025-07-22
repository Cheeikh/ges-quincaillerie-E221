const SousCategorie = require('../models/SousCategorie');
const Categorie = require('../models/Categorie');
const Produit = require('../models/Produit');
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

    const { nom, description, categorie } = req.body;

    // Vérifier que la catégorie existe
    const categorieExist = await Categorie.findById(categorie);
    if (!categorieExist || categorieExist.isArchived) {
      return res.status(400).json({
        success: false,
        message: 'Catégorie invalide ou archivée'
      });
    }

    const sousCategorie = new SousCategorie({
      nom,
      description,
      categorie
    });

    await sousCategorie.save();
    await sousCategorie.populate('categorie', 'nom');

    res.status(201).json({
      success: true,
      message: 'Sous-catégorie créée avec succès',
      data: {
        sousCategorie
      }
    });
  } catch (error) {
    if (error.code === 11000) {
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
    const { page = 1, limit = 10, search = '', categorie, includeArchived = false } = req.query;
    const { skip, limit: limitNum } = paginer(page, limit);

    const filter = {};
    if (!includeArchived || includeArchived === 'false') {
      filter.isArchived = false;
    }
    if (search) {
      filter.nom = { $regex: search, $options: 'i' };
    }
    if (categorie) {
      filter.categorie = categorie;
    }

    const [sousCategories, total] = await Promise.all([
      SousCategorie.find(filter)
        .populate('categorie', 'nom')
        .sort({ nom: 1 })
        .skip(skip)
        .limit(limitNum),
      SousCategorie.countDocuments(filter)
    ]);

    const response = construireReponsePaginee(sousCategories, total, page, limit);

    res.json({
      success: true,
      message: 'Sous-catégories récupérées avec succès',
      ...response
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

    const sousCategorie = await SousCategorie.findById(id)
      .populate('categorie');

    if (!sousCategorie) {
      return res.status(404).json({
        success: false,
        message: 'Sous-catégorie non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Sous-catégorie récupérée avec succès',
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
    const { nom, description, categorie } = req.body;

    // Vérifier que la catégorie existe si elle est fournie
    if (categorie) {
      const categorieExist = await Categorie.findById(categorie);
      if (!categorieExist || categorieExist.isArchived) {
        return res.status(400).json({
          success: false,
          message: 'Catégorie invalide ou archivée'
        });
      }
    }

    const sousCategorie = await SousCategorie.findByIdAndUpdate(
      id,
      { nom, description, categorie },
      { new: true, runValidators: true }
    ).populate('categorie', 'nom');

    if (!sousCategorie) {
      return res.status(404).json({
        success: false,
        message: 'Sous-catégorie non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Sous-catégorie mise à jour avec succès',
      data: {
        sousCategorie
      }
    });
  } catch (error) {
    if (error.code === 11000) {
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

// Archiver/Désarchiver une sous-catégorie
const toggleArchiveSousCategorie = async (req, res) => {
  try {
    const { id } = req.params;

    const sousCategorie = await SousCategorie.findById(id);
    if (!sousCategorie) {
      return res.status(404).json({
        success: false,
        message: 'Sous-catégorie non trouvée'
      });
    }

    sousCategorie.isArchived = !sousCategorie.isArchived;
    await sousCategorie.save();

    // Si on archive la sous-catégorie, archiver aussi ses produits
    if (sousCategorie.isArchived) {
      await Produit.updateMany(
        { sousCategorie: id },
        { isArchived: true }
      );
    }

    res.json({
      success: true,
      message: `Sous-catégorie ${sousCategorie.isArchived ? 'archivée' : 'désarchivée'} avec succès`,
      data: {
        sousCategorie
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'archivage de la sous-catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Supprimer définitivement une sous-catégorie
const deleteSousCategorie = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier s'il y a des produits
    const produits = await Produit.countDocuments({ sousCategorie: id });
    if (produits > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer la sous-catégorie. Elle contient des produits.'
      });
    }

    const sousCategorie = await SousCategorie.findByIdAndDelete(id);
    if (!sousCategorie) {
      return res.status(404).json({
        success: false,
        message: 'Sous-catégorie non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Sous-catégorie supprimée avec succès'
    });
  } catch (error) {
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
  toggleArchiveSousCategorie,
  deleteSousCategorie
};