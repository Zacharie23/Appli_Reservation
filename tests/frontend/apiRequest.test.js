global.fetch = jest.fn();

global.localStorage = {
    _store: {},
    getItem(key)        { return this._store[key] || null; },
    setItem(key, value) { this._store[key] = value; },
    removeItem(key)     { delete this._store[key]; },
};

function getToken() {
    return localStorage.getItem('arena_token');
}

async function apiRequest(path, options = {}) {
    const token   = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`http://localhost:3000${path}`, { ...options, headers });

    let data = null;
    const ct = response.headers.get('Content-Type') || '';
    if (ct.includes('application/json')) {
        data = await response.json().catch(() => null);
    }

    if (!response.ok) {
        const message = (data && (data.error || data.message)) || `Erreur HTTP ${response.status}`;
        const error   = new Error(message);
        error.status  = response.status;
        throw error;
    }

    return data;
}


describe('apiRequest()', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.removeItem('arena_token');
    });

    test('✅ retourne les données si la réponse est 200', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            headers: { get: () => 'application/json' },
            json: async () => ({ id: 1, title: 'Corrida' }),
        });

        const data = await apiRequest('/events/1');
        expect(data.title).toBe('Corrida');
    });

    test('❌ lance une erreur avec status 401 si non authentifié', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 401,
            headers: { get: () => 'application/json' },
            json: async () => ({ message: 'Token manquant' }),
        });

        await expect(apiRequest('/reservations/me'))
            .rejects.toMatchObject({ status: 401, message: 'Token manquant' });
    });

    test('❌ lance une erreur 409 avec le bon message pour place déjà réservée', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 409,
            headers: { get: () => 'application/json' },
            json: async () => ({ error: 'Cette place est déjà réservée pour cet événement' }),
        });

        await expect(apiRequest('/reservations', { method: 'POST' }))
            .rejects.toMatchObject({
                status: 409,
                message: 'Cette place est déjà réservée pour cet événement'
            });
    });

    test('❌ lance une erreur 404 avec message générique si pas de body JSON', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 404,
            headers: { get: () => 'text/html' },
            text: async () => 'Not Found',
        });

        await expect(apiRequest('/events/9999'))
            .rejects.toMatchObject({ status: 404 });
    });

    test('✅ ajoute le token Authorization si connecté', async () => {
        localStorage.setItem('arena_token', 'mon_token_jwt');

        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            headers: { get: () => 'application/json' },
            json: async () => ([]),
        });

        await apiRequest('/reservations/me');

        const callHeaders = global.fetch.mock.calls[0][1].headers;
        expect(callHeaders['Authorization']).toBe('Bearer mon_token_jwt');
    });

});