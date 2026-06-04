const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middlewares/errorHandler');

// Rotas
const authRoutes = require('./routes/auth.routes');
const abrigosRoutes = require('./routes/abrigos.routes');
const doacoesRoutes = require('./routes/doacoes.routes');
const voluntariosRoutes = require('./routes/voluntarios.routes');
const desaparecidosRoutes = require('./routes/desaparecidos.routes');

const app = express();

// Middlewares globais
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    sistema: 'HelpEnchentes API',
    versao: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/abrigos', abrigosRoutes);
app.use('/api/doacoes', doacoesRoutes);
app.use('/api/voluntarios', voluntariosRoutes);
app.use('/api/desaparecidos', desaparecidosRoutes);

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Handler de erros global
app.use(errorHandler);

module.exports = app;
