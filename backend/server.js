require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:4173'];

app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: '10mb' }));

// Statické súbory — fotky a videá
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API endpointy
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// Frontend (produkčný build)
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`FANN Pomocník backend beží na http://localhost:${PORT}`);
});
