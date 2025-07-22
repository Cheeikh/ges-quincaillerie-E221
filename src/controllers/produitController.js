const { prisma, includes } = require('../models');
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

    const { code, designation, quantiteStock, prixUnitaire, sousCategorieId } = req.body;

    // Vérifier que la sous-catégorie existe et n'est pas archivée
    const sousCategorie = await prisma.sousCategorie.findUnique({
      where: { id: sousCategorieId }
    });

    if (!sousCategorie || sousCategorie.isArchived) {
      return res.status(400).json({
        success: false,
        message: 'Sous-catégorie invalide ou archivée'
      });
    }

    const produitData = {
      code,
      designation,
      quantiteStock: parseInt(quantiteStock),
      prixUnitaire: parseFloat(prixUnitaire),
      sousCategorieId
    };

    // Ajouter l'image si elle existe
    if (req.file) {
      produitData.image = req.file.filename;
    }

    const produit = await prisma.produit.create({
      data: produitData,
      include: includes.PRODUIT_INCLUDE
    });

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: {
        produit
      }
    });
  } catch (error) {
    // Supprimer le fichier image en cas d'erreur
    if (req.file) {
      const imagePath = path.join(__dirname, '../../uploads', req.file.filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (error.code === 'P2002') { // Unique constraint error
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
      sousCategorieId = '', 
      categorieId = '',
      includeArchived = false 
    } = req.query;
    const { skip, limit: limitNum } = paginer(page, limit);

    // Construire le filtre
    const where = {};
    if (!includeArchived || includeArchived === 'false') {
      where.isArchived = false;
    }

    if (search) {
      where.OR = [
        {
          code: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          designation: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    if (sousCategorieId) {
      where.sousCategorieId = sousCategorieId;
    }

    if (categorieId) {
      where.sousCategorie = {
        categorieId: categorieId
      };
    }

    // Compter le total
    const total = await prisma.produit.count({ where });

    // Récupérer les produits avec pagination
    const produits = await prisma.produit.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        designation: 'asc'
      },
      include: includes.PRODUIT_INCLUDE
    });

    const pagination = construireReponsePaginee(total, page, limitNum);

    res.json({
      success: true,
      data: {
        produits,
        pagination
      }
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
    const { id } = req.params;

    const produit = await prisma.produit.findUnique({
      where: { id },
      include: includes.PRODUIT_INCLUDE
    });

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    res.json({
      success: true,
      data: {
        produit
      }
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
    const { code, designation, quantiteStock, prixUnitaire, sousCategorieId } = req.body;

    // Récupérer le produit actuel pour l'image
    const produitActuel = await prisma.produit.findUnique({
      where: { id }
    });

    if (!produitActuel) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Vérifier la sous-catégorie si elle est fournie
    if (sousCategorieId) {
      const sousCategorie = await prisma.sousCategorie.findUnique({
        where: { id: sousCategorieId }
      });

      if (!sousCategorie || sousCategorie.isArchived) {
        return res.status(400).json({
          success: false,
          message: 'Sous-catégorie invalide ou archivée'
        });
      }
    }

    const updateData = {
      code,
      designation,
      quantiteStock: quantiteStock !== undefined ? parseInt(quantiteStock) : undefined,
      prixUnitaire: prixUnitaire !== undefined ? parseFloat(prixUnitaire) : undefined,
      ...(sousCategorieId && { sousCategorieId })
    };

    // Gérer l'image
    if (req.file) {
      // Supprimer l'ancienne image si elle existe
      if (produitActuel.image) {
        const oldImagePath = path.join(__dirname, '../../uploads', produitActuel.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.image = req.file.filename;
    }

    const produit = await prisma.produit.update({
      where: { id },
      data: updateData,
      include: includes.PRODUIT_INCLUDE
    });

    res.json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: {
        produit
      }
    });
  } catch (error) {
    // Supprimer le nouveau fichier en cas d'erreur
    if (req.file) {
      const imagePath = path.join(__dirname, '../../uploads', req.file.filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (error.code === 'P2002') { // Unique constraint error
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

const updateStock = async (req, res) => {
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
    const { quantiteStock } = req.body;

    const produit = await prisma.produit.update({
      where: { id },
      data: {
        quantiteStock: parseInt(quantiteStock)
      },
      include: includes.PRODUIT_INCLUDE
    });

    res.json({
      success: true,
      message: 'Stock mis à jour avec succès',
      data: {
        produit
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    console.error('Erreur lors de la mise à jour du stock:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

const archiveProduit = async (req, res) => {
  try {
    const { id } = req.params;

    const produit = await prisma.produit.update({
      where: { id },
      data: {
        isArchived: true
      }
    });

    res.json({
      success: true,
      message: 'Produit archivé avec succès',
      data: {
        produit
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    console.error('Erreur lors de l\'archivage du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

const unarchiveProduit = async (req, res) => {
  try {
    const { id } = req.params;

    const produit = await prisma.produit.update({
      where: { id },
      data: {
        isArchived: false
      }
    });

    res.json({
      success: true,
      message: 'Produit désarchivé avec succès',
      data: {
        produit
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    console.error('Erreur lors du désarchivage du produit:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

const deleteProduit = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer le produit pour l'image
    const produit = await prisma.produit.findUnique({
      where: { id }
    });

    if (!produit) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }

    // Vérifier s'il y a des commandes avec ce produit
    const articlesCount = await prisma.articleCommande.count({
      where: {
        produitId: id
      }
    });

    if (articlesCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer un produit qui fait partie de commandes'
      });
    }

    // Supprimer le produit
    await prisma.produit.delete({
      where: { id }
    });

    // Supprimer l'image si elle existe
    if (produit.image) {
      const imagePath = path.join(__dirname, '../../uploads', produit.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
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
  updateStock,
  archiveProduit,
  unarchiveProduit,
  deleteProduit
};