const UserModel = require('../models/UserModel');

async function listUsers() {
    return await UserModel.findAll();
}

async function getUserById(id) {
    const user = await UserModel.findById(id);
    if (!user) throw { status: 404, message: 'Utilisateur introuvable' };
    const { password, ...safe } = user;
    return safe;
}

async function createUser(data) {
    const { email, password, nom, prenom, role } = data;

    const existing = await UserModel.findByEmail(email);
    if (existing) throw { status: 409, message: 'Email déjà utilisé' };

    return await UserModel.create(email, password, nom || '', prenom || '', role || 'user');
}

async function updateUser(id, data) {
    const { email, password, nom, prenom, role } = data;

    if (email) {
        const existing = await UserModel.findByEmail(email);
        if (existing && existing.id !== id) {
            throw { status: 409, message: 'Email déjà utilisé' };
        }
    }

    return await UserModel.update(id, { email, password, nom, prenom, role });
}

async function deleteUser(id, requesterId) {
    if (id === requesterId) {
        throw { status: 400, message: 'Vous ne pouvez pas supprimer votre propre compte' };
    }
    return await UserModel.remove(id);
}

module.exports = { listUsers, getUserById, createUser, updateUser, deleteUser };