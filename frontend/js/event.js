let panier = {};

document.addEventListener('DOMContentLoaded', () => {
    setupNavbar();
    loadEventFromUrl();
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

        if (user.role === 'admin') {
            linkAdmin.style.display = 'inline';
        }
    } else {
        navbarUser.innerHTML = `<a href="login.html" id="link-login">Connexion</a>`;
        linkAdmin.style.display = 'none';
    }
}

function loadEventFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId   = parseInt(urlParams.get('id'));

    if (!eventId) {
        showError('event-error', 'ID événement manquant dans l\'URL');
        return;
    }

    loadEventDetails(eventId);

    const user = getCurrentUser();
    if (!user) {
        showLoginRequired();
    } else {
        loadPlaces(eventId);
    }
}

async function loadEventDetails(eventId) {
    const detailsEl = document.getElementById('event-details');
    const errorEl   = document.getElementById('event-error');

    try {
        const event = await apiGetEventById(eventId);

        document.title = `${event.title} – Arènes de Dax`;

        document.getElementById('event-title-detail').textContent = event.title;
        document.getElementById('event-type').textContent         = event.type || '';
        document.getElementById('event-description').textContent  = event.description || '';
        document.getElementById('event-date').textContent         = formatDate(event.date);
        document.getElementById('event-heure').textContent        = event.heure || '';
        document.getElementById('event-capacity').textContent     = `${event.capacity || '—'} places`;

        detailsEl.style.display = 'block';

        document.getElementById('btn-back-to-events').onclick = () => {
            window.location.href = 'index.html';
        };

    } catch (err) {
        console.error('Erreur event:', err);
        errorEl.textContent = err.message || 'Événement non trouvé';
        errorEl.style.display = 'block';
    }
}

function showLoginRequired() {
    const listEl     = document.getElementById('places-list');
    const subtitleEl = document.getElementById('places-subtitle');
    const errorEl    = document.getElementById('places-error');

    subtitleEl.textContent = '';
    errorEl.style.display  = 'none';
    listEl.innerHTML       = '';

    const returnUrl = encodeURIComponent(window.location.href);

    listEl.innerHTML = `
        <div class="login-required-box">
            <div class="login-required-icon">🔒</div>
            <h3 class="login-required-title">Connexion requise</h3>
            <p class="login-required-text">
                Connectez-vous pour voir les places disponibles et effectuer une réservation.
            </p>
            <a href="login.html?redirect=${returnUrl}" class="btn btn-primary">
                Se connecter
            </a>
        </div>
    `;
}

async function loadPlaces(eventId) {
    const listEl     = document.getElementById('places-list');
    const emptyEl    = document.getElementById('places-empty');
    const errorEl    = document.getElementById('places-error');
    const subtitleEl = document.getElementById('places-subtitle');

    listEl.innerHTML      = '';
    emptyEl.style.display = 'none';
    errorEl.style.display = 'none';
    subtitleEl.textContent = 'Chargement des places...';

    panier = {};
    const panierEl = document.getElementById('panier-box');
    if (panierEl) panierEl.innerHTML = '';

    try {
        const [places, categories] = await Promise.all([
            apiGetAvailableSeats(eventId),
            apiGetCategories()
        ]);

        if (!places || places.length === 0) {
            subtitleEl.textContent = 'Aucune place disponible.';
            emptyEl.style.display  = 'block';
            return;
        }

        renderPlacesTable(eventId, places, categories, 'Ombre');

    } catch (err) {
        console.error('Erreur places:', err);
        subtitleEl.textContent = 'Impossible de charger les places.';
        errorEl.textContent    = err.message || 'Erreur lors du chargement des places.';
        errorEl.style.display  = 'block';
    }
}

function renderPlacesTable(eventId, places, categories, situationFilter) {
    const listEl     = document.getElementById('places-list');
    const subtitleEl = document.getElementById('places-subtitle');

    listEl.innerHTML = '';

    const filtered = places.filter(p =>
        p.situation.toLowerCase() === situationFilter.toLowerCase()
    );

    const grouped = {};
    filtered.forEach(p => {
        if (!grouped[p.category_id]) grouped[p.category_id] = [];
        grouped[p.category_id].push(p);
    });

    subtitleEl.textContent = `${filtered.length} place(s) disponible(s) — ${Object.keys(grouped).length} catégorie(s)`;

    const filterHtml = `
        <div class="exposition-filter">
            <label for="situation-filter">Exposition</label>
            <select id="situation-filter" class="filter-select">
                <option value="Ombre"        ${situationFilter === 'Ombre'        ? 'selected' : ''}>🌑 Ombre</option>
                <option value="Ombre-Soleil" ${situationFilter === 'Ombre-Soleil' ? 'selected' : ''}>🌗 Ombre-Soleil</option>
                <option value="Soleil-Ombre" ${situationFilter === 'Soleil-Ombre' ? 'selected' : ''}>🌓 Soleil-Ombre</option>
                <option value="Soleil"       ${situationFilter === 'Soleil'       ? 'selected' : ''}>☀️ Soleil</option>
            </select>
        </div>
    `;

    const table = document.createElement('div');
    table.className = 'places-table';

    table.innerHTML = `
        ${filterHtml}
        <div class="places-table-header">
            <span>Catégorie</span>
            <span>Exposition</span>
            <span>Prix</span>
            <span>Places dispo</span>
            <span>Quantité</span>
            <span></span>
        </div>
    `;

    if (Object.keys(grouped).length === 0) {
        table.innerHTML += `<div class="text-muted" style="padding:1.5rem;">Aucune place disponible pour cette exposition.</div>`;
        listEl.appendChild(table);
        table.querySelector('#situation-filter').addEventListener('change', (e) => {
            renderPlacesTable(eventId, places, categories, e.target.value);
        });
        return;
    }

    Object.entries(grouped).forEach(([catId, catPlaces]) => {
        const first  = catPlaces[0];
        const inCart = panier[catId]?.qty || 0;
        const row    = document.createElement('div');
        row.className = 'places-table-row';
        row.id = `row-cat-${catId}`;

        row.innerHTML = `
            <span class="places-cat-name">${escapeHtml(first.name)}</span>
            <span><span class="card-event-type">${escapeHtml(first.situation)}</span></span>
            <span class="places-price">${first.price}€</span>
            <span class="places-count">
                <span class="badge"><span class="badge-dot"></span>${catPlaces.length}</span>
            </span>
            <span>
                <div class="qty-control">
                    <button class="qty-btn" data-action="minus" data-cat="${catId}">−</button>
                    <span class="qty-value" id="qty-${catId}">${inCart || 1}</span>
                    <button class="qty-btn" data-action="plus" data-cat="${catId}" data-max="${catPlaces.length}">+</button>
                </div>
            </span>
            <span>
                <button class="btn btn-outline btn-sm btn-add-cart ${inCart > 0 ? 'btn-in-cart' : ''}"
                    data-cat-id="${catId}">
                    ${inCart > 0 ? '✅ Ajouté' : '+ Panier'}
                </button>
            </span>
        `;

        table.appendChild(row);
    });

    listEl.appendChild(table);

    renderPanier(eventId, grouped);

    table.querySelector('#situation-filter').addEventListener('change', (e) => {
        renderPlacesTable(eventId, places, categories, e.target.value);
    });

    listEl.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const catId  = btn.getAttribute('data-cat');
            const action = btn.getAttribute('data-action');
            const max    = parseInt(btn.getAttribute('data-max') || 99);
            const qtyEl  = document.getElementById(`qty-${catId}`);
            let val      = parseInt(qtyEl.textContent);
            if (action === 'plus' && val < max) val++;
            if (action === 'minus' && val > 1) val--;
            qtyEl.textContent = val;

            if (panier[catId]) {
                panier[catId].qty   = val;
                panier[catId].seats = grouped[catId].slice(0, val);
                renderPanier(eventId, grouped);
            }
        });
    });

    listEl.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const catId = btn.getAttribute('data-cat-id');
            const qty   = parseInt(document.getElementById(`qty-${catId}`).textContent);
            const first = grouped[catId][0];

            if (panier[catId]) {
                delete panier[catId];
                btn.textContent = '+ Panier';
                btn.classList.remove('btn-in-cart');
            } else {
                panier[catId] = {
                    qty,
                    seats:     grouped[catId].slice(0, qty),
                    name:      first.name,
                    price:     first.price,
                    situation: first.situation
                };
                btn.textContent = '✅ Ajouté';
                btn.classList.add('btn-in-cart');
            }

            renderPanier(eventId, grouped);
        });
    });
}

function renderPanier(eventId, grouped) {
    let panierEl = document.getElementById('panier-box');

    if (!panierEl) {
        panierEl = document.createElement('div');
        panierEl.id = 'panier-box';
        document.getElementById('places-list').after(panierEl);
    }

    const items = Object.entries(panier);

    if (items.length === 0) {
        panierEl.innerHTML = '';
        return;
    }

    const total    = items.reduce((sum, [, v]) => sum + v.price * v.qty, 0);
    const totalQty = items.reduce((sum, [, v]) => sum + v.qty, 0);

    panierEl.innerHTML = `
        <div class="panier-card">
            <div class="panier-header">
                <h3 class="panier-title">🛒 Mon panier</h3>
                <span class="panier-count">${totalQty} place(s)</span>
            </div>
            <div class="panier-items">
                ${items.map(([catId, item]) => `
                    <div class="panier-item">
                        <div>
                            <span class="panier-item-name">${escapeHtml(item.name)}</span>
                            <span class="panier-item-meta">${escapeHtml(item.situation)} • ${item.qty} place(s)</span>
                        </div>
                        <span class="panier-item-price">${(item.price * item.qty).toFixed(2)}€</span>
                    </div>
                `).join('')}
            </div>
            <div class="panier-footer">
                <div class="panier-total">
                    <span>Total</span>
                    <span class="panier-total-price">${total.toFixed(2)}€</span>
                </div>
                <button class="btn btn-primary" id="btn-valider-panier">
                    Confirmer la réservation
                </button>
            </div>
        </div>
    `;

    document.getElementById('btn-valider-panier').addEventListener('click', () => {
        validerPanier(eventId);
    });
}

async function validerPanier(eventId) {
    const items    = Object.entries(panier);
    const totalQty = items.reduce((sum, [, v]) => sum + v.qty, 0);

    if (!confirm(`Confirmer la réservation de ${totalQty} place(s) ?`)) return;

    const btn = document.getElementById('btn-valider-panier');
    btn.textContent = 'Réservation en cours...';
    btn.disabled    = true;

    try {
        const reservationIds = [];

        for (const [, item] of items) {
            for (const seat of item.seats) {
                const res = await apiCreateReservation(parseInt(eventId), parseInt(seat.id));
                reservationIds.push(res.id);
            }
        }

        panier = {};
        window.location.href = `reservation.html?ids=${reservationIds.join(',')}`;

    } catch (err) {
        console.error('Erreur réservation:', err);
        alert(err.message || 'Erreur lors de la réservation');
        btn.textContent = 'Confirmer la réservation';
        btn.disabled    = false;
        loadPlaces(eventId);
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
}

function showError(errorId, message) {
    const errorEl = document.getElementById(errorId);
    errorEl.textContent   = message;
    errorEl.style.display = 'block';
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}