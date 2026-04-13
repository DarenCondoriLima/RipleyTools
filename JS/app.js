/* =========================================================
   app.js  —  Inicialización de Supabase + funciones globales
   Debe cargarse UNA SOLA VEZ, DESPUÉS del CDN de Supabase.
   ========================================================= */

'use strict';

const SUPABASE_URL = 'https://mkgkvudwllxeuokaiszz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZ2t2dWR3bGx4ZXVva2Fpc3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDI0MTMsImV4cCI6MjA4OTg3ODQxM30.m1EuwKezHWfWU_Bw2fVklY-106dDa2ovPjAlcmET6gk';

/* Guarda contra doble carga del script */
if (!window.supabaseClient) {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.error('app.js: No se encontró @supabase/supabase-js. Carga el CDN antes de app.js.');
    }
}

/* ---- Login ---- */
async function loginUsuario(codigo, pass) {
    if (!window.supabaseClient) return null;
    const { data, error } = await window.supabaseClient
        .from('users').select('*')
        .eq('coder', codigo).eq('password', pass).single();
    if (error) { console.error('loginUsuario:', error.message); return null; }
    return data;
}

/* ---- Horario ---- */
async function obtenerHorario(codigo) {
    if (!window.supabaseClient) return null;
    const { data, error } = await window.supabaseClient
        .from('schedule').select('*').eq('coder', codigo);
    if (error) { console.error('obtenerHorario:', error.message); return null; }
    return data;
}

/* ---- Datos del usuario ---- */
async function obtenerDatosUsuario(codigo) {
    if (!window.supabaseClient) return null;
    const { data, error } = await window.supabaseClient
        .from('users').select('coder, name, role')
        .eq('coder', codigo).single();
    if (error) { console.error('obtenerDatosUsuario:', error.message); return null; }
    return data;
}

window.loginUsuario        = loginUsuario;
window.obtenerHorario      = obtenerHorario;
window.obtenerDatosUsuario = obtenerDatosUsuario;