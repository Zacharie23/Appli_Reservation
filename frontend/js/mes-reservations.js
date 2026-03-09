document.addEventListener('DOMContentLoaded', () => {
    setupNavbar();
    requireAuth();
    loadReservations();
});

function setupNavbar() {
    const user = getCurrentUser();
    const navbarUser = document.getElementById('navbar-user');
    const linkAdmin = document.getElementById('link-admin');

    if (user) {
        navbarUser.innerHTML = `
            <button class="btn btn-outline btn-sm" id="btn-logout">Déconnexion</button>
        `;
        document.getElementById('btn-logout').addEventListener('click', logout);

        if (user.role === 'admin') {
            linkAdmin.style.display = 'inline';
        }
    }
}

async function loadReservations() {
    const listEl = document.getElementById('reservations-list');
    const emptyEl = document.getElementById('reservations-empty');
    const errorEl = document.getElementById('reservations-error');
    const subtitleEl = document.getElementById('reservations-subtitle');

    listEl.innerHTML = '';
    emptyEl.style.display = 'none';
    errorEl.style.display = 'none';
    subtitleEl.textContent = 'Chargement de vos réservations...';

    try {
        const reservations = await apiGetMyReservations();

        if (!reservations || reservations.length === 0) {
            subtitleEl.textContent = 'Aucune réservation.';
            emptyEl.style.display = 'block';
            return;
        }

        subtitleEl.textContent = `${reservations.length} réservation(s) en cours`;

        reservations.forEach(res => {
            const card = document.createElement('article');
            card.className = 'reservation-card';
            card.id = `res-${res.id}`;

            card.innerHTML = `
                <div class="reservation-card-left">
                    <div class="reservation-event-date">
                        <span class="res-day">${formatDay(res.event_date)}</span>
                        <span class="res-month">${formatMonth(res.event_date)}</span>
                        <span class="res-year">${formatYear(res.event_date)}</span>
                    </div>
                </div>

                <div class="reservation-card-body">
                    <div class="reservation-card-top">
                        <div>
                            <h3 class="reservation-event-title">${escapeHtml(res.event_title)}</h3>
                            <span class="card-event-type">${escapeHtml(res.category_name)} • ${escapeHtml(res.category_situation)}</span>
                        </div>
                        <div class="reservation-price">${res.category_price}€</div>
                    </div>

                    <div class="reservation-card-meta">
                        <span>🕐 ${res.event_heure || ''}</span>
                        <span>🎫 ${escapeHtml(res.seat_value)}</span>
                        <span class="res-created">Réservée le ${formatDateTime(res.created_at)}</span>
                    </div>

                    <div class="reservation-card-footer">
                        <button class="btn btn-outline btn-sm" onclick="window.location.href='event.html?id=${res.event_id}'">
                            Voir l'événement
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="cancelReservation(${res.id})">
                            Annuler
                        </button>
                    </div>
                </div>
            `;

            listEl.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        subtitleEl.textContent = 'Impossible de charger vos réservations.';
        errorEl.textContent = err.message || 'Erreur lors du chargement.';
        errorEl.style.display = 'block';
    }
}

async function cancelReservation(reservationId) {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;

    try {
        await apiDeleteReservation(reservationId);

        const card = document.getElementById(`res-${reservationId}`);
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateX(-20px)';
            card.style.transition = 'all 0.3s ease';
            setTimeout(() => card.remove(), 300);
        }

        const successEl = document.getElementById('success-msg');
        successEl.innerHTML = `<div class="alert alert-success">✅ Réservation annulée avec succès.</div>`;
        setTimeout(() => successEl.innerHTML = '', 4000);

        setTimeout(() => loadReservations(), 400);

    } catch (err) {
        console.error(err);
        alert(err.message || 'Erreur lors de l\'annulation');
    }
}

function formatDay(dateStr) {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit' });
}

function formatMonth(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
}

function formatYear(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).getFullYear();
}

function formatDateTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}