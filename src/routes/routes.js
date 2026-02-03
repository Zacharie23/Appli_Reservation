// Contient uniquement la déclaration des routes et l’association avec les controllers. 
// Aucune logique métier ici.

const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/ExampleController');

/**
 * @swagger
 * /examples:
 *  get:
 *    summary: Récupère la liste des éléments "exemples"
 *    responses:
 *       200:
 *         description: Liste des exemples  
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
router.get('/', exampleController.getExamples);

module.exports = router;
