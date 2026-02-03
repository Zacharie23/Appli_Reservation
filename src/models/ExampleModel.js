// Contient la définition des données et de la logique liée aux bases de données.
// 1 fichier par ressource

// TODO A compléter (soit le faire en dur dans le code ou bien connecter avec une BDD)
let examples = [
  { id: 1, title: "Example 1" },
  { id: 2, title: "Example 2" },
  { id: 3, title: "Example 3" }
];

function getAll() {
  return examples;
}

module.exports = { getAll};
