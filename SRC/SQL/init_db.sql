-- src/sql/init_db.sql
-- Inicialización de BD para FRUNA (PostgreSQL)
-- Crea tablas: products, clients
-- Incluye constraints útiles, triggers de updated_at e inserta datos de ejemplo.

-- Extensiones útiles
CREATE EXTENSION IF NOT EXISTS citext;        -- emails case-insensitive
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- si en el futuro usas UUIDs

-- =========================================================
-- Función y trigger genéricos para mantener updated_at
-- =========================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- Tabla: clients (usuarios)
-- =========================================================
CREATE TABLE IF NOT EXISTS clients (
  id            TEXT PRIMARY KEY,                     -- conservamos tus IDs string
  nombre        TEXT NOT NULL,
  email         CITEXT NOT NULL UNIQUE,               -- único y case-insensitive
  telefono      TEXT,
  direccion     TEXT,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin','user')),
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger updated_at para clients
DROP TRIGGER IF EXISTS trg_clients_updated_at ON clients;
CREATE TRIGGER trg_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Índices auxiliares
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients (email);
CREATE INDEX IF NOT EXISTS idx_clients_activo ON clients (activo);

-- =========================================================
-- Tabla: products
-- =========================================================
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,                       -- conservamos tus IDs string
  name        TEXT NOT NULL UNIQUE,
  price       NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  stock       INTEGER     NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category    TEXT        NOT NULL,
  description TEXT,
  image       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger updated_at para products
DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Índices auxiliares
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_active_stock ON products (stock);

-- =========================================================
-- Semillas (basadas en tus JSON)
-- Nota: ON CONFLICT DO NOTHING evita duplicados si ya existen.
-- =========================================================

-- ---------- CLIENTS ----------
INSERT INTO clients (id, nombre, email, telefono, direccion, password_hash, role, activo, created_at)
VALUES
('1758128875560','Admin Fruna','admin@fruna.cl',NULL,NULL,'$2a$10$4aSHdUOlzBsQZOkDg.PgIuu8i9l/8BCgcrF34PeFRenyat7bSZg.e','admin',TRUE,'2025-09-17T17:07:55.560Z'),
('1758129268033','Pepe Acosta','pepeacosta@example.com','+56912345678','Calle de Pepe Acosta','$2a$10$oIF1EbvZs03v9SkbxzJP/e7Tq4Me8q5XnG.eEA6v73emAvqgzhS6i','user',TRUE,'2025-09-17T17:14:28.033Z'),
('1758131713782','Laura Fernández','laura.fernandez@example.com','+5698765432','Av. Los Olivos 123','$2a$10$UTXtcfGS4i4Q3uN3FrTrgutWqw1XOuEQx0cozV36QtQR561I26rcq','user',FALSE,'2025-09-17T17:55:13.782Z'),
('1758131811794','Martín Rojas','martin.rojas@example.com','+5692318745','Calle Central 45','$2a$10$SBkoEWohAewpoTxJNig0AOKXcUE4rhFeCXeZPJDAHJsmBb11H9v.6','user',TRUE,'2025-09-17T17:56:51.794Z'),
('1758131903313','Camila Soto','camila.soto@example.com','+5691234567','Pje. El Bosque 89','$2a$10$aUi3G2/TR7bJeP98Et1y4OpVD3iSvo/mxvjVVj4QaoScq5lhNAUuS','user',TRUE,'2025-09-17T17:58:23.313Z'),
('1758131987333','Antonia Morales','antonia.morales@example.com','+56 97654321','Calle Nueva 77','$2a$10$xjj3p7Pb1ZscDcVmvfnqwuxAM1HfikP3SQjCe/Wok7Mw.Era4.e6i','user',TRUE,'2025-09-17T17:59:47.333Z'),
('1758564458773','angela muñoz','angela@gmail.com','+56912345678',NULL,'$2a$10$gmQGdDF1jia592kEN0Fnp.sOV68EgSHsEEF7INMIKVi2k4kK6MXxa','user',TRUE,'2025-09-22T18:07:38.773Z'),
('1758571061501','angela otro','angela@hotmail.com','+56912341234',NULL,'$2a$10$OnayP6tdoHiL28h1OkkrG.GJ4G5Mgp9L/ioCUCy.B6RedQsHsCH7C','user',TRUE,'2025-09-22T19:57:41.501Z')
ON CONFLICT (id) DO NOTHING;

-- ---------- PRODUCTS ----------
INSERT INTO products (id, name, price, stock, category, description, image, created_at, updated_at)
VALUES
('1758149195472','Palo Palito',390.00,15,'Helados','Helado de agua sabor cereza y piña.','palo_palito.png','2025-09-17T22:46:35.472Z','2025-09-17T22:46:35.472Z'),
('1758149775878','Cola Cola Clásica 2Lt',1490.00,10,'Bebidas','Refresca tus momentos con el sabor clásico y burbujeante de siempre. Ideal para compartir en familia o con amigos.','cola_cola_fruna.jpg','2025-09-17T22:56:15.878Z','2025-09-17T22:56:15.878Z'),
('1758149867672','Sufle Maní',990.00,20,'Snacks','Snack crocante de maní con el sabor clásico de siempre. Perfecto para compartir y disfrutar en cualquier ocasión.','Sufle_Chanfle_Mani.jpg','2025-09-17T22:57:47.672Z','2025-09-17T22:57:47.672Z'),
('1758489700270','Tabletones Chocolate',2290.00,1,'Chocolate','Tabletones de galleta bañados en chocolate.','tabletones.png','2025-09-21T21:21:40.270Z','2025-09-29T20:32:20.589Z'),
('1758571251073','Alfajor Clásico',1290.00,20,'Alfajores','alfajor tradicional','alfajores.png','2025-09-22T20:00:51.073Z','2025-09-22T20:00:51.073Z'),
('1759101595903','Alfajor Panchito',490.00,45,'Alfajores','Alfajor recubierto de chocolate y relleno de manjar.','Alfajor_Panchito.jpg','2025-09-28T23:19:55.903Z','2025-09-28T23:19:55.903Z')
ON CONFLICT (id) DO NOTHING;
