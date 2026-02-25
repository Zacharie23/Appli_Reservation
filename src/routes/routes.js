const express = require('express');
const router = express.Router();
const eventController = require('../controllers/EventController');
const authenticate = require('../middlewares/AuthMiddleware');
const authorize = require('../middlewares/RoleMiddleware');

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Récupère la liste des éléments "events"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des events
 */
router.get('/', authenticate, eventController.getEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Récupère un élément "event" spécifique par son ID
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
 *         description: Détails de l'event demandé
 */
router.get('/:id', authenticate, eventController.getEventById);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Crée un nouvel event
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Event créé avec succès
 */
router.post('/', authenticate, authorize('admin'), eventController.createEvent);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Met à jour un event existant par son ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Event mis à jour avec succès
 *       404:
 *         description: Event pas trouvé
 */
router.put('/:id', authenticate, authorize('admin'), eventController.updateEvent);

/**
 * @swagger
 * /events/{id}:
 *   patch:
 *     summary: Met à jour partiellement un event existant par son ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Event mis à jour avec succès
 *       404:
 *         description: Event pas trouvé
 */
router.patch('/:id', authenticate, authorize('admin'), eventController.patchEvent);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Supprime un event par son ID
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
 *         description: Event supprimé avec succès
 *       404:
 *         description: Event pas trouvé
 */
router.delete('/:id', authenticate, authorize('admin'), eventController.deleteEvent);

module.exports = router;
