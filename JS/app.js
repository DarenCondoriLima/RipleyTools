const SUPABASE_URL = 'https://mkgkvudwllxeuokaiszz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rZ2t2dWR3bGx4ZXVva2Fpc3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMDI0MTMsImV4cCI6MjA4OTg3ODQxM30.m1EuwKezHWfWU_Bw2fVklY-106dDa2ovPjAlcmET6gk';
let supabaseClient = null;

if (window.supabase && typeof window.supabase.createClient === 'function') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error('No se pudo inicializar Supabase: falta la libreria @supabase/supabase-js en la pagina.');
}

// Ejemplo: Función para loguear a un usuario por su CodeR
async function loginUsuario(codigo, pass) {
    if (!supabaseClient) {
        return null;
    }

    const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('coder', codigo)
        .eq('password', pass) 
        .single();

    if (error) {
        console.error("Error al entrar:", error.message);
        return null;
    }
    
    return data;
}

// Ejemplo: Obtener el horario de un usuario
async function obtenerHorario(codigo) {
    if (!supabaseClient) {
        return null;
    }

    const { data, error } = await supabaseClient
        .from('schedule') // Prueba 'schedule' en minúscula
        .select('*')
        .eq('CodeR', codigo); // CAMBIADO: 'C' y 'R' en mayúscula
        
    return data;
}

// Ejemplo: Obtener el horario de un usuario
async function obtenerHorario(codigo) {
    if (!supabaseClient) {
        return null;
    }

    const { data, error } = await supabaseClient
        .from('Schedule')
        .select('*')
        .eq('CodeR', codigo);
        
    return data;
}

// Función para obtener los datos del usuario logueado
async function obtenerDatosUsuario(codigo) {
    if (!supabaseClient) {
        console.error("Supabase no está inicializado.");
        return null;
    }

    const { data, error } = await supabaseClient
        .from('Users')
        .select('CodeR, Name, UrlPassword')
        .eq('CodeR', codigo)
        .single();

    if (error) {
        console.error("Error al obtener datos del usuario:", error.message);
        return null;
    }

    return data;
}

window.loginUsuario = loginUsuario;
window.obtenerHorario = obtenerHorario;
window.obtenerDatosUsuario = obtenerDatosUsuario;