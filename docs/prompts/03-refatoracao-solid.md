# Prompt 03 — Refatoração com SOLID e Clean Code

**Etapa:** Refatoração do código gerado  
**Padrão de Prompting:** Few-shot Prompting  
**Ferramenta:** Kiro AI

---

## Contexto

Após o ciclo inicial de geração, o controller de doações retornava apenas o ID do abrigo nas listagens, sem o nome e cidade. Além disso, a lógica de ordenação por urgência estava em JS (sort no array) em vez de SQL.

---

## Prompt Utilizado

```
Refatore o controller de doações seguindo os princípios de Clean Code e SOLID.

Exemplo de código ruim que quero melhorar:
---
// Exemplo 1: busca dados no JS quando poderia fazer JOIN no SQL
const doacoes = db.prepare('SELECT * FROM doacoes').all();
const resultado = doacoes.map(d => {
  const abrigo = db.prepare('SELECT * FROM abrigos WHERE id = ?').get(d.abrigo_id);
  return { ...d, abrigo_nome: abrigo?.nome };
});

// Exemplo 2: ordenação feita em JS
const ordenada = resultado.sort((a, b) => {
  const ordem = { critica: 0, alta: 1, media: 2, baixa: 3 };
  return ordem[a.urgencia] - ordem[b.urgencia];
});
---

Exemplo de código bom que quero seguir:
---
// JOIN no SQL, ordenação no SQL
const doacoes = db.prepare(`
  SELECT d.*, a.nome as abrigo_nome, a.cidade as abrigo_cidade
  FROM doacoes d
  LEFT JOIN abrigos a ON d.abrigo_id = a.id
  ORDER BY CASE d.urgencia
    WHEN 'critica' THEN 1
    WHEN 'alta' THEN 2
    WHEN 'media' THEN 3
    WHEN 'baixa' THEN 4
  END
`).all();
---

Aplique essa mesma melhoria para a função listar() do controller de doações,
incluindo filtros dinâmicos por abrigo_id, categoria, urgencia e status.
```

---

## Código ANTES da Refatoração

```javascript
function listar(req, res, next) {
  try {
    const doacoes = db.prepare('SELECT * FROM doacoes').all();
    const resultado = doacoes.map(d => {
      const abrigo = db.prepare('SELECT nome, cidade FROM abrigos WHERE id = ?').get(d.abrigo_id);
      return { ...d, abrigo_nome: abrigo?.nome, abrigo_cidade: abrigo?.cidade };
    });
    return res.json(resultado.sort((a, b) => {
      const ordem = { critica: 0, alta: 1, media: 2, baixa: 3 };
      return ordem[a.urgencia] - ordem[b.urgencia];
    }));
  } catch (err) {
    next(err);
  }
}
```

**Problemas:**
- N+1 queries: para cada doação, faz uma query separada no abrigo
- Ordenação feita em memória JS quando o banco poderia fazer isso mais eficientemente

## Código DEPOIS da Refatoração

```javascript
function listar(req, res, next) {
  try {
    const { abrigo_id, categoria, urgencia, status } = req.query;
    let query = `
      SELECT d.*, a.nome as abrigo_nome, a.cidade as abrigo_cidade
      FROM doacoes d
      LEFT JOIN abrigos a ON d.abrigo_id = a.id
      WHERE 1=1
    `;
    const params = [];
    if (abrigo_id) { query += ' AND d.abrigo_id = ?'; params.push(abrigo_id); }
    if (categoria) { query += ' AND d.categoria = ?'; params.push(categoria); }
    if (urgencia)  { query += ' AND d.urgencia = ?'; params.push(urgencia); }
    if (status)    { query += ' AND d.status = ?'; params.push(status); }
    query += ` ORDER BY CASE d.urgencia
      WHEN 'critica' THEN 1 WHEN 'alta' THEN 2
      WHEN 'media' THEN 3 WHEN 'baixa' THEN 4
    END, d.criado_em DESC`;

    const doacoes = db.prepare(query).all(...params);
    return res.json(doacoes);
  } catch (err) {
    next(err);
  }
}
```

**Melhorias aplicadas:**
- ✅ Single Responsibility: a query faz tudo (JOIN + filtros + ordenação)
- ✅ Elimina N+1 queries com LEFT JOIN
- ✅ Ordenação delegada ao banco de dados
- ✅ Filtros dinâmicos com query builder seguro (sem SQL injection)
