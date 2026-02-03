const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Appli réservation",
      version: "1.0.0",
      description: "Système de réservation d'évènement des arènes de DAX",
    },
    servers: [
      { url: "http://localhost:3000", description: "Serveur local" }
    ]
  },
  apis: ["./src/routes/routes.js"]
};

const specs = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

module.exports = setupSwagger;
