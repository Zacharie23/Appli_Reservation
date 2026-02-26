// frontend/js/api.js

const API_BASE_URL = 'http://localhost:3000';

/**
 * Wrapper générique pour les appels API
 */
async function apiRequest(path, options = {}) {
    const token = getToken();
    const headers = options.headers ? { ...options.headers } : {};

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    let data = null;
    const contentType = response.headers.get('Content-Type') || '';

    if (contentType.includes('application/json')) {
        data = await response.json().catch(() => null);
    } else {
        data = await response.text().catch(() => null);
    }

    if (!response.ok) {
        const message =
        (data && (data.error || data.message || (data.errors && data.errors.join(', ')))) ||
        `Erreur HTTP ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        error.raw = data;
        throw error;
    }

    return data;
}

/* ========== AUTH ========== */

async function apiLogin(email, password) {
    const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    // On suppose que le backend renvoie { token, user }
    saveAuth(res.token, res.user);
    return res;
    }

async function apiRegister(email, password, nom, prenom) { // ← nom + prenom
    return await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, nom, prenom }), // ← nom + prenom
    });
}

/* ========== EVENTS ========== */

async function apiGetEvents() {
    return await apiRequest('/events', { method: 'GET' });
}

async function apiGetEventById(id) {
    return await apiRequest(`/events/${id}`, { method: 'GET' });
}

/* ========== CATEGORIES ========== */

async function apiGetCategories() {
    return await apiRequest('/categories', { method: 'GET' });
}

/* ========== SEATS ========== */

async function apiGetSeats() {
    return await apiRequest('/seats', { method: 'GET' });
}

async function apiGetAvailableSeats(eventId) {
    return await apiRequest(`/seats/available/${eventId}`, { method: 'GET' });
}

/* ========== RESERVATIONS ========== */

async function apiGetMyReservations() {
    return await apiRequest('/reservations/me', { method: 'GET' });
}

async function apiCreateReservation(eventId, seatId) {
    return await apiRequest('/reservations', {
        method: 'POST',
        body: JSON.stringify({ event_id: eventId, seat_id: seatId }),
    });
}

async function apiDeleteReservation(id) {
    return await apiRequest(`/reservations/${id}`, {
        method: 'DELETE',
    });
}

/* ========== ADMIN (Events) ========== */

async function apiCreateEvent(eventData) {
    return await apiRequest('/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
    });
}

async function apiUpdateEvent(id, eventData) {
    return await apiRequest(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(eventData),
    });
}

async function apiPatchEvent(id, partialData) {
    return await apiRequest(`/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(partialData),
    });
}

async function apiDeleteEvent(id) {
    return await apiRequest(`/events/${id}`, {
        method: 'DELETE',
    });
}
