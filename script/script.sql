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