// frontend/js/mes-reservations.js

document.addEventListener('DOMContentLoaded', () => {
    setupNavbar();
    requireAuth(); // Redirige si pas connecté
    loadReservations();
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
        card.className = 'card';

        const date = res.event_date || '';
        const heure = res.event_heure || '';

        card.innerHTML = `
            <div class="card-header">
            <div>
                <h3 class="card-title">${escapeHtml(res.event_title)}</h3>
                <div class="card-subtitle">${escapeHtml(res.seat_value)}</div>
                <div class="card-event-type">${escapeHtml(res.category_name)} • ${escapeHtml(res.category_situation)}</div>
            </div>
            <div class="text-right">
                <div class="card-event-title">${res.category_price}€</div>
            </div>
            </div>
            <div class="card-event-meta" style="margin-bottom: 0.6rem;">
            <div>${date} à ${heure}</div>
            <div style="font-size: 0.85rem; color: var(--color-text-muted);">Réservée le ${res.created_at}</div>
            </div>
            <div class="card-footer">
            <button class="btn btn-outline" onclick="window.location.href='index.html'">
                Voir l'événement
            </button>
            <button class="btn btn-primary" onclick="cancelReservation(${res.id})">
                Annuler
            </button>
            </div>
        `;

        listEl.appendChild(card);
        });

    } catch (err) {
        console.error('Erreur réservations:', err);
        subtitleEl.textContent = 'Impossible de charger vos réservations.';
        errorEl.textContent = err.message || 'Erreur lors du chargement.';
        errorEl.style.display = 'block';
    }
}

async function cancelReservation(reservationId) {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;

    try {
        await apiDeleteReservation(reservationId);
        
        // Recharger la liste
        loadReservations();
        
        // Message de succès
        const successEl = document.createElement('div');
        successEl.className = 'alert alert-success';
        successEl.textContent = 'Réservation annulée avec succès.';
        document.querySelector('.section-header').parentNode.insertBefore(successEl, document.querySelector('.section-header').nextSibling);
        
        // Auto-disparition
        setTimeout(() => successEl.remove(), 4000);
        
    } catch (err) {
        console.error('Erreur annulation:', err);
        alert(err.message || 'Erreur lors de l\'annulation');
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
