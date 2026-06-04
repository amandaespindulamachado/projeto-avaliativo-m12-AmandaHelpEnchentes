# Prompt 04 — Geração de Testes Automatizados

**Etapa:** Testes automatizados  
**Padrão de Prompting:** Few-shot Prompting + Role-based  
**Ferramenta:** Kiro AI

---

## Prompt Utilizado

```
Você é um engenheiro de QA especializado em testes de API Node.js com Jest e Supertest.

Gere uma suíte de testes de integração para o módulo de Autenticação da API HelpEnchentes.

Aqui está o contrato da API que deve ser testado:
- POST /api/auth/registro → cria usuário (campos: nome, email, senha, perfil)
- POST /api/auth/login → retorna { token, usuario } ou 401
- GET /api/auth/me → retorna dados do usuário autenticado (requer Bearer token)

Exemplos de padrão de teste que quero seguir:
---
test('deve retornar 401 com credenciais inválidas', async () => {
  const res = await request(app).post('/api/auth/login').send({
    email: 'naoexiste@test.com', senha: 'errada'
  });
  expect(res.status).toBe(401);
});
---

Cubra estes cenários:
1. Registro com dados válidos → 201
2. Registro com email duplicado → 409
3. Registro sem campos obrigatórios → 400
4. Registro com perfil inválido → 400
5. Registro com senha curta (< 6 chars) → 400
6. Login com credenciais corretas → 200 + token
7. Login com senha errada → 401
8. Login com email inexistente → 401
9. Login sem email → 400
10. GET /me com token válido → 200
11. GET /me sem token → 401
12. GET /me com token inválido → 401

Use banco SQLite em memória para não contaminar dados reais.
```

---

## Ciclo 3 — Ajuste após Validação

Após executar os testes, o teste #5 (senha curta) estava falhando pois a rota não tinha validação de tamanho mínimo. 

**Problema identificado:** A IA gerou o teste correto, mas o código da rota não tinha a validação. Isso revelou uma lacuna na implementação.

**Ação tomada:** O controller foi atualizado para incluir:
```javascript
if (senha.length < 6) {
  return res.status(400).json({ erro: 'A senha deve ter no mínimo 6 caracteres.' });
}
```

**Conclusão:** Os testes gerados com IA revelaram uma falha no código — uso correto de TDD implícito.

---

## Resultado dos Testes

Todos os 12 cenários passando após correção:

```
PASS tests/auth.test.js
  POST /api/auth/registro
    ✓ deve registrar novo usuário com dados válidos
    ✓ deve rejeitar registro com email duplicado
    ✓ deve rejeitar registro com campos obrigatórios faltando
    ✓ deve rejeitar registro com perfil inválido
    ✓ deve rejeitar senha com menos de 6 caracteres
  POST /api/auth/login
    ✓ deve autenticar usuário com credenciais válidas
    ✓ deve rejeitar login com senha incorreta
    ✓ deve rejeitar login com email inexistente
    ✓ deve rejeitar login sem email
  GET /api/auth/me
    ✓ deve retornar dados do usuário autenticado
    ✓ deve rejeitar requisição sem token
    ✓ deve rejeitar requisição com token inválido
```
