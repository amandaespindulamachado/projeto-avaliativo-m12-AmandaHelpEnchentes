const db = require('../database/db');

/**
 * GET /api/abrigos
 * Lista todos os abrigos com filtros opcionais.
 * Query params: cidade, estado, status
 */
function listar(req, res, next) {
  try {
    const { cidade, estado, status } = req.query;
    let query = 'SELECT * FROM abrigos WHERE 1=1';
    const params = [];

    if (cidade) { query += ' AND cidade LIKE ?'; params.push(`%${cidade}%`); }
    if (estado) { query += ' AND estado = ?'; params.push(estado); }
    if (status) { query += ' AND status = ?'; params.push(status); }

    query += ' ORDER BY criado_em DESC';

    const abrigos = db.prepare(query).all(...params);

    // Calcula vagas disponíveis em cada abrigo
    const resultado = abrigos.map(a => ({
      ...a,
      vagas_disponiveis: Math.max(0, a.capacidade_total - a.ocupacao_atual)
    }));

    return res.json(resultado);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/abrigos/:id
 * Retorna um abrigo pelo ID com suas doações associadas.
 */
function buscarPorId(req, res, next) {
  try {
    const abrigo = db.prepare('SELECT * FROM abrigos WHERE id = ?').get(req.params.id);

    if (!abrigo) {
      return res.status(404).json({ erro: 'Abrigo não encontrado.' });
    }

    const doacoes = db.prepare('SELECT * FROM doacoes WHERE abrigo_id = ? ORDER BY urgencia DESC').all(abrigo.id);

    return res.json({
      ...abrigo,
      vagas_disponiveis: Math.max(0, abrigo.capacidade_total - abrigo.ocupacao_atual),
      doacoes
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/abrigos
 * Cria um novo abrigo.
 */
function criar(req, res, next) {
  try {
    const { nome, endereco, cidade, estado, capacidade_total, contato, responsavel, observacoes } = req.body;

    if (!nome || !endereco || !cidade) {
      return res.status(400).json({ erro: 'Campos obrigatórios: nome, endereco, cidade.' });
    }

    const result = db.prepare(`
      INSERT INTO abrigos (nome, endereco, cidade, estado, capacidade_total, contato, responsavel, observacoes, criado_por)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      nome, endereco, cidade,
      estado || 'RS',
      capacidade_total || 0,
      contato || null,
      responsavel || null,
      observacoes || null,
      req.usuario.id
    );

    const novo = db.prepare('SELECT * FROM abrigos WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(novo);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/abrigos/:id
 * Atualiza dados de um abrigo.
 */
function atualizar(req, res, next) {
  try {
    const abrigo = db.prepare('SELECT id FROM abrigos WHERE id = ?').get(req.params.id);
    if (!abrigo) {
      return res.status(404).json({ erro: 'Abrigo não encontrado.' });
    }

    const { nome, endereco, cidade, estado, capacidade_total, status, contato, responsavel, observacoes } = req.body;

    db.prepare(`
      UPDATE abrigos SET
        nome = COALESCE(?, nome),
        endereco = COALESCE(?, endereco),
        cidade = COALESCE(?, cidade),
        estado = COALESCE(?, estado),
        capacidade_total = COALESCE(?, capacidade_total),
        status = COALESCE(?, status),
        contato = COALESCE(?, contato),
        responsavel = COALESCE(?, responsavel),
        observacoes = COALESCE(?, observacoes),
        atualizado_em = datetime('now','localtime')
      WHERE id = ?
    `).run(nome, endereco, cidade, estado, capacidade_total, status, contato, responsavel, observacoes, req.params.id);

    const atualizado = db.prepare('SELECT * FROM abrigos WHERE id = ?').get(req.params.id);
    return res.json(atualizado);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/abrigos/:id/ocupacao
 * Atualiza a ocupação atual de um abrigo e recalcula o status.
 */
function atualizarOcupacao(req, res, next) {
  try {
    const abrigo = db.prepare('SELECT * FROM abrigos WHERE id = ?').get(req.params.id);
    if (!abrigo) {
      return res.status(404).json({ erro: 'Abrigo não encontrado.' });
    }

    const { ocupacao_atual } = req.body;

    if (ocupacao_atual === undefined || ocupacao_atual < 0) {
      return res.status(400).json({ erro: 'ocupacao_atual deve ser um número >= 0.' });
    }

    // Determina status automaticamente baseado na ocupação
    let novoStatus = 'ativo';
    if (ocupacao_atual >= abrigo.capacidade_total) {
      novoStatus = 'lotado';
    }

    db.prepare(`
      UPDATE abrigos SET ocupacao_atual = ?, status = ?, atualizado_em = datetime('now','localtime')
      WHERE id = ?
    `).run(ocupacao_atual, novoStatus, req.params.id);

    const atualizado = db.prepare('SELECT * FROM abrigos WHERE id = ?').get(req.params.id);
    return res.json({
      ...atualizado,
      vagas_disponiveis: Math.max(0, atualizado.capacidade_total - atualizado.ocupacao_atual)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/abrigos/:id
 * Remove um abrigo (somente gestores).
 */
function remover(req, res, next) {
  try {
    const abrigo = db.prepare('SELECT id FROM abrigos WHERE id = ?').get(req.params.id);
    if (!abrigo) {
      return res.status(404).json({ erro: 'Abrigo não encontrado.' });
    }

    db.prepare('DELETE FROM abrigos WHERE id = ?').run(req.params.id);
    return res.json({ mensagem: 'Abrigo removido com sucesso.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, atualizarOcupacao, remover };
