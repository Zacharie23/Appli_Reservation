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



describe('GET /events', () => {

    test('✅ 200 retourne la liste des événements (sans auth)', async () => {
        const res = await request(app).get('/events');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

});


describe('POST /events', () => {

    const newEvent = {
        title: 'Course landaise', type: 'Course landaise',
        date: '2026-09-01', heure: '18:00', capacity: 3000
    };

    test('✅ 201 si admin crée un événement', async () => {
        const res = await request(app)
            .post('/events')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(newEvent);

        expect(res.status).toBe(201);
        expect(res.body.title).toBe('Course landaise');
    });

    test('❌ 403 si user non admin essaie de créer', async () => {
        const res = await request(app)
            .post('/events')
            .set('Authorization', `Bearer ${userToken}`)
            .send(newEvent);

        expect(res.status).toBe(403);
    });

    test('❌ 401 sans token', async () => {
        const res = await request(app).post('/events').send(newEvent);
        expect(res.status).toBe(401);
    });

    test('❌ 400 si champs obligatoires manquants', async () => {
        const res = await request(app)
            .post('/events')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ title: 'Incomplet' });

        expect(res.status).toBe(400);
    });

});


describe('DELETE /events/:id', () => {

    test('✅ 200 si admin supprime un événement existant', async () => {
        const created = await request(app)
            .post('/events')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                title: 'À supprimer', type: 'Concert',
                date: '2026-10-01', heure: '20:00', capacity: 500
            });

        const res = await request(app)
            .delete(`/events/${created.body.id}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
    });

    test('❌ 403 si user essaie de supprimer', async () => {
        const res = await request(app)
            .delete('/events/1')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(403);
    });

});
