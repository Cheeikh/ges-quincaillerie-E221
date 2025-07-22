/**
 * Middleware de gestion d'erreurs centralisé
 * Standardise les réponses d'erreur pour une meilleure documentation Swagger
 */

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.keys(err.errors).map(key => ({
      field: key,
      message: err.errors[key].message
    }));

    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors
    });
  }
  next(err);
};

// Middleware pour gérer les erreurs de validation Express-validator
const handleExpressValidationErrors = (err, req, res, next) => {
  if (err && err.array) {
    const errors = err.array().map(error => ({
      field: error.param,
      message: error.msg
    }));

    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors
    });
  }
  next(err);
};

// Middleware pour gérer les erreurs Prisma
const handlePrismaErrors = (err, req, res, next) => {
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Conflit de données - Ressource déjà existante'
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Ressource non trouvée'
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Référence invalide - Ressource liée introuvable'
    });
  }

  next(err);
};

// Middleware pour gérer les erreurs JWT
const handleJWTErrors = (err, req, res, next) => {
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expiré'
    });
  }

  next(err);
};

// Middleware pour gérer les erreurs générales
const handleGeneralErrors = (err, req, res, next) => {
  console.error('Erreur serveur:', err);

  // Si c'est une erreur déjà traitée, la passer au suivant
  if (res.headersSent) {
    return next(err);
  }

  // Erreur par défaut
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
};

// Middleware pour gérer les routes non trouvées
const handleNotFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
};

module.exports = {
  handleValidationErrors,
  handleExpressValidationErrors,
  handlePrismaErrors,
  handleJWTErrors,
  handleGeneralErrors,
  handleNotFound
}; 