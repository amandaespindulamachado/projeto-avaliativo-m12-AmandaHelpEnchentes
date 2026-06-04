# Prompt 01 — Especificação e Arquitetura

**Etapa:** Planejamento Arquitetural  
**Padrão de Prompting:** Chain of Thought (CoT)  
**Ferramenta:** Kiro AI

---

## Prompt Utilizado

```
Contexto: Preciso desenvolver um sistema web para apoio a vítimas de enchentes no Brasil.
O sistema deve cobrir 4 módulos: abrigos, doações, voluntários e desaparecidos.

Stack obrigatória:
- Backend: Node.js, Express, SQLite (better-sqlite3), JWT
- Frontend: React 19, Vite, Tailwind CSS, Axios

Raciocine passo a passo sobre:
1. Qual deve ser a estrutura de tabelas do banco de dados para cobrir os 4 módulos?
2. Quais rotas de API são necessárias para cada módulo?
3. Qual deve ser a estratégia de autenticação — quem precisa de login e quem não precisa?
4. Como organizar as pastas do projeto para deixar a arquitetura clara?

Ao raciocinar, considere:
- Pessoas em situação de emergência precisam consultar sem login
- Apenas gestores e voluntários autenticados devem poder inserir/editar dados
- O sistema deve funcionar mesmo com conexão limitada
```

---

## Resposta da IA (Resumida)

A IA propôs:

**Banco de Dados:**
- `usuarios` — gestores e voluntários com perfil e senha hash
- `abrigos` — com capacidade, ocupação e status calculado automaticamente
- `doacoes` — ligadas a abrigos, com urgência e status calculado por quantidade recebida
- `voluntarios` — com disponibilidade e possibilidade de alocação em abrigo
- `desaparecidos` — com status: desaparecido | encontrado | em_abrigo

**Estratégia de Auth:**
- GET (consulta): público, sem token
- POST/PUT/PATCH/DELETE: requer JWT com perfil gestor ou voluntario
- Registrar desaparecido e cadastrar voluntário: público (emergência)

**Estrutura de pastas proposta:**
```
backend/src/
  controllers/  — lógica de negócio
  routes/       — definição de endpoints
  middlewares/  — auth e errorHandler
  database/     — db, migrations, seed
```

---

## Avaliação Crítica

✅ A proposta de deixar GET público foi acertada — em emergências, vítimas não podem ser barradas por falta de login.

⚠️ **Problema identificado:** A IA inicialmente sugeriu que o registro de voluntários exigisse autenticação. Isso foi corrigido porque um voluntário novo precisaria se cadastrar antes de ter login, criando um paradoxo.

**Correção aplicada:** `POST /api/voluntarios` e `POST /api/desaparecidos` foram liberados como públicos.

---

## Decisão Final Documentada

- Arquitetura REST com separação clara de controllers e routes
- SQLite com `better-sqlite3` (síncrono) para simplicidade no projeto
- JWT com expiração de 8h, sem refresh token (escopo do projeto)
- Status de abrigo calculado automaticamente ao atualizar ocupação
- Status de doação calculado automaticamente ao registrar recebimento
