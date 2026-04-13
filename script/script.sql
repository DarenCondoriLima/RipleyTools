-- Tabla de Usuarios (Vendedores)
CREATE TABLE Users (
  CodeR INT PRIMARY KEY, -- Ejemplo: 250089
  Name TEXT NOT NULL,
  Password TEXT NOT NULL,
  UrlPassword TEXT -- Para guardar enlaces de recuperación o fotos
);

-- Tabla de Metas (Goals)
CREATE TABLE Goals (
  Id SERIAL PRIMARY KEY,
  Month TEXT NOT NULL,
  Target DECIMAL DEFAULT 0,
  Progress DECIMAL DEFAULT 0,
  DaysWorked INT DEFAULT 0,
  DaysRemaining INT DEFAULT 0,
  CodeR INT REFERENCES Users(CodeR) ON DELETE CASCADE
);

-- Tabla de Horarios (Schedule)
CREATE TABLE Schedule (
  ID SERIAL PRIMARY KEY,
  Month TEXT NOT NULL,
  Day INT NOT NULL,
  Year INT NOT NULL,
  StartTime TIME,
  EndTime TIME,
  CodeR INT REFERENCES Users(CodeR) ON DELETE CASCADE
);

-- =========================================================
-- clients.sql  —  Tablas para el módulo de clientes
-- Ejecutar en el SQL Editor de Supabase
-- IMPORTANTE: todos los nombres en minúsculas
-- =========================================================

-- Tabla de prospectos / clientes a contactar
create table clients (
  id          serial primary key,
  name        text        not null,
  phone       text        not null,
  dni         text        not null,
  wants_card  boolean     default false,
  wants_loan  boolean     default false,
  contacted   boolean     default false,
  month       text        not null,        -- formato 'YYYY-MM'
  notes       text,
  coder       int         references users(coder) on delete cascade,
  created_at  timestamptz default now()
);

-- Tabla de cierres (clientes que obtuvieron producto)
create table closings (
  id          serial primary key,
  name        text        not null,
  phone       text        not null,
  dni         text        not null,
  got_card    boolean     default false,
  got_loan    boolean     default false,
  month       text        not null,
  notes       text,
  coder       int         references users(coder) on delete cascade,
  created_at  timestamptz default now()
);

-- Índices para búsquedas por vendedor y mes
create index idx_clients_coder_month  on clients  (coder, month);
create index idx_closings_coder_month on closings (coder, month);

-- =========================================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
-- =========================================================
ALTER TABLE Users ENABLE ROW LEVEL SECURITY;
ALTER TABLE Goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE Schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE closings ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 2. CREAR POLÍTICAS (MODO COMPATIBILIDAD CON TU CÓDIGO)
-- Estas políticas permiten que tu código actual basado en 'anon'
-- siga leyendo e insertando datos sin arrojar Error 403.
-- =========================================================

-- Tabla: Users
CREATE POLICY "Acceso anon a Users" 
ON Users FOR ALL TO anon 
USING (true);

-- Tabla: Goals
CREATE POLICY "Acceso anon a Goals" 
ON Goals FOR ALL TO anon 
USING (true);

-- Tabla: Schedule
CREATE POLICY "Acceso anon a Schedule" 
ON Schedule FOR ALL TO anon 
USING (true);

-- Tabla: clients
CREATE POLICY "Acceso anon a clients" 
ON clients FOR ALL TO anon 
USING (true);

-- Tabla: closings
CREATE POLICY "Acceso anon a closings" 
ON closings FOR ALL TO anon 
USING (true);