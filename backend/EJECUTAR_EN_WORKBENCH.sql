-- 1. Limpieza radical: eliminamos todo para asegurar orden 1-4
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS inscripciones;
DROP TABLE IF EXISTS cursos;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Creación de tabla usuarios (Email único para evitar duplicados)
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- 3. Creación de tabla cursos (Nombre único para evitar duplicados)
CREATE TABLE cursos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(150) UNIQUE NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2)
);

-- 4. Inserción GARANTIZADA: Forzamos los IDs del 1 al 4
INSERT INTO cursos (id, nombre, descripcion, precio) VALUES 
(1, 'Lineart Minimalista', 'El poder de la simplicidad.', 25.00), 
(2, 'Realismo e Hiperrealismo', 'Domina el arte de capturar la realidad.', 49.99), 
(3, 'Manga y Anime Profesional', 'Diseño de personajes impactantes.', 39.99), 
(4, 'Ilustración Digital', 'Dominio de tablet y software.', 35.00);

-- 5. Tabla de Inscripciones (Relaciona usuarios con cursos)
CREATE TABLE inscripciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  curso_id INT NOT NULL,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

-- 6. Consulta de verificación (Para confirmar que todo está perfecto)
SELECT id, nombre FROM cursos ORDER BY id ASC;