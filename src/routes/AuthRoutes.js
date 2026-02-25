const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authentifie un utilisateur et retourne un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentification réussie, retourne un token JWT
 *       401:
 *         description: Email ou mot de passe incorrect
 *       403:
 *         description: Accès refusé, token manquant ou invalide
 *       500:
 *         description: Erreur serveur
 */
router.post('/login', authController.login);

module.exports = router;