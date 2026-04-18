-- =====================================
-- CREAR BASE DE DATOS
-- =====================================
CREATE DATABASE IF NOT EXISTS netflix_clone;
USE netflix_clone;

-- =====================================
-- USUARIOS
-- =====================================
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- PELICULAS
-- =====================================
CREATE TABLE peliculas (
  id VARCHAR(50) PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  tipo ENUM('pelicula','serie') NOT NULL,
  genero VARCHAR(100) NOT NULL,
  duracion_min INT,
  imagen VARCHAR(255),
  sinopsis TEXT
);

-- =====================================
-- PERFILES
-- =====================================
CREATE TABLE perfiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nombre VARCHAR(80) NOT NULL,
  tipo ENUM('normal','kids') DEFAULT 'normal',
  avatar VARCHAR(255) DEFAULT 'imgs/perfiles/profile1.jpg',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- =====================================
-- ETIQUETAS
-- =====================================
CREATE TABLE etiquetas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

-- =====================================
-- RELACIÓN PELICULAS - ETIQUETAS
-- =====================================
CREATE TABLE pelicula_etiqueta (
  pelicula_id VARCHAR(100) NOT NULL,
  etiqueta_id INT NOT NULL,
  PRIMARY KEY (pelicula_id, etiqueta_id),
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE,
  FOREIGN KEY (etiqueta_id) REFERENCES etiquetas(id) ON DELETE CASCADE
);

-- =====================================
-- REPRODUCCIONES
-- =====================================
CREATE TABLE reproducciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pelicula_id VARCHAR(100) NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE
);

-- =====================================
-- CALIFICACIONES
-- =====================================
CREATE TABLE calificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pelicula_id VARCHAR(100),
  gusta TINYINT(1),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE
);

-- =====================================
-- HISTORIAL
-- ====================================
DROP TABLE IF EXISTS historial_reproduccion;

CREATE TABLE historial_reproduccion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  perfil_id INT NOT NULL,
  pelicula_id VARCHAR(100) NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (perfil_id) REFERENCES perfiles(id) ON DELETE CASCADE,
  FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE
);

-- =====================================
-- INSERT PELICULAS
-- =====================================
INSERT INTO peliculas (id, titulo, tipo, genero, duracion_min, imagen, sinopsis) VALUES
('anabelle', 'Anabelle', 'pelicula', 'Terror', 6, 'imgs/anabelle.jpg', 'Una muñeca poseída aterroriza a una familia.'),
('better_call_saul', 'Better Call Saul', 'serie', 'Crimen', 8, 'imgs/saul.jpg', 'La historia del abogado Saul Goodman.'),
('bladerunner', 'Blade Runner 2049', 'pelicula', 'Ciencia Ficción', 6, 'imgs/blade.jpg', 'Un blade runner descubre un secreto oculto.'),
('breaking_bad', 'Breaking Bad', 'serie', 'Crimen', 8, 'imgs/bk.jpg', 'Profesor crea un imperio de drogas.'),
('dark_knight', 'The Dark Knight', 'pelicula', 'Acción', 6, 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 'Batman enfrenta al Joker.'),
('el_conjuro', 'El Conjuro', 'pelicula', 'Terror', 6, 'imgs/cj.jpg', 'Investigadores paranormales enfrentan una entidad maligna.'),
('el_conjuro2', 'El Conjuro 2', 'pelicula', 'Terror', 6, 'imgs/cj.jpg', 'Los Warren investigan un caso paranormal en Inglaterra.'),
('forrest_gump', 'Forrest Gump', 'pelicula', 'Drama', 6, 'imgs/for.webp', 'Historia de vida extraordinaria de Forrest.'),
('game_of_thrones', 'Game of Thrones', 'serie', 'Fantasía', 8, 'imgs/got.jpg', 'La lucha por el trono en Westeros.'),
('interstellar', 'Interstellar', 'pelicula', 'Ciencia Ficción', 6, 'imgs/int.jpg', 'Viaje interestelar para salvar a la humanidad.'),
('lotr_fellowship', 'The Lord of the Rings', 'pelicula', 'Fantasía', 6, 'imgs/lotr.jpg', 'La comunidad inicia el viaje para destruir el anillo.'),
('mandalorian', 'The Mandalorian', 'serie', 'Ciencia Ficción', 8, 'imgs/manda.jpg', 'Un cazarrecompensas viaja por la galaxia.'),
('peaky_blinders', 'Peaky Blinders', 'serie', 'Crimen', 8, 'imgs/blinders.jpg', 'Una familia criminal asciende en Birmingham.'),
('stranger_things', 'Stranger Things', 'serie', 'Terror', 8, 'imgs/stran.jpg', 'Niños enfrentan criaturas de otra dimensión.'),
('sw4', 'Star Wars: A New Hope', 'pelicula', 'Ciencia Ficción', 6, 'imgs/st1.jpg', 'Luke Skywalker se une a la rebelión contra el Imperio.'),
('sw5', 'Star Wars: The Empire Strikes Back', 'pelicula', 'Ciencia Ficción', 6, 'imgs/st2.jpg', 'El Imperio contraataca y Luke continúa su entrenamiento Jedi.'),
('the_sopranos', 'The Sopranos', 'serie', 'Crimen', 8, 'imgs/sopranos.jpg', 'Un jefe de la mafia equilibra crimen y familia.');

-- =====================================
-- INSERT ETIQUETAS
-- =====================================
INSERT INTO etiquetas (id, nombre) VALUES
(1,'espacio'),(2,'jedi'),(3,'naves'),(4,'imperio'),(5,'ia'),
(6,'cyberpunk'),(7,'futuro'),(8,'detective'),(9,'clones'),
(10,'agujero negro'),(11,'tiempo'),(12,'gravedad'),
(13,'fantasmas'),(14,'posesion'),(15,'demonios'),
(16,'muñeca'),(17,'maldicion'),(18,'monstruos'),
(19,'telequinesis'),(20,'mutantes'),(21,'viajes en el tiempo'),
(22,'poderes'),(23,'garras'),(24,'mercenario'),(25,'regeneracion'),
(26,'mafia'),(27,'caos'),(28,'hackers'),(29,'realidad virtual'),
(30,'desierto'),(31,'autos'),(32,'roma'),(33,'venganza'),
(34,'drogas'),(35,'cartel'),(36,'quimica'),(37,'abogados'),
(38,'estafas'),(39,'familia'),(40,'apuestas'),(41,'magia'),
(42,'dragones'),(43,'espadas'),(44,'reinos'),(45,'anillo'),
(46,'orcos'),(47,'historia'),(48,'guerra'),(49,'amor'),
(50,'destino'),(52,'aventura'),(53,'rebelion'),(54,'distopia'),
(55,'ciencia'),(56,'armaduras'),(57,'galaxia'),(58,'accion'),
(59,'heroe'),(60,'joker'),(61,'dinero'),(62,'crimen'),
(63,'negocios'),(64,'drama'),(65,'gangsters'),(66,'epoca'),
(67,'terror'),(68,'casa'),(69,'misterio'),(70,'horror'),
(71,'dimensiones'),(72,'años80'),(73,'fantasia'),
(74,'traicion'),(75,'elfos'),(76,'vida');

-- =====================================
-- INSERT RELACION PELICULA-ETIQUETA
-- =====================================
INSERT INTO pelicula_etiqueta (pelicula_id, etiqueta_id) VALUES
('interstellar', 1),('mandalorian', 1),('sw4', 1),('sw5', 1),
('sw4', 2),('sw5', 2),
('interstellar', 3),('mandalorian', 3),('sw4', 3),('sw5', 3),
('sw4', 4),('sw5', 4),
('bladerunner', 5),('bladerunner', 6),('bladerunner', 7),
('bladerunner', 8),('bladerunner', 9),
('interstellar', 10),('interstellar', 11),('interstellar', 12),
('el_conjuro', 13),('el_conjuro2', 13),
('el_conjuro', 14),('el_conjuro2', 14),
('anabelle', 15),('el_conjuro', 15),('el_conjuro2', 15),
('anabelle', 16),('anabelle', 17),
('stranger_things', 18),
('dark_knight', 26),('peaky_blinders', 26),('the_sopranos', 26);