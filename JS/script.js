/* =========================================================
   script.js  —  Auth, login, logout, perfil
   ========================================================= */

'use strict';

const THEME_KEY = 'theme';

/* ---- Helpers de localStorage ---- */
function readJsonFromStorage(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
}

function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeToggleLabel(theme);
}

function updateThemeToggleLabel(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.setAttribute('aria-pressed', theme === 'dark');
    btn.textContent = theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
}

function setupThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
    });
}

function getCurrentCredentials() {
    return readJsonFromStorage('credentials');
}

function getLoginPath() {
    return window.location.pathname.includes('/HTML/')
        ? 'login.html'
        : './HTML/login.html';
}

/* ---- Verificar login ---- */
function verifyLoginStatus() {
    if (window.location.pathname.includes('login.html')) return;
    if (readJsonFromStorage('isLoggedIn') !== true) {
        window.location.href = getLoginPath();
    }
}

/* ---- Prellenar credenciales guardadas ---- */
function checkLocalStorageCredentials() {
    if (!window.location.pathname.includes('login.html')) return;

    const userInput = document.querySelector('input[placeholder="Username"]');
    const passInput = document.querySelector('input[placeholder="Password"]');
    const saveChk   = document.querySelector('#Save');
    if (!userInput || !passInput || !saveChk) return;

    const saved = readJsonFromStorage('credentials');
    if (saved) {
        userInput.value  = saved.username;
        passInput.value  = saved.password;
        saveChk.checked  = true;
    }
}

/* ---- Manejar login ---- */
async function handleLogin(event) {
    event.preventDefault();

    const userInput    = document.querySelector('input[placeholder="Username"]');
    const passInput    = document.querySelector('input[placeholder="Password"]');
    const saveChk      = document.querySelector('#Save');
    if (!userInput || !passInput || !saveChk) return;

    const username     = userInput.value.trim();
    const password     = passInput.value.trim();
    const submitButton = event.target?.querySelector('button[type="submit"]');

    if (submitButton) submitButton.disabled = true;

    if (typeof window.loginUsuario !== 'function') {
        if (submitButton) submitButton.disabled = false;
        alert('No se pudo conectar con el servicio de login.');
        return;
    }

    const userData = await window.loginUsuario(username, password);

    if (!userData) {
        if (submitButton) submitButton.disabled = false;
        alert('Credenciales incorrectas');
        return;
    }

    if (saveChk.checked) {
        localStorage.setItem('credentials', JSON.stringify({ username, password }));
    } else {
        localStorage.removeItem('credentials');
    }

    localStorage.setItem('isLoggedIn', JSON.stringify(true));
    localStorage.setItem('loggedUser', username);
    localStorage.setItem('userRole', userData.role);
    window.location.href = '../index.html';
}

/* ---- Logout ---- */
function setupLogoutButton() {
    const btn = document.getElementById('logoutButton');
    if (!btn) return;
    btn.addEventListener('click', e => {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedUser');
        window.location.href = getLoginPath();
    });
}

/* ---- Login form ---- */
function setupLoginForm() {
    const form = document.querySelector('.loginForm');
    if (form) form.addEventListener('submit', handleLogin);
}

/* ---- Tarjeta de credenciales guardadas ---- */
function showSavedCredentialsCard() {
    if (!window.location.pathname.includes('login.html')) return;

    const saved     = readJsonFromStorage('credentials');
    const userInput = document.querySelector('input[placeholder="Username"]');
    const passInput = document.querySelector('input[placeholder="Password"]');
    if (!saved || !userInput || !passInput) return;

    let card = document.getElementById('savedCredentialsCard');
    if (!card) {
        card               = document.createElement('button');
        card.id            = 'savedCredentialsCard';
        card.type          = 'button';
        document.body.appendChild(card);
    }

    card.textContent = `Usuario guardado: ${saved.username}`;
    card.onclick = () => {
        userInput.value = saved.username;
        passInput.value = saved.password;
    };
}

/* ---- Perfil ---- */
function setupProfileInfo() {
    if (!window.location.pathname.includes('perfil.html')) return;
    const el = document.getElementById('currentUserInfo');
    if (!el) return;

    const loggedUser = localStorage.getItem('loggedUser');
    const creds      = getCurrentCredentials();
    const toShow     = loggedUser || (creds ? creds.username : null);

    el.textContent = toShow
        ? `Usuario actual: ${toShow}`
        : 'No hay datos de usuario para mostrar.';
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getPreferredTheme());
    setupThemeToggle();
    verifyLoginStatus();
    checkLocalStorageCredentials();
    setupLoginForm();
    showSavedCredentialsCard();
    setupLogoutButton();
    setupProfileInfo();
});