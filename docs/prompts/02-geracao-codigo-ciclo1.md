# Prompt 02 — Geração de Código (Ciclo 1)

**Etapa:** Geração inicial do código backend  
**Padrão de Prompting:** Role-based Prompting  
**Ferramenta:** Kiro AI

---

## Prompt Utilizado

```
Você é um desenvolvedor Node.js sênior especializado em APIs REST com Express e SQLite.

Crie o controller completo para o módulo de Abrigos seguindo estas regras:
- GET /api/abrigos → público, com filtros de cidade, estado e status
- GET /api/abrigos/:id → público, retorna abrigo + doações vinculadas
- POST /api/abrigos → autenticado (gestor ou voluntário)
- PUT /api/abrigos/:id → atualização parcial com COALESCE
- PATCH /api/abrigos/:id/ocupacao → atualiza ocupação e recalcula status automaticamente
- DELETE /api/abrigos/:id → somente gestor

Restrições:
- Use better-sqlite3 (API síncrona, sem callbacks)
- Inclua JSDoc em todas as funções
- Trate todos os erros com next(err) passando para o errorHandler
- Calcule vagas_disponiveis em todo retorno de abrigo
- Determine status automaticamente: lotado quando ocupacao >= capacidade
```

---

## Avaliação Crítica — Saída Incorreta Identificada

**Problema encontrado no código gerado:**

A IA gerou o PATCH de ocupação assim:

```javascript
// CÓDIGO GERADO PELA IA (INCORRETO)
function atualizarOcupacao(req, res, next) {
  const { ocupacao_atual } = req.body;
  const novoStatus = ocupacao_atual >= req.params.capacidade ? 'lotado' : 'ativo';
  // ...
}
```

**Problema:** `req.params.capacidade` não existe. Params vem da URL (`:id`), não do body. A IA confundiu `req.params` com `req.body` e com dados do banco.

**Correção aplicada:**

```javascript
// CÓDIGO CORRIGIDO
function atualizarOcupacao(req, res, next) {
  const abrigo = db.prepare('SELECT * FROM abrigos WHERE id = ?').get(req.params.id);
  const { ocupacao_atual } = req.body;
  let novoStatus = 'ativo';
  if (ocupacao_atual >= abrigo.capacidade_total) {
    novoStatus = 'lotado';
  }
  // ...
}
```

**Lição aprendida:** Sempre verificar se a IA está lendo dados do banco quando precisa de valores existentes, e não tentando buscá-los de lugares errados como `req.params`.

---

## Ciclo 2 — Refinamento

Prompt de refinamento aplicado:

```
O código gerado tem um bug: você está lendo req.params.capacidade, mas esse valor 
precisa vir do banco (SELECT no abrigo). Corrija a função atualizarOcupacao para 
primeiro buscar o abrigo no banco, depois calcular o status baseado em capacidade_total.
```

A IA corrigiu corretamente após este refinamento.
