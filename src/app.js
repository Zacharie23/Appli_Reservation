const express = require('express');
const app = express();

const cors = require('cors');

app.use(cors({
    origin: true,
    credentials: true
}));

const routes = require('./routes/routes');
const setupSwagger = require('../swagger');
const errorHandler = require('./middlewares/ErrorHandler');
const authRoutes = require('./routes/AuthRoutes');
const reservationRoutes = require('./routes/ReservationRoutes');
const seatRoutes     = require('./routes/SeatRoutes');
const categoryRoutes = require('./routes/CategoryRoutes');
const userRoutes = require('./routes/UserRoutes');

setupSwagger(app);

app.use(express.json());
app.use('/events', routes);
app.use('/auth', authRoutes);
app.use('/reservations', reservationRoutes);
app.use('/seats',      seatRoutes);
app.use('/categories', categoryRoutes);
app.use('/users', userRoutes);

app.use(errorHandler);

module.exports = app;