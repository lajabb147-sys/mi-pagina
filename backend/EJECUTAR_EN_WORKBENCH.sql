-- Ejecuta ESTO en MySQL Workbench para crear un usuario que funcione
-- Copia TODO de abajo y pégalo en MySQL Workbench

CREATE USER IF NOT EXISTS 'zensei'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON *.* TO 'zensei'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;

CREATE DATABASE IF NOT EXISTS zensei_academy;
USE zensei_academy;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS cursos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  imagen VARCHAR(255),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS inscripciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  curso_id INT NOT NULL,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('activo', 'completado', 'cancelado') DEFAULT 'activo',
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

CREATE TABLE IF NOT EXISTS notificaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

INSERT IGNORE INTO cursos (nombre, descripcion, precio, imagen) VALUES
('Lineart Minimalista', 'El poder de la simplicidad. Aprende a definir figuras completas, rostros y conceptos usando trazos puros, limpios y continuos.', 25.00, 'minimalista_curso.jpg'),
('Realismo e Hiperrealismo', 'Domina el arte de capturar la realidad. Técnicas avanzadas de sombreado, volumen y texturas extremas que imitan una fotografía.', 49.99, 'realismo_curso.jpg'),
('Manga y Anime Profesional', 'Diseño de personajes con fisonomía japonesa, expresiones impactantes, ojos expresivos y estructura dinámica de viñetas.', 39.99, 'manga_curso.jpg');
