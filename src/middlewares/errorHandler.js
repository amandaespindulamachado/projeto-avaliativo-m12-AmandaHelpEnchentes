/**
 * Middleware global de tratamento de erros.
 * Captura erros lançados nas rotas e retorna resposta padronizada.
 */
function errorHandler(err, req, res, next) {
  console.error(`[Erro] ${req.method} ${req.url} ->`, err.message);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ erro: err.message });
  }

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ erro: 'Registro já existe com esses dados.' });
  }

  return res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = { errorHandler };
