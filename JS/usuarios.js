// usuarios.js
async function loadUsers() {
    const { data, error } = await window.supabaseClient
        .from('users')
        .select('coder, name, role');

    if (error) return console.error(error);

    const list = document.getElementById('usersList');
    list.innerHTML = data.map(u => `
        <tr>
            <td>${u.coder ?? ''}</td>
            <td>${u.name}</td>
            <td><strong>${u.role}</strong></td>
            <td>
                <button onclick="deleteUser('${u.coder}')" style="color:red">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

async function createUser() {
    const coder = document.getElementById('newCoder').value;
    const name = document.getElementById('newUsername').value;
    const pass = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;

    if (!coder || !name || !pass) {
        alert('Completa coder, usuario y password.');
        return;
    }

    const { error } = await window.supabaseClient
        .from('users')
        .insert([{ coder: coder, name: name, password: pass, role: role }]);

    if (error) alert("Error al crear: " + error.message);
    else {
        alert("Usuario creado");
        loadUsers();
    }
}

async function deleteUser(coder) {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;

    const { error } = await window.supabaseClient
        .from('users')
        .delete()
        .eq('coder', coder);

    if (error) alert("Error: " + error.message);
    else loadUsers();
}

// Cargar al inicio
document.addEventListener('DOMContentLoaded', loadUsers);