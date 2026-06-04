const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação JWT.
 * Verifica o token no header Authorization: Bearer <token>
 */
function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

/**
 * Middleware de autorização por perfil.
 * @param {...string} perfis - Perfis permitidos ('gestor', 'voluntario')
 */
function autorizar(...perfis) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Não autenticado.' });
    }

    if (!perfis.includes(req.usuario.perfil)) {
      return res.status(403).json({ erro: 'Acesso negado. Permissão insuficiente.' });
    }

    next();
  };
}

module.exports = { autenticar, autorizar };
