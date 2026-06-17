-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS zensei_academy;
USE zensei_academy;

-- Tabla Usuarios: EMAIL es UNIQUE (no se repite), PASSWORD en formato texto real
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE
);

-- Tabla Cursos: NOMBRE es UNIQUE (no se duplican los cursos)
CREATE TABLE IF NOT EXISTS cursos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(150) UNIQUE NOT NULL,
  descripcion TEXT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  imagen VARCHAR(255),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE
);

-- Tabla Inscripciones: Relaciona Usuarios y Cursos
CREATE TABLE IF NOT EXISTS inscripciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  curso_id INT NOT NULL,
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('activo', 'completado', 'cancelado') DEFAULT 'activo',
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

-- Insertar cursos de forma segura (IGNORE evita errores si ya existen)
INSERT IGNORE INTO cursos (nombre, descripcion, precio, imagen) VALUES
('Lineart Minimalista', 'El poder de la simplicidad. Aprende a definir figuras completas.', 25.00, 'minimalista_curso.jpg'),
('Realismo e Hiperrealismo', 'Domina el arte de capturar la realidad.', 49.99, 'realismo_curso.jpg'),
('Manga y Anime Profesional', 'Diseño de personajes con fisonomía japonesa.', 39.99, 'manga_curso.jpg'),
('Ilustración Digital', 'Dominio de tablet y software.', 35.00, 'digital_curso.jpg');