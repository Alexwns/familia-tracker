const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'familia2024';
const DB_PATH = path.join(__dirname, 'db', 'data.json');

// ── Base de datos JSON simple ─────────────────────────────────────────────
if (!fs.existsSync(path.join(__dirname, 'db'))) fs.mkdirSync(path.join(__dirname, 'db'));

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch { return { miembros: [], ubicaciones: [] }; }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.key;
  if (key !== ADMIN_KEY) return res.status(403).json({ error: 'No autorizado' });
  next();
}

// ── Admin: crear miembro ──────────────────────────────────────────────────
app.post('/admin/miembros', requireAdmin, (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Falta el nombre' });
  const db = readDB();
  const id = crypto.randomUUID();
  const token = crypto.randomBytes(16).toString('hex');
  db.miembros.push({ id, nombre, token, creado_en: new Date().toISOString() });
  writeDB(db);
  res.json({
    id, nombre,
    link: `${req.protocol}://${req.get('host')}/rastrear.html?token=${token}`
  });
});

// ── Admin: listar miembros ────────────────────────────────────────────────
app.get('/admin/miembros', requireAdmin, (req, res) => {
  const db = readDB();
  res.json(db.miembros.map(({ id, nombre, creado_en }) => ({ id, nombre, creado_en })));
});

// ── Admin: eliminar miembro ───────────────────────────────────────────────
app.delete('/admin/miembros/:id', requireAdmin, (req, res) => {
  const db = readDB();
  db.miembros = db.miembros.filter(m => m.id !== req.params.id);
  db.ubicaciones = db.ubicaciones.filter(u => u.miembro_id !== req.params.id);
  writeDB(db);
  res.json({ ok: true });
});

// ── Admin: mapa (última ubicación de cada miembro) ────────────────────────
app.get('/admin/mapa', requireAdmin, (req, res) => {
  const db = readDB();
  const resultado = db.miembros.map(m => {
    const locs = db.ubicaciones
      .filter(u => u.miembro_id === m.id)
      .sort((a, b) => new Date(b.enviado_en) - new Date(a.enviado_en));
    const ultima = locs[0] || {};
    return {
      id: m.id, nombre: m.nombre,
      lat: ultima.lat || null, lng: ultima.lng || null,
      precision_m: ultima.precision_m || null,
      bateria: ultima.bateria || null,
      enviado_en: ultima.enviado_en || null
    };
  });
  res.json(resultado);
});

// ── Admin: historial ──────────────────────────────────────────────────────
app.get('/admin/historial/:id', requireAdmin, (req, res) => {
  const db = readDB();
  const locs = db.ubicaciones
    .filter(u => u.miembro_id === req.params.id)
    .sort((a, b) => new Date(b.enviado_en) - new Date(a.enviado_en))
    .slice(0, 50);
  res.json(locs);
});

// ── Público: recibir ubicación ────────────────────────────────────────────
app.post('/ubicacion', (req, res) => {
  const { token, lat, lng, precision, bateria } = req.body;
  if (!token || lat == null || lng == null)
    return res.status(400).json({ error: 'Datos incompletos' });

  const db = readDB();
  const miembro = db.miembros.find(m => m.token === token);
  if (!miembro) return res.status(404).json({ error: 'Token inválido' });

  db.ubicaciones.push({
    miembro_id: miembro.id, lat, lng,
    precision_m: precision || null,
    bateria: bateria || null,
    enviado_en: new Date().toISOString()
  });

  // Mantener solo las últimas 500 por miembro
  const otras = db.ubicaciones.filter(u => u.miembro_id !== miembro.id);
  const mias = db.ubicaciones
    .filter(u => u.miembro_id === miembro.id)
    .sort((a, b) => new Date(b.enviado_en) - new Date(a.enviado_en))
    .slice(0, 500);
  db.ubicaciones = [...otras, ...mias];

  writeDB(db);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT} | Admin key: ${ADMIN_KEY}`);
});
