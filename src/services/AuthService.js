const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');


async function login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) throw { status: 401, message: 'Utilisateur non trouvé' };

    const isValid = await User.verifyPassword(password, user.password);
    if (!isValid) throw { status: 401, message: 'Mot de passe incorrect' };

    const token = jwt.sign(
        { id: user.id, role: user.role, nom: user.nom, prenom: user.prenom }, // ← nom + prenom dans le token
        process.env.JWT_SECRET || 'SECRET_KEY',
        { expiresIn: '1h' }
    );

    const { password: pwd, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
}


async function register(email, password, nom, prenom) { // ← nom + prenom
    const existing = await User.findByEmail(email);
    if (existing) throw { status: 409, message: 'Email déjà utilisé' };

    const user = await User.create(email, password, nom, prenom); // ← nom + prenom
    return user;
}


module.exports = { login, register };
