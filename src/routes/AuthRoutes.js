const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const schemas = require('../middlewares/ValidationSchemas');

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
 *             required: [email, password]
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
router.post('/login', schemas.login, authController.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscrit un nouvel utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, nom, prenom]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *               nom:
 *                 type: string    
 *                 minLength: 2
 *                 maxLength: 50
 *               prenom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Champs manquants ou invalides
 *       409:
 *         description: Email déjà utilisé
 */
router.post('/register', schemas.register, authController.register);

module.exports = router;