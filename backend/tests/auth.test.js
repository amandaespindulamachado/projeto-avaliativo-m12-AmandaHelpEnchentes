/**
 * Testes unitários e de integração para autenticação.
 * Gerados com suporte de IA (Few-shot prompting).
 */
const request = require('supertest');
const app = require('../src/app');
const db = require('../src/database/db');
const { runMigrations } = require('../src/database/migrations');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'test_secret_key';
process.env.DB_PATH = ':memory:';

// Email único para esta suíte evitar conflito com outras suítes rodando no mesmo processo
const EMAIL_ADMIN = 'admin_auth@test.com';

beforeAll(() => {
  runMigrations();
  const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(EMAIL_ADMIN);
  if (!existe) {
    const senha = bcrypt.hashSync('senha123', 10);
    db.prepare('INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)').run('Admin Teste', EMAIL_ADMIN, senha, 'gestor');
  }
});

afterAll(() => {
  try { db.close(); } catch { /* já fechado por outra suíte */ }
});

describe('POST /api/auth/registro', () => {
  test('deve registrar novo usuário com dados válidos', async () => {
    const emailUnico = `novo_${Date.now()}@test.com`;
    const res = await request(app).post('/api/auth/registro').send({
      nome: 'Novo Usuário',
      email: emailUnico,
      senha: 'senha123',
      perfil: 'voluntario'
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.mensagem).toContain('sucesso');
  });

  test('deve rejeitar registro com email duplicado', async () => {
    const res = await request(app).post('/api/auth/registro').send({
      nome: 'Duplicado',
      email: EMAIL_ADMIN,
      senha: 'senha123',
      perfil: 'gestor'
    });
    expect(res.status).toBe(409);
  });

  test('deve rejeitar registro com campos obrigatórios faltando', async () => {
    const res = await request(app).post('/api/auth/registro').send({
      nome: 'Sem Email',
      senha: 'senha123',
      perfil: 'voluntario'
    });
    expect(res.status).toBe(400);
  });

  test('deve rejeitar registro com perfil inválido', async () => {
    const res = await request(app).post('/api/auth/registro').send({
      nome: 'Perfil Inválido',
      email: 'invalido_auth@test.com',
      senha: 'senha123',
      perfil: 'admin'
    });
    expect(res.status).toBe(400);
  });

  test('deve rejeitar senha com menos de 6 caracteres', async () => {
    const res = await request(app).post('/api/auth/registro').send({
      nome: 'Senha Curta',
      email: 'curta_auth@test.com',
      senha: '123',
      perfil: 'voluntario'
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  test('deve autenticar usuário com credenciais válidas', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: EMAIL_ADMIN,
      senha: 'senha123'
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario.email).toBe(EMAIL_ADMIN);
    expect(res.body.usuario.perfil).toBe('gestor');
  });

  test('deve rejeitar login com senha incorreta', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: EMAIL_ADMIN,
      senha: 'senhaerrada'
    });
    expect(res.status).toBe(401);
  });

  test('deve rejeitar login com email inexistente', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'naoexiste@test.com',
      senha: 'senha123'
    });
    expect(res.status).toBe(401);
  });

  test('deve rejeitar login sem email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      senha: 'senha123'
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: EMAIL_ADMIN,
      senha: 'senha123'
    });
    token = res.body.token;
  });

  test('deve retornar dados do usuário autenticado', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(EMAIL_ADMIN);
  });

  test('deve rejeitar requisição sem token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('deve rejeitar requisição com token inválido', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer tokeninvalido');
    expect(res.status).toBe(401);
  });
});
