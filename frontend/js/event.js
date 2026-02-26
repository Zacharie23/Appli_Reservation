// frontend/js/event.js

document.addEventListener('DOMContentLoaded', () => {
    setupNavbar();
    loadEventFromUrl();
});


function setupNavbar() {
    const user = getCurrentUser();
    const navbarUser = document.getElementById('navbar-user');
    const linkAdmin = document.getElementById('link-admin');

    if (user) {
        // Juste le bouton déconnexion, sans email
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
    const eventId = parseInt(urlParams.get('id'));

    if (!eventId) {
        showError('event-error', 'ID événement manquant dans l\'URL');
        return;
    }

    loadEventDetails(eventId);
    loadPlaces(eventId);
    loadCategories(eventId);
}


async function loadEventDetails(eventId) {
    const detailsEl = document.getElementById('event-details');
    const errorEl = document.getElementById('event-error');

    try {
        const event = await apiGetEventById(eventId);

        // Titre page
        document.title = `${event.title} – Arènes de Dax`;

        // Nouveau HTML hero
        document.getElementById('event-title-detail').textContent = event.title;
        document.getElementById('event-type').textContent = event.type || '';
        document.getElementById('event-description').textContent = event.description || '';
        document.getElementById('event-date').textContent = formatDate(event.date);
        document.getElementById('event-heure').textContent = event.heure || '';
        document.getElementById('event-capacity').textContent = `${event.capacity || '—'} places`;

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


async function loadCategories(eventId) {
    try {
        const categories = await apiGetCategories();
        const filterEl = document.getElementById('category-filter');

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = `${cat.name} (${cat.situation}) - ${cat.price}€`;
            filterEl.appendChild(option);
        });

        filterEl.onchange = () => loadPlaces(eventId);
    } catch (err) {
        console.error('Erreur catégories:', err);
    }
}


async function loadPlaces(eventId) {
    const listEl = document.getElementById('places-list');
    const emptyEl = document.getElementById('places-empty');
    const errorEl = document.getElementById('places-error');
    const subtitleEl = document.getElementById('places-subtitle');

    listEl.innerHTML = '';
    emptyEl.style.display = 'none';
    errorEl.style.display = 'none';
    subtitleEl.textContent = 'Chargement des places...';

    try {
        const [places, categories] = await Promise.all([
            apiGetAvailableSeats(eventId),
            apiGetCategories()
        ]);

        if (!places || places.length === 0) {
            subtitleEl.textContent = 'Aucune place disponible.';
            emptyEl.style.display = 'block';
            return;
        }

        renderPlacesTable(eventId, places, categories, 'Ombre'); // ← Ombre par défaut

    } catch (err) {
        console.error('Erreur places:', err);
        subtitleEl.textContent = 'Impossible de charger les places.';
        errorEl.textContent = err.message || 'Erreur lors du chargement des places.';
        errorEl.style.display = 'block';
    }
}


function renderPlacesTable(eventId, places, categories, situationFilter) {
    const listEl = document.getElementById('places-list');
    const subtitleEl = document.getElementById('places-subtitle');
    const emptyEl = document.getElementById('places-empty');

    listEl.innerHTML = '';

    // Filtre exposition
    const filtered = places.filter(p =>
        p.situation.toLowerCase() === situationFilter.toLowerCase()
    );

    // Grouper par category_id
    const grouped = {};
    filtered.forEach(p => {
        if (!grouped[p.category_id]) grouped[p.category_id] = [];
        grouped[p.category_id].push(p);
    });

    subtitleEl.textContent = `${filtered.length} place(s) disponible(s) — ${Object.keys(grouped).length} catégorie(s)`;

    // Sélecteur exposition
    const filterHtml = `
        <div class="exposition-filter">
            <label for="situation-filter">Exposition</label>
            <select id="situation-filter" class="filter-select">
                <option value="Ombre"         ${situationFilter === 'Ombre'          ? 'selected' : ''}>🌑 Ombre</option>
                <option value="Ombre-Soleil"  ${situationFilter === 'Ombre-Soleil'   ? 'selected' : ''}>🌗 Ombre-Soleil</option>
                <option value="Soleil-Ombre"  ${situationFilter === 'Soleil-Ombre'   ? 'selected' : ''}>🌓 Soleil-Ombre</option>
                <option value="Soleil"        ${situationFilter === 'Soleil'         ? 'selected' : ''}>☀️ Soleil</option>
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

        // Listener filtre quand même
        table.querySelector('#situation-filter').addEventListener('change', (e) => {
            renderPlacesTable(eventId, places, categories, e.target.value);
        });
        return;
    }

    Object.entries(grouped).forEach(([catId, catPlaces]) => {
        const first = catPlaces[0];

        const row = document.createElement('div');
        row.className = 'places-table-row';

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
                    <span class="qty-value" id="qty-${catId}">1</span>
                    <button class="qty-btn" data-action="plus" data-cat="${catId}" data-max="${catPlaces.length}">+</button>
                </div>
            </span>
            <span>
                <button class="btn btn-primary btn-sm" data-cat-id="${catId}">
                    Réserver
                </button>
            </span>
        `;

        table.appendChild(row);
    });

    listEl.appendChild(table);

    // Listener filtre exposition
    table.querySelector('#situation-filter').addEventListener('change', (e) => {
        renderPlacesTable(eventId, places, categories, e.target.value);
    });

    // Listeners quantité
    listEl.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const catId = btn.getAttribute('data-cat');
            const action = btn.getAttribute('data-action');
            const max = parseInt(btn.getAttribute('data-max') || 99);
            const qtyEl = document.getElementById(`qty-${catId}`);
            let val = parseInt(qtyEl.textContent);
            if (action === 'plus' && val < max) val++;
            if (action === 'minus' && val > 1) val--;
            qtyEl.textContent = val;
        });
    });

    // Listeners boutons Réserver
    listEl.querySelectorAll('button[data-cat-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            const catId = btn.getAttribute('data-cat-id');
            const qty = parseInt(document.getElementById(`qty-${catId}`).textContent);
            const seatsToBook = grouped[catId].slice(0, qty);
            reservePlaces(eventId, seatsToBook, qty);
        });
    });
}


async function reservePlaces(eventId, seats, qty) {
    const label = qty > 1 ? `${qty} places` : '1 place';
    if (!confirm(`Confirmer la réservation de ${label} ?`)) return;

    try {
        // Réserve chaque place séquentiellement
        let lastRes;
        for (const seat of seats) {
            lastRes = await apiCreateReservation(parseInt(eventId), parseInt(seat.id));
        }
        window.location.href = `reservation.html?id=${lastRes.id}`;
    } catch (err) {
        console.error('Erreur réservation:', err);
        alert(err.message || 'Erreur lors de la réservation');
        loadPlaces(eventId);
    }
}


// loadCategories n'est plus nécessaire, supprime son appel dans loadEventFromUrl
function loadEventFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = parseInt(urlParams.get('id'));

    if (!eventId) {
        showError('event-error', 'ID événement manquant dans l\'URL');
        return;
    }

    loadEventDetails(eventId);
    loadPlaces(eventId); // ← categories chargées en interne
}


function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
}


function showError(errorId, message) {
    const errorEl = document.getElementById(errorId);
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}


function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
