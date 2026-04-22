const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_DIR = path.join(__dirname, '..', '..', 'data');

// GET /api/categories
router.get('/categories', (req, res) => {
  try {
    const data = fs.readFileSync(path.join(DATA_DIR, 'categories.json'), 'utf-8');
    const categories = JSON.parse(data);
    res.json(categories.sort((a, b) => a.order - b.order));
  } catch (err) {
    console.error('Chyba pri čítaní kategórií:', err.message);
    res.status(500).json({ error: 'Nepodarilo sa načítať kategórie' });
  }
});

// GET /api/manuals — zoznam aktívnych manuálov (bez krokov)
router.get('/manuals', (req, res) => {
  try {
    const manualsDir = path.join(DATA_DIR, 'manuals');
    const files = fs.readdirSync(manualsDir).filter(f => f.endsWith('.json'));

    const manuals = files
      .map(file => {
        try {
          const data = fs.readFileSync(path.join(manualsDir, file), 'utf-8');
          const manual = JSON.parse(data);
          if (!manual.active) return null;
          return {
            id: manual.id,
            name: manual.name,
            desc: manual.desc,
            category: manual.category,
            priority: manual.priority,
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    res.json(manuals);
  } catch (err) {
    console.error('Chyba pri čítaní manuálov:', err.message);
    res.status(500).json({ error: 'Nepodarilo sa načítať manuály' });
  }
});

// GET /api/manuals/:id — kompletný manuál so krokmi
router.get('/manuals/:id', (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, 'manuals', `${req.params.id}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Manuál nebol nájdený' });
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Chyba pri čítaní manuálu:', err.message);
    res.status(500).json({ error: 'Nepodarilo sa načítať manuál' });
  }
});

module.exports = router;
