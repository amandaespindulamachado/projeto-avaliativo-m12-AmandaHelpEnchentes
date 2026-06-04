const db = require('../database/db');

/**
 * GET /api/voluntarios
 * Lista voluntários com filtros opcionais.
 * Query params: cidade, status, disponibilidade
 */
function listar(req, res, next) {
  try {
    const { cidade, status, disponibilidade } = req.query;
    let query = `
      SELECT v.*, a.nome as abrigo_nome
      FROM voluntarios v
      LEFT JOIN abrigos a ON v.alocado_em = a.id
      WHERE 1=1
    `;
    const params = [];

    if (cidade) { query += ' AND v.cidade LIKE ?'; params.push(`%${cidade}%`); }
    if (status) { query += ' AND v.status = ?'; params.push(status); }
    if (disponibilidade) { query += ' AND v.disponibilidade = ?'; params.push(disponibilidade); }

    query += ' ORDER BY v.criado_em DESC';

    const voluntarios = db.prepare(query).all(...params);
    return res.json(voluntarios);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/voluntarios/:id
 * Retorna um voluntário pelo ID.
 */
function buscarPorId(req, res, next) {
  try {
    const voluntario = db.prepare(`
      SELECT v.*, a.nome as abrigo_nome, a.endereco as abrigo_endereco
      FROM voluntarios v
      LEFT JOIN abrigos a ON v.alocado_em = a.id
      WHERE v.id = ?
    `).get(req.params.id);

    if (!voluntario) {
      return res.status(404).json({ erro: 'Voluntário não encontrado.' });
    }

    return res.json(voluntario);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/voluntarios
 * Registra um novo voluntário. Público — qualquer pessoa pode se cadastrar.
 */
function criar(req, res, next) {
  try {
    const { nome, email, telefone, habilidades, disponibilidade, cidade, estado } = req.body;

    if (!nome || !cidade) {
      return res.status(400).json({ erro: 'Campos obrigatórios: nome, cidade.' });
    }

    const disponibilidades = ['manha', 'tarde', 'noite', 'integral', 'fins_de_semana'];
    if (disponibilidade && !disponibilidades.includes(disponibilidade)) {
      return res.status(400).json({ erro: `Disponibilidade inválida. Use: ${disponibilidades.join(', ')}.` });
    }

    const result = db.prepare(`
      INSERT INTO voluntarios (nome, email, telefone, habilidades, disponibilidade, cidade, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      nome,
      email || null,
      telefone || null,
      habilidades || null,
      disponibilidade || 'integral',
      cidade,
      estado || 'RS'
    );

    const novo = db.prepare('SELECT * FROM voluntarios WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(novo);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/voluntarios/:id
 * Atualiza dados de um voluntário.
 */
function atualizar(req, res, next) {
  try {
    const voluntario = db.prepare('SELECT id FROM voluntarios WHERE id = ?').get(req.params.id);
    if (!voluntario) {
      return res.status(404).json({ erro: 'Voluntário não encontrado.' });
    }

    const { nome, email, telefone, habilidades, disponibilidade, cidade, estado } = req.body;

    db.prepare(`
      UPDATE voluntarios SET
        nome = COALESCE(?, nome),
        email = COALESCE(?, email),
        telefone = COALESCE(?, telefone),
        habilidades = COALESCE(?, habilidades),
        disponibilidade = COALESCE(?, disponibilidade),
        cidade = COALESCE(?, cidade),
        estado = COALESCE(?, estado),
        atualizado_em = datetime('now','localtime')
      WHERE id = ?
    `).run(nome, email, telefone, habilidades, disponibilidade, cidade, estado, req.params.id);

    const atualizado = db.prepare('SELECT * FROM voluntarios WHERE id = ?').get(req.params.id);
    return res.json(atualizado);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/voluntarios/:id/alocar
 * Aloca ou desaloca um voluntário em um abrigo.
 */
function alocar(req, res, next) {
  try {
    const voluntario = db.prepare('SELECT * FROM voluntarios WHERE id = ?').get(req.params.id);
    if (!voluntario) {
      return res.status(404).json({ erro: 'Voluntário não encontrado.' });
    }

    const { abrigo_id } = req.body;

    // Se abrigo_id for null, desaloca o voluntário
    if (abrigo_id === null || abrigo_id === undefined) {
      db.prepare(`
        UPDATE voluntarios SET alocado_em = NULL, status = 'disponivel', atualizado_em = datetime('now','localtime')
        WHERE id = ?
      `).run(req.params.id);
    } else {
      const abrigo = db.prepare('SELECT id FROM abrigos WHERE id = ?').get(abrigo_id);
      if (!abrigo) {
        return res.status(404).json({ erro: 'Abrigo não encontrado.' });
      }

      db.prepare(`
        UPDATE voluntarios SET alocado_em = ?, status = 'alocado', atualizado_em = datetime('now','localtime')
        WHERE id = ?
      `).run(abrigo_id, req.params.id);
    }

    const atualizado = db.prepare(`
      SELECT v.*, a.nome as abrigo_nome
      FROM voluntarios v
      LEFT JOIN abrigos a ON v.alocado_em = a.id
      WHERE v.id = ?
    `).get(req.params.id);

    return res.json(atualizado);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/voluntarios/:id
 * Remove um voluntário do sistema.
 */
function remover(req, res, next) {
  try {
    const voluntario = db.prepare('SELECT id FROM voluntarios WHERE id = ?').get(req.params.id);
    if (!voluntario) {
      return res.status(404).json({ erro: 'Voluntário não encontrado.' });
    }

    db.prepare('DELETE FROM voluntarios WHERE id = ?').run(req.params.id);
    return res.json({ mensagem: 'Voluntário removido com sucesso.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, alocar, remover };
