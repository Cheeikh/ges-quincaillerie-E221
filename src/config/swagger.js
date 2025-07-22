const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuration des serveurs selon l'environnement
const getServers = () => {
  const servers = [];
  
  // Serveur de développement
  servers.push({
    url: 'http://localhost:3000/api',
    description: 'Serveur de développement'
  });
  
  // Serveur de production (si configuré)
  if (process.env.PRODUCTION_URL) {
    servers.push({
      url: `${process.env.PRODUCTION_URL}/api`,
      description: 'Serveur de production'
    });
  }
  
  // Serveur de staging (si configuré)
  if (process.env.STAGING_URL) {
    servers.push({
      url: `${process.env.STAGING_URL}/api`,
      description: 'Serveur de staging'
    });
  }
  
  // Serveur dynamique basé sur l'environnement actuel
  const currentUrl = process.env.NODE_ENV === 'production' 
    ? (process.env.PRODUCTION_URL || process.env.BASE_URL || 'https://votre-domaine.com')
    : (process.env.STAGING_URL || process.env.BASE_URL || 'http://localhost:3000');
    
  servers.unshift({
    url: `${currentUrl}/api`,
    description: 'Serveur actuel'
  });
  
  return servers;
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gestion Quincaillerie Barro et Frère',
      version: '1.0.0',
      description: 'API pour la gestion des commandes et livraisons de la quincaillerie',
      contact: {
        name: 'Support API',
        email: 'support@quincaillerie-barro.com'
      }
    },
    servers: getServers(),
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/config/swagger-docs.js',
    './src/routes/*.js'
  ], // Chemins vers les fichiers contenant les définitions OpenAPI
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};