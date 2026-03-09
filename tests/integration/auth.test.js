const request = require('supertest');
const { createTestDb } = require('../helpers/setupTestDb');

let app, db;

beforeAll(async () => {
    db = await createTestDb();
    jest.resetModules();
    jest.doMock('../../src/db', () => db);
    app = require('../../src/app');
});

afterAll(() => new Promise((resolve) => db.close(resolve)));



describe('POST /auth/login', () => {

    test('✅ 200 avec token si credentials valides', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'user@test.com', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).not.toHaveProperty('password');
    });

    test('❌ 401 si email inconnu', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'inconnu@test.com', password: 'password123' });

        expect(res.status).toBe(401);
    });

    test('❌ 401 si mauvais mot de passe', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'user@test.com', password: 'mauvais' });

        expect(res.status).toBe(401);
    });

    test('❌ 400 si champs manquants', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'user@test.com' });

        expect(res.status).toBe(400);
    });

});


describe('POST /auth/register', () => {

    test('✅ 201 si nouvel email valide', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({
                email: 'nouveau@test.com', password: 'pass123',
                nom: 'Martin', prenom: 'Léa'
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
    });

    test('❌ 409 si email déjà utilisé', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({
                email: 'user@test.com', password: 'pass123',
                nom: 'Dupont', prenom: 'Jean'
            });

        expect(res.status).toBe(409);
    });

    test('❌ 400 si nom/prénom manquants', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'test2@test.com', password: 'pass123' });

        expect(res.status).toBe(400);
    });

});
