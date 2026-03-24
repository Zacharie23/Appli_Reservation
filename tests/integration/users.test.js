const request = require('supertest');
const { createTestDb } = require('../helpers/setupTestDb');

let app, db, adminToken, userToken;

beforeAll(async () => {
    db = await createTestDb();
    jest.resetModules();
    jest.doMock('../../src/db', () => db);
    app = require('../../src/app');

    const resAdmin = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'admin123' });
    adminToken = resAdmin.body.token;

    const resUser = await request(app)
        .post('/auth/login')
        .send({ email: 'user@test.com', password: 'password123' });
    userToken = resUser.body.token;
});

afterAll(() => new Promise((resolve) => db.close(resolve)));


describe('GET /users', () => {

    test('✅ 200 admin récupère la liste des users', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('❌ 403 si user non admin essaie d\'accéder', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(403);
    });

    test('❌ 401 sans token', async () => {
        const res = await request(app).get('/users');
        expect(res.status).toBe(401);
    });

});