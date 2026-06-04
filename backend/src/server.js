require('dotenv').config();
const app = require('./app');
const { runMigrations } = require('./database/migrations');
const { runSeed } = require('./database/seed');

const PORT = process.env.PORT || 3001;

// Executa migrations e seed ao iniciar
runMigrations();
runSeed();

app.listen(PORT, () => {
  console.log(`[Server] HelpEnchentes API rodando em http://localhost:${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
});
