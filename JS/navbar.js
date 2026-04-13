/* =========================================================
   navbar.js  —  Inyecta el navbar en todas las páginas
   ========================================================= */

export function loadNavbar() {
    const role = localStorage.getItem('userRole');
    console.log('Cargando navbar para rol:', role);
    const navbarContainer = document.getElementById('navbar'); // O como lo insertes
    
    let adminLink = '';
    
    // Si el rol es 'Admin', creamos el enlace adicional
    if (role === 'Admin' && role != null) {
        adminLink = `<li><a href="usuarios.html">👥 Lista de Usuarios</a></li>`;
    }

    const navbarHTML = `
        <nav>
            <ul>
                <li><a href="./calculateGoals.html">Calcular Metas</a></li>
                <li><a href="./clients.html">Mis Clientes</a></li>
                <!-- <li><a href="./generateCalendar.html">Generar Calendario</a></li> -->
                <!-- <li><a href="./callCustomers.html">Llamar Clientes</a></li>    -->
                <!-- <li><a href="./equipmentReport.html">Reportes de Equipos</a></li> -->
                <!-- <li><a href="./perfil.html">Perfil</a></li>                    -->
                ${adminLink}
                <li class="nav-spacer"></li>
                <li>
                    <button id="themeToggle" class="theme-toggle" type="button" aria-pressed="false">
                        Modo oscuro
                    </button>
                </li>
                <li><a href="#" id="logoutButton">Logout</a></li>
            </ul>
        </nav>
    `;

    const wrapper       = document.createElement('div');
    wrapper.innerHTML   = navbarHTML;
    document.body.insertBefore(wrapper, document.body.firstChild);

    /* Estilos del navbar */
    const link  = document.createElement('link');
    link.rel    = 'stylesheet';
    link.href   = '../CSS/navbar.css';
    document.head.appendChild(link);
}