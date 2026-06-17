-- 1. Limpieza total de la base de datos
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS inscripciones;
DROP TABLE IF EXISTS cursos;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Creación de tabla usuarios
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- 3. Creación de tabla cursos
CREATE TABLE cursos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(150) UNIQUE NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2),
  imagen VARCHAR(255)
);

-- 4. Creación de tabla inscripciones
CREATE TABLE inscripciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  curso_id INT NOT NULL,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

-- 5. Inserción de datos (Alineados con tus nombres de archivo)
INSERT INTO cursos (id, nombre, descripcion, precio, imagen) VALUES 
(1, 'Lineart Minimalista', 'El poder de la simplicidad.', 25.00, 'minimalista_curso.jpg'), 
(2, 'Realismo e Hiperrealismo', 'Domina el arte de capturar la realidad.', 49.99, 'realismo_curso.jpg'), 
(3, 'Manga y Anime Profesional', 'Diseño de personajes impactantes.', 39.99, 'manga_curso.jpg'), 
(4, 'Ilustración Digital', 'Dominio de tablet y software.', 35.00, 'digital_curso.jpg');