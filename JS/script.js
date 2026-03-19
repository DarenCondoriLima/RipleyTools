const DEFAULT_CREDENTIALS = [
    { username: '250089', password: '250089' },
    { username: '249825', password: '249825' },
    { username: '249328', password: '249328' }
];

function readJsonFromStorage(key) {
    const rawValue = localStorage.getItem(key);

    if (!rawValue) {
        return null;
    }

    try {
        return JSON.parse(rawValue);
    } catch (error) {
        return null;
    }
}

function getCurrentCredentials() {
    return readJsonFromStorage('credentials');
}

function getLoginPath() {
    if (window.location.pathname.includes('/HTML/')) {
        return 'login.html';
    }

    return './HTML/login.html';
}

// Función para verificar las credenciales en el localStorage al cargar la página
function checkLocalStorageCredentials() {
    if (!window.location.pathname.includes('login.html')) {
        return;
    }

    const usernameInput = document.querySelector('input[placeholder="Username"]');
    const passwordInput = document.querySelector('input[placeholder="Password"]');
    const saveCheckbox = document.querySelector('#Save');

    if (!usernameInput || !passwordInput || !saveCheckbox) {
        return;
    }

    const savedCredentials = readJsonFromStorage('credentials');
    if (savedCredentials) {
        usernameInput.value = savedCredentials.username;
        passwordInput.value = savedCredentials.password;
        saveCheckbox.checked = true;
    }
}

// Función para manejar el evento de login
function handleLogin(event) {
    event.preventDefault();

    const usernameInput = document.querySelector('input[placeholder="Username"]');
    const passwordInput = document.querySelector('input[placeholder="Password"]');
    const saveCheckbox = document.querySelector('#Save');

    if (!usernameInput || !passwordInput || !saveCheckbox) {
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const validCredentials = [...DEFAULT_CREDENTIALS];
    const isValid = validCredentials.some((cred) => cred.username === username && cred.password === password);

    if (!isValid) {
        alert('Credenciales incorrectas');
        return;
    }

    if (saveCheckbox.checked) {
        localStorage.setItem('credentials', JSON.stringify({ username, password }));
    } else {
        localStorage.removeItem('credentials');
    }

    localStorage.setItem('isLoggedIn', JSON.stringify(true));
    localStorage.setItem('loggedUser', username);
    window.location.href = '../index.html';
}

// Función para verificar si el usuario está logueado
function verifyLoginStatus() {
    if (window.location.pathname.includes('login.html')) {
        return;
    }

    const isLoggedIn = readJsonFromStorage('isLoggedIn') === true;
    if (!isLoggedIn) {
        window.location.href = getLoginPath();
    }
}

function setupLogoutButton() {
    const logoutButton = document.getElementById('logoutButton');
    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedUser');
        window.location.href = getLoginPath();
    });
}

function setupLoginForm() {
    const loginForm = document.querySelector('.loginForm');
    if (!loginForm) {
        return;
    }

    loginForm.addEventListener('submit', handleLogin);
}

// Función para mostrar tarjeta con credenciales guardadas
function showSavedCredentialsCard() {
    if (!window.location.pathname.includes('login.html')) {
        return;
    }

    const savedCredentials = readJsonFromStorage('credentials');
    const usernameInput = document.querySelector('input[placeholder="Username"]');
    const passwordInput = document.querySelector('input[placeholder="Password"]');

    if (!savedCredentials || !usernameInput || !passwordInput) {
        return;
    }

    let card = document.getElementById('savedCredentialsCard');

    if (!card) {
        card = document.createElement('button');
        card.id = 'savedCredentialsCard';
        card.type = 'button';
        card.style.position = 'fixed';
        card.style.bottom = '10px';
        card.style.right = '10px';
        card.style.padding = '10px';
        card.style.border = '1px solid #ccc';
        card.style.borderRadius = '5px';
        card.style.backgroundColor = '#f9f9f9';
        card.style.cursor = 'pointer';
        document.body.appendChild(card);
    }

    card.textContent = `Usuario guardado: ${savedCredentials.username}`;
    card.onclick = () => {
        usernameInput.value = savedCredentials.username;
        passwordInput.value = savedCredentials.password;
    };
}

function setupProfileInfo() {
    if (!window.location.pathname.includes('perfil.html')) {
        return;
    }

    const currentUserInfo = document.getElementById('currentUserInfo');

    if (!currentUserInfo) {
        return;
    }

    const loggedUser = localStorage.getItem('loggedUser');
    const currentCredentials = getCurrentCredentials();
    const usernameToShow = loggedUser || (currentCredentials ? currentCredentials.username : null);

    if (usernameToShow) {
        currentUserInfo.textContent = `Usuario actual: ${usernameToShow}`;
        return;
    }

    currentUserInfo.textContent = 'No hay datos de usuario para mostrar.';
}

document.addEventListener('DOMContentLoaded', () => {
    verifyLoginStatus();
    checkLocalStorageCredentials();
    setupLoginForm();
    showSavedCredentialsCard();
    setupLogoutButton();
    setupProfileInfo();
});
