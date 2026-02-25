const express = require('express');
const app = express();
const routes = require('./routes/routes');
const setupSwagger = require('../swagger');
const errorHandler = require('./middlewares/ErrorHandler');
const authRoutes = require('./routes/AuthRoutes');

setupSwagger(app);

app.use(express.json());
app.use('/events', routes);
app.use('/auth', authRoutes);

app.use(errorHandler);

module.exports = app;
