import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();

/* =====================================
   CONFIG
===================================== */
app.use(cors());
app.use(express.json());
app.use(express.static("./"));

/* =====================================
   REGISTRO
===================================== */
app.post("/api/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const [exists] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (exists.length > 0) {
      return res.status(400).json({
        error: "El usuario ya existe"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    // crear usuario
    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash)
       VALUES (?, ?, ?)`,
      [nombre, email, hash]
    );

    const usuarioId = result.insertId;

    // crear perfiles automáticos
    await pool.query(
      `
      INSERT INTO perfiles (usuario_id, nombre, tipo, avatar)
      VALUES
      (?, ?, 'normal', 'imgs/perfiles/profile1.jpg'),
      (?, 'Kids', 'kids', 'imgs/perfiles/profile2.jpg')
      `,
      [usuarioId, nombre, usuarioId]
    );

    res.json({
      id: usuarioId,
      nombre,
      email
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error registrando usuario"
    });
  }
});

/* =====================================
   LOGIN
===================================== */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (!users.length) {
      return res.status(401).json({
        error: "Usuario no existe"
      });
    }

    const user = users[0];

    const valid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!valid) {
      return res.status(401).json({
        error: "Contraseña incorrecta"
      });
    }

    res.json({
      id: user.id,
      nombre: user.nombre,
      email: user.email
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error en login"
    });
  }
});

/* =====================================
   LISTAR PELÍCULAS
===================================== */
app.get("/api/peliculas", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM peliculas"
    );

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error obteniendo películas"
    });
  }
});

/* =====================================
   DETALLE PELÍCULA
===================================== */
app.get("/api/peliculas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM peliculas WHERE id = ? LIMIT 1",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: "No encontrada"
      });
    }

    const pelicula = rows[0];

    const [tags] = await pool.query(
      `
      SELECT e.nombre
      FROM pelicula_etiqueta pe
      JOIN etiquetas e ON e.id = pe.etiqueta_id
      WHERE pe.pelicula_id = ?
      `,
      [id]
    );

    pelicula.tags = tags.map(t => t.nombre);

    res.json(pelicula);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error servidor"
    });
  }
});

/* =====================================
   GUARDAR HISTORIAL
===================================== */
app.post("/api/reproducciones", async (req, res) => {
  try {
    const {
      usuario_id,
      perfil_id,
      pelicula_id
    } = req.body;

    await pool.query(
      `
      INSERT INTO historial_reproduccion
      (usuario_id, perfil_id, pelicula_id)
      VALUES (?, ?, ?)
      `,
      [usuario_id, perfil_id, pelicula_id]
    );

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error guardando historial"
    });
  }
});

/* =====================================
   CALIFICAR
===================================== */
app.post("/api/calificar", async (req, res) => {
  try {
    const { pelicula_id, valor } = req.body;

    await pool.query(
      `
      INSERT INTO calificaciones
      (pelicula_id, gusta, fecha)
      VALUES (?, ?, NOW())
      `,
      [pelicula_id, valor]
    );

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error guardando calificación"
    });
  }
});

/* =====================================
   RECOMENDACIONES
===================================== */
app.get("/api/recomendaciones/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [actualRows] = await pool.query(
      "SELECT * FROM peliculas WHERE id = ?",
      [id]
    );

    if (!actualRows.length) {
      return res.status(404).json({
        error: "Película no encontrada"
      });
    }

    const actual = actualRows[0];

    // por género
    const [similares] = await pool.query(
      `
      SELECT *
      FROM peliculas
      WHERE id <> ?
      AND genero = ?
      LIMIT 8
      `,
      [id, actual.genero]
    );

    // por etiquetas
    const [etiquetas] = await pool.query(
      `
      SELECT p.*, COUNT(*) AS coincidencias
      FROM pelicula_etiqueta pe1
      JOIN pelicula_etiqueta pe2
        ON pe1.etiqueta_id = pe2.etiqueta_id
      JOIN peliculas p
        ON p.id = pe2.pelicula_id
      WHERE pe1.pelicula_id = ?
        AND pe2.pelicula_id <> ?
      GROUP BY p.id
      ORDER BY coincidencias DESC
      LIMIT 8
      `,
      [id, id]
    );

    res.json({
      actual,
      similares,
      etiquetas
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error en recomendaciones"
    });
  }
});

/* =====================================
   OBTENER PERFILES
===================================== */
app.get("/api/perfiles/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const [perfiles] = await pool.query(
      "SELECT * FROM perfiles WHERE usuario_id = ?",
      [usuarioId]
    );

    res.json(perfiles);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error obteniendo perfiles"
    });
  }
});

/* =====================================
   CREAR PERFIL
===================================== */
app.post("/api/perfiles", async (req, res) => {
  try {
    const {
      usuario_id,
      nombre,
      tipo,
      avatar
    } = req.body;

    if (!usuario_id || !nombre) {
      return res.status(400).json({
        error: "Faltan datos"
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO perfiles
      (usuario_id, nombre, tipo, avatar)
      VALUES (?, ?, ?, ?)
      `,
      [
        usuario_id,
        nombre,
        tipo || "normal",
        avatar || "imgs/perfiles/profile1.jpg"
      ]
    );

    res.json({
      id: result.insertId,
      usuario_id,
      nombre,
      tipo,
      avatar
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error creando perfil"
    });
  }
});

/* =====================================
   ACTUALIZAR PERFIL
===================================== */
app.put("/api/perfiles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, avatar } = req.body;

    await pool.query(
      `
      UPDATE perfiles
      SET nombre = ?, tipo = ?, avatar = ?
      WHERE id = ?
      `,
      [nombre, tipo, avatar, id]
    );

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error actualizando perfil"
    });
  }
});

/* =====================================
   ELIMINAR PERFIL
===================================== */
app.delete("/api/perfiles/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM perfiles WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: "Perfil no encontrado"
      });
    }

    if (rows[0].tipo === "kids") {
      return res.status(400).json({
        error: "No se puede eliminar perfil Kids"
      });
    }

    await pool.query(
      "DELETE FROM perfiles WHERE id = ?",
      [id]
    );

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error eliminando perfil"
    });
  }
});

/* =====================================
   HOME -> LOGIN
===================================== */
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

/* =====================================
   START SERVER
===================================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Servidor en http://localhost:${PORT}`
  );
});