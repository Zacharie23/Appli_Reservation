    // frontend/js/auth.js

    const AUTH_TOKEN_KEY = 'arena_token';
    const AUTH_USER_KEY  = 'arena_user';

    function saveAuth(token, user) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }

    function getToken() {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    }

    function getCurrentUser() {
        const raw = localStorage.getItem(AUTH_USER_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    function clearAuth() {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
    }

    function isAuthenticated() {
        return !!getToken();
    }

    function isAdmin() {
        const user = getCurrentUser();
        return user && user.role === 'admin';
    }

    /**
     * À appeler au chargement d'une page protégée (user ou admin)
     * redirectUrl = où rediriger si non connecté (ex: 'login.html')
     */
    function requireAuth(redirectUrl = 'login.html') {
        if (!isAuthenticated()) {
            window.location.href = redirectUrl;
        }
    }

    /**
     * À appeler au chargement d'une page admin-only
     */
    function requireAdmin(redirectUrl = 'index.html') {
        if (!isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }
        if (!isAdmin()) {
            window.location.href = redirectUrl;
        }
    }

    function logout() {
        clearAuth();
        window.location.href = 'login.html';
    }
