const mongoose = require('mongoose');
const Produit = require('../models/Produit');
const SousCategorie = require('../models/SousCategorie');
const { validationResult } = require('express-validator');
const { paginer, construireReponsePaginee } = require('../utils/helpers');
const path = require('path');
const fs = require('fs');

const createProduit = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Erreurs de validation',
        errors: errors.array()
      });
    }

    const { code, designation, quantiteStock, prixUnitaire, sousCategorie } = req.body;

    // Vérifier que la sous-catégorie existe
    const sousCategorieExist = await SousCategorie.findById(sousCategorie);
    if (!sousCategorieExist || sousCategorieExist.isArchived) {
      return res.status(400).json({
        success: false,
        message: 'Sous-catégorie invalide ou archivée'
      });
    }

    const produitData = {
      code,
      designation,
      quantiteStock,
      prixUnitaire,
      sousCategorie
    };

    // Ajouter l'image si elle existe
    if (req.file) {
      produitData.image = req.file.filename;
    }

    const produit = new Produit(produitData);
    await produit.save();
    await produit.populate('sousCategorie');

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: { produit }
    });
  } catch (error) {
    // Supprimer le fichier uploadé en cas d'erreur
    if (req.file) {
      fs.unlink(path.join(__dirname, '../../uploads', req.file.filename), () => {});
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Un produit avec ce code existe déjà'
      });
    }
    console.error('Erreur lors de la création du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

const getProduits = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      sousCategorie,
      categorie,
      includeArchived = false 
    } = req.query;
    const { skip, limit: limitNum } = paginer(page, limit);

    const filter = {};
    if (!includeArchived || includeArchived === 'false') {
      filter.isArchived = false;
    }
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
    }
    if (sousCategorie) {
      filter.sousCategorie = sousCategorie;
    }

    let pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'souscategories',
          localField: 'sousCategorie',
          foreignField: '_id',
          as: 'sousCategorieData'
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'sousCategorieData.categorie',
          foreignField: '_id',
          as: 'categorieData'
        }
      }
    ];

    if (categorie) {
      pipeline.splice(1, 0, {
        $match: { 'categorieData._id': new mongoose.Types.ObjectId(categorie) }
      });
    }

    pipeline.push(
      { $sort: { designation: 1 } },
      { $skip: skip },
      { $limit: limitNum }
    );

    const [produits, total] = await Promise.all([
      Produit.aggregate(pipeline),
      Produit.countDocuments(filter)
    ]);

    const response = construireReponsePaginee(produits, total, page, limit);

    res.json({
      success: true,
      message: 'Produits récupérés avec succès',
      ...response
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

const getProduitById = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id)
      .populate({
        path: 'sousCategorie',
        populate: {
          path: 'categorie'
        }
      });

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Produit récupéré avec succès',
      data: { produit }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

const updateProduit = async (req, res) => {
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
    const updateData = { ...req.body };

    // Vérifier la sous-catégorie si elle est fournie
    if (updateData.sousCategorie) {
      const sousCategorieExist = await SousCategorie.findById(updateData.sousCategorie);
      if (!sousCategorieExist || sousCategorieExist.isArchived) {
        return res.status(400).json({
          success: false,
          message: 'Sous-catégorie invalide ou archivée'
        });
      }
    }

    const produitExistant = await Produit.findById(id);
    if (!produitExistant) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Gérer l'image
    if (req.file) {
      // Supprimer l'ancienne image si elle existe
      if (produitExistant.image) {
        fs.unlink(path.join(__dirname, '../../uploads', produitExistant.image), () => {});
      }
      updateData.image = req.file.filename;
    }

    const produit = await Produit.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('sousCategorie');

    res.json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: { produit }
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(path.join(__dirname, '../../uploads', req.file.filename), () => {});
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Un produit avec ce code existe déjà'
      });
    }
    console.error('Erreur lors de la mise à jour du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

const toggleArchiveProduit = async (req, res) => {
  try {
    const produit = await Produit.findById(req.params.id);
    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    produit.isArchived = !produit.isArchived;
    await produit.save();

    res.json({
      success: true,
      message: `Produit ${produit.isArchived ? 'archivé' : 'désarchivé'} avec succès`,
      data: { produit }
    });
  } catch (error) {
    console.error('Erreur lors de l\'archivage du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  createProduit,
  getProduits,
  getProduitById,
  updateProduit,
  toggleArchiveProduit
};