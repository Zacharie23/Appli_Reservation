const express = require('express');
const app = express();

const cors = require('cors');

// Ajoute ces lignes AVANT tes routes
app.use(cors({
    origin: true,  // Autorise tout pour le dev (à restreindre en prod)
    credentials: true
}));


const routes = require('./routes/routes');
const setupSwagger = require('../swagger');
const errorHandler = require('./middlewares/ErrorHandler');
const authRoutes = require('./routes/AuthRoutes');
const reservationRoutes = require('./routes/ReservationRoutes');
const seatRoutes     = require('./routes/SeatRoutes');
const categoryRoutes = require('./routes/CategoryRoutes');

setupSwagger(app);

app.use(express.json());
app.use('/events', routes);
app.use('/auth', authRoutes);
app.use('/reservations', reservationRoutes);
app.use('/seats',      seatRoutes);
app.use('/categories', categoryRoutes);

app.use(errorHandler);

module.exports = app;
