const express = require('express');
const router = express.Router();
const seatController = require('../controllers/SeatController');
const { authenticate } = require('../middlewares/AuthMiddleware');

/**
 * @swagger
 * /seats:
 *   get:
 *     summary: Récupère toutes les places
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de toutes les places
 */
router.get('/', authenticate, seatController.getSeats);

/**
 * @swagger
 * /seats/available/{eventId}:
 *   get:
 *     summary: Récupère les places disponibles pour un événement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des places disponibles
 *       404:
 *         description: Événement non trouvé
 */
router.get('/available/:eventId', authenticate, seatController.getAvailableSeats);

module.exports = router;