const EVENTS_PER_PAGE = 6;
let currentOffset = 0;
let currentTotal  = 0;
let currentType   = '';

document.addEventListener('DOMContentLoaded', () => {
    setupNavbar();
    setupHeroGreeting();
    setupFilters();
    loadEvents(0);

    document.getElementById('btn-prev').addEventListener('click', () => loadEvents(currentOffset - EVENTS_PER_PAGE));
    document.getElementById('btn-next').addEventListener('click', () => loadEvents(currentOffset + EVENTS_PER_PAGE));
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

function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentType = btn.getAttribute('data-type');
            loadEvents(0);
        });
    });
}

async function loadEvents(offset = 0) {
    const listEl       = document.getElementById('events-list');
    const emptyEl      = document.getElementById('events-empty');
    const errorEl      = document.getElementById('events-error');
    const subtitleEl   = document.getElementById('events-subtitle');
    const paginationEl = document.getElementById('events-pagination');
    const btnPrev      = document.getElementById('btn-prev');
    const btnNext      = document.getElementById('btn-next');
    const infoEl       = document.getElementById('pagination-info');

    listEl.innerHTML           = '';
    emptyEl.style.display      = 'none';
    errorEl.style.display      = 'none';
    paginationEl.style.display = 'none';
    subtitleEl.textContent     = 'Chargement des événements...';

    try {
        const res    = await apiGetEvents({ limit: EVENTS_PER_PAGE, offset, type: currentType || null });
        const events = Array.isArray(res) ? res : (res.events || []);
        const total  = Array.isArray(res) ? res.length : (res.total ?? events.length);

        currentOffset = offset;
        currentTotal  = total;

        if (!events || events.length === 0) {
            subtitleEl.textContent = currentType
                ? `Aucun événement de type "${currentType}".`
                : 'Aucun événement pour le moment.';
            emptyEl.style.display  = 'block';
            return;
        }

        subtitleEl.textContent = `${total} événement(s) disponible(s)${currentType ? ` · ${currentType}` : ''}`;

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

        listEl.querySelectorAll('button[data-event-id]').forEach(btn => {
            btn.addEventListener('click', () => {
                window.location.href = `event.html?id=${encodeURIComponent(btn.getAttribute('data-event-id'))}`;
            });
        });

        const currentPage = Math.floor(offset / EVENTS_PER_PAGE) + 1;
        const totalPages  = Math.ceil(total / EVENTS_PER_PAGE);

        if (totalPages > 1) {
            paginationEl.style.display = 'flex';
            infoEl.textContent         = `Page ${currentPage} / ${totalPages}`;
            btnPrev.disabled           = offset <= 0;
            btnNext.disabled           = offset + EVENTS_PER_PAGE >= total;
        }

    } catch (err) {
        console.error(err);
        subtitleEl.textContent = 'Impossible de charger les événements.';
        errorEl.textContent    = err.message || 'Erreur lors du chargement des événements.';
        errorEl.style.display  = 'block';
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    let date;
    if (dateStr.includes('/')) {
        const [d, m, y] = dateStr.split('/');
        date = new Date(`${y}-${m}-${d}`);
    } else {
        date = new Date(dateStr);
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}