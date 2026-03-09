const userService = require('../services/UserService');

async function getAll(req, res) {
    const users = await userService.listUsers();
    res.json(users);
}

async function getById(req, res) {
    const user = await userService.getUserById(parseInt(req.params.id));
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'Utilisateur introuvable' });
    }
}

async function create(req, res) {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
}

async function update(req, res) {
    const updated = await userService.updateUser(parseInt(req.params.id), req.body);
    if (updated) {
        res.json(updated);
    } else {
        res.status(404).json({ message: 'Utilisateur introuvable' });
    }
}

async function remove(req, res) {
    const deleted = await userService.deleteUser(parseInt(req.params.id), req.user.id);
    if (deleted) {
        res.json({ message: 'Utilisateur supprimé avec succès' });
    } else {
        res.status(404).json({ message: 'Utilisateur introuvable' });
    }
}

module.exports = { getAll, getById, create, update, remove };