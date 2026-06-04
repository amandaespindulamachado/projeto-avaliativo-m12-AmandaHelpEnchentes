# Prompt 05 — Configuração do Pipeline CI/CD

**Etapa:** Pipeline de Integração Contínua  
**Padrão de Prompting:** Chain of Thought (CoT)  
**Ferramenta:** Kiro AI

---

## Prompt Utilizado

```
Preciso configurar um pipeline de CI/CD com GitHub Actions para o projeto HelpEnchentes.

O repositório tem dois projetos separados:
- /backend — Node.js + Express + Jest (testes com banco SQLite em memória)
- /frontend — React 19 + Vite (build de produção)

Raciocine passo a passo sobre:
1. Quantos jobs são necessários e por quê separá-los?
2. Quais etapas cada job precisa executar?
3. Como configurar variáveis de ambiente para testes (especialmente JWT_SECRET e DB_PATH)?
4. Como usar cache do npm para agilizar o pipeline?
5. Em quais branches o pipeline deve rodar?

Gere o arquivo .github/workflows/ci.yml completo e funcional.
```

---

## Avaliação Crítica — Saída da IA Corrigida

**Problema 1:** A IA inicialmente gerou um único job para backend e frontend, o que tornava o pipeline mais lento e misturava responsabilidades.

**Correção:** Separados em dois jobs paralelos: `backend-lint-test` e `frontend-lint-build`.

**Problema 2:** A IA esqueceu de configurar `working-directory` nos jobs, o que faria os comandos `npm ci` falharem.

**Código gerado incorretamente:**
```yaml
steps:
  - run: npm ci  # Falharia — estaria na raiz do repo, sem package.json
```

**Código corrigido:**
```yaml
defaults:
  run:
    working-directory: ./backend
steps:
  - run: npm ci  # Correto — executa dentro de /backend
```

**Problema 3:** O DB_PATH estava sendo passado como caminho de arquivo `./test.sqlite` que persiste entre runs. Corrigido para `:memory:`.

---

## Pipeline Final

O pipeline configurado:
- Executa em push e pull_request para `main` e `develop`
- Job 1: backend — instala deps, lint, testes (com DB em memória)
- Job 2: frontend — instala deps, lint, build
- Usa cache npm para performance
- Variáveis de ambiente configuradas via `env:` no step de testes
