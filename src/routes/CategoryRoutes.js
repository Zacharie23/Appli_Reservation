const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/CategoryController');
const authenticate = require('../middlewares/AuthMiddleware');

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Récupère toutes les catégories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des catégories avec leurs prix
 */
router.get('/', authenticate, categoryController.getCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Récupère une catégorie par son ID
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
 *         description: Détails de la catégorie
 *       404:
 *         description: Catégorie non trouvée
 */
router.get('/:id', authenticate, categoryController.getCategoryById);

module.exports = router;
