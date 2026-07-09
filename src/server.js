const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const prisma = require('./config/databse');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const contactRoutes = require('./routes/contactRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5500', process.env.FRONTEND_URL],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventRoutes);
app.use('/api/galeria', galleryRoutes);
app.use('/api/contato', contactRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🎬 API Cine Cocais - IFMA', status: 'online' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎬 Servidor rodando em http://localhost:${PORT}`);
});