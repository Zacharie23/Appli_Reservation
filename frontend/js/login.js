document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuth();
});


function setupEventListeners() {
    document.querySelector('.link-create a')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.section').style.display = 'none';
        document.getElementById('register-section').style.display = 'block';
    });

    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-section').style.display = 'none';
        document.querySelector('.section').style.display = 'block';
    });

    document.querySelector('.login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
}


function checkAuth() {
    if (isAuthenticated()) {
        window.location.href = 'index.html';
    }
}


async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    let errorEl = document.getElementById('login-error');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = 'login-error';
        errorEl.className = 'alert alert-error';
        errorEl.style.display = 'none';
        document.querySelector('.login-form').insertBefore(
            errorEl,
            document.querySelector('.login-btn')
        );
    }

    errorEl.style.display = 'none';

    try {
        await apiLogin(email, password);
        window.location.href = 'index.html';
    } catch (err) {
        console.error('Erreur login:', err);
        errorEl.textContent = err.message || 'Erreur de connexion';
        errorEl.style.display = 'block';
    }
}


async function handleRegister(e) {
    e.preventDefault();

    const prenom = document.getElementById('register-prenom').value.trim(); // ← nouveau
    const nom    = document.getElementById('register-nom').value.trim();    // ← nouveau
    const email  = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const errorEl = document.getElementById('register-error');

    errorEl.style.display = 'none';

    if (password.length < 6) {
        errorEl.textContent = 'Le mot de passe doit contenir au moins 6 caractères';
        errorEl.style.display = 'block';
        return;
    }

    try {
        await apiRegister(email, password, nom, prenom); // ← nom + prenom

        // Retour au login
        document.getElementById('register-section').style.display = 'none';
        document.querySelector('.section').style.display = 'block';

        document.getElementById('email').value = email;
        document.getElementById('password').value = '';

        let successEl = document.getElementById('login-success');
        if (!successEl) {
            successEl = document.createElement('div');
            successEl.id = 'login-success';
            successEl.className = 'alert alert-success';
            document.querySelector('.login-form').insertBefore(
                successEl,
                document.querySelector('.login-btn')
            );
        }
        successEl.textContent = `✅ Compte créé ! Connectez-vous, ${prenom}.`; // ← prénom
        successEl.style.display = 'block';

    } catch (err) {
        console.error('Erreur register:', err);
        errorEl.textContent = err.message || 'Erreur lors de la création du compte';
        errorEl.style.display = 'block';
    }
}
