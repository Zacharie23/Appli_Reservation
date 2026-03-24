const userService = require('../../src/services/UserService');
const UserModel = require('../../src/models/UserModel');

jest.mock('../../src/models/UserModel');


describe('UserService.deleteUser', () => {

    beforeEach(() => jest.clearAllMocks());

    test('✅ supprime un utilisateur existant', async () => {
        UserModel.remove.mockResolvedValue({ deleted: true });

        const result = await userService.deleteUser(2, 1);
        expect(result).toEqual({ deleted: true });
    });

    test('❌ lance une erreur 400 si l\'admin essaie de se supprimer lui-même', async () => {
        await expect(
            userService.deleteUser(1, 1)
        ).rejects.toMatchObject({ status: 400, message: 'Vous ne pouvez pas supprimer votre propre compte' });

        expect(UserModel.remove).not.toHaveBeenCalled();
    });

});


describe('UserService.updateUser', () => {

    beforeEach(() => jest.clearAllMocks());

    test('✅ met à jour un utilisateur sans conflit d\'email', async () => {
        UserModel.findByEmail.mockResolvedValue(null);
        UserModel.update.mockResolvedValue({ id: 1, email: 'new@test.com', role: 'user' });

        const result = await userService.updateUser(1, { email: 'new@test.com' });
        expect(result.email).toBe('new@test.com');
    });

    test('❌ lance une erreur 409 si le nouvel email est déjà pris par un autre user', async () => {
        UserModel.findByEmail.mockResolvedValue({ id: 2, email: 'pris@test.com' });

        await expect(
            userService.updateUser(1, { email: 'pris@test.com' })
        ).rejects.toMatchObject({ status: 409, message: 'Email déjà utilisé' });
    });

});