# SPEC — Simulador de Comissionamento Lojas v2

> **Documento destinado ao Claude CLI / Claude Code.**
> Leia este arquivo inteiro antes de escrever qualquer código. Siga as seções na ordem apresentada.

---

## 1. Visão Geral

Construir uma aplicação web React (Vite + Tailwind CSS + shadcn/ui) que simula o novo modelo de comissionamento individual de consultores de lojas Vivo — **Modelo Lojas v2**.

O simulador deve permitir:
- Entrada manual de dados por formulário
- Upload de arquivo CSV/Excel com dados de um consultor
- Cálculo automático da comissão total do mês
- Visualização clara do resultado por bloco de remuneração

Não há backend. Toda a lógica é client-side.

---

## 2. Stack e Estrutura de Projeto

```
simulador-lojas-v2/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── FormularioConsultor.jsx      # Formulário de entrada manual
│   │   ├── FormularioProdutividade.jsx  # Sub-seção: metas e resultados por indicador
│   │   ├── UploadArquivo.jsx            # Upload CSV/XLSX
│   │   ├── ResultadoComissao.jsx        # Painel de resultado
│   │   ├── ResultadoProdutividade.jsx   # Gauge/card do atingimento ponderado
│   │   ├── TabelaFaixas.jsx             # Tabela de referência das faixas
│   │   └── ui/                          # Componentes shadcn/ui (button, card, input, etc.)
│   ├── lib/
│   │   ├── calcularComissao.js          # Lógica de cálculo pura (sem UI)
│   │   └── calcularProdutividade.js     # Lógica do atingimento ponderado (sem UI)
│   └── hooks/
│       └── useSimulador.js              # Estado global do simulador
```

**Dependências:**
```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "lucide-react": "latest",
    "xlsx": "latest"
  },
  "devDependencies": {
    "vite": "^5",
    "@vitejs/plugin-react": "latest",
    "tailwindcss": "^3",
    "postcss": "latest",
    "autoprefixer": "latest"
  }
}
```

> shadcn/ui: copiar manualmente os componentes necessários em `src/components/ui/` (Button, Card, Input, Label, Tabs, Badge, Separator). Não usar CLI do shadcn neste projeto.

---

## 3. Regras de Negócio

### 3.1 Bloco 1 — Vendeu, Ganhou! Serviços (Volume × Receita)

A comissão deste bloco é calculada **por produto**, com base no volume de ativações do consultor no mês.

A faixa é determinada pelo volume total. O valor unitário se aplica a **todas as unidades** do período (não apenas às excedentes).

#### Fibra (FTTH)

| Faixa    | Mínimo (inclusive) | Máximo (inclusive) | Valor por unidade |
|----------|:------------------:|:------------------:|:-----------------:|
| Laranja  | 0                  | 5                  | R$ 20,00          |
| Amarela  | 6                  | 10                 | R$ 40,00          |
| Verde    | 10                 | 15                 | R$ 60,00          |
| Púrpura  | 15+                | —                  | R$ 80,00          |

#### Controle

| Faixa    | Mínimo | Máximo | Valor por unidade |
|----------|:------:|:------:|:-----------------:|
| Laranja  | 0      | 20     | R$ 10,00          |
| Amarela  | 20     | 27     | R$ 20,00          |
| Verde    | 27     | 34     | R$ 30,00          |
| Púrpura  | 34+    | —      | R$ 40,00          |

#### Pós Puro

| Faixa    | Mínimo | Máximo | Valor por unidade |
|----------|:------:|:------:|:-----------------:|
| Laranja  | 0      | 5      | R$ 10,00          |
| Amarela  | 5      | 10     | R$ 20,00          |
| Verde    | 10     | 15     | R$ 30,00          |
| Púrpura  | 15+    | —      | R$ 40,00          |

**Fórmula:**
```
comissaoServico(produto) = volume * valorDaFaixa(volume)
totalBloco1 = comissaoFibra + comissaoControle + comissaoPosPuro
```

**Função auxiliar para determinar faixa:**
```javascript
// Retorna o valor por unidade com base no volume e na tabela do produto
function getFaixaValor(volume, tabelaFaixas) {
  // tabelaFaixas é array de { min, max, valor }
  // max === null significa sem limite superior (Púrpura)
  for (const faixa of tabelaFaixas) {
    if (volume >= faixa.min && (faixa.max === null || volume <= faixa.max)) {
      return faixa.valor;
    }
  }
  return 0;
}
```

---

### 3.2 Bloco 2 — Vendeu, Ganhou! Produtos / SVAs / Seguros

Comissão por produto vendido. Dois níveis: **base** e **acelerador**.

#### Tabela de Comissões

| Produto / Categoria   | Base (Vendeu, Ganhou) | Acelerador      | Tipo de cálculo          |
|-----------------------|:---------------------:|:---------------:|:------------------------:|
| Smartphones           | 0,60%                 | 1,50%           | % sobre receita (NF)     |
| Demais Eletrônicos    | 1,50%                 | 3,00%           | % sobre receita (NF)     |
| Essenciais            | 5%                    | 10%             | % sobre franquia mensal  |
| Seguros               | 50%                   | 100%            | % sobre franquia mensal  |
| Serviços Digitais     | R$ 2,00               | R$ 5,00         | Valor fixo por unidade   |
| Easy Anual            | R$ 25,00              | —               | Valor fixo por unidade   |
| Película              | R$ 10,00              | —               | Valor fixo por unidade   |
| Vale Saúde            | R$ 5,00               | R$ 10,00        | Valor fixo por unidade   |

#### Gatilho do Acelerador — Atingimento Ponderado de Produtividade

O acelerador **só é aplicado** quando o **Atingimento Ponderado de Produtividade ≥ 100%**. Este valor é calculado a partir das metas e resultados individuais de cada indicador, ponderados pelo tipo de área da loja.

Ver seção 3.3 abaixo para a lógica completa do cálculo.

- `atingimentoPonderado >= 1.00` → usar coluna "Acelerador" para todos os produtos que possuem acelerador
- `atingimentoPonderado < 1.00` → usar sempre coluna "Base"
- Produtos sem acelerador (Easy Anual, Película) usam sempre o valor base, independente do atingimento

**Fórmula:**
```javascript
const aceleradorAtivo = atingimentoPonderado >= 1.00;

// Para produtos com % sobre receita:
comissao = receita * (aceleradorAtivo ? taxaAcelerador : taxaBase)

// Para produtos com valor fixo por unidade:
comissao = quantidade * (aceleradorAtivo && temAcelerador ? valorAcelerador : valorBase)

totalBloco2 = soma de todas as comissões de produtos
```

---

### 3.3 Atingimento Ponderado de Produtividade (`calcularProdutividade.js`)

Este módulo é responsável por calcular o atingimento ponderado e determinar se o acelerador está ativo.

#### Inputs

| Campo              | Tipo    | Descrição                                          |
|--------------------|---------|----------------------------------------------------|
| `tipoArea`         | string  | `"com_fibra"` ou `"sem_fibra"`                     |
| `metaPosPuro`      | number  | Meta de produtividade Pós Puro (ex: 0,40)          |
| `resultadoPosPuro` | number  | Resultado real do consultor Pós Puro (ex: 0,40)    |
| `metaControle`     | number  | Meta de produtividade Controle (ex: 0,80)          |
| `resultadoControle`| number  | Resultado real Controle (ex: 0,75)                 |
| `metaFTTH`         | number  | Meta de produtividade FTTH (ex: 0,30) — ignorado se `tipoArea = "sem_fibra"` |
| `resultadoFTTH`    | number  | Resultado real FTTH (ex: 0,40) — ignorado se `tipoArea = "sem_fibra"` |

#### Pesos por Tipo de Área

```javascript
const PESOS = {
  com_fibra: { posPuro: 0.25, controle: 0.25, ftth: 0.50 },
  sem_fibra: { posPuro: 0.50, controle: 0.50, ftth: 0.00 },
};
```

#### Lógica de Cálculo

```javascript
const TETO_ATINGIMENTO = 1.30; // 130%

function calcularProdutividade({ tipoArea, metaPosPuro, resultadoPosPuro, metaControle, resultadoControle, metaFTTH, resultadoFTTH }) {
  const pesos = PESOS[tipoArea];

  // 1. Calcular atingimento bruto de cada indicador
  const atPosPuro   = metaPosPuro   > 0 ? resultadoPosPuro   / metaPosPuro   : 0;
  const atControle  = metaControle  > 0 ? resultadoControle  / metaControle  : 0;
  const atFTTH      = metaFTTH      > 0 ? resultadoFTTH      / metaFTTH      : 0;

  // 2. Aplicar teto de 130%
  const capPosPuro  = Math.min(atPosPuro,  TETO_ATINGIMENTO);
  const capControle = Math.min(atControle, TETO_ATINGIMENTO);
  const capFTTH     = Math.min(atFTTH,     TETO_ATINGIMENTO);

  // 3. Calcular ponderado
  const ponderado = (capPosPuro  * pesos.posPuro)
                  + (capControle * pesos.controle)
                  + (capFTTH     * pesos.ftth);

  return {
    detalhes: {
      posPuro:  { atingBruto: atPosPuro,  atingCap: capPosPuro,  peso: pesos.posPuro,  contrib: capPosPuro  * pesos.posPuro  },
      controle: { atingBruto: atControle, atingCap: capControle, peso: pesos.controle, contrib: capControle * pesos.controle },
      ftth:     { atingBruto: atFTTH,     atingCap: capFTTH,     peso: pesos.ftth,     contrib: capFTTH     * pesos.ftth     },
    },
    atingimentoPonderado: ponderado,
    aceleradorAtivo: ponderado >= 1.00,
  };
}
```

#### Output esperado

```javascript
{
  detalhes: {
    posPuro:  { atingBruto: 1.00, atingCap: 1.00, peso: 0.25, contrib: 0.25 },
    controle: { atingBruto: 0.94, atingCap: 0.94, peso: 0.25, contrib: 0.235 },
    ftth:     { atingBruto: 1.33, atingCap: 1.30, peso: 0.50, contrib: 0.65 },
  },
  atingimentoPonderado: 1.135,   // 113,5%
  aceleradorAtivo: true,
}
```

---

### 3.4 Total Geral

```
totalComissao = totalBloco1 + totalBloco2
```

---

## 4. Campos de Entrada (Formulário Manual)

### Bloco 1 — Serviços

| Campo             | Tipo    | Label no formulário         | Validação          |
|-------------------|---------|-----------------------------|-------------------|
| `volumeFibra`     | number  | Ativações Fibra (FTTH)      | Inteiro ≥ 0        |
| `volumeControle`  | number  | Ativações Controle          | Inteiro ≥ 0        |
| `volumePosPuro`   | number  | Ativações Pós Puro          | Inteiro ≥ 0        |

### Bloco 2 — Produtos / SVAs

| Campo                  | Tipo    | Label no formulário              | Base de cálculo         |
|------------------------|---------|----------------------------------|-------------------------|
| `receitaSmartphone`    | number  | Receita Smartphones (R$)         | % sobre valor           |
| `receitaEletronicos`   | number  | Receita Demais Eletrônicos (R$)  | % sobre valor           |
| `receitaEssenciais`    | number  | Receita Essenciais (R$)          | % sobre franquia mensal |
| `receitaSeguros`       | number  | Receita Seguros (R$)             | % sobre franquia mensal |
| `qtdServicosDigitais`  | number  | Qtd. Serviços Digitais           | Valor fixo              |
| `qtdEasyAnual`         | number  | Qtd. Easy Anual                  | Valor fixo              |
| `qtdPelicula`          | number  | Qtd. Película                    | Valor fixo              |
| `qtdValeSaude`         | number  | Qtd. Vale Saúde                  | Valor fixo              |

### Produtividade (Gatilho do Acelerador)

| Campo               | Tipo   | Label no formulário                          | Observação                              |
|---------------------|--------|----------------------------------------------|-----------------------------------------|
| `tipoArea`          | select | Tipo de Área da Loja                         | Opções: "Com Fibra" / "Sem Fibra"       |
| `metaPosPuro`       | number | Meta Pós Puro                                | Ex: 0,40                               |
| `resultadoPosPuro`  | number | Resultado Pós Puro                           | Ex: 0,40                               |
| `metaControle`      | number | Meta Controle                                | Ex: 0,80                               |
| `resultadoControle` | number | Resultado Controle                           | Ex: 0,75                               |
| `metaFTTH`          | number | Meta FTTH                                    | Ocultar/desabilitar se Sem Fibra        |
| `resultadoFTTH`     | number | Resultado FTTH                               | Ocultar/desabilitar se Sem Fibra        |

> O campo `metaAtingida` (boolean) é **removido** desta versão — substituído pelo cálculo automático do atingimento ponderado. O acelerador é determinado programaticamente por `calcularProdutividade()`.

---

## 5. Upload de CSV/Excel

Permitir upload de arquivo `.csv` ou `.xlsx` com os dados de um consultor.

### Mapeamento de colunas esperadas

O arquivo deve conter uma linha de cabeçalho com os nomes abaixo (case insensitive, aceitar variações com/sem acento):

```
volume_fibra, volume_controle, volume_pos_puro,
receita_smartphone, receita_eletronicos, receita_essenciais, receita_seguros,
qtd_servicos_digitais, qtd_easy_anual, qtd_pelicula, qtd_vale_saude,
tipo_area          (valores aceitos: "com_fibra", "sem_fibra", "c/fixa", "s/fixa", "com fibra", "sem fibra"),
meta_pos_puro, resultado_pos_puro,
meta_controle, resultado_controle,
meta_ftth, resultado_ftth
```

### Comportamento esperado

1. Usuário clica em "Importar arquivo" e seleciona o arquivo
2. O app lê a primeira linha de dados (ignora linhas vazias)
3. Os campos do formulário são preenchidos automaticamente com os valores lidos
4. O usuário pode ajustar manualmente antes de calcular
5. Se a leitura falhar ou coluna não for encontrada: exibir mensagem de erro clara indicando qual coluna está faltando

Usar a biblioteca `xlsx` (SheetJS) para ler tanto `.csv` quanto `.xlsx`.

---

## 6. Interface e UX

### Layout geral

```
┌──────────────────────────────────────────────────────────┐
│  Simulador de Comissionamento — Lojas v2                 │
│  (header com logo Centrão Digital se possível)           │
├──────────────────────────────────────────────────────────┤
│  [Tabs: "Formulário Manual" | "Importar Arquivo"]        │
├────────────────────────┬─────────────────────────────────┤
│  PRODUTIVIDADE         │  RESULTADO PRODUTIVIDADE        │
│  Tipo de área: [v]     │                                 │
│  Pós:  Meta__ Res.__   │  Pós:   ___% × 25% = ___%      │
│  Ctrl: Meta__ Res.__   │  Ctrl:  ___% × 25% = ___%      │
│  FTTH: Meta__ Res.__   │  FTTH:  ___% × 50% = ___%      │
│                        │  ────────────────────────────   │
│  BLOCO 1 — Serviços    │  Ponderado: [███░░] 113%        │
│  [campos vol. ativ.]   │  Acelerador: ✅ ATIVO           │
│                        │  ────────────────────────────   │
│  BLOCO 2 — Produtos    │  COMISSÃO                       │
│  [campos receita/qtd]  │  Fibra: R$ ___ (🟣 Púrpura)    │
│                        │  Controle: R$ ___ (🟢 Verde)   │
│  [Botão Calcular]      │  Pós Puro: R$ ___ (🟡 Amarela) │
│  [Botão Limpar]        │  Subtotal Bloco 1: R$ ___       │
│                        │  ────────────────────────────   │
│                        │  Smartphones: R$ ___            │
│                        │  Eletrônicos: R$ ___            │
│                        │  ... (demais produtos)          │
│                        │  Subtotal Bloco 2: R$ ___       │
│                        │  ══════════════════════════     │
│                        │  TOTAL GERAL: R$ ___            │
└────────────────────────┴─────────────────────────────────┘
│  [Tabela de referência colapsável — faixas de serviços]  │
└──────────────────────────────────────────────────────────┘
```

### Detalhes de UX

- Resultado atualiza em **tempo real** (sem botão Calcular obrigatório, mas manter o botão para usuários que preferem)
- Faixa de cada produto (Fibra, Controle, Pós) deve ser exibida com a cor correspondente: 🟠 Laranja / 🟡 Amarela / 🟢 Verde / 🟣 Púrpura
- Badge colorido indica se o acelerador está ativo ou não
- Valores monetários sempre formatados como `R$ 1.234,56` (locale pt-BR)
- Campos numéricos aceitam apenas números positivos
- Responsivo: funcionar bem em telas de 1024px+
- Tema: cores neutras (cinza/branco), destaques em roxo (`#7C3AED` ou similar) para manter identidade Centrão

---

## 7. Módulo de Cálculo Puro (`calcularComissao.js`)

Este arquivo deve ser **puro** (sem dependências de UI ou React). Exportar uma função principal:

```javascript
/**
 * @param {Object} dados - Campos do formulário
 * @returns {Object} resultado com detalhamento por item e total geral
 */
export function calcularComissao(dados) {
  // Retorna:
  // {
  //   bloco1: {
  //     fibra: { volume, faixa, valorUnitario, total },
  //     controle: { volume, faixa, valorUnitario, total },
  //     posPuro: { volume, faixa, valorUnitario, total },
  //     subtotal
  //   },
  //   bloco2: {
  //     smartphone: { receita, taxa, total },
  //     eletronicos: { receita, taxa, total },
  //     essenciais: { receita, taxa, total },
  //     seguros: { receita, taxa, total },
  //     servicosDigitais: { quantidade, valorUnit, total },
  //     easyAnual: { quantidade, valorUnit, total },
  //     pelicula: { quantidade, valorUnit, total },
  //     valeSaude: { quantidade, valorUnit, total },
  //     subtotal
  //   },
  //   aceleradorAtivo: boolean,
  //   totalGeral
  // }
}
```

Escrever **testes unitários simples** (sem framework, apenas `console.assert`) em dois arquivos:

**`src/lib/calcularComissao.test.js`** — testa o Bloco 1 e Bloco 2:
- Volume 0 em todos os produtos → total R$ 0,00
- Volume exato nos limites de cada faixa (ex: 5, 6, 10, 15 para Fibra)
- Acelerador ativo vs inativo → diferença no Bloco 2
- Produto sem acelerador (Easy Anual, Película) → mesmo valor independente do acelerador

**`src/lib/calcularProdutividade.test.js`** — testa o atingimento ponderado:
- Exemplo C/Fixa: Pós=100%, Ctrl=94%, FTTH=133% → ponderado ≈ 113,5% → acelerador ativo
- Exemplo S/Fixa: Pós=100%, Ctrl=94% → ponderado ≈ 97% → acelerador inativo
- FTTH com atingimento < 130% → não sofre truncamento
- FTTH com atingimento > 130% → truncado em 130% exatamente
- Área sem fibra → peso de FTTH = 0, ignorado mesmo se resultado > 0
- Meta = 0 → atingimento = 0 (não dividir por zero)

---

## 8. Formato de Saída do CSV de Modelo

Gerar um botão "Baixar modelo CSV" que exporta um arquivo com as colunas esperadas e uma linha de exemplo preenchida com valores fictícios para guiar o usuário.

---

## 9. O que NÃO implementar nesta versão

- Autenticação ou login
- Backend ou banco de dados
- Múltiplos consultores simultâneos
- Histórico de simulações
- Comparativo com modelo anterior (Lojas v1)
- PWA ou modo offline

---

## 10. Ordem de Implementação Recomendada

1. Scaffold do projeto (`npm create vite@latest`, instalar Tailwind, copiar componentes shadcn)
2. Implementar `calcularProdutividade.js` com testes (`calcularProdutividade.test.js`)
3. Implementar `calcularComissao.js` com testes (`calcularComissao.test.js`) — depende do resultado de `calcularProdutividade` para o acelerador
4. Implementar `FormularioProdutividade.jsx` (tipo de área + campos meta/resultado por indicador)
5. Implementar `ResultadoProdutividade.jsx` (card com ponderado, breakdown por indicador, badge acelerador)
6. Implementar `FormularioConsultor.jsx` (Bloco 1 + Bloco 2 + embute `FormularioProdutividade`)
7. Implementar `ResultadoComissao.jsx` (painel completo de comissão)
8. Conectar tudo via `useSimulador.js`
9. Implementar `UploadArquivo.jsx` (SheetJS — incluir novos campos de produtividade no parser)
10. Implementar `TabelaFaixas.jsx` (colapsável)
11. Estilização final e responsividade
12. Rodar testes manuais nos casos de borda: limites de faixa + transição de acelerador (ponderado 99% vs 100%)

---

## 11. Entrega

- Código em pasta `simulador-lojas-v2/` na raiz do projeto
- `README.md` com instruções de instalação e execução (`npm install && npm run dev`)
- Rodar `npm run build` ao final e confirmar que o build passa sem erros

---

## Referências de Negócio

- Modelo documentado em: `Modelo Comissionamento Lojas v2.md` (mesmo diretório deste arquivo)
- Modelo anterior (para comparação): `Proposta Vivo - Lojas.md`
