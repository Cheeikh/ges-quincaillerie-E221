const Fournisseur = require('../models/Fournisseur');
const { validationResult } = require('express-validator');
const { paginer, construireReponsePaginee } = require('../utils/helpers');

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

    const fournisseur = new Fournisseur(req.body);
    await fournisseur.save();

    res.status(201).json({
      success: true,
      message: 'Fournisseur créé avec succès',
      data: { fournisseur }
    });
  } catch (error) {
    if (error.code === 11000) {
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

const getFournisseurs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', includeArchived = false } = req.query;
    const { skip, limit: limitNum } = paginer(page, limit);

    const filter = {};
    if (!includeArchived || includeArchived === 'false') {
      filter.isArchived = false;
    }
    if (search) {
      filter.$or = [
        { nom: { $regex: search, $options: 'i' } },
        { numero: { $regex: search, $options: 'i' } }
      ];
    }

    const [fournisseurs, total] = await Promise.all([
      Fournisseur.find(filter).sort({ nom: 1 }).skip(skip).limit(limitNum),
      Fournisseur.countDocuments(filter)
    ]);

    const response = construireReponsePaginee(fournisseurs, total, page, limit);

    res.json({
      success: true,
      message: 'Fournisseurs récupérés avec succès',
      ...response
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

const getFournisseurById = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findById(req.params.id);
    if (!fournisseur) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Fournisseur récupéré avec succès',
      data: { fournisseur }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du fournisseur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

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

    const fournisseur = await Fournisseur.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!fournisseur) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Fournisseur mis à jour avec succès',
      data: { fournisseur }
    });
  } catch (error) {
    if (error.code === 11000) {
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

const toggleArchiveFournisseur = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findById(req.params.id);
    if (!fournisseur) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }

    fournisseur.isArchived = !fournisseur.isArchived;
    await fournisseur.save();

    res.json({
      success: true,
      message: `Fournisseur ${fournisseur.isArchived ? 'archivé' : 'désarchivé'} avec succès`,
      data: { fournisseur }
    });
  } catch (error) {
    console.error('Erreur lors de l\'archivage du fournisseur:', error);
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
  toggleArchiveFournisseur
};