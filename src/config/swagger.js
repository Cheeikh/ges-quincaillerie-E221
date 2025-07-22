const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Serveur de développement'
      }
    ],
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