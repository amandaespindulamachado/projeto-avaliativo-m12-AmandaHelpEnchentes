# 🌊 HelpEnchentes

Sistema web de apoio a vítimas de enchentes — conectando quem precisa de ajuda com quem pode ajudar.

Vídeo — Drive: https://drive.google.com/file/d/13w80V0Ia1iRfUrli6Zr3VZkv89hS59ow/view?usp=sharing
Repo: https://github.com/amandaespindulamachado/projeto-avaliativo-m12-AmandaHelpEnchentes
Kanban: https://github.com/users/amandaespindulamachado/projects/2/views/1

---

## 📋 Descrição

O HelpEnchentes é uma plataforma web que centraliza informações críticas durante enchentes, resolvendo o problema da **informação dispersa em redes sociais e aplicativos de mensagem**. O sistema permite:

- 🏠 **Abrigos** — localizar abrigos com vagas disponíveis em tempo real
- 📦 **Doações** — ver o que cada abrigo precisa com mais urgência
- 🤝 **Voluntários** — cadastrar-se como voluntário e ser alocado onde é mais necessário
- 🔍 **Desaparecidos** — registrar e buscar pessoas desaparecidas durante a enchente

---

## 🤖 Uso de IA no Desenvolvimento

| Etapa | Ferramenta | Padrão de Prompting |
|-------|-----------|---------------------|
| Especificação e arquitetura | Kiro AI | Chain of Thought (CoT) |
| Geração do código backend | Kiro AI | Role-based Prompting |
| Refatoração (Clean Code / SOLID) | Kiro AI | Few-shot Prompting |
| Geração dos testes automatizados | Kiro AI | Few-shot + Role-based |
| Configuração do pipeline CI/CD | Kiro AI | Chain of Thought (CoT) |
| Documentação técnica | Kiro AI | Role-based Prompting |

Todos os prompts utilizados estão salvos em [`docs/prompts/`](./docs/prompts/).

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────┐
│           Frontend (React 19)        │
│  Vite + Tailwind CSS + Axios        │
│  Porta: 5173                        │
└──────────────┬──────────────────────┘
               │ HTTP (proxy → /api)
┌──────────────▼──────────────────────┐
│           Backend (Node.js)          │
│  Express + JWT + better-sqlite3     │
│  Porta: 3001                        │
│                                     │
│  Rotas:                             │
│  /api/auth        → Autenticação    │
│  /api/abrigos     → Módulo Abrigos  │
│  /api/doacoes     → Módulo Doações  │
│  /api/voluntarios → Voluntários     │
│  /api/desaparecidos → Desaparecidos │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         SQLite (better-sqlite3)      │
│  database.sqlite (arquivo local)    │
│  Tabelas: usuarios, abrigos,        │
│  doacoes, voluntarios, desaparecidos│
└─────────────────────────────────────┘
```

**Decisões técnicas documentadas:**
- **SQLite** escolhido por simplicidade de deploy e zero configuração de servidor
- **JWT sem refresh token** — escopo do projeto educacional, sessão de 8h
- **Rotas GET públicas** — vítimas em emergência não podem ser barradas por falta de login
- **Status calculado automaticamente** — abrigo vira "lotado" quando ocupação ≥ capacidade; doação vira "atendido" quando quantidade_recebida ≥ quantidade_necessaria

---

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm 9+

### 1. Clone o repositório

```bash
git clone https://github.com/amandaespindulamachado/projeto-avaliativo-m12-AmandaHelpEnchentes.git
cd projeto-avaliativo-m12-AmandaHelpEnchentes
```

### 2. Configure e inicie o Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite o .env e defina um JWT_SECRET seguro
npm run dev
```

A API estará disponível em: `http://localhost:3001`  
Health check: `http://localhost:3001/api/health`

### 3. Configure e inicie o Frontend

```bash
cd frontend
npm install
npm run dev
```

A interface estará disponível em: `http://localhost:5173`

### 4. Credenciais de demonstração

O sistema popula dados de exemplo automaticamente na primeira execução:

| Perfil | Email | Senha |
|--------|-------|-------|
| Gestor | gestor@helpenchentes.com | senha123 |
| Voluntário | joao@helpenchentes.com | senha123 |

---

## 🎯 Cenários de Uso

### Cenário 1 — Vítima buscando abrigo (sem login)

1. Acesse `http://localhost:5173`
2. Clique em **Abrigos**
3. Filtre por cidade (ex: "Porto Alegre")
4. Veja vagas disponíveis em tempo real
5. Clique no abrigo para ver detalhes e necessidades de doação

**Entrada:** cidade="Porto Alegre"  
**Saída esperada:** Lista de abrigos com vagas disponíveis, status (ativo/lotado), contato e endereço

---

### Cenário 2 — Gestor atualizando ocupação de abrigo

1. Faça login como gestor
2. Acesse **Abrigos** → clique no abrigo
3. No campo "Atualizar ocupação atual", insira o novo número
4. O status é recalculado automaticamente (lotado quando cheio)

**Entrada:** `PATCH /api/abrigos/1/ocupacao` com `{ "ocupacao_atual": 200 }`  
**Saída esperada:** `{ "status": "lotado", "vagas_disponiveis": 0 }`

---

### Cenário 3 — Familiar registrando pessoa desaparecida (sem login)

1. Acesse **Desaparecidos** → clique em "+ Registrar Desaparecido"
2. Preencha nome, descrição, último local visto e seu contato
3. O registro aparece imediatamente na listagem pública

---

### Cenário 4 — Voluntário se cadastrando

1. Acesse **Voluntários** → "+ Quero Voluntariar"
2. Preencha habilidades e disponibilidade
3. Um gestor pode alocar o voluntário a um abrigo

---

## 🧪 Testes

```bash
cd backend
npm test
# ou com cobertura:
npm run test:coverage
```

Suíte de testes cobre:
- Autenticação (registro, login, token inválido)
- CRUD de Abrigos com regras de negócio
- Registro e atualização de status de Desaparecidos
- Validações de entrada e autorização

---

## 🔁 Pipeline CI/CD

O pipeline GitHub Actions roda automaticamente em push/PR para `main` e `develop`:

1. **Backend:** lint + testes com banco SQLite em memória
2. **Frontend:** lint + build de produção

Ver: [`.github/workflows/ci.yml`](./.github/workflows/ci.yml)

---

## 🔍 Análise Crítica de Saída da IA

### Caso documentado: Bug no controller de Abrigos

**Problema:** Ao gerar o `PATCH /api/abrigos/:id/ocupacao`, a IA usou `req.params.capacidade` para comparar com a ocupação, sendo que esse valor não existe em `req.params`.

**Código incorreto gerado:**
```javascript
const novoStatus = ocupacao_atual >= req.params.capacidade ? 'lotado' : 'ativo';
```

**Correção aplicada:**
```javascript
const abrigo = db.prepare('SELECT * FROM abrigos WHERE id = ?').get(req.params.id);
let novoStatus = 'ativo';
if (ocupacao_atual >= abrigo.capacidade_total) {
  novoStatus = 'lotado';
}
```

**Lição aprendida:** A IA confunde a origem dos dados (`req.params` vs banco de dados). Em operações de atualização que dependem do estado atual do registro, sempre verificar se o dado está sendo buscado do banco ou tentando vir de outro lugar.

Ver documentação completa: [`docs/prompts/02-geracao-codigo-ciclo1.md`](./docs/prompts/02-geracao-codigo-ciclo1.md)

---

## 📁 Estrutura do Projeto

```
projeto-avaliativo-m12-AmandaHelpEnchentes/
├── .github/workflows/ci.yml     # Pipeline CI/CD
├── backend/
│   ├── src/
│   │   ├── controllers/         # Lógica de negócio
│   │   ├── routes/              # Endpoints da API
│   │   ├── middlewares/         # Auth JWT + ErrorHandler
│   │   ├── database/            # DB, migrations, seed
│   │   ├── app.js               # Configuração Express
│   │   └── server.js            # Entrypoint
│   ├── tests/                   # Testes automatizados
│   ├── .env.example             # Template de variáveis
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/               # Telas da aplicação
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── contexts/            # AuthContext
│   │   ├── services/api.js      # Axios configurado
│   │   └── App.jsx              # Rotas
│   └── package.json
├── docs/
│   └── prompts/                 # Prompts utilizados por etapa
└── README.md
```

---

## 🔮 Melhorias Futuras

- [ ] Mapa interativo com localização dos abrigos (integração com Google Maps ou OpenStreetMap)
- [ ] Notificações em tempo real via WebSocket quando um abrigo fica lotado
- [ ] Upload de foto para pessoas desaparecidas
- [ ] Painel de relatórios com gráficos de ocupação e doações
- [ ] App mobile (React Native) para uso em campo com conexão limitada
- [ ] Sistema de alertas por CEP para notificar voluntários próximos
- [ ] Integração com Defesa Civil via API para alertas automáticos

---

## 👥 Equipe

Projeto desenvolvido para o curso **IA para Desenvolvedores [T1] — Módulo 1, Semana 08**  
Instituição: SCTEC / LAB365
