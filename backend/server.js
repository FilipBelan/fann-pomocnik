require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
}));

app.use(express.json({ limit: '10mb' }));

// Statické súbory — fotky a videá
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API endpointy
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`FANN Pomocník backend beží na http://localhost:${PORT}`);
});
