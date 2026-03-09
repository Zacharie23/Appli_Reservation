document.addEventListener('DOMContentLoaded', () => {
    setupNavbar();
    loadReservationsFromUrl();
});

function setupNavbar() {
    const user       = getCurrentUser();
    const navbarUser = document.getElementById('navbar-user');
    const linkAdmin  = document.getElementById('link-admin');

    if (user) {
        navbarUser.innerHTML = `
            <button class="btn btn-outline btn-sm" id="btn-logout">Déconnexion</button>
        `;
        document.getElementById('btn-logout').addEventListener('click', logout);
        if (user.role === 'admin') linkAdmin.style.display = 'inline';
    } else {
        navbarUser.innerHTML = `<a href="login.html">Connexion</a>`;
        linkAdmin.style.display = 'none';
    }
}

function loadReservationsFromUrl() {
    const params   = new URLSearchParams(window.location.search);
    const idsParam = params.get('ids') || params.get('id');

    if (!idsParam) {
        showError('ID réservation manquant dans l\'URL');
        return;
    }

    const ids = idsParam.split(',').map(id => parseInt(id)).filter(Boolean);
    loadReservations(ids);
}

async function loadReservations(ids) {
    const detailsEl = document.getElementById('reservation-details');

    try {
        const allReservations = await apiGetMyReservations();

        const reservations = ids.map(id => {
            const found = allReservations.find(r => r.id == id);
            if (!found) throw new Error(`Réservation #${id} non trouvée`);
            return found;
        });

        if (ids.length > 1) {
            document.querySelector('.confirmation-title').textContent =
                `${ids.length} réservations confirmées !`;
            document.querySelector('.confirmation-subtitle').textContent =
                `Vos ${ids.length} places ont bien été réservées aux Arènes de Dax`;
        }

        detailsEl.innerHTML = '';

        reservations.forEach((res, i) => {
            const card = document.createElement('div');
            card.className = ids.length > 1 ? 'reservation-card' : '';

            card.innerHTML = `
                ${ids.length > 1 ? `<div class="reservation-card-index">Place ${i + 1}</div>` : ''}
                <div class="confirmation-event-title">${escapeHtml(res.event_title)}</div>
                <hr>
                <div class="confirmation-row">
                    <div class="confirmation-block">
                        <span class="confirmation-label">📅 DATE</span>
                        <span class="confirmation-value">${formatDate(res.event_date)}</span>
                    </div>
                    <div class="confirmation-block">
                        <span class="confirmation-label">🕐 HEURE</span>
                        <span class="confirmation-value">${res.event_heure || '—'}</span>
                    </div>
                    <div class="confirmation-block">
                        <span class="confirmation-label">🪑 PLACE</span>
                        <span class="confirmation-value">${escapeHtml(res.seat_value)}</span>
                    </div>
                    <div class="confirmation-block">
                        <span class="confirmation-label">🏷️ CATÉGORIE</span>
                        <span class="confirmation-value">${escapeHtml(res.category_name)} • ${escapeHtml(res.category_situation)}</span>
                    </div>
                </div>
                <div class="confirmation-price">${res.category_price}€</div>
                <div class="confirmation-date">Réservée le ${formatDateTime(res.created_at)}</div>
            `;

            detailsEl.appendChild(card);
        });

        if (ids.length > 1) {
            const total = reservations.reduce((sum, r) => sum + parseFloat(r.category_price || 0), 0);
            const totalCard = document.createElement('div');
            totalCard.className = 'reservation-total-card';
            totalCard.innerHTML = `
                <span>Total payé</span>
                <span class="panier-total-price">${total.toFixed(2)}€</span>
            `;
            detailsEl.appendChild(totalCard);
        }

    } catch (err) {
        console.error(err);
        showError(err.message || 'Erreur lors du chargement');
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function showError(message) {
    document.getElementById('reservation-details').innerHTML = `
        <div class="alert alert-error">${escapeHtml(message)}</div>
    `;
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}