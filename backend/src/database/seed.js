const db = require('./db');
const bcrypt = require('bcryptjs');

/**
 * Popula o banco com dados de exemplo para demonstração.
 */
function runSeed() {
  const usuariosExistentes = db.prepare('SELECT COUNT(*) as total FROM usuarios').get();
  if (usuariosExistentes.total > 0) {
    console.log('[Seed] Banco já possui dados. Seed ignorado.');
    return;
  }

  // Usuários de exemplo
  const senhaHash = bcrypt.hashSync('senha123', 10);
  const insertUsuario = db.prepare(`
    INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)
  `);

  const gestor = insertUsuario.run('Admin Gestor', 'gestor@helpenchentes.com', senhaHash, 'gestor');
  const voluntario = insertUsuario.run('Voluntário João', 'joao@helpenchentes.com', senhaHash, 'voluntario');

  // Abrigos de exemplo
  const insertAbrigo = db.prepare(`
    INSERT INTO abrigos (nome, endereco, cidade, estado, capacidade_total, ocupacao_atual, status, contato, responsavel, criado_por)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const abrigo1 = insertAbrigo.run(
    'Ginásio Municipal Centro', 'Rua das Flores, 100', 'Porto Alegre', 'RS',
    200, 120, 'ativo', '(51) 99999-0001', 'Maria Silva', gestor.lastInsertRowid
  );
  const abrigo2 = insertAbrigo.run(
    'Escola Estadual Farrapos', 'Av. Farrapos, 500', 'Porto Alegre', 'RS',
    150, 150, 'lotado', '(51) 99999-0002', 'Carlos Souza', gestor.lastInsertRowid
  );
  const abrigo3 = insertAbrigo.run(
    'Igreja São Pedro', 'Rua da Igreja, 45', 'Canoas', 'RS',
    80, 30, 'ativo', '(51) 99999-0003', 'Padre Antonio', gestor.lastInsertRowid
  );

  // Doações necessárias
  const insertDoacao = db.prepare(`
    INSERT INTO doacoes (abrigo_id, categoria, descricao, quantidade_necessaria, quantidade_recebida, urgencia, status, criado_por)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDoacao.run(abrigo1.lastInsertRowid, 'alimentos', 'Caixas de leite integral 1L', 100, 40, 'alta', 'parcial', gestor.lastInsertRowid);
  insertDoacao.run(abrigo1.lastInsertRowid, 'higiene', 'Kits de higiene pessoal', 50, 10, 'critica', 'parcial', gestor.lastInsertRowid);
  insertDoacao.run(abrigo2.lastInsertRowid, 'roupas', 'Cobertores e agasalhos adulto', 80, 80, 'media', 'atendido', gestor.lastInsertRowid);
  insertDoacao.run(abrigo3.lastInsertRowid, 'alimentos', 'Cestas básicas', 30, 5, 'critica', 'parcial', gestor.lastInsertRowid);
  insertDoacao.run(abrigo3.lastInsertRowid, 'medicamentos', 'Analgésicos e antitérmicos', 20, 0, 'alta', 'pendente', gestor.lastInsertRowid);

  // Voluntários de exemplo
  const insertVoluntario = db.prepare(`
    INSERT INTO voluntarios (nome, email, telefone, habilidades, disponibilidade, cidade, estado, status, alocado_em)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVoluntario.run('Ana Paula', 'ana@email.com', '(51) 98888-0001', 'Enfermagem, Primeiros Socorros', 'integral', 'Porto Alegre', 'RS', 'alocado', abrigo1.lastInsertRowid);
  insertVoluntario.run('Roberto Lima', 'roberto@email.com', '(51) 98888-0002', 'Logística, Motorista', 'manha', 'Canoas', 'RS', 'disponivel', null);
  insertVoluntario.run('Fernanda Costa', 'fernanda@email.com', '(51) 98888-0003', 'Psicologia, Atendimento', 'tarde', 'Porto Alegre', 'RS', 'alocado', abrigo3.lastInsertRowid);

  // Desaparecidos de exemplo
  const insertDesaparecido = db.prepare(`
    INSERT INTO desaparecidos (nome, idade, descricao, ultimo_local_visto, cidade, estado, data_desaparecimento, contato_familiar, nome_familiar, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDesaparecido.run('José Oliveira', 67, 'Homem idoso, cabelos brancos, camisa azul', 'Bairro Navegantes, próximo ao rio', 'Porto Alegre', 'RS', '2024-05-15', '(51) 97777-0001', 'Filha: Lucia Oliveira', 'desaparecido');
  insertDesaparecido.run('Criança Maria', 8, 'Menina, cabelos cacheados, vestido amarelo', 'Escola Municipal do bairro', 'Canoas', 'RS', '2024-05-15', '(51) 97777-0002', 'Mãe: Sandra Santos', 'encontrado');
  insertDesaparecido.run('Pedro Alves', 45, 'Homem moreno, barba, altura média', 'Rua do Porto, bairro Industrial', 'Porto Alegre', 'RS', '2024-05-16', '(51) 97777-0003', 'Esposa: Carmen Alves', 'em_abrigo');

  console.log('[Seed] Dados de exemplo inseridos com sucesso.');
  console.log('[Seed] Login gestor: gestor@helpenchentes.com / senha123');
  console.log('[Seed] Login voluntário: joao@helpenchentes.com / senha123');
}

module.exports = { runSeed };
