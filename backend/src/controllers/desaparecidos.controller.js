const db = require('../database/db');

/**
 * GET /api/desaparecidos
 * Lista pessoas desaparecidas com filtros opcionais.
 * Query params: cidade, status, nome
 */
function listar(req, res, next) {
  try {
    const { cidade, status, nome } = req.query;
    let query = 'SELECT * FROM desaparecidos WHERE 1=1';
    const params = [];

    if (cidade) { query += ' AND cidade LIKE ?'; params.push(`%${cidade}%`); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    if (nome) { query += ' AND nome LIKE ?'; params.push(`%${nome}%`); }

    query += ' ORDER BY criado_em DESC';

    const desaparecidos = db.prepare(query).all(...params);
    return res.json(desaparecidos);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/desaparecidos/:id
 * Retorna uma pessoa desaparecida pelo ID.
 */
function buscarPorId(req, res, next) {
  try {
    const desaparecido = db.prepare('SELECT * FROM desaparecidos WHERE id = ?').get(req.params.id);

    if (!desaparecido) {
      return res.status(404).json({ erro: 'Registro não encontrado.' });
    }

    return res.json(desaparecido);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/desaparecidos
 * Registra nova pessoa desaparecida.
 * Público — qualquer pessoa pode registrar em situação de emergência.
 */
function criar(req, res, next) {
  try {
    const {
      nome, idade, descricao, foto_url,
      ultimo_local_visto, cidade, estado,
      data_desaparecimento, contato_familiar, nome_familiar
    } = req.body;

    if (!nome || !ultimo_local_visto || !cidade || !data_desaparecimento || !contato_familiar || !nome_familiar) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: nome, ultimo_local_visto, cidade, data_desaparecimento, contato_familiar, nome_familiar.'
      });
    }

    const result = db.prepare(`
      INSERT INTO desaparecidos
        (nome, idade, descricao, foto_url, ultimo_local_visto, cidade, estado, data_desaparecimento, contato_familiar, nome_familiar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      nome,
      idade || null,
      descricao || null,
      foto_url || null,
      ultimo_local_visto,
      cidade,
      estado || 'RS',
      data_desaparecimento,
      contato_familiar,
      nome_familiar
    );

    const novo = db.prepare('SELECT * FROM desaparecidos WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(novo);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/desaparecidos/:id
 * Atualiza dados de uma pessoa desaparecida.
 */
function atualizar(req, res, next) {
  try {
    const desaparecido = db.prepare('SELECT id FROM desaparecidos WHERE id = ?').get(req.params.id);
    if (!desaparecido) {
      return res.status(404).json({ erro: 'Registro não encontrado.' });
    }

    const { nome, idade, descricao, foto_url, ultimo_local_visto, cidade, estado, data_desaparecimento, contato_familiar, nome_familiar } = req.body;

    db.prepare(`
      UPDATE desaparecidos SET
        nome = COALESCE(?, nome),
        idade = COALESCE(?, idade),
        descricao = COALESCE(?, descricao),
        foto_url = COALESCE(?, foto_url),
        ultimo_local_visto = COALESCE(?, ultimo_local_visto),
        cidade = COALESCE(?, cidade),
        estado = COALESCE(?, estado),
        data_desaparecimento = COALESCE(?, data_desaparecimento),
        contato_familiar = COALESCE(?, contato_familiar),
        nome_familiar = COALESCE(?, nome_familiar),
        atualizado_em = datetime('now','localtime')
      WHERE id = ?
    `).run(nome, idade, descricao, foto_url, ultimo_local_visto, cidade, estado, data_desaparecimento, contato_familiar, nome_familiar, req.params.id);

    const atualizado = db.prepare('SELECT * FROM desaparecidos WHERE id = ?').get(req.params.id);
    return res.json(atualizado);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/desaparecidos/:id/status
 * Atualiza o status de uma pessoa desaparecida.
 */
function atualizarStatus(req, res, next) {
  try {
    const desaparecido = db.prepare('SELECT id FROM desaparecidos WHERE id = ?').get(req.params.id);
    if (!desaparecido) {
      return res.status(404).json({ erro: 'Registro não encontrado.' });
    }

    const { status, informacoes_encontrado } = req.body;
    const statusValidos = ['desaparecido', 'encontrado', 'em_abrigo'];

    if (!status || !statusValidos.includes(status)) {
      return res.status(400).json({ erro: `Status inválido. Use: ${statusValidos.join(', ')}.` });
    }

    db.prepare(`
      UPDATE desaparecidos SET
        status = ?,
        informacoes_encontrado = COALESCE(?, informacoes_encontrado),
        atualizado_em = datetime('now','localtime')
      WHERE id = ?
    `).run(status, informacoes_encontrado || null, req.params.id);

    const atualizado = db.prepare('SELECT * FROM desaparecidos WHERE id = ?').get(req.params.id);
    return res.json(atualizado);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/desaparecidos/:id
 * Remove um registro de pessoa desaparecida.
 */
function remover(req, res, next) {
  try {
    const desaparecido = db.prepare('SELECT id FROM desaparecidos WHERE id = ?').get(req.params.id);
    if (!desaparecido) {
      return res.status(404).json({ erro: 'Registro não encontrado.' });
    }

    db.prepare('DELETE FROM desaparecidos WHERE id = ?').run(req.params.id);
    return res.json({ mensagem: 'Registro removido com sucesso.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, atualizarStatus, remover };
