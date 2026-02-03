// Appeler le bon service et renvoyer la réponse.
// 1 fichier par ressource

const exampleService = require('../services/ExampleService');

async function getExamples(req, res) {
  const examples = exampleService.listExamples(req.query.title);
  res.json(examples);
}

module.exports = { getExamples};