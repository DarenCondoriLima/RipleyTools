/* =========================================================
   calculateGoals.js
   Lógica de:
     · Formulario de metas
     · Modales (IGV y Calculadora general)
   ========================================================= */

'use strict';

/* ---- Utilidades ---- */
const GOALS_KEY = 'goalsFormData';

const fmt = v =>
    'S/. ' + v.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

function saveGoalsFormData(data) {
    localStorage.setItem(GOALS_KEY, JSON.stringify(data));
}

function loadGoalsFormData() {
    try {
        const raw = localStorage.getItem(GOALS_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/* =========================================================
   CÁLCULO DE METAS
   ========================================================= */
function calculate() {
    const goal     = parseFloat(document.getElementById('monthGoal').value);
    const weekdays = parseInt(document.getElementById('Weekdays').value);
    const prog     = parseFloat(document.getElementById('ProgressTowardTheGoal').value);
    const rem      = parseInt(document.getElementById('daysRemaining').value);

    if ([goal, weekdays, prog, rem].some(isNaN) || goal <= 0 || weekdays <= 0) {
        alert('Por favor completa todos los campos con valores válidos.');
        return;
    }

    const elapsed       = Math.max(0, weekdays - rem);
    const dailyHistoric = elapsed > 0 ? prog / elapsed : 0;
    const pct           = (prog / goal) * 100;
    const divisor       = rem > 0 ? rem : 1;

    const levels = [
        { label: '95%',  mult: 0.95 },
        { label: '100%', mult: 1.00 },
        { label: '105%', mult: 1.05 },
        { label: '110%', mult: 1.10 },
        { label: '125%', mult: 1.25 },
        { label: '140%', mult: 1.40 },
    ];

    /* KPIs */
    document.getElementById('kpiPct').textContent   = pct.toFixed(1) + '%';
    document.getElementById('kpiGoal').textContent  = fmt(goal);
    document.getElementById('kpiProg').textContent  = fmt(prog);
    document.getElementById('kpiDaily').textContent = fmt(dailyHistoric);

    /* Barra de progreso */
    const clampedPct = Math.min(100, pct);
    document.getElementById('progFill').style.width  = clampedPct + '%';
    document.getElementById('progText').textContent  = pct.toFixed(1) + '%';

    /* Píldoras informativas */
    document.getElementById('pillDays').textContent    = `Restan: ${rem} días`;
    document.getElementById('pillElapsed').textContent = `Transcurridos: ${elapsed} días`;
    document.getElementById('pillTotal').textContent   = `Total: ${weekdays} días`;

    /* Alerta de meta alcanzada */
    const alertBox = document.getElementById('alertBox');
    if (pct >= 100) {
        alertBox.style.display = 'block';
        alertBox.textContent   = `¡Felicidades! Has superado la meta con un ${pct.toFixed(1)}%.`;
    } else {
        alertBox.style.display = 'none';
    }

    /* Grid de metas por nivel */
    const grid = document.getElementById('targetsGrid');
    grid.innerHTML = levels.map(lv => {
        const tv       = goal * lv.mult;
        const remaining = tv - prog;
        const dn       = remaining / divisor;
        const dnIgv    = dn * 1.18;
        const achieved = prog >= tv;

        return `
        <div class="t-card ${achieved ? 'achieved' : ''}">
            <div class="t-head">
                Objetivo ${lv.label}
                ${achieved ? '<span class="badge-done">✓ Logrado</span>' : ''}
            </div>
            <div class="t-row">
                <span>Total meta:</span>
                <strong>${fmt(tv)}</strong>
            </div>
            <hr class="light">
            <div class="t-row">
                <span>Venta diaria:</span>
                <strong>${achieved ? '—' : fmt(Math.max(0, dn))}</strong>
            </div>
            <div class="t-row sub">
                <span>Con IGV:</span>
                <span>${achieved ? '—' : fmt(Math.max(0, dnIgv))}</span>
            </div>
        </div>`;
    }).join('');

    document.getElementById('results').style.display = 'block';

    /* Persistir datos */
    saveGoalsFormData({
        monthGoal:              goal,
        weekdays,
        progressTowardTheGoal: prog,
        daysRemaining:          rem,
    });
}

/* Exponer para onclick inline en el HTML */
window.calculate = calculate;

/* =========================================================
   MODALES — apertura / cierre
   ========================================================= */
function openModal(type) {
    const id = type === 'igv' ? 'igvModal' : 'calcModal';
    document.getElementById(id).classList.add('open');
}

function closeModal(type) {
    const id = type === 'igv' ? 'igvModal' : 'calcModal';
    document.getElementById(id).classList.remove('open');
}

/* Cerrar al hacer click fuera del modal */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function (e) {
        if (e.target === this) this.classList.remove('open');
    });
});

window.openModal  = openModal;
window.closeModal = closeModal;

/* =========================================================
   CALCULADORA DE IGV
   ========================================================= */
function calcIgv() {
    const total  = parseFloat(document.getElementById('igvInput').value);
    const result = document.getElementById('igvResult');

    if (isNaN(total) || total <= 0) {
        result.style.display = 'none';
        return;
    }

    /* Lógica: el monto del POS ya incluye IGV → neto = total / 1.18 */
    const neto = total / 1.18;
    const igv  = total - neto;

    document.getElementById('igvNeto').textContent   = fmt(neto);
    document.getElementById('igvAmount').textContent = fmt(igv);
    document.getElementById('igvTotal').textContent  = fmt(total);

    result.style.display = 'block';
}

window.calcIgv = calcIgv;

/* =========================================================
   CALCULADORA GENERAL
   ========================================================= */
let cVal   = '0';
let cOp    = '';
let cPrev  = '';
let cReset = false;

function calcAction(type, val) {
    const display = document.getElementById('calcDisplay');

    switch (type) {
        case 'clear':
            cVal = '0'; cOp = ''; cPrev = ''; cReset = false;
            break;

        case 'num':
            if (cReset) { cVal = val; cReset = false; }
            else        { cVal = cVal === '0' ? val : (cVal.length < 14 ? cVal + val : cVal); }
            break;

        case 'dot':
            if (cReset)           { cVal = '0.'; cReset = false; }
            else if (!cVal.includes('.')) { cVal += '.'; }
            break;

        case 'sign':
            cVal = String(-(parseFloat(cVal)) || 0);
            break;

        case 'pct':
            cVal = String(parseFloat(cVal) / 100);
            break;

        case 'op':
            if (cOp && !cReset) {
                const r = evalOp(parseFloat(cPrev), parseFloat(cVal), cOp);
                cVal = String(parseFloat(r.toFixed(10)));
            }
            cPrev  = cVal;
            cOp    = val;
            cReset = true;
            break;

        case 'eq':
            if (cOp) {
                const r = evalOp(parseFloat(cPrev), parseFloat(cVal), cOp);
                cVal   = String(parseFloat(r.toFixed(10)));
                cOp    = '';
                cPrev  = '';
                cReset = true;
            }
            break;
    }

    display.textContent = cVal.length > 14
        ? parseFloat(cVal).toExponential(4)
        : cVal;
}

function evalOp(a, b, op) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b !== 0 ? a / b : 0;
        default:  return b;
    }
}

window.calcAction = calcAction;

/* =========================================================
   INIT — restaurar formulario desde localStorage
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
    const saved = loadGoalsFormData();

    if (saved) {
        const g = document.getElementById('monthGoal');
        const w = document.getElementById('Weekdays');
        const p = document.getElementById('ProgressTowardTheGoal');
        const d = document.getElementById('daysRemaining');

        if (g) g.value = saved.monthGoal              ?? '';
        if (w) w.value = saved.weekdays               ?? '';
        if (p) p.value = saved.progressTowardTheGoal  ?? '';
        if (d) d.value = saved.daysRemaining          ?? '';

        if (saved.monthGoal) calculate();
    }

    /* Enlace IGV en el navbar también abre el modal */
    const navIgv = document.getElementById('navIgvLink');
    if (navIgv) {
        navIgv.addEventListener('click', e => {
            e.preventDefault();
            openModal('igv');
        });
    }
});