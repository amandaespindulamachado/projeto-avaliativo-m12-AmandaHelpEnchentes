const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

/**
 * POST /api/auth/login
 * Autentica um usuário e retorna token JWT.
 */
function login(req, res, next) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ? AND ativo = 1').get(email);

    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const senhaValida = bcrypt.compareSync(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/registro
 * Registra novo usuário no sistema.
 */
function registro(req, res, next) {
  try {
    const { nome, email, senha, perfil } = req.body;

    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios: nome, email, senha, perfil.' });
    }

    if (!['gestor', 'voluntario'].includes(perfil)) {
      return res.status(400).json({ erro: 'Perfil inválido. Use: gestor ou voluntario.' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
    if (existe) {
      return res.status(409).json({ erro: 'Email já cadastrado.' });
    }

    const senhaHash = bcrypt.hashSync(senha, 10);

    const result = db.prepare(`
      INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)
    `).run(nome, email, senhaHash, perfil);

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      id: result.lastInsertRowid
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado.
 */
function me(req, res) {
  const usuario = db.prepare('SELECT id, nome, email, perfil, criado_em FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado.' });
  }
  return res.json(usuario);
}

module.exports = { login, registro, me };
