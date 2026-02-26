// frontend/js/reservation.js

document.addEventListener('DOMContentLoaded', () => {
    setupNavbar();
    loadReservationFromUrl();
});

function setupNavbar() {
    const user = getCurrentUser();
    const navbarUser = document.getElementById('navbar-user');
    const linkLogin = document.getElementById('link-login');
    const linkAdmin = document.getElementById('link-admin');

    if (user) {
        navbarUser.innerHTML = `
        <span>Bonjour, ${user.email}</span>
        <button class="btn btn-outline btn-sm" id="btn-logout">Déconnexion</button>
        `;
        document.getElementById('btn-logout').addEventListener('click', logout);
        
        if (user.role === 'admin') {
        linkAdmin.style.display = 'inline';
        }
    } else {
        navbarUser.innerHTML = `<a href="login.html" id="link-login">Connexion</a>`;
        linkAdmin.style.display = 'none';
    }
}

function loadReservationFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const reservationId = parseInt(urlParams.get('id'));

    if (!reservationId) {
        showError('ID réservation manquant dans l\'URL');
        return;
    }

    loadReservationDetails(reservationId);
}

async function loadReservationDetails(reservationId) {
    const detailsEl = document.getElementById('reservation-details');

    try {
        // On utilise apiGetMyReservations pour récupérer les détails
        const reservations = await apiGetMyReservations();
        const reservation = reservations.find(r => r.id == reservationId);

        if (!reservation) {
        throw new Error('Réservation non trouvée');
        }

        detailsEl.innerHTML = `
        <div style="margin-bottom: 1.2rem;">
            <h3 style="margin-bottom: 0.4rem;">${escapeHtml(reservation.event_title)}</h3>
            <div class="text-muted" style="font-size: 0.9rem;">
            <div>${escapeHtml(reservation.event_date)} à ${escapeHtml(reservation.event_heure)}</div>
            <div>${escapeHtml(reservation.seat_value)}</div>
            <div>${escapeHtml(reservation.category_name)} • ${escapeHtml(reservation.category_situation)}</div>
            <div style="font-weight: 600; color: var(--color-primary); margin-top: 0.2rem;">
                ${reservation.category_price}€
            </div>
            </div>
        </div>
        <div class="text-muted" style="font-size: 0.85rem;">
            <p>Réservée le <strong>${reservation.created_at}</strong></p>
        </div>
        `;

    } catch (err) {
        console.error('Erreur réservation:', err);
        detailsEl.innerHTML = `
        <div class="alert alert-error">
            <strong>Erreur :</strong> ${escapeHtml(err.message || 'Réservation non trouvée')}
        </div>
        `;
    }
}

function showError(message) {
    document.getElementById('reservation-details').innerHTML = `
        <div class="alert alert-error">
        <strong>Erreur :</strong> ${escapeHtml(message)}
        </div>
    `;
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
