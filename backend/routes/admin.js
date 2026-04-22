const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const auth = require('../middleware/auth');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// Multer — upload do správneho priečinka podľa type query param
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const isVideo = req.query.type === 'video' ||
      file.mimetype.startsWith('video/');
    const dir = isVideo
      ? path.join(UPLOADS_DIR, 'videos')
      : path.join(UPLOADS_DIR, 'images');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-z0-9_-]/gi, '_')
      .toLowerCase();
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
  fileFilter(req, file, cb) {
    const allowed = /\.(jpg|jpeg|png|gif|webp|mp4|mov|webm)$/i;
    if (allowed.test(file.originalname)) cb(null, true);
    else cb(new Error('Nepodporovaný formát súboru'));
  },
});

// ─── LOGIN (verejné) ────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASS;

  if (!username || !password) {
    return res.status(400).json({ error: 'Zadajte meno a heslo' });
  }

  const userMatch = username === expectedUser;
  // Porovnanie hesla — podporuje aj plain-text (pre jednoduchosť nastavenia)
  const passMatch = expectedPass.startsWith('$2')
    ? await bcrypt.compare(password, expectedPass)
    : password === expectedPass;

  if (!userMatch || !passMatch) {
    return res.status(401).json({ error: 'Nesprávne meno alebo heslo' });
  }

  const token = jwt.sign({ user: username }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// ─── MANUÁLY ────────────────────────────────────────────────────────────────

router.get('/manuals', auth, (req, res) => {
  try {
    const dir = path.join(DATA_DIR, 'manuals');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    const manuals = files.map(file => {
      try {
        return JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
      } catch { return null; }
    }).filter(Boolean);
    res.json(manuals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/manuals/:id', auth, (req, res) => {
  const filePath = path.join(DATA_DIR, 'manuals', `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Manuál nebol nájdený' });
  }
  try {
    res.json(JSON.parse(fs.readFileSync(filePath, 'utf-8')));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/manuals', auth, (req, res) => {
  const manual = req.body;
  if (!manual.id || !/^[a-z0-9-]+$/.test(manual.id)) {
    return res.status(400).json({ error: 'ID musí obsahovať len malé písmená, číslice a pomlčky' });
  }
  const filePath = path.join(DATA_DIR, 'manuals', `${manual.id}.json`);
  if (fs.existsSync(filePath)) {
    return res.status(409).json({ error: `Manuál s ID "${manual.id}" už existuje` });
  }
  manual.updated = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(manual, null, 2), 'utf-8');
  res.status(201).json(manual);
});

router.put('/manuals/:id', auth, (req, res) => {
  const filePath = path.join(DATA_DIR, 'manuals', `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Manuál nebol nájdený' });
  }
  const manual = { ...req.body, id: req.params.id, updated: new Date().toISOString() };
  fs.writeFileSync(filePath, JSON.stringify(manual, null, 2), 'utf-8');
  res.json(manual);
});

router.delete('/manuals/:id', auth, (req, res) => {
  const filePath = path.join(DATA_DIR, 'manuals', `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Manuál nebol nájdený' });
  }
  fs.unlinkSync(filePath);
  res.json({ ok: true });
});

// ─── KATEGÓRIE ──────────────────────────────────────────────────────────────

router.get('/categories', auth, (req, res) => {
  try {
    const data = fs.readFileSync(path.join(DATA_DIR, 'categories.json'), 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/categories', auth, (req, res) => {
  const categories = req.body;
  if (!Array.isArray(categories)) {
    return res.status(400).json({ error: 'Očakávaný zoznam kategórií' });
  }
  // Kontrola či nejaký manuál odkazuje na mazané kategórie
  const catIds = new Set(categories.map(c => c.id));
  const manualsDir = path.join(DATA_DIR, 'manuals');
  const files = fs.readdirSync(manualsDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const m = JSON.parse(fs.readFileSync(path.join(manualsDir, file), 'utf-8'));
      if (m.category && !catIds.has(m.category)) {
        return res.status(409).json({
          error: `Nemožno zmazať kategóriu "${m.category}" — používa ju manuál "${m.name}"`,
        });
      }
    } catch { /* skip */ }
  }
  fs.writeFileSync(path.join(DATA_DIR, 'categories.json'), JSON.stringify(categories, null, 2), 'utf-8');
  res.json(categories);
});

// ─── UPLOAD ─────────────────────────────────────────────────────────────────

router.post('/upload', auth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Súbor nebol nahraný' });
  }
  const isVideo = req.file.mimetype.startsWith('video/');
  res.json({
    filename: req.file.filename,
    type: isVideo ? 'video' : 'image',
    url: isVideo ? `/uploads/videos/${req.file.filename}` : `/uploads/images/${req.file.filename}`,
  });
});

module.exports = router;
