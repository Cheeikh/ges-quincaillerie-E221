const express = require('express');
const authRoutes = require('./auth');
const categorieRoutes = require('./categories');
const sousCategorieRoutes = require('./sous-categories');
const fournisseurRoutes = require('./fournisseurs');
const produitRoutes = require('./produits');
const commandeRoutes = require('./commandes');
const paiementRoutes = require('./paiements');

const router = express.Router();

// Routes d'authentification
router.use('/auth', authRoutes);

// Routes des entités
router.use('/categories', categorieRoutes);
router.use('/sous-categories', sousCategorieRoutes);
router.use('/fournisseurs', fournisseurRoutes);
router.use('/produits', produitRoutes);
router.use('/commandes', commandeRoutes);
router.use('/paiements', paiementRoutes);

// Route de test
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Quincaillerie Barro et Frère - Service en ligne',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;