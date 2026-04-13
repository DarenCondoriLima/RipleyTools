/* =========================================================
   clients.js  —  Módulo de Clientes y Cierres
   Tablas:   clients, closings
   Columnas: todo en minúsculas (id, name, phone, dni,
             wants_card, wants_loan, contacted, month,
             notes, coder, created_at, got_card, got_loan)
   ========================================================= */

'use strict';

/* =========================================================
   GUARDIA: acceso seguro al cliente de Supabase
   ========================================================= */
function getClient() {
    if (!window.supabaseClient) {
        throw new Error('Supabase no está inicializado. Verifica el orden de los scripts.');
    }
    return window.supabaseClient;
}

/* =========================================================
   UTILIDADES
   ========================================================= */
const currentCodeR = () => parseInt(localStorage.getItem('loggedUser'), 10);

function currentMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function escHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className   = `show ${type}`;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.className = ''; }, 3200);
}

function setLoading(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = '<div class="spinner"></div>';
}

function setEl(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
}

/* =========================================================
   SUPABASE — Clientes
   Tabla: clients
   Columnas: id, name, phone, dni, wants_card, wants_loan,
             contacted, month, notes, coder, created_at
   ========================================================= */
async function fetchClients(month) {
    const { data, error } = await getClient()
        .from('clients')
        .select('*')
        .eq('coder', currentCodeR())
        .eq('month', month)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('fetchClients:', error);
        showToast('Error al cargar clientes: ' + error.message, 'error');
        return [];
    }
    return data;
}

async function addClient(payload) {
    const { data, error } = await getClient()
        .from('clients')
        .insert([{ ...payload, coder: currentCodeR() }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function updateClient(id, changes) {
    const { error } = await getClient()
        .from('clients')
        .update(changes)
        .eq('id', id);

    if (error) throw error;
}

async function deleteClient(id) {
    const { error } = await getClient()
        .from('clients')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/* =========================================================
   SUPABASE — Cierres
   Tabla: closings
   Columnas: id, name, phone, dni, got_card, got_loan,
             month, notes, coder, created_at
   ========================================================= */
async function fetchClosings(month) {
    const { data, error } = await getClient()
        .from('closings')
        .select('*')
        .eq('coder', currentCodeR())
        .eq('month', month)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('fetchClosings:', error);
        showToast('Error al cargar cierres: ' + error.message, 'error');
        return [];
    }
    return data;
}

async function addClosing(payload) {
    const { data, error } = await getClient()
        .from('closings')
        .insert([{ ...payload, coder: currentCodeR() }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function deleteClosing(id) {
    const { error } = await getClient()
        .from('closings')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/* =========================================================
   ESTADO LOCAL
   ========================================================= */
let allClients    = [];
let allClosings   = [];
let editingClientId = null;

/* =========================================================
   RENDER — CLIENTES
   ========================================================= */
function renderClients(list) {
    const container = document.getElementById('clientsList');
    if (!container) return;

    const search   = (document.getElementById('searchClients')?.value ?? '').toLowerCase();
    const onlyPend = document.getElementById('filterPending')?.checked ?? false;

    const filtered = list.filter(c => {
        const matchText = c.name.toLowerCase().includes(search) ||
                          c.phone.includes(search) ||
                          c.dni.includes(search);
        return matchText && (!onlyPend || !c.contacted);
    });

    updateClientsSummary(list);

    if (!filtered.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">👤</span>
                No hay prospectos que coincidan.
            </div>`;
        return;
    }

    container.innerHTML = filtered.map(c => {
        const chips = [
            c.wants_card ? `<span class="chip chip-c">Tarjeta</span>` : '',
            c.wants_loan ? `<span class="chip chip-l">Préstamo</span>` : '',
            c.contacted
                ? `<span class="chip chip-ok">✓ Contactado</span>`
                : `<span class="chip chip-pend">Pendiente</span>`,
        ].join('');

        const contactBtn = c.contacted
            ? `<button class="btn-icon" onclick="markContacted(${c.id}, false)">↩ Pendiente</button>`
            : `<button class="btn-icon contacted-btn" onclick="markContacted(${c.id}, true)">✓ Contactado</button>`;

        return `
        <div class="client-card ${c.contacted ? 'contacted' : ''}" data-id="${c.id}">
            <div class="client-info">
                <div class="client-name">${escHtml(c.name)}</div>
                <div class="client-meta">
                    <span>📞 ${escHtml(c.phone)}</span>
                    <span>DNI ${escHtml(c.dni)}</span>
                </div>
                <div class="client-chips">${chips}</div>
                ${c.notes ? `<div class="client-notes">${escHtml(c.notes)}</div>` : ''}
            </div>
            <div class="client-actions">
                ${contactBtn}
                <button class="btn-icon edit-btn" onclick="startEditClient(${c.id})">✏️ Editar</button>
                <button class="btn-icon" onclick="moveToClosing(${c.id})">🏆 Cierre</button>
                <button class="btn-icon danger-btn" onclick="removeClient(${c.id})">🗑 Eliminar</button>
            </div>
        </div>`;
    }).join('');
}

function updateClientsSummary(list) {
    const contacted = list.filter(c => c.contacted).length;
    const cards     = list.filter(c => c.wants_card).length;
    const loans     = list.filter(c => c.wants_loan).length;
    setEl('summaryTotal',     `${list.length} cliente${list.length !== 1 ? 's' : ''}`);
    setEl('summaryContacted', `${contacted} contactado${contacted !== 1 ? 's' : ''}`);
    setEl('summaryCard',      `${cards} tarjeta`);
    setEl('summaryLoan',      `${loans} préstamo`);
}

/* =========================================================
   RENDER — CIERRES
   ========================================================= */
function renderClosings(list) {
    const container = document.getElementById('closingsList');
    if (!container) return;

    const search   = (document.getElementById('searchClosings')?.value ?? '').toLowerCase();
    const filtered = list.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.phone.includes(search) ||
        c.dni.includes(search)
    );

    updateClosingsSummary(list);

    if (!filtered.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🏆</span>
                Aún no hay cierres registrados este mes.
            </div>`;
        return;
    }

    container.innerHTML = filtered.map(c => `
        <div class="client-card contacted" data-id="${c.id}">
            <div class="client-info">
                <div class="client-name">${escHtml(c.name)}</div>
                <div class="client-meta">
                    <span>📞 ${escHtml(c.phone)}</span>
                    <span>DNI ${escHtml(c.dni)}</span>
                </div>
                <div class="client-chips">
                    ${c.got_card ? `<span class="chip chip-c">✓ Tarjeta</span>` : ''}
                    ${c.got_loan ? `<span class="chip chip-l">✓ Préstamo</span>` : ''}
                </div>
                ${c.notes ? `<div class="client-notes">${escHtml(c.notes)}</div>` : ''}
            </div>
            <div class="client-actions">
                <button class="btn-icon danger-btn" onclick="removeClosing(${c.id})">🗑 Eliminar</button>
            </div>
        </div>`
    ).join('');
}

function updateClosingsSummary(list) {
    const cards = list.filter(c => c.got_card).length;
    const loans = list.filter(c => c.got_loan).length;
    setEl('closingsTotal', `${list.length} cierre${list.length !== 1 ? 's' : ''}`);
    setEl('closingsCard',  `${cards} tarjeta${cards !== 1 ? 's' : ''}`);
    setEl('closingsLoan',  `${loans} préstamo${loans !== 1 ? 's' : ''}`);
}

/* =========================================================
   ACCIONES — CLIENTES
   ========================================================= */
async function loadClients() {
    const month = document.getElementById('monthClients')?.value;
    if (!month) return;
    setLoading('clientsList');
    allClients = await fetchClients(month);
    renderClients(allClients);
}

async function handleAddClient(e) {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-add');
    btn.disabled = true;

    const payload = {
        name:       document.getElementById('cName').value.trim(),
        phone:      document.getElementById('cPhone').value.trim(),
        dni:        document.getElementById('cDNI').value.trim(),
        wants_card: document.getElementById('cCard').checked,
        wants_loan: document.getElementById('cLoan').checked,
        notes:      document.getElementById('cNotes').value.trim(),
        contacted:  false,
        month:      document.getElementById('monthClients').value,
    };

    if (!payload.name || !payload.phone || !payload.dni) {
        showToast('Nombre, teléfono y DNI son obligatorios', 'error');
        btn.disabled = false;
        return;
    }

    try {
        if (editingClientId !== null) {
            await updateClient(editingClientId, {
                name:       payload.name,
                phone:      payload.phone,
                dni:        payload.dni,
                wants_card: payload.wants_card,
                wants_loan: payload.wants_loan,
                notes:      payload.notes,
            });
            showToast('Prospecto actualizado', 'success');
            stopEditClient();
        } else {
            await addClient(payload);
            showToast('Prospecto agregado', 'success');
            e.target.reset();
        }
        await loadClients();
    } catch (err) {
        console.error(err);
        showToast('Error: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
    }
}

function startEditClient(id) {
    const c = allClients.find(x => x.id === id);
    if (!c) return;
    editingClientId = id;

    document.getElementById('cName').value    = c.name;
    document.getElementById('cPhone').value   = c.phone;
    document.getElementById('cDNI').value     = c.dni;
    document.getElementById('cCard').checked  = c.wants_card;
    document.getElementById('cLoan').checked  = c.wants_loan;
    document.getElementById('cNotes').value   = c.notes ?? '';

    const title  = document.querySelector('#panel-clients .add-form-title');
    const btn    = document.querySelector('#formAddClient .btn-add');
    const cancel = document.getElementById('cancelEditBtn');
    if (title)  title.textContent    = '✏️ Editando prospecto';
    if (btn)    btn.textContent      = 'Guardar cambios';
    if (cancel) cancel.style.display = 'inline-flex';

    document.querySelector('#panel-clients .add-form')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function stopEditClient() {
    editingClientId = null;
    const title  = document.querySelector('#panel-clients .add-form-title');
    const btn    = document.querySelector('#formAddClient .btn-add');
    const cancel = document.getElementById('cancelEditBtn');
    if (title)  title.textContent    = '+ Nuevo prospecto';
    if (btn)    btn.textContent      = '+ Agregar prospecto';
    if (cancel) cancel.style.display = 'none';
    document.getElementById('formAddClient')?.reset();
}

async function markContacted(id, value = true) {
    try {
        await updateClient(id, { contacted: value });
        showToast(value ? '✓ Marcado como contactado' : '↩ Marcado como pendiente', 'success');
        await loadClients();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

async function removeClient(id) {
    if (!confirm('¿Eliminar este prospecto?')) return;
    try {
        await deleteClient(id);
        showToast('Prospecto eliminado', 'success');
        if (editingClientId === id) stopEditClient();
        await loadClients();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

function moveToClosing(id) {
    const c = allClients.find(x => x.id === id);
    if (!c) return;
    document.getElementById('mcName').textContent = c.name;
    document.getElementById('mcGotCard').checked  = c.wants_card;
    document.getElementById('mcGotLoan').checked  = c.wants_loan;
    document.getElementById('mcClientId').value   = id;
    document.getElementById('moveClosingModal').classList.add('open');
}

async function confirmMoveToClosing() {
    const id      = parseInt(document.getElementById('mcClientId').value, 10);
    const gotCard = document.getElementById('mcGotCard').checked;
    const gotLoan = document.getElementById('mcGotLoan').checked;
    const c       = allClients.find(x => x.id === id);
    if (!c) return;

    if (!gotCard && !gotLoan) {
        showToast('Selecciona al menos un producto obtenido', 'error');
        return;
    }

    const btn = document.getElementById('confirmMoveBtn');
    btn.disabled = true;

    try {
        await addClosing({
            name:     c.name,
            phone:    c.phone,
            dni:      c.dni,
            got_card: gotCard,
            got_loan: gotLoan,
            notes:    c.notes,
            month:    document.getElementById('monthClients').value,
        });
        await deleteClient(id);
        document.getElementById('moveClosingModal').classList.remove('open');
        showToast('🏆 ¡Cierre registrado!', 'success');
        await loadClients();
        await loadClosings();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
    }
}

/* =========================================================
   ACCIONES — CIERRES
   ========================================================= */
async function loadClosings() {
    const month = document.getElementById('monthClosings')?.value;
    if (!month) return;
    setLoading('closingsList');
    allClosings = await fetchClosings(month);
    renderClosings(allClosings);
}

async function handleAddClosing(e) {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-add');
    btn.disabled = true;

    const payload = {
        name:     document.getElementById('clName').value.trim(),
        phone:    document.getElementById('clPhone').value.trim(),
        dni:      document.getElementById('clDNI').value.trim(),
        got_card: document.getElementById('clCard').checked,
        got_loan: document.getElementById('clLoan').checked,
        notes:    document.getElementById('clNotes').value.trim(),
        month:    document.getElementById('monthClosings').value,
    };

    if (!payload.name || !payload.phone || !payload.dni) {
        showToast('Nombre, teléfono y DNI son obligatorios', 'error');
        btn.disabled = false;
        return;
    }
    if (!payload.got_card && !payload.got_loan) {
        showToast('Selecciona al menos un producto obtenido', 'error');
        btn.disabled = false;
        return;
    }

    try {
        await addClosing(payload);
        e.target.reset();
        showToast('Cierre registrado', 'success');
        await loadClosings();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
    }
}

async function removeClosing(id) {
    if (!confirm('¿Eliminar este cierre?')) return;
    try {
        await deleteClosing(id);
        showToast('Cierre eliminado', 'success');
        await loadClosings();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

/* =========================================================
   TABS
   ========================================================= */
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-panel').forEach(p =>
        p.classList.toggle('active', p.id === `panel-${tab}`));
}

/* =========================================================
   GLOBALS
   ========================================================= */
window.switchTab            = switchTab;
window.markContacted        = markContacted;
window.removeClient         = removeClient;
window.startEditClient      = startEditClient;
window.stopEditClient       = stopEditClient;
window.moveToClosing        = moveToClosing;
window.confirmMoveToClosing = confirmMoveToClosing;
window.removeClosing        = removeClosing;

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    if (!window.supabaseClient) {
        console.error('clients.js: supabaseClient no disponible. Revisa el orden de los scripts.');
        showToast('Error de conexión con la base de datos', 'error');
        return;
    }

    const today = currentMonth();
    const elMC  = document.getElementById('monthClients');
    const elMCl = document.getElementById('monthClosings');
    if (elMC)  elMC.value  = today;
    if (elMCl) elMCl.value = today;

    document.getElementById('formAddClient')?.addEventListener('submit', handleAddClient);
    document.getElementById('formAddClosing')?.addEventListener('submit', handleAddClosing);
    document.getElementById('searchClients')?.addEventListener('input',  () => renderClients(allClients));
    document.getElementById('filterPending')?.addEventListener('change', () => renderClients(allClients));
    document.getElementById('searchClosings')?.addEventListener('input', () => renderClosings(allClosings));
    elMC?.addEventListener('change',  loadClients);
    elMCl?.addEventListener('change', loadClosings);

    document.getElementById('cancelEditBtn')?.addEventListener('click', stopEditClient);
    document.getElementById('confirmMoveBtn')?.addEventListener('click', confirmMoveToClosing);
    document.getElementById('moveClosingModal')?.addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('open');
    });

    loadClients();
    loadClosings();
});