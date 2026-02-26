// frontend/js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    requireAdmin();
    setupNavbar();
    setupEventListeners();
    loadAdminEvents();
});

function setupNavbar() {
    const user = getCurrentUser();
    const navbarUser = document.getElementById('navbar-user');
    
    navbarUser.innerHTML = `
        <span>Bonjour, ${user.email} (Admin)</span>
        <button class="btn btn-outline btn-sm" id="btn-logout">Déconnexion</button>
    `;
    document.getElementById('btn-logout').addEventListener('click', logout);
}

function setupEventListeners() {
    document.getElementById('btn-new-event').addEventListener('click', openNewEventModal);
    document.getElementById('event-form').addEventListener('submit', handleEventForm);
}

async function loadAdminEvents() {
    const listEl = document.getElementById('admin-events-list');
    const emptyEl = document.getElementById('admin-events-empty');
    const errorEl = document.getElementById('admin-events-error');
    const subtitleEl = document.getElementById('admin-events-subtitle');

    listEl.innerHTML = '';
    emptyEl.style.display = 'none';
    errorEl.style.display = 'none';
    subtitleEl.textContent = 'Chargement...';

    try {
        const events = await apiGetEvents();

        if (!events || events.length === 0) {
        subtitleEl.textContent = 'Aucun événement.';
        emptyEl.style.display = 'block';
        return;
        }

        subtitleEl.textContent = `${events.length} événement(s)`;

        events.forEach(ev => {
        const card = document.createElement('article');
        card.className = 'card';

        card.innerHTML = `
            <div class="card-header">
            <div>
                <h3 class="card-title">${escapeHtml(ev.title)}</h3>
                <div class="card-subtitle">${escapeHtml(ev.type || '')} • ${escapeHtml(ev.date || '')} à ${escapeHtml(ev.heure || '')}</div>
            </div>
            <div class="text-right">
                <div style="font-size:0.9rem; color:var(--color-text-muted);">
                ${ev.capacity || '—'} places
                </div>
            </div>
            </div>
            <p>${escapeHtml(ev.description || '')}</p>
            <div class="card-footer">
            <button class="btn btn-outline" onclick="editEvent(${ev.id})">
                Modifier
            </button>
            <button class="btn btn-primary" onclick="deleteEvent(${ev.id}, '${escapeHtml(ev.title)}')">
                Supprimer
            </button>
            </div>
        `;

        listEl.appendChild(card);
        });

    } catch (err) {
        console.error('Erreur admin events:', err);
        subtitleEl.textContent = 'Erreur de chargement.';
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
    }
}

function openNewEventModal() {
    document.getElementById('modal-title').textContent = 'Nouveau événement';
    document.getElementById('event-id').value = '';
    document.getElementById('event-title-input').value = '';
    document.getElementById('event-type-input').value = '';
    document.getElementById('event-date-input').value = '';
    document.getElementById('event-heure-input').value = '';
    document.getElementById('event-capacity-input').value = '';
    document.getElementById('event-description-input').value = '';
    document.getElementById('event-form-error').style.display = 'none';
    document.getElementById('event-modal').style.display = 'flex';
}

function closeEventModal() {
    document.getElementById('event-modal').style.display = 'none';
}

function editEvent(eventId) {
    // TODO : préremplir le formulaire avec les données de l'event
    openNewEventModal();
    document.getElementById('modal-title').textContent = 'Modifier événement';
    document.getElementById('event-id').value = eventId;
}

async function deleteEvent(eventId, eventTitle) {
    if (!confirm(`Supprimer "${eventTitle}" ? Cette action est irréversible.`)) return;

    try {
        await apiDeleteEvent(eventId);
        loadAdminEvents();
    } catch (err) {
        alert(err.message || 'Erreur lors de la suppression');
    }
}

async function handleEventForm(e) {
    e.preventDefault();

    const id = document.getElementById('event-id').value;
    const title = document.getElementById('event-title-input').value.trim();
    const type = document.getElementById('event-type-input').value;
    const date = document.getElementById('event-date-input').value;
    const heure = document.getElementById('event-heure-input').value;
    const capacity = parseInt(document.getElementById('event-capacity-input').value);
    const description = document.getElementById('event-description-input').value.trim();

    const errorEl = document.getElementById('event-form-error');

    if (!title || !type || !date || !heure || !capacity) {
        errorEl.textContent = 'Tous les champs obligatoires doivent être remplis.';
        errorEl.style.display = 'block';
        return;
    }

    const eventData = {
        title,
        type,
        date,
        heure,
        capacity,
        description: description || ''
    };

    try {
        if (id) {
        // UPDATE
        await apiUpdateEvent(parseInt(id), eventData);
        } else {
        // CREATE
        await apiCreateEvent(eventData);
        }

        closeEventModal();
        loadAdminEvents();

    } catch (err) {
        console.error('Erreur event form:', err);
        errorEl.textContent = err.message || 'Erreur lors de la sauvegarde.';
        errorEl.style.display = 'block';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
