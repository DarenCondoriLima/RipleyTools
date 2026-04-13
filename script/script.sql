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