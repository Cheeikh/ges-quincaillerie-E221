const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { swaggerUi, specs } = require('./config/swagger');
const routes = require('./routes');
const {
  handleValidationErrors,
  handleExpressValidationErrors,
  handlePrismaErrors,
  handleJWTErrors,
  handleGeneralErrors,
  handleNotFound
} = require('./middleware/errorHandler');

const app = express();

// Connexion à la base de données
connectDB();

// Configuration CORS pour le déploiement
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (comme les applications mobiles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Liste des origines autorisées
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:8080'
    ];
    
    // Ajouter les origines de production depuis les variables d'environnement
    if (process.env.ALLOWED_ORIGINS) {
      allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
    }
    
    // Ajouter les origines de staging et production
    if (process.env.STAGING_URL) {
      allowedOrigins.push(process.env.STAGING_URL);
    }
    if (process.env.PRODUCTION_URL) {
      allowedOrigins.push(process.env.PRODUCTION_URL);
    }
    
    // Vérifier si l'origine est autorisée
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('Origine bloquée par CORS:', origin);
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
};

// Middlewares de sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Configuration CORS
app.use(cors(corsOptions));

// Middleware pour gérer les erreurs CORS
app.use((err, req, res, next) => {
  if (err.message === 'Non autorisé par CORS') {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé par la politique CORS',
      error: 'CORS_ERROR'
    });
  }
  next(err);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre de temps
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Parsing JSON et URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Documentation Swagger avec configuration améliorée
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Quincaillerie Barro et Frère',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    deepLinking: true,
    tryItOutEnabled: true,
    requestInterceptor: (request) => {
      // Ajouter automatiquement le préfixe /api si nécessaire
      if (!request.url.startsWith('/api') && !request.url.startsWith('http')) {
        request.url = `/api${request.url}`;
      }
      return request;
    }
  }
}));

// Routes principales
app.use('/api', routes);

// Route racine
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Gestion Quincaillerie Barro et Frère',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
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

// Middlewares de gestion d'erreurs (dans l'ordre d'exécution)
app.use(handleExpressValidationErrors);
app.use(handleValidationErrors);
app.use(handlePrismaErrors);
app.use(handleJWTErrors);

// Middleware de gestion des routes non trouvées
app.use('*', handleNotFound);

// Middleware de gestion globale des erreurs (doit être en dernier)
app.use(handleGeneralErrors);

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