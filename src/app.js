const express = require('express');
const app = express();
const routes = require('./routes/routes');
const setupSwagger = require('../swagger');
const errorHandler = require('./middlewares/ErrorHandler');

setupSwagger(app);

app.use(express.json());
app.use('/examples', routes);

app.use(errorHandler);

module.exports = app;
