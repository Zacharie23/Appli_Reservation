// frontend/js/index.js

document.addEventListener('DOMContentLoaded', () => {
    setupNavbar();
    setupHeroGreeting(); // ← nouveau
    loadEvents();
});


function setupNavbar() {
    const user = getCurrentUser();
    const navbarUser = document.getElementById('navbar-user');
    const linkAdmin = document.getElementById('link-admin');

    if (user) {
        // Plus de greeting dans la navbar, juste le bouton déconnexion
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


function setupHeroGreeting() {
    const user = getCurrentUser();
    const heroGreeting = document.getElementById('hero-greeting');
    if (heroGreeting && user?.prenom) {
        heroGreeting.textContent = `Bonjour, ${user.prenom} 👋`;
    }
}


async function loadEvents() {
    const listEl = document.getElementById('events-list');
    const emptyEl = document.getElementById('events-empty');
    const errorEl = document.getElementById('events-error');
    const subtitleEl = document.getElementById('events-subtitle');

    listEl.innerHTML = '';
    emptyEl.style.display = 'none';
    errorEl.style.display = 'none';
    subtitleEl.textContent = 'Chargement des événements...';

    try {
        const events = await apiGetEvents();

        if (!events || events.length === 0) {
            subtitleEl.textContent = 'Aucun événement pour le moment.';
            emptyEl.style.display = 'block';
            return;
        }

        // Tri du plus proche au plus loin
        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        subtitleEl.textContent = `${events.length} événement(s) disponible(s)`;

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
                    <button class="btn btn-primary btn-sm" data-event-id="${ev.id}">
                        Voir les places
                    </button>
                </div>
            `;

            listEl.appendChild(card);
        });

        // Listeners boutons "Voir les places"
        listEl.querySelectorAll('button[data-event-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                const eventId = btn.getAttribute('data-event-id');
                window.location.href = `event.html?id=${encodeURIComponent(eventId)}`;
            });
        });

    } catch (err) {
        console.error(err);
        subtitleEl.textContent = 'Impossible de charger les événements.';
        errorEl.textContent = err.message || 'Erreur lors du chargement des événements.';
        errorEl.style.display = 'block';
    }
}


function formatDate(dateStr) {
    if (!dateStr) return '';
    // Gère les formats DD/MM/YYYY et YYYY-MM-DD
    let date;
    if (dateStr.includes('/')) {
        const [d, m, y] = dateStr.split('/');
        date = new Date(`${y}-${m}-${d}`);
    } else {
        date = new Date(dateStr);
    }
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
}




function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
