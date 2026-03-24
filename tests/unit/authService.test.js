const authService = require('../../src/services/AuthService');
const User = require('../../src/models/UserModel');

jest.mock('../../src/models/UserModel');


describe('AuthService.login', () => {

    beforeEach(() => jest.clearAllMocks());

    test('✅ retourne un token et l\'user si credentials valides', async () => {
        User.findByEmail.mockResolvedValue({
            id: 1, email: 'test@test.com', password: 'hashed', role: 'user',
            nom: 'Dupont', prenom: 'Jean'
        });
        User.verifyPassword.mockResolvedValue(true);

        const result = await authService.login('test@test.com', 'password123');

        expect(result).toHaveProperty('token');
        expect(result.user).not.toHaveProperty('password');
        expect(result.user.email).toBe('test@test.com');
    });

    test('❌ lance une erreur 401 si l\'email est inconnu', async () => {
        User.findByEmail.mockResolvedValue(null);

        await expect(
            authService.login('inconnu@test.com', 'password123')
        ).rejects.toMatchObject({ status: 401, message: 'Utilisateur non trouvé' });
    });

    test('❌ lance une erreur 401 si le mot de passe est incorrect', async () => {
        User.findByEmail.mockResolvedValue({
            id: 1, email: 'test@test.com', password: 'hashed', role: 'user'
        });
        User.verifyPassword.mockResolvedValue(false);

        await expect(
            authService.login('test@test.com', 'mauvais_mdp')
        ).rejects.toMatchObject({ status: 401, message: 'Mot de passe incorrect' });
    });

});


describe('AuthService.register', () => {

    beforeEach(() => jest.clearAllMocks());

    test('✅ crée un utilisateur si l\'email est libre', async () => {
        User.findByEmail.mockResolvedValue(null);
        User.create.mockResolvedValue({
            id: 2, email: 'nouveau@test.com', nom: 'Martin', prenom: 'Léa', role: 'user'
        });

        const result = await authService.register('nouveau@test.com', 'pass123', 'Martin', 'Léa');

        expect(result.email).toBe('nouveau@test.com');
        expect(User.create).toHaveBeenCalledWith('nouveau@test.com', 'pass123', 'Martin', 'Léa');
    });

    test('❌ lance une erreur 409 si l\'email est déjà utilisé', async () => {
        User.findByEmail.mockResolvedValue({ id: 1, email: 'existe@test.com' });

        await expect(
            authService.register('existe@test.com', 'pass123', 'Nom', 'Prenom')
        ).rejects.toMatchObject({ status: 409, message: 'Email déjà utilisé' });

        expect(User.create).not.toHaveBeenCalled();
    });

});