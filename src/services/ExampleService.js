// Contient la logique métier (traitements, calculs, accès à la DB).
// 1 fichier par ressource

const Example = require('../models/ExampleModel');

function listExamples(title) {
  const all = Example.getAll();
  if (title) {
    return all.filter(a => a.title.toLowerCase().includes(title.toLowerCase()));
  }
  return all;
}


module.exports = { listExamples };
