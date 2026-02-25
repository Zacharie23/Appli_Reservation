const authService = require('../services/AuthService');

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

async function register(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await authService.register(email, password);
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
}

module.exports = { login, register };
