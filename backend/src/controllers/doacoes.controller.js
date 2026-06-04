const db = require('../database/db');

/**
 * GET /api/doacoes
 * Lista necessidades de doação com filtros opcionais.
 * Query params: abrigo_id, categoria, urgencia, status
 */
function listar(req, res, next) {
  try {
    const { abrigo_id, categoria, urgencia, status } = req.query;
    let query = `
      SELECT d.*, a.nome as abrigo_nome, a.cidade as abrigo_cidade
      FROM doacoes d
      LEFT JOIN abrigos a ON d.abrigo_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (abrigo_id) { query += ' AND d.abrigo_id = ?'; params.push(abrigo_id); }
    if (categoria) { query += ' AND d.categoria = ?'; params.push(categoria); }
    if (urgencia) { query += ' AND d.urgencia = ?'; params.push(urgencia); }
    if (status) { query += ' AND d.status = ?'; params.push(status); }

    // Ordena por urgência (critica > alta > media > baixa)
    query += ` ORDER BY CASE d.urgencia
      WHEN 'critica' THEN 1
      WHEN 'alta' THEN 2
      WHEN 'media' THEN 3
      WHEN 'baixa' THEN 4
    END, d.criado_em DESC`;

    const doacoes = db.prepare(query).all(...params);
    return res.json(doacoes);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/doacoes/:id
 * Retorna uma necessidade de doação pelo ID.
 */
function buscarPorId(req, res, next) {
  try {
    const doacao = db.prepare(`
      SELECT d.*, a.nome as abrigo_nome, a.cidade as abrigo_cidade, a.contato as abrigo_contato
      FROM doacoes d
      LEFT JOIN abrigos a ON d.abrigo_id = a.id
      WHERE d.id = ?
    `).get(req.params.id);

    if (!doacao) {
      return res.status(404).json({ erro: 'Necessidade de doação não encontrada.' });
    }

    return res.json(doacao);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/doacoes
 * Registra nova necessidade de doação para um abrigo.
 */
function criar(req, res, next) {
  try {
    const { abrigo_id, categoria, descricao, quantidade_necessaria, urgencia } = req.body;

    if (!abrigo_id || !categoria || !descricao) {
      return res.status(400).json({ erro: 'Campos obrigatórios: abrigo_id, categoria, descricao.' });
    }

    const categorias = ['alimentos', 'roupas', 'higiene', 'medicamentos', 'utensilios', 'outros'];
    if (!categorias.includes(categoria)) {
      return res.status(400).json({ erro: `Categoria inválida. Use: ${categorias.join(', ')}.` });
    }

    const abrigo = db.prepare('SELECT id FROM abrigos WHERE id = ?').get(abrigo_id);
    if (!abrigo) {
      return res.status(404).json({ erro: 'Abrigo não encontrado.' });
    }

    const result = db.prepare(`
      INSERT INTO doacoes (abrigo_id, categoria, descricao, quantidade_necessaria, urgencia, criado_por)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      abrigo_id, categoria, descricao,
      quantidade_necessaria || 1,
      urgencia || 'media',
      req.usuario.id
    );

    const nova = db.prepare('SELECT * FROM doacoes WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json(nova);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/doacoes/:id
 * Atualiza dados de uma necessidade de doação.
 */
function atualizar(req, res, next) {
  try {
    const doacao = db.prepare('SELECT id FROM doacoes WHERE id = ?').get(req.params.id);
    if (!doacao) {
      return res.status(404).json({ erro: 'Necessidade de doação não encontrada.' });
    }

    const { descricao, quantidade_necessaria, urgencia, status } = req.body;

    db.prepare(`
      UPDATE doacoes SET
        descricao = COALESCE(?, descricao),
        quantidade_necessaria = COALESCE(?, quantidade_necessaria),
        urgencia = COALESCE(?, urgencia),
        status = COALESCE(?, status),
        atualizado_em = datetime('now','localtime')
      WHERE id = ?
    `).run(descricao, quantidade_necessaria, urgencia, status, req.params.id);

    const atualizada = db.prepare('SELECT * FROM doacoes WHERE id = ?').get(req.params.id);
    return res.json(atualizada);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/doacoes/:id/receber
 * Registra recebimento de doações e atualiza status automaticamente.
 */
function registrarRecebimento(req, res, next) {
  try {
    const doacao = db.prepare('SELECT * FROM doacoes WHERE id = ?').get(req.params.id);
    if (!doacao) {
      return res.status(404).json({ erro: 'Necessidade de doação não encontrada.' });
    }

    const { quantidade } = req.body;

    if (!quantidade || quantidade <= 0) {
      return res.status(400).json({ erro: 'quantidade deve ser um número maior que 0.' });
    }

    const novaQuantidade = doacao.quantidade_recebida + quantidade;

    // Status calculado automaticamente
    let novoStatus = 'pendente';
    if (novaQuantidade >= doacao.quantidade_necessaria) {
      novoStatus = 'atendido';
    } else if (novaQuantidade > 0) {
      novoStatus = 'parcial';
    }

    db.prepare(`
      UPDATE doacoes SET
        quantidade_recebida = ?,
        status = ?,
        atualizado_em = datetime('now','localtime')
      WHERE id = ?
    `).run(novaQuantidade, novoStatus, req.params.id);

    const atualizada = db.prepare('SELECT * FROM doacoes WHERE id = ?').get(req.params.id);
    return res.json(atualizada);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/doacoes/:id
 * Remove uma necessidade de doação.
 */
function remover(req, res, next) {
  try {
    const doacao = db.prepare('SELECT id FROM doacoes WHERE id = ?').get(req.params.id);
    if (!doacao) {
      return res.status(404).json({ erro: 'Necessidade de doação não encontrada.' });
    }

    db.prepare('DELETE FROM doacoes WHERE id = ?').run(req.params.id);
    return res.json({ mensagem: 'Necessidade de doação removida com sucesso.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, registrarRecebimento, remover };
