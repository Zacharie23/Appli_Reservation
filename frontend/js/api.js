const API_BASE_URL = 'http://localhost:3000';

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

async function apiLogin(email, password) {
    const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    saveAuth(res.token, res.user);
    return res;
    }

async function apiRegister(email, password, nom, prenom) {
    return await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, nom, prenom }),
    });
}

async function apiGetEvents() {
    return await apiRequest('/events', { method: 'GET' });
}

async function apiGetEventById(id) {
    return await apiRequest(`/events/${id}`, { method: 'GET' });
}

async function apiGetCategories() {
    return await apiRequest('/categories', { method: 'GET' });
}

async function apiGetSeats() {
    return await apiRequest('/seats', { method: 'GET' });
}

async function apiGetAvailableSeats(eventId) {
    return await apiRequest(`/seats/available/${eventId}`, { method: 'GET' });
}

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

async function apiGetUsers() {
    return await apiRequest('/users', { method: 'GET' });
}

async function apiCreateUser(data) {
    return await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async function apiUpdateUser(id, data) {
    return await apiRequest(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async function apiDeleteUser(id) {
    return await apiRequest(`/users/${id}`, { method: 'DELETE' });
}