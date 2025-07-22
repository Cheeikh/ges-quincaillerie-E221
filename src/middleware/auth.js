const jwt = require('jsonwebtoken');
const { prisma } = require('../models');

// Middleware d'authentification
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Token manquant.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Token invalide ou utilisateur inactif.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({
      success: false,
      message: 'Token invalide.'
    });
  }
};

// Middleware d'autorisation par rôle
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    next();
  };
};

// Middleware pour vérifier si l'utilisateur est gestionnaire
const isGestionnaire = authorize('GESTIONNAIRE');

// Middleware pour vérifier si l'utilisateur est responsable achat
const isResponsableAchat = authorize('RESPONSABLE_ACHAT');

// Middleware pour vérifier si l'utilisateur est responsable paiement
const isResponsablePaiement = authorize('RESPONSABLE_PAIEMENT');

// Middleware pour vérifier si l'utilisateur est gestionnaire ou responsable achat
const isGestionnaireOrResponsableAchat = authorize('GESTIONNAIRE', 'RESPONSABLE_ACHAT');

// Middleware pour vérifier si l'utilisateur est gestionnaire ou responsable paiement
const isGestionnaireOrResponsablePaiement = authorize('GESTIONNAIRE', 'RESPONSABLE_PAIEMENT');

module.exports = {
  authenticate,
  authorize,
  isGestionnaire,
  isResponsableAchat,
  isResponsablePaiement,
  isGestionnaireOrResponsableAchat,
  isGestionnaireOrResponsablePaiement
};