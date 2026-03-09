const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/ReservationController');
const { authenticate } = require('../middlewares/AuthMiddleware');
const authorize = require('../middlewares/RoleMiddleware');
const schemas = require('../middlewares/ValidationSchemas');

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Récupère toutes les réservations (admin uniquement)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de toutes les réservations
 */
router.get('/', authenticate, authorize('admin'), reservationController.getReservations);

/**
 * @swagger
 * /reservations/me:
 *   get:
 *     summary: Récupère les réservations de l'utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des réservations de l'utilisateur
 */
router.get('/me', authenticate, reservationController.getMyReservations);

/**
 * @swagger
 * /reservations/event/{eventId}:
 *   get:
 *     summary: Récupère toutes les réservations d'un événement (admin uniquement)
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
 *         description: Liste des réservations pour cet événement
 */
router.get('/event/:eventId', authenticate, authorize('admin'), reservationController.getReservationsByEvent);

/**
 * @swagger
 * /reservations/{id}:
 *   get:
 *     summary: Récupère une réservation par son ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de la réservation
 *       404:
 *         description: Réservation non trouvée
 */
router.get('/:id', authenticate, reservationController.getReservationById);

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Crée une nouvelle réservation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event_id:
 *                 type: integer
 *               seat_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Réservation créée avec succès
 *       409:
 *         description: Place déjà réservée pour cet événement
 */
router.post('/', authenticate, schemas.createReservation, reservationController.createReservation);

/**
 * @swagger
 * /reservations/{id}:
 *   delete:
 *     summary: Supprime une réservation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Réservation supprimée avec succès
 *       403:
 *         description: Accès interdit
 *       404:
 *         description: Réservation non trouvée
 */
router.delete('/:id', authenticate, reservationController.deleteReservation);

module.exports = router;