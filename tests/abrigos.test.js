/**
 * Testes de API para o módulo de Abrigos.
 * Gerados com suporte de IA (Chain of Thought prompting).
 */
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/db');
const { runMigrations } = require('../src/database/migrations');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'test_secret_key';
process.env.DB_PATH = ':memory:';

let tokenGestor;
let abrigoId;

beforeAll(async () => {
  runMigrations();
  const senha = bcrypt.hashSync('senha123', 10);
  db.prepare('INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)').run('Gestor', 'gestor@test.com', senha, 'gestor');

  const res = await request(app).post('/api/auth/login').send({ email: 'gestor@test.com', senha: 'senha123' });
  tokenGestor = res.body.token;
});

afterAll(() => {
  db.close();
});

describe('POST /api/abrigos', () => {
  test('deve criar novo abrigo com dados válidos', async () => {
    const res = await request(app)
      .post('/api/abrigos')
      .set('Authorization', `Bearer ${tokenGestor}`)
      .send({
        nome: 'Ginásio Municipal',
        endereco: 'Rua Teste, 100',
        cidade: 'Porto Alegre',
        estado: 'RS',
        capacidade_total: 150,
        contato: '(51) 99999-0001'
      });
    expect(res.status).toBe(201);
    expect(res.body.nome).toBe('Ginásio Municipal');
    expect(res.body.status).toBe('ativo');
    abrigoId = res.body.id;
  });

  test('deve rejeitar criação sem campos obrigatórios', async () => {
    const res = await request(app)
      .post('/api/abrigos')
      .set('Authorization', `Bearer ${tokenGestor}`)
      .send({ nome: 'Sem endereço' });
    expect(res.status).toBe(400);
  });

  test('deve rejeitar criação sem autenticação', async () => {
    const res = await request(app).post('/api/abrigos').send({
      nome: 'Teste', endereco: 'Rua', cidade: 'POA'
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/abrigos', () => {
  test('deve listar todos os abrigos sem autenticação', async () => {
    const res = await request(app).get('/api/abrigos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('deve filtrar abrigos por cidade', async () => {
    const res = await request(app).get('/api/abrigos?cidade=Porto Alegre');
    expect(res.status).toBe(200);
    res.body.forEach(a => expect(a.cidade).toContain('Porto'));
  });

  test('deve retornar abrigo específico com doações', async () => {
    const res = await request(app).get(`/api/abrigos/${abrigoId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(abrigoId);
    expect(res.body).toHaveProperty('doacoes');
    expect(res.body).toHaveProperty('vagas_disponiveis');
  });

  test('deve retornar 404 para abrigo inexistente', async () => {
    const res = await request(app).get('/api/abrigos/99999');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/abrigos/:id/ocupacao', () => {
  test('deve atualizar ocupação e recalcular status para lotado', async () => {
    const res = await request(app)
      .patch(`/api/abrigos/${abrigoId}/ocupacao`)
      .set('Authorization', `Bearer ${tokenGestor}`)
      .send({ ocupacao_atual: 150 });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('lotado');
    expect(res.body.vagas_disponiveis).toBe(0);
  });

  test('deve atualizar status para ativo quando há vagas', async () => {
    const res = await request(app)
      .patch(`/api/abrigos/${abrigoId}/ocupacao`)
      .set('Authorization', `Bearer ${tokenGestor}`)
      .send({ ocupacao_atual: 80 });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ativo');
    expect(res.body.vagas_disponiveis).toBe(70);
  });
});

describe('DELETE /api/abrigos/:id', () => {
  test('deve remover abrigo com permissão de gestor', async () => {
    const criarRes = await request(app)
      .post('/api/abrigos')
      .set('Authorization', `Bearer ${tokenGestor}`)
      .send({ nome: 'Para Deletar', endereco: 'Rua', cidade: 'POA' });

    const res = await request(app)
      .delete(`/api/abrigos/${criarRes.body.id}`)
      .set('Authorization', `Bearer ${tokenGestor}`);
    expect(res.status).toBe(200);
  });
});
