const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
    const user = await User.findById(decoded.id).select('-password');

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
const isGestionnaire = authorize('gestionnaire');

// Middleware pour vérifier si l'utilisateur est responsable achat
const isResponsableAchat = authorize('responsable_achat');

// Middleware pour vérifier si l'utilisateur est responsable paiement
const isResponsablePaiement = authorize('responsable_paiement');

// Middleware pour vérifier si l'utilisateur est gestionnaire ou responsable achat
const isGestionnaireOrResponsableAchat = authorize('gestionnaire', 'responsable_achat');

// Middleware pour vérifier si l'utilisateur est gestionnaire ou responsable paiement
const isGestionnaireOrResponsablePaiement = authorize('gestionnaire', 'responsable_paiement');

module.exports = {
  authenticate,
  authorize,
  isGestionnaire,
  isResponsableAchat,
  isResponsablePaiement,
  isGestionnaireOrResponsableAchat,
  isGestionnaireOrResponsablePaiement
};