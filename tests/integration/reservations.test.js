const request = require('supertest');
const { createTestDb } = require('../helpers/setupTestDb');

let app, db, userToken, adminToken;

beforeAll(async () => {
    db = await createTestDb();
    jest.resetModules();
    jest.doMock('../../src/db', () => db);
    app = require('../../src/app');

    const resUser = await request(app)
        .post('/auth/login')
        .send({ email: 'user@test.com', password: 'password123' });
    userToken = resUser.body.token;

    const resAdmin = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@test.com', password: 'admin123' });
    adminToken = resAdmin.body.token;
});

afterAll(() => new Promise((resolve) => db.close(resolve)));



describe('POST /reservations', () => {

    test('✅ 201 réservation créée sur une place libre', async () => {
        const res = await request(app)
            .post('/reservations')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ event_id: 1, seat_id: 1 });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
    });

    test('❌ 409 place déjà réservée — RÈGLE MÉTIER', async () => {
        const res = await request(app)
            .post('/reservations')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ event_id: 1, seat_id: 1 });

        expect(res.status).toBe(409);
        expect(res.body.error).toMatch(/déjà réservée/i);
    });

    test('❌ 401 sans token', async () => {
        const res = await request(app)
            .post('/reservations')
            .send({ event_id: 1, seat_id: 2 });

        expect(res.status).toBe(401);
    });

    test('❌ 404 si seat_id inexistant', async () => {
        const res = await request(app)
            .post('/reservations')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ event_id: 1, seat_id: 9999 });

        expect(res.status).toBe(404);
    });

    test('❌ 404 si event_id inexistant', async () => {
        const res = await request(app)
            .post('/reservations')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ event_id: 9999, seat_id: 2 });

        expect(res.status).toBe(404);
    });

});


describe('GET /reservations/me', () => {

    test('✅ 200 retourne les réservations du user connecté', async () => {
        const res = await request(app)
            .get('/reservations/me')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('❌ 401 sans token', async () => {
        const res = await request(app).get('/reservations/me');
        expect(res.status).toBe(401);
    });

});


describe('DELETE /reservations/:id', () => {

    test('✅ le propriétaire peut annuler sa réservation', async () => {
        const listRes = await request(app)
            .get('/reservations/me')
            .set('Authorization', `Bearer ${userToken}`);

        const reservationId = listRes.body[0].id;

        const res = await request(app)
            .delete(`/reservations/${reservationId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
    });

    test('❌ 404 si la réservation n\'existe pas', async () => {
        const res = await request(app)
            .delete('/reservations/9999')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(404);
    });

});
