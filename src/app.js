const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { swaggerUi, specs } = require('./config/swagger');
const routes = require('./routes');

const app = express();

// Connexion à la base de données
connectDB();

// Middlewares de sécurité
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre de temps
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
  }
});
app.use(limiter);

// Parsing JSON et URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Quincaillerie Barro et Frère'
}));

// Routes principales
app.use('/api', routes);

// Route racine
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Gestion Quincaillerie Barro et Frère',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      sousCategories: '/api/sous-categories',
      fournisseurs: '/api/fournisseurs',
      produits: '/api/produits',
      commandes: '/api/commandes',
      paiements: '/api/paiements'
    }
  });
});

// Middleware de gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Middleware de gestion globale des erreurs
app.use((error, req, res, next) => {
  console.error('Erreur globale:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
🚀 Serveur API Quincaillerie Barro et Frère démarré
📍 Port: ${PORT}
🌍 Environnement: ${process.env.NODE_ENV || 'development'}
📚 Documentation: http://localhost:${PORT}/api-docs
🔗 API: http://localhost:${PORT}/api
  `);
});

module.exports = app;