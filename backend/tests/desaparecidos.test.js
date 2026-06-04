/**
 * Testes de API para o módulo de Desaparecidos.
 * Gerados com suporte de IA (Few-shot prompting).
 */
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/db');
const { runMigrations } = require('../src/database/migrations');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'test_secret_key';
process.env.DB_PATH = ':memory:';

// Email único para esta suíte evitar conflito com outras suítes
const EMAIL_GESTOR = 'gestor_desaparecidos@test.com';

let tokenGestor;
let desaparecidoId;

beforeAll(async () => {
  runMigrations();
  const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(EMAIL_GESTOR);
  if (!existe) {
    const senha = bcrypt.hashSync('senha123', 10);
    db.prepare('INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)').run('Gestor Desaparecidos', EMAIL_GESTOR, senha, 'gestor');
  }

  const res = await request(app).post('/api/auth/login').send({ email: EMAIL_GESTOR, senha: 'senha123' });
  tokenGestor = res.body.token;
});

afterAll(() => {
  try { db.close(); } catch { /* já fechado por outra suíte */ }
});

describe('POST /api/desaparecidos', () => {
  test('deve registrar pessoa desaparecida sem autenticação', async () => {
    const res = await request(app).post('/api/desaparecidos').send({
      nome: 'João da Silva',
      idade: 65,
      descricao: 'Homem idoso, cabelos brancos',
      ultimo_local_visto: 'Bairro Navegantes',
      cidade: 'Porto Alegre',
      data_desaparecimento: '2024-05-15',
      contato_familiar: '(51) 99999-1111',
      nome_familiar: 'Maria Silva'
    });
    expect(res.status).toBe(201);
    expect(res.body.nome).toBe('João da Silva');
    expect(res.body.status).toBe('desaparecido');
    desaparecidoId = res.body.id;
  });

  test('deve rejeitar registro sem campos obrigatórios', async () => {
    const res = await request(app).post('/api/desaparecidos').send({
      nome: 'Incompleto'
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/desaparecidos', () => {
  test('deve listar todos os desaparecidos sem autenticação', async () => {
    const res = await request(app).get('/api/desaparecidos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('deve filtrar por status desaparecido', async () => {
    const res = await request(app).get('/api/desaparecidos?status=desaparecido');
    expect(res.status).toBe(200);
    res.body.forEach(d => expect(d.status).toBe('desaparecido'));
  });

  test('deve buscar por nome', async () => {
    const res = await request(app).get('/api/desaparecidos?nome=João');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('PATCH /api/desaparecidos/:id/status', () => {
  test('deve atualizar status para encontrado', async () => {
    const res = await request(app)
      .patch(`/api/desaparecidos/${desaparecidoId}/status`)
      .set('Authorization', `Bearer ${tokenGestor}`)
      .send({
        status: 'encontrado',
        informacoes_encontrado: 'Encontrado no abrigo do bairro Centro'
      });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('encontrado');
    expect(res.body.informacoes_encontrado).toContain('Centro');
  });

  test('deve rejeitar status inválido', async () => {
    const res = await request(app)
      .patch(`/api/desaparecidos/${desaparecidoId}/status`)
      .set('Authorization', `Bearer ${tokenGestor}`)
      .send({ status: 'status_invalido' });
    expect(res.status).toBe(400);
  });

  test('deve rejeitar atualização sem autenticação', async () => {
    const res = await request(app)
      .patch(`/api/desaparecidos/${desaparecidoId}/status`)
      .send({ status: 'encontrado' });
    expect(res.status).toBe(401);
  });
});
