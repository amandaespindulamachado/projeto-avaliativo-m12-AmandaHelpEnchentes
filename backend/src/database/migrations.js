const db = require('./db');

/**
 * Executa as migrations para criar todas as tabelas do banco de dados.
 * Gerado e refinado com suporte de IA (Chain of Thought prompting).
 */
function runMigrations() {
  db.exec(`
    -- Tabela de usuários (gestores e voluntários autenticados)
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      perfil TEXT NOT NULL CHECK(perfil IN ('gestor', 'voluntario')),
      ativo INTEGER NOT NULL DEFAULT 1,
      criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      atualizado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    -- Tabela de abrigos
    CREATE TABLE IF NOT EXISTS abrigos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      endereco TEXT NOT NULL,
      cidade TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'RS',
      capacidade_total INTEGER NOT NULL DEFAULT 0,
      ocupacao_atual INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'ativo' CHECK(status IN ('ativo', 'lotado', 'inativo')),
      contato TEXT,
      responsavel TEXT,
      observacoes TEXT,
      criado_por INTEGER REFERENCES usuarios(id),
      criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      atualizado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    -- Tabela de itens de doação necessários por abrigo
    CREATE TABLE IF NOT EXISTS doacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      abrigo_id INTEGER REFERENCES abrigos(id) ON DELETE CASCADE,
      categoria TEXT NOT NULL CHECK(categoria IN ('alimentos', 'roupas', 'higiene', 'medicamentos', 'utensilios', 'outros')),
      descricao TEXT NOT NULL,
      quantidade_necessaria INTEGER NOT NULL DEFAULT 1,
      quantidade_recebida INTEGER NOT NULL DEFAULT 0,
      urgencia TEXT NOT NULL DEFAULT 'media' CHECK(urgencia IN ('baixa', 'media', 'alta', 'critica')),
      status TEXT NOT NULL DEFAULT 'pendente' CHECK(status IN ('pendente', 'parcial', 'atendido')),
      criado_por INTEGER REFERENCES usuarios(id),
      criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      atualizado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    -- Tabela de voluntários
    CREATE TABLE IF NOT EXISTS voluntarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT,
      telefone TEXT,
      habilidades TEXT,
      disponibilidade TEXT NOT NULL DEFAULT 'integral' CHECK(disponibilidade IN ('manha', 'tarde', 'noite', 'integral', 'fins_de_semana')),
      cidade TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'RS',
      status TEXT NOT NULL DEFAULT 'disponivel' CHECK(status IN ('disponivel', 'alocado', 'inativo')),
      alocado_em INTEGER REFERENCES abrigos(id),
      criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      atualizado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    -- Tabela de pessoas desaparecidas
    CREATE TABLE IF NOT EXISTS desaparecidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      idade INTEGER,
      descricao TEXT,
      foto_url TEXT,
      ultimo_local_visto TEXT NOT NULL,
      cidade TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'RS',
      data_desaparecimento TEXT NOT NULL,
      contato_familiar TEXT NOT NULL,
      nome_familiar TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'desaparecido' CHECK(status IN ('desaparecido', 'encontrado', 'em_abrigo')),
      informacoes_encontrado TEXT,
      criado_por INTEGER REFERENCES usuarios(id),
      criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      atualizado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );
  `);

  console.log('[DB] Migrations executadas com sucesso.');
}

module.exports = { runMigrations };
