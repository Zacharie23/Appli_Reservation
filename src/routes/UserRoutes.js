const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { authenticate, requireAdmin } = require('../middlewares/AuthMiddleware');
const schemas = require('../middlewares/ValidationSchemas');

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Liste tous les utilisateurs (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *       403:
 *         description: Accès refusé
 */
router.get('/',    authenticate, requireAdmin, userController.getAll);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Récupère un utilisateur par son id (admin)
 */
router.get('/:id', authenticate, requireAdmin, userController.getById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crée un utilisateur (admin)
 */
router.post('/',   authenticate, requireAdmin, schemas.createUser, userController.create);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Modifie un utilisateur (admin)
 */
router.put('/:id', authenticate, requireAdmin, schemas.updateUser, userController.update);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Supprime un utilisateur (admin)
 */
router.delete('/:id', authenticate, requireAdmin, userController.remove);

module.exports = router;