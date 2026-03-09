document.addEventListener('DOMContentLoaded', () => {
    requireAdmin();
    setupNavbar();
    setupEventListeners();
    loadAdminEvents();
    loadAdminUsers();
});

function setupNavbar() {
    const navbarUser = document.getElementById('navbar-user');
    navbarUser.innerHTML = `
        <button class="btn btn-outline btn-sm" id="btn-logout">Déconnexion</button>
    `;
    document.getElementById('btn-logout').addEventListener('click', logout);
}

function setupEventListeners() {
    document.getElementById('btn-new-event').addEventListener('click', openNewEventModal);
    document.getElementById('event-form').addEventListener('submit', handleEventForm);
    document.getElementById('btn-new-user').addEventListener('click', openNewUserModal);
    document.getElementById('user-form').addEventListener('submit', handleUserForm);
}

async function loadAdminEvents() {
    const listEl     = document.getElementById('admin-events-list');
    const emptyEl    = document.getElementById('admin-events-empty');
    const errorEl    = document.getElementById('admin-events-error');
    const subtitleEl = document.getElementById('admin-events-subtitle');

    listEl.innerHTML = '';
    emptyEl.style.display = 'none';
    errorEl.style.display = 'none';

    try {
        const res = await apiGetEvents({ limit: 999, offset: 0 });
        const events = Array.isArray(res) ? res : (res.events || []);
        events.sort((a, b) => new Date(a.date) - new Date(b.date));
        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (!events || events.length === 0) {
            subtitleEl.textContent = 'Aucun événement.';
            emptyEl.style.display = 'block';
            return;
        }

        subtitleEl.textContent = `${events.length} événement(s)`;

        events.forEach(ev => {
            const card = document.createElement('article');
            card.className = 'card card-event';

            card.innerHTML = `
                <div class="card-event-header">
                    <div>
                        <h3 class="card-event-title">${escapeHtml(ev.title)}</h3>
                        <span class="card-event-type">${escapeHtml(ev.type || '')}</span>
                    </div>
                    <div class="card-event-meta">
                        <div class="card-event-date">${formatDate(ev.date)}</div>
                        <div class="card-event-time">${ev.heure || ''}</div>
                    </div>
                </div>
                <p class="card-event-description">${escapeHtml(ev.description || '')}</p>
                <div class="card-event-footer">
                    <span class="badge">
                        <span class="badge-dot"></span>
                        ${ev.capacity || '—'} places
                    </span>
                    <div style="display:flex; gap:0.6rem;">
                        <button class="btn btn-outline btn-sm" onclick="editEvent(${ev.id})">
                            ✏️ Modifier
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteEvent(${ev.id}, '${escapeHtml(ev.title)}')">
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            `;

            listEl.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        subtitleEl.textContent = 'Erreur de chargement.';
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
    }
}

function openNewEventModal() {
    document.getElementById('modal-title').textContent = 'Nouveau événement';
    document.getElementById('modal-submit-btn').textContent = 'Créer l\'événement';
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

async function editEvent(eventId) {
    try {
        const event = await apiGetEventById(eventId);
        document.getElementById('modal-title').textContent = 'Modifier l\'événement';
        document.getElementById('modal-submit-btn').textContent = 'Enregistrer';
        document.getElementById('event-id').value = event.id;
        document.getElementById('event-title-input').value = event.title;
        document.getElementById('event-type-input').value = event.type;
        document.getElementById('event-date-input').value = event.date;
        document.getElementById('event-heure-input').value = event.heure;
        document.getElementById('event-capacity-input').value = event.capacity;
        document.getElementById('event-description-input').value = event.description || '';
        document.getElementById('event-form-error').style.display = 'none';
        document.getElementById('event-modal').style.display = 'flex';
    } catch (err) {
        alert('Impossible de charger l\'événement : ' + err.message);
    }
}

async function deleteEvent(eventId, eventTitle) {
    if (!confirm(`Supprimer "${eventTitle}" ? Cette action est irréversible.`)) return;

    try {
        await apiDeleteEvent(eventId);
        showSuccess('success-msg', `✅ "${eventTitle}" supprimé avec succès.`);
        loadAdminEvents();
    } catch (err) {
        alert(err.message || 'Erreur lors de la suppression');
    }
}

async function handleEventForm(e) {
    e.preventDefault();

    const id          = document.getElementById('event-id').value;
    const title       = document.getElementById('event-title-input').value.trim();
    const type        = document.getElementById('event-type-input').value;
    const date        = document.getElementById('event-date-input').value;
    const heure       = document.getElementById('event-heure-input').value;
    const capacity    = parseInt(document.getElementById('event-capacity-input').value);
    const description = document.getElementById('event-description-input').value.trim();
    const errorEl     = document.getElementById('event-form-error');
    const submitBtn   = document.getElementById('modal-submit-btn');

    errorEl.style.display = 'none';

    if (!title || !type || !date || !heure || !capacity) {
        errorEl.textContent = 'Tous les champs obligatoires doivent être remplis.';
        errorEl.style.display = 'block';
        return;
    }

    const eventData = { title, type, date, heure, capacity, description: description || '' };

    submitBtn.textContent = 'Enregistrement...';
    submitBtn.disabled = true;

    try {
        if (id) {
            await apiUpdateEvent(parseInt(id), eventData);
        } else {
            await apiCreateEvent(eventData);
        }

        closeEventModal();
        loadAdminEvents();
        showSuccess('success-msg', `✅ Événement ${id ? 'modifié' : 'créé'} avec succès.`);

    } catch (err) {
        errorEl.textContent = err.message || 'Erreur lors de la sauvegarde.';
        errorEl.style.display = 'block';
    } finally {
        submitBtn.textContent = id ? 'Enregistrer' : 'Créer l\'événement';
        submitBtn.disabled = false;
    }
}

async function loadAdminUsers() {
    const listEl     = document.getElementById('admin-users-list');
    const emptyEl    = document.getElementById('admin-users-empty');
    const errorEl    = document.getElementById('admin-users-error');
    const subtitleEl = document.getElementById('admin-users-subtitle');

    listEl.innerHTML = '';
    emptyEl.style.display = 'none';
    errorEl.style.display = 'none';

    try {
        const users = await apiGetUsers();

        if (!users || users.length === 0) {
            subtitleEl.textContent = 'Aucun utilisateur.';
            emptyEl.style.display = 'block';
            return;
        }

        subtitleEl.textContent = `${users.length} utilisateur(s)`;

        listEl.innerHTML = `
            <div class="users-table-header">
                <span>Utilisateur</span>
                <span>Nom / Prénom</span>
                <span>Rôle</span>
                <span></span>
            </div>
        `;

        users.forEach(user => {
            const initiale = (user.email || '?')[0].toUpperCase();
            const row = document.createElement('div');
            row.className = 'users-table-row';
            row.id = `user-row-${user.id}`;

            row.innerHTML = `
                <div class="user-cell-email">
                    <div class="user-avatar">${initiale}</div>
                    <span class="user-email-text">${escapeHtml(user.email)}</span>
                </div>
                <span class="user-cell-name">
                    ${escapeHtml(user.prenom || '')} ${escapeHtml(user.nom || '')}
                </span>
                <span>
                    <span class="user-role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}">
                        ${user.role === 'admin' ? '⚙️ Admin' : '👤 Utilisateur'}
                    </span>
                </span>
                <div class="user-cell-actions">
                    <button class="btn btn-outline btn-sm"
                        data-id="${user.id}"
                        data-email="${escapeHtml(user.email)}"
                        data-role="${user.role}"
                        data-nom="${escapeHtml(user.nom || '')}"
                        data-prenom="${escapeHtml(user.prenom || '')}"
                        onclick="editUserFromBtn(this)">
                        ✏️ Modifier
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id}, '${escapeHtml(user.email)}')">
                        🗑️ Supprimer
                    </button>
                </div>
            `;

            listEl.appendChild(row);
        });

    } catch (err) {
        console.error(err);
        subtitleEl.textContent = 'Erreur de chargement.';
        errorEl.textContent = err.message;
        errorEl.style.display = 'block';
    }
}

function editUserFromBtn(btn) {
    const id     = btn.dataset.id;
    const email  = btn.dataset.email;
    const role   = btn.dataset.role;
    const nom    = btn.dataset.nom;
    const prenom = btn.dataset.prenom;
    editUser(id, email, role, nom, prenom);
}

function openNewUserModal() {
    document.getElementById('user-modal-title').textContent = 'Nouvel utilisateur';
    document.getElementById('user-submit-btn').textContent = 'Créer';
    document.getElementById('user-id').value = '';
    document.getElementById('user-email-input').value = '';
    document.getElementById('user-prenom-input').value = '';
    document.getElementById('user-nom-input').value = '';
    document.getElementById('user-password-input').value = '';
    document.getElementById('user-role-input').value = 'user';
    document.getElementById('password-hint').style.display = 'none';
    document.getElementById('user-password-input').required = true;
    document.getElementById('user-form-error').style.display = 'none';
    document.getElementById('user-modal').style.display = 'flex';
}

function editUser(userId, email, role, nom, prenom) {
    document.getElementById('user-modal-title').textContent = 'Modifier l\'utilisateur';
    document.getElementById('user-submit-btn').textContent = 'Enregistrer';
    document.getElementById('user-id').value = userId;
    document.getElementById('user-email-input').value = email;
    document.getElementById('user-prenom-input').value = prenom || '';
    document.getElementById('user-nom-input').value = nom || '';
    document.getElementById('user-password-input').value = '';
    document.getElementById('user-role-input').value = role;
    document.getElementById('password-hint').style.display = 'inline';
    document.getElementById('user-password-input').required = false;
    document.getElementById('user-form-error').style.display = 'none';
    document.getElementById('user-modal').style.display = 'flex';
}

function closeUserModal() {
    document.getElementById('user-modal').style.display = 'none';
}

async function handleUserForm(e) {
    e.preventDefault();

    const id        = document.getElementById('user-id').value;
    const email     = document.getElementById('user-email-input').value.trim();
    const prenom    = document.getElementById('user-prenom-input').value.trim();
    const nom       = document.getElementById('user-nom-input').value.trim();
    const password  = document.getElementById('user-password-input').value;
    const role      = document.getElementById('user-role-input').value;
    const errorEl   = document.getElementById('user-form-error');
    const submitBtn = document.getElementById('user-submit-btn');

    errorEl.style.display = 'none';

    const userData = { email, nom, prenom, role };
    if (password) userData.password = password;

    submitBtn.textContent = 'Enregistrement...';
    submitBtn.disabled = true;

    try {
        if (id) {
            await apiUpdateUser(parseInt(id), userData);
        } else {
            await apiCreateUser(userData);
        }

        closeUserModal();
        loadAdminUsers();
        showSuccess('success-msg-users', `✅ Utilisateur ${id ? 'modifié' : 'créé'} avec succès.`);

    } catch (err) {
        errorEl.textContent = err.message || 'Erreur lors de la sauvegarde.';
        errorEl.style.display = 'block';
    } finally {
        submitBtn.textContent = id ? 'Enregistrer' : 'Créer';
        submitBtn.disabled = false;
    }
}

async function deleteUser(userId, email) {
    if (!confirm(`Supprimer "${email}" ? Ses réservations seront également supprimées.`)) return;

    try {
        await apiDeleteUser(userId);

        const row = document.getElementById(`user-row-${userId}`);
        if (row) {
            row.style.opacity = '0';
            row.style.transition = 'opacity 0.3s';
            setTimeout(() => { row.remove(); loadAdminUsers(); }, 300);
        }

        showSuccess('success-msg-users', `✅ "${email}" supprimé avec succès.`);

    } catch (err) {
        alert(err.message || 'Erreur lors de la suppression');
    }
}

function showSuccess(containerId, message) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `<div class="alert alert-success">${message}</div>`;
    setTimeout(() => el.innerHTML = '', 4000);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}