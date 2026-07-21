-- ============================================================
-- SECRETARÍA DE MUJERES, GÉNEROS E INFANCIAS · TIGRE
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ---- TABLAS ----

CREATE TABLE IF NOT EXISTS eventos (
  id         bigserial PRIMARY KEY,
  platform   text NOT NULL CHECK (platform IN ('genero','infancia')),
  day        text NOT NULL,
  month      text NOT NULL,
  title      text NOT NULL,
  detail     text DEFAULT '',
  cupo       integer DEFAULT 20,
  anotados   integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS novedades (
  id         bigserial PRIMARY KEY,
  platform   text NOT NULL CHECK (platform IN ('genero','infancia')),
  title      text NOT NULL,
  detail     text DEFAULT '',
  body       text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bitacoras (
  id           bigserial PRIMARY KEY,
  platform     text NOT NULL CHECK (platform IN ('genero','infancia')),
  tipo         text NOT NULL,
  detalle      text NOT NULL,
  status       text DEFAULT 'pendiente' CHECK (status IN ('pendiente','seguimiento','resuelto','falso')),
  responsible  text DEFAULT 'coordinador',
  assigned_to  text DEFAULT 'Sin asignar',
  pending_ack  boolean DEFAULT false,
  derived_from text,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bitacora_logs (
  id           bigserial PRIMARY KEY,
  bitacora_id  bigint REFERENCES bitacoras(id) ON DELETE CASCADE,
  text         text NOT NULL,
  level        text DEFAULT 'sistema',
  created_at   timestamptz DEFAULT now()
);

-- ---- ROW LEVEL SECURITY ----

ALTER TABLE eventos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE novedades     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bitacoras     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bitacora_logs ENABLE ROW LEVEL SECURITY;

-- Políticas abiertas para el prototipo (sin auth todavía)
CREATE POLICY "public_all_eventos"       ON eventos       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_novedades"     ON novedades     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_bitacoras"     ON bitacoras     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_bitacora_logs" ON bitacora_logs FOR ALL USING (true) WITH CHECK (true);

-- ---- DATOS INICIALES ----

TRUNCATE eventos, novedades, bitacoras, bitacora_logs RESTART IDENTITY CASCADE;

INSERT INTO eventos (platform, day, month, title, detail, cupo, anotados) VALUES
('genero',   '18','JUL','Taller de Nuevas Masculinidades',          '18:00 hs · Centro de Integración Social',        20, 14),
('genero',   '22','JUL','Turno: asesoramiento legal gratuito',      '10:00 hs · Secretaría, Gral. Pacheco',           8,   8),
('genero',   '25','JUL','Ronda de Promotoras territoriales',        '16:00 hs · Barrio Ricardo Rojas',                30,  6),
('genero',   '28','JUL','Grupo de apoyo entre pares',               '17:30 hs · Talar de Pacheco',                    12,  9),
('genero',   '02','AGO','Capacitación en perspectiva de género',    '9:00 hs · Equipos municipales, Tigre Centro',    25, 11),
('infancia', '17','JUL','Vacunatorio itinerante',                   '9:00 hs · Barrio Ricardo Rojas',                 50, 22),
('infancia', '21','JUL','Inscripción Colonia de verano',            'Todo el día · Centros de Infancia',              40, 40),
('infancia', '26','JUL','Taller de crianza respetuosa',             '17:00 hs · Talar de Pacheco',                    15,  5),
('infancia', '29','JUL','Feria de servicios en Rincón de Milberg', '10:00 hs · Salud, educación y juego',            60, 18),
('infancia', '04','AGO','Jornada de prevención del acoso escolar',  '14:00 hs · Escuelas de Tigre Centro',            35,  9);

INSERT INTO novedades (platform, title, detail, body) VALUES
('genero', 'Taller de Nuevas Masculinidades',
 'Inscripciones abiertas · Centro de Integración Social',
 'El taller propone un espacio de reflexión y deconstrucción sobre los mandatos de la masculinidad tradicional. Coordinado por el equipo de Género de la Secretaría, se realizará el 18 de julio a las 18:00 hs en el Centro de Integración Social de Tigre. Cupo limitado.'),
('genero', 'Turnos de asesoramiento legal gratuito',
 'Consultas por violencia de género',
 'La Secretaría ofrece turnos de asesoramiento legal gratuito para personas en situación de violencia de género, atendidos por abogadas/os especializadas/os y con total confidencialidad. Llamá al (011) 4506-5559 de lunes a viernes de 8 a 18 hs.'),
('genero', 'Ronda de Promotoras territoriales',
 'Recorrida semanal en Barrio Ricardo Rojas',
 'Las Promotoras territoriales recorren los barrios semanalmente brindando información sobre derechos, programas y recursos disponibles. Esta semana estarán en el Barrio Ricardo Rojas el 25 de julio a partir de las 16 hs.'),
('infancia', 'Vacunatorio itinerante para infancias',
 'Esta semana en distintos barrios de Tigre',
 'El vacunatorio itinerante recorre los barrios para facilitar el acceso al calendario de vacunación. Esta semana estará en el Barrio Ricardo Rojas el 17 de julio desde las 9:00 hs. No es necesario turno previo. Traé el carnet de vacunación.'),
('infancia', 'Colonia de verano — inscripción abierta',
 'Centros de Infancia, cupos limitados',
 'Abiertas las inscripciones para la Colonia de Verano en los Centros de Infancia del Municipio. Actividades recreativas, deportivas y culturales para niñas y niños de 4 a 12 años. Cupos limitados.'),
('infancia', 'Feria de servicios en Rincón de Milberg',
 'Salud, educación y juego para las familias',
 'El 29 de julio de 10 a 17 hs, feria con stands de salud, educación, recreación y más. Vacunación, asesoramiento legal, juegos para los chicos y atención de todos los programas municipales. Entrada libre y gratuita.');
