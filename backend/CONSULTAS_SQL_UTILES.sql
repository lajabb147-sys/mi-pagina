-- CONSULTAS ÚTILES PARA LA BASE DE DATOS ZENSEI ACADEMY

-- ═══════════════════════════════════════════════════════════════
-- USUARIOS
-- ═══════════════════════════════════════════════════════════════

-- Ver todos los usuarios
SELECT * FROM usuarios;

-- Agregar un usuario de prueba
INSERT INTO usuarios (nombre, email, password) 
VALUES ('Juan Perez', 'juan@email.com', 'password123');

-- Actualizar un usuario
UPDATE usuarios 
SET nombre = 'Juan Carlos' 
WHERE email = 'juan@email.com';

-- Eliminar un usuario (lógicamente, manteniendo historial)
UPDATE usuarios 
SET activo = FALSE 
WHERE id = 1;

-- Ver cuántos usuarios hay
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- ═══════════════════════════════════════════════════════════════
-- CURSOS
-- ═══════════════════════════════════════════════════════════════

-- Ver todos los cursos
SELECT * FROM cursos;

-- Ver cursos con precio mayor a $30
SELECT * FROM cursos WHERE precio > 30;

-- Agregar un nuevo curso
INSERT INTO cursos (nombre, descripcion, precio, imagen) 
VALUES (
  'Ilustración Digital',
  'Aprende a crear ilustraciones profesionales digitales',
  59.99,
  'ilustracion_digital.jpg'
);

-- Ver cursos ordenados por precio
SELECT * FROM cursos ORDER BY precio ASC;

-- Ver cursos ordenados por nombre
SELECT * FROM cursos ORDER BY nombre ASC;

-- Actualizar el precio de un curso
UPDATE cursos 
SET precio = 45.99 
WHERE nombre = 'Lineart Minimalista';

-- Ver cursos creados en los últimos 7 días
SELECT * FROM cursos 
WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 7 DAY);

-- ═══════════════════════════════════════════════════════════════
-- INSCRIPCIONES
-- ═══════════════════════════════════════════════════════════════

-- Ver todas las inscripciones
SELECT * FROM inscripciones;

-- Inscribir un usuario en un curso
INSERT INTO inscripciones (usuario_id, curso_id) 
VALUES (1, 1);

-- Ver inscripciones de un usuario específico
SELECT u.nombre, c.nombre as curso, i.fecha_inscripcion, i.estado
FROM inscripciones i
JOIN usuarios u ON i.usuario_id = u.id
JOIN cursos c ON i.curso_id = c.id
WHERE u.id = 1;

-- Ver cuántos usuarios se inscribieron en cada curso
SELECT c.nombre, COUNT(i.id) as total_inscritos
FROM cursos c
LEFT JOIN inscripciones i ON c.id = i.curso_id
GROUP BY c.id, c.nombre;

-- Ver usuarios inscritos en un curso específico
SELECT u.nombre, u.email, i.fecha_inscripcion
FROM inscripciones i
JOIN usuarios u ON i.usuario_id = u.id
JOIN cursos c ON i.curso_id = c.id
WHERE c.nombre = 'Lineart Minimalista';

-- ═══════════════════════════════════════════════════════════════
-- REPORTES Y ESTADÍSTICAS
-- ═══════════════════════════════════════════════════════════════

-- Total de ingresos por curso
SELECT c.nombre, COUNT(i.id) as inscritos, 
  (COUNT(i.id) * c.precio) as ingresos_totales
FROM cursos c
LEFT JOIN inscripciones i ON c.id = i.curso_id
GROUP BY c.id, c.nombre
ORDER BY ingresos_totales DESC;

-- Usuario que se inscribió en más cursos
SELECT u.nombre, COUNT(i.id) as total_cursos
FROM usuarios u
LEFT JOIN inscripciones i ON u.id = i.usuario_id
GROUP BY u.id, u.nombre
ORDER BY total_cursos DESC
LIMIT 1;

-- Cursos ordenados por popularidad (más inscritos primero)
SELECT c.nombre, c.precio, COUNT(i.id) as inscritos
FROM cursos c
LEFT JOIN inscripciones i ON c.id = i.curso_id
GROUP BY c.id, c.nombre, c.precio
ORDER BY inscritos DESC;

-- ═══════════════════════════════════════════════════════════════
-- NOTIFICACIONES
-- ═══════════════════════════════════════════════════════════════

-- Ver notificaciones no leídas de un usuario
SELECT * FROM notificaciones 
WHERE usuario_id = 1 AND leida = FALSE;

-- Marcar notificación como leída
UPDATE notificaciones 
SET leida = TRUE 
WHERE id = 1;

-- Crear una notificación para todos los usuarios
INSERT INTO notificaciones (usuario_id, tipo, mensaje)
SELECT id, 'oferta', 'Nuevo curso disponible: Ilustración Digital'
FROM usuarios WHERE activo = TRUE;

-- ═══════════════════════════════════════════════════════════════
-- MANTENIMIENTO
-- ═══════════════════════════════════════════════════════════════

-- Ver el tamaño de la base de datos
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) as 'Tamaño (MB)'
FROM information_schema.tables
WHERE table_schema = 'zensei_academy';

-- Ver índices de una tabla
SHOW INDEX FROM cursos;

-- Optimizar una tabla
OPTIMIZE TABLE usuarios;
OPTIMIZE TABLE cursos;
OPTIMIZE TABLE inscripciones;

-- Ver usuarios duplicados (si los hay)
SELECT email, COUNT(*) as cantidad
FROM usuarios
GROUP BY email
HAVING cantidad > 1;

-- ═══════════════════════════════════════════════════════════════
-- DATOS DE PRUEBA ADICIONALES
-- ═══════════════════════════════════════════════════════════════

-- Agregar más usuarios de prueba
INSERT INTO usuarios (nombre, email, password) VALUES
('María García', 'maria@email.com', 'pass123'),
('Carlos López', 'carlos@email.com', 'pass123'),
('Ana Martínez', 'ana@email.com', 'pass123'),
('Pedro Rodríguez', 'pedro@email.com', 'pass123');

-- Agregar más cursos de prueba
INSERT INTO cursos (nombre, descripcion, precio, imagen) VALUES
('Conceptos básicos del dibujo', 'Aprende los fundamentos del dibujo', 19.99, 'conceptos.jpg'),
('Anatomía para artistas', 'Domina la anatomía humana', 44.99, 'anatomia.jpg'),
('Colorimetría avanzada', 'Técnicas avanzadas de color', 54.99, 'color.jpg'),
('Composición y perspectiva', 'Domina la composición', 34.99, 'composicion.jpg');

-- ═══════════════════════════════════════════════════════════════

💡 TIPS:
- Usa SELECT para ver datos (no modifica nada)
- Usa INSERT para agregar datos
- Usa UPDATE para modificar datos
- Usa DELETE para eliminar datos (mejor: UPDATE ... SET activo = FALSE)
- Siempre haz backup antes de grandes cambios

¿Necesitas más consultas? Pregúntame en el código 🎨
