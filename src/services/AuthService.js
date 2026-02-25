const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');

async function login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) throw { status: 401, message: 'Utilisateur non trouvé' };

    const isValid = await User.verifyPassword(password, user.password);
    if (!isValid) throw { status: 401, message: 'Mot de passe incorrect' };

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'SECRET_KEY',
        { expiresIn: '1h' }
    );
    
    const { password: pwd, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
}

module.exports = { login };