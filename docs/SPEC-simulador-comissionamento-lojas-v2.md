# SPEC — Simulador de Comissionamento Lojas v2

> **Documento destinado ao Claude CLI / Claude Code.**
> Leia este arquivo inteiro antes de escrever qualquer código. Siga as seções na ordem apresentada.

---

## 1. Visão Geral

Construir o **Simulador de Comissionamento Lojas v2** como um **módulo integrado ao Centrão Business** (`centrao-business`) — a aplicação React/TypeScript existente que consome o backend `api-helorite`.

O simulador **não é um projeto isolado**. Ele vive dentro do repositório `centrao-business` como uma nova rota protegida, reutilizando o sistema de autenticação, design system e controle de acesso RBAC já existentes.

O simulador deve permitir:
- Entrada manual de dados por formulário (cargo selecionado automaticamente via perfil do usuário logado)
- Upload de arquivo CSV/Excel com dados de um consultor ou equipe
- Cálculo automático da comissão total do mês
- Visualização por cargo: **Consultor** (faixas individuais + faixa geral) e **Gerente** (PPL + SVAs da equipe)

A lógica de cálculo é inteiramente **client-side** — sem novas rotas de API para o simulador. O acesso à rota é controlado pelo RBAC existente via `canAccessFeature()`.

---

## 2. Stack e Estrutura de Projeto

### 2.1 Stack (herdada do Centrão Business)

| Camada        | Tecnologia                                      |
|---------------|-------------------------------------------------|
| Framework     | React 18 + TypeScript (`vite.config.ts`)        |
| Estilização   | Tailwind CSS + shadcn/ui (já instalados)        |
| Roteamento    | React Router (já configurado no projeto)        |
| Auth/RBAC     | `AuthContext.tsx` + `authService.ts` + `accessControl.ts` |
| Backend       | `api-helorite` via proxy `/api` (Vite config)   |
| Upload        | `xlsx` (SheetJS) — adicionar se não existir     |

**Não criar `vite.config`, `tailwind.config`, `package.json` novos.** Tudo é adicionado dentro do repositório existente.

### 2.2 Feature ID no RBAC

Registrar a nova feature no catálogo `accessControl.ts`:

```typescript
// Em src/config/accessControl.ts, adicionar ao AccessFeatureId:
'simulador_comissionamento_lojas': 'Simulador de Comissionamento Lojas'
```

Associar ao perfil `gerente_loja`, `analista`, `master` (e demais que fizerem sentido) via seed no banco ou painel admin. Ver `rls_export_config.md` para a estrutura de `role_features`.

```sql
-- Seed para liberar acesso ao simulador
INSERT INTO public.role_features (role_id, feature_id) VALUES
('master',       'simulador_comissionamento_lojas'),
('analista',     'simulador_comissionamento_lojas'),
('gerente_loja', 'simulador_comissionamento_lojas'),
('coordenador',  'simulador_comissionamento_lojas'),
('gestor',       'simulador_comissionamento_lojas');
```

### 2.3 Estrutura de Arquivos (dentro de `centrao-business/src/`)

```
src/
├── config/
│   └── accessControl.ts          ← EDITAR: adicionar 'simulador_comissionamento_lojas'
├── pages/
│   └── SimuladorComissionamento/
│       ├── index.tsx             # Página raiz — guard de acesso + tabs cargo
│       ├── ConsultorView.tsx     # View do consultor (Bloco 1 + Bloco 2)
│       └── GerenteView.tsx       # View do gerente (PPL + SVAs equipe)
├── components/
│   └── simulador/
│       ├── FormularioConsultor.tsx
│       ├── FormularioGerente.tsx
│       ├── UploadArquivo.tsx
│       ├── ResultadoConsultor.tsx
│       ├── ResultadoGerente.tsx
│       ├── CardFaixaGeral.tsx
│       ├── CardAtingimentoPPL.tsx
│       └── TabelaFaixas.tsx
└── lib/
    └── simulador/
        ├── calcularComissao.ts   # Lógica consultor (tipada)
        ├── calcularFaixaGeral.ts # Faixa geral por soma (tipada)
        ├── calcularGerente.ts    # Lógica gerente (tipada)
        └── tipos.ts              # Interfaces e types compartilhados
```

### 2.4 Rota Protegida

Adicionar a rota no router principal do projeto seguindo o padrão existente de proteção por `canAccessFeature`:

```tsx
// No arquivo de rotas (ex: App.tsx ou routes/index.tsx)
<ProtectedRoute feature="simulador_comissionamento_lojas">
  <SimuladorComissionamento />
</ProtectedRoute>
```

O componente de rota protegida já existe no projeto — usar o padrão atual, não criar um novo.

### 2.5 Cargo Inicial — Inferência pelo Perfil Logado

Ao abrir o simulador, inferir o cargo padrão da tab a partir do `role` do usuário autenticado (disponível via `AuthContext`):

```typescript
// Em SimuladorComissionamento/index.tsx
const { user } = useAuth(); // hook do AuthContext existente

const cargoInicial = user?.role === 'gerente_loja' ? 'gerente' : 'consultor';
```

O usuário ainda pode trocar manualmente via tabs.

### 2.6 TypeScript — Tipos Base (`lib/simulador/tipos.ts`)

```typescript
export type TipoArea = 'com_fibra' | 'sem_fibra';
export type FaixaCor = 'laranja' | 'amarela' | 'verde' | 'purpura';
export type FaixaPPL = 'oportunidade' | 'intermediario' | 'bom' | 'otimo' | 'top' | 'super';

export interface InputConsultor {
  volumeFibra: number;
  volumeControle: number;
  volumePosPuro: number;
  receitaSmartphone: number;
  receitaEletronicos: number;
  receitaEssenciais: number;
  receitaSeguros: number;
  qtdServicosDigitais: number;
  qtdEasyAnual: number;
  qtdPelicula: number;
  qtdValeSaude: number;
}

export interface InputGerente {
  // SVAs da equipe
  receitaSmartphone: number;
  receitaEletronicos: number;
  receitaEssenciais: number;
  receitaSeguros: number;
  qtdServicosDigitais: number;
  qtdNovosNegocios: number;
  qtdPelicula: number;
  // Produtividade
  tipoArea: TipoArea;
  metaPosPuro: number;
  resultadoPosPuro: number;
  metaControle: number;
  resultadoControle: number;
  metaFTTH: number;
  resultadoFTTH: number;
  // Cargo
  salarioBase: number;
  valorBaseCargoColetivo: number;
}
```

---

## 3. Critérios de Venda Válida

**Toda lógica de cálculo parte do pressuposto que os dados de entrada já representam apenas vendas válidas.** O simulador não valida os dados individualmente — isso é responsabilidade do pipeline FCDI upstream.

Documentar para o usuário, via texto informativo na interface, que os volumes e receitas informados devem considerar somente as vendas que atendam todos os critérios abaixo:

| # | Critério | O que verificar |
|---|----------|-----------------|
| 1 | Base de apuração | Extrato FCDI da competência da safra |
| 2 | Biometria | Dentro da regra vigente |
| 3 | Reabilitação | **Excluída da apuração** — não somar ao volume (continua valendo para TFP) |
| 4 | Sem deduções | Excluir baixas em M0 e estornos por erro de movimentação (MD, MN, Realta, etc.) |
| 5 | Vivo Go | Lançamento correto: acesso, data, serviço, plano, receita e usuário |
| 6 | Price | Estoque Centrão — price correto, sem discrepância |
| 7 | Venda manual | Somente com justificativa registrada |
| 8 | Vivo Renova | Correto — sem prejuízo e sem discrepância |
| 9 | Processos Vivo | Seguir as regras do POP estabelecido pela Vivo |
| 10 | Prazo de instalação | Instaladas até o **dia 15 do mês subsequente** |

### Impacto no Simulador

- Exibir um **aviso de elegibilidade** fixo no topo do formulário, lembrando que os volumes devem excluir Reabilitações e vendas com deduções
- O campo de volume de Fibra deve ter tooltip explícito: _"Não incluir Reabilitação — ela não entra nesta métrica"_
- Não é necessário implementar validação automática dos critérios — o simulador é uma ferramenta de projeção, não de auditoria

---

## 4. Regras de Negócio

### 4.1 Bloco 1 — Vendeu, Ganhou! Serviços (Volume × Receita)

A comissão deste bloco é calculada **por produto**, com base no volume de ativações do consultor no mês.

A faixa é determinada pelo volume total. O valor unitário se aplica a **todas as unidades** do período (não apenas às excedentes).

> **REGRA CRÍTICA — Movimentos contabilizáveis:**
> Para os três produtos, apenas os movimentos abaixo entram no volume de faixa. **Reabilitação, Upgrade, Downgrade, Baixa e Troca Lateral não são contabilizados.**
>
> - **Fibra**: Alta FTTH (**sem Reabilitação** — embora tecnicamente seja Alta no FCDI, está excluída desta métrica)
> - **Controle**: Alta Controle + Migração Pré → Controle (**sem Reabilitação**)
> - **Pós Puro**: Alta Pós Puro + Migração Pré → Pós Puro (**sem Reabilitação**)
>
> Nenhuma loja possui Migração de Tecnologia (cobre → fibra) — este tipo de movimento **não existe na operação** e não deve ser considerado.
>
> O formulário e o parser de CSV devem deixar claro que os campos de volume referem-se apenas a esses movimentos, excluindo Reabilitação. Adicionar tooltip em cada campo.

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

### 4.2 Bloco 2 — Vendeu, Ganhou! Produtos / SVAs / Seguros

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

#### Gatilho do Acelerador — Faixa Geral por Soma de Movimentos

O acelerador **só é aplicado** quando a **soma total de movimentos (Fibra + Controle + Pós Puro) ≥ 48**, ou seja, quando o consultor atingir a faixa geral **Verde ou Púrpura**.

Ver seção 3.3 abaixo para a tabela de faixas e a lógica completa.

- `somaMovimentos >= 48` → `aceleradorAtivo = true` → usar coluna "Acelerador"
- `somaMovimentos < 48`  → `aceleradorAtivo = false` → usar sempre coluna "Base"
- Produtos sem acelerador (Easy Anual, Película) usam sempre o valor base, independente da faixa

**Fórmula:**
```javascript
const somaMovimentos = volumeFibra + volumeControle + volumePosPuro;
const aceleradorAtivo = somaMovimentos >= 48; // faixa Verde ou Púrpura

// Para produtos com % sobre receita:
comissao = receita * (aceleradorAtivo ? taxaAcelerador : taxaBase)

// Para produtos com valor fixo por unidade:
comissao = quantidade * (aceleradorAtivo && temAcelerador ? valorAcelerador : valorBase)

totalBloco2 = soma de todas as comissões de produtos
```

---

### 4.3 Faixa Geral e Acelerador (`calcularFaixaGeral.ts`)

Este módulo calcula a faixa geral do consultor com base na **soma de todos os movimentos** e determina se o acelerador está ativo.

#### Tabela de Faixas Gerais

```javascript
const FAIXAS_GERAIS = [
  { faixa: 'purpura', min: 65,  acelerador: true  },
  { faixa: 'verde',   min: 48,  acelerador: true  },
  { faixa: 'amarela', min: 31,  acelerador: false },
  { faixa: 'laranja', min: 0,   acelerador: false },
];
```

#### Lógica de Cálculo

```javascript
function calcularFaixaGeral(volumeFibra, volumeControle, volumePosPuro) {
  const soma = volumeFibra + volumeControle + volumePosPuro;

  // Percorrer faixas do maior para o menor (ordem decrescente de min)
  const faixaAtual = FAIXAS_GERAIS.find(f => soma >= f.min);

  return {
    soma,
    faixa: faixaAtual.faixa,       // 'laranja' | 'amarela' | 'verde' | 'purpura'
    aceleradorAtivo: faixaAtual.acelerador,
  };
}
```

#### Output esperado

```javascript
// Exemplo: Fibra=8, Controle=25, Pós=18 → soma=51
{
  soma: 51,
  faixa: 'verde',
  aceleradorAtivo: true,
}

// Exemplo: Fibra=5, Controle=15, Pós=8 → soma=28
{
  soma: 28,
  faixa: 'laranja',
  aceleradorAtivo: false,
}
```

---

### 4.4 Cálculo do Gerente de Loja (`calcularGerente.ts`)

O Gerente tem uma mecânica diferente do consultor. O módulo `calcularGerente.ts` deve ser separado e puro.

#### 3.4.1 Bloco Produtos/SVAs do Gerente

Taxas diferentes das do consultor, aplicadas sobre a **receita consolidada da equipe** (não do indivíduo). Produto "Novos Negócios" existe somente no Gerente (substitui "Easy Anual" + "Vale Saúde" que não existem neste cargo).

```javascript
const TABELA_GERENTE = {
  smartphone:       { base: 0.0013, acelerador: 0.0026,  tipo: 'percentual' },
  eletronicos:      { base: 0.0018, acelerador: 0.0036,  tipo: 'percentual' },
  essenciais:       { base: 0.0040, acelerador: 0.0080,  tipo: 'percentual' },
  seguros:          { base: 0.20,   acelerador: 0.40,    tipo: 'percentual' },
  servicosDigitais: { base: 2.00,   acelerador: 5.00,    tipo: 'fixo'       },
  novosNegocios:    { base: 5.00,   acelerador: 10.00,   tipo: 'fixo'       },
  pelicula:         { base: 3.00,   acelerador: null,    tipo: 'fixo'       }, // sem acelerador
};
```

#### 3.4.2 Acelerador do Gerente — Atingimento Ponderado de Produtividade

O acelerador do Gerente **não usa a soma de movimentos** (essa lógica é exclusiva do consultor). O Gerente usa o **atingimento ponderado dos indicadores da loja**, com os mesmos pesos por tipo de área definidos na seção [[Modelo Comissionamento Lojas v2.md]]:

```javascript
// Reutilizar a lógica de calcularFaixaGeral.ts NÃO se aplica aqui.
// Implementar calcularAtingimentoPonderado() separado:

const PESOS = {
  com_fibra: { posPuro: 0.25, controle: 0.25, ftth: 0.50 },
  sem_fibra: { posPuro: 0.50, controle: 0.50, ftth: 0.00 },
};

const TETO = 1.30;

function calcularAtingimentoPonderado({ tipoArea, metaPos, resultPos, metaCtrl, resultCtrl, metaFtth, resultFtth }) {
  const pesos = PESOS[tipoArea];

  const atPos  = metaPos  > 0 ? Math.min(resultPos  / metaPos,  TETO) : 0;
  const atCtrl = metaCtrl > 0 ? Math.min(resultCtrl / metaCtrl, TETO) : 0;
  const atFtth = metaFtth > 0 ? Math.min(resultFtth / metaFtth, TETO) : 0;

  return (atPos * pesos.posPuro) + (atCtrl * pesos.controle) + (atFtth * pesos.ftth);
}

// aceleradorAtivo = atingimentoPonderado >= 1.00
```

#### 3.4.3 Meta da Loja — Cargo Coletivo

```javascript
const FAIXAS_PPL = [
  { nome: 'super',        minAting: 1.05, pct: 1.00 },
  { nome: 'top',          minAting: 1.00, pct: 0.80 },
  { nome: 'otimo',        minAting: 0.95, pct: 0.60 },
  { nome: 'bom',          minAting: 0.90, pct: 0.40 },
  { nome: 'intermediario',minAting: 0.85, pct: 0.20 },
  { nome: 'oportunidade', minAting: 0,    pct: 0.00 },
];

// Exemplo: atingimentoPonderado = 0.848 → faixa "intermediario" → pct = 0.20
// rvMetaLoja = valorBaseCargoColetivo * pct
// (valorBaseCargoColetivo a confirmar — no exemplo: R$3.500 × 20% = R$700)
```

> **ATENÇÃO:** O `valorBaseCargoColetivo` usado no exemplo é R$ 3.500 (igual ao salário base). Confirmar com Lorena/Vivo se é sempre o salário, um valor fixo por faixa, ou outro parâmetro. Implementar como campo configurável no formulário.

#### 3.4.4 Output de `calcularGerente()`

```javascript
{
  blocoSVAs: {
    smartphone:       { receita, taxa, total },
    eletronicos:      { receita, taxa, total },
    essenciais:       { receita, taxa, total },
    seguros:          { receita, taxa, total },
    servicosDigitais: { quantidade, valorUnit, total },
    novosNegocios:    { quantidade, valorUnit, total },
    pelicula:         { quantidade, valorUnit, total },
    subtotalSemAce,
    subtotalComAce,
  },
  metaLoja: {
    atingimentoPonderado,   // ex: 0.848
    faixaPPL,               // ex: 'intermediario'
    pctCargoColetivo,       // ex: 0.20
    rvMetaLoja,             // ex: 700
    aceleradorAtivo,        // ex: false
  },
  salarioBase,
  rvTotalSemAce,            // blocoSVAs.subtotalSemAce + rvMetaLoja
  rvTotalComAce,            // blocoSVAs.subtotalComAce + rvMetaLoja
  totalSemAce,              // salarioBase + rvTotalSemAce
  totalComAce,              // salarioBase + rvTotalComAce
}
```

---

### 4.5 Total Geral — Consultor

```
totalComissao = totalBloco1 + totalBloco2
```

---

## 4. Campos de Entrada (Formulário Manual)

### Bloco 1 — Serviços

| Campo             | Tipo    | Label no formulário                              | Tooltip / Ajuda                                                               | Validação   |
|-------------------|---------|--------------------------------------------------|-------------------------------------------------------------------------------|-------------|
| `volumeFibra`     | number  | Altas Fibra (FTTH)                               | Somente Alta FTTH. **Não incluir Reabilitação** (não conta nesta métrica)     | Inteiro ≥ 0 |
| `volumeControle`  | number  | Altas + Migrações Controle                       | Alta Controle + Migração Pré → Controle. **Não incluir Reabilitação**         | Inteiro ≥ 0 |
| `volumePosPuro`   | number  | Altas + Migrações Pós Puro                       | Alta Pós Puro + Migração Pré → Pós Puro. **Não incluir Reabilitação**         | Inteiro ≥ 0 |

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

### Faixa Geral e Acelerador — Consultor (calculado automaticamente)

Não há campos extras. A faixa geral e o acelerador são calculados a partir dos volumes do Bloco 1: `soma = volumeFibra + volumeControle + volumePosPuro`. Exibido no `CardFaixaGeral`.

---

### Campos de Entrada — Gerente (`FormularioGerente.tsx`)

#### SVAs/Produtos da Equipe

| Campo                  | Tipo   | Label no formulário                          | Base de cálculo          |
|------------------------|--------|----------------------------------------------|--------------------------|
| `receitaSmartphone`    | number | Receita Smartphones da Equipe (R$)           | % sobre receita          |
| `receitaEletronicos`   | number | Receita Demais Eletrônicos da Equipe (R$)    | % sobre receita          |
| `receitaEssenciais`    | number | Receita Essenciais da Equipe (R$)            | % sobre franquia mensal  |
| `receitaSeguros`       | number | Receita Seguros da Equipe (R$)               | % sobre franquia mensal  |
| `qtdServicosDigitais`  | number | Qtd. Serviços Digitais da Equipe             | Valor fixo por unidade   |
| `qtdNovosNegocios`     | number | Qtd. Novos Negócios da Equipe                | Valor fixo por unidade   |
| `qtdPelicula`          | number | Qtd. Película da Equipe                      | Valor fixo, sem acelerador|

#### Meta da Loja — Produtividade Ponderada

| Campo               | Tipo   | Label no formulário        | Observação                              |
|---------------------|--------|----------------------------|-----------------------------------------|
| `tipoArea`          | select | Tipo de Área da Loja       | "Com Fibra" / "Sem Fibra"               |
| `metaPosPuro`       | number | Meta Pós Puro              | Ex: 0,40                               |
| `resultadoPosPuro`  | number | Resultado Pós Puro         | Ex: 0,28                               |
| `metaControle`      | number | Meta Controle              | Ex: 0,80                               |
| `resultadoControle` | number | Resultado Controle         | Ex: 0,82                               |
| `metaFTTH`          | number | Meta FTTH                  | Ocultar se "Sem Fibra"                  |
| `resultadoFTTH`     | number | Resultado FTTH             | Ocultar se "Sem Fibra"                  |

#### Dados do Cargo

| Campo                    | Tipo   | Label no formulário                 | Observação                                     |
|--------------------------|--------|-------------------------------------|------------------------------------------------|
| `salarioBase`            | number | Salário Base (R$)                   | Default: R$ 3.500 (configurável)               |
| `valorBaseCargoColetivo` | number | Base para % Cargo Coletivo (R$)     | A confirmar — default: igual ao salário base   |

---

## 6. Upload de CSV/Excel

Permitir upload de arquivo `.csv` ou `.xlsx` com os dados de um consultor.

### Mapeamento de colunas esperadas

O arquivo deve conter uma linha de cabeçalho com os nomes abaixo (case insensitive, aceitar variações com/sem acento):

```
volume_fibra, volume_controle, volume_pos_puro,
receita_smartphone, receita_eletronicos, receita_essenciais, receita_seguros,
qtd_servicos_digitais, qtd_easy_anual, qtd_pelicula, qtd_vale_saude
```

A faixa geral e o acelerador são calculados automaticamente a partir dos volumes — não há colunas extras no CSV para isso.

### Comportamento esperado

1. Usuário clica em "Importar arquivo" e seleciona o arquivo
2. O app lê a primeira linha de dados (ignora linhas vazias)
3. Os campos do formulário são preenchidos automaticamente com os valores lidos
4. O usuário pode ajustar manualmente antes de calcular
5. Se a leitura falhar ou coluna não for encontrada: exibir mensagem de erro clara indicando qual coluna está faltando

Usar a biblioteca `xlsx` (SheetJS) para ler tanto `.csv` quanto `.xlsx`.

---

## 7. Interface e UX

### Layout geral

O simulador tem **duas visões de cargo** selecionáveis por tab no topo.

```
┌──────────────────────────────────────────────────────────────┐
│  Simulador de Comissionamento — Lojas v2                     │
├──────────────────────────────────────────────────────────────┤
│  [Cargo: 👤 Consultor | 👔 Gerente]   [Importar Arquivo]     │
└──────────────────────────────────────────────────────────────┘
```

**Aba Consultor:**
```
├────────────────────────┬─────────────────────────────────────┤
│  BLOCO 1 — Serviços    │  FAIXA GERAL (tempo real)           │
│  Altas+Migr. Fibra: __ │  Soma: 51 mov. │ 🟢 Verde           │
│  Altas+Migr. Ctrl:  __ │  Acelerador: ✅ ATIVO               │
│  Altas+Migr. Pós:   __ │  ─────────────────────────────────  │
│                        │  COMISSÃO SERVIÇOS                  │
│  BLOCO 2 — Produtos    │  Fibra (🟡): R$ ___                 │
│  Receita Smartphone: _ │  Controle (🟠): R$ ___              │
│  Receita Eletrôn.:   _ │  Pós Puro (🟣): R$ ___             │
│  Receita Essenciais: _ │  Subtotal Bloco 1: R$ ___           │
│  Receita Seguros:    _ │  ─────────────────────────────────  │
│  Qtd. Serv. Digit.:  _ │  COMISSÃO PRODUTOS                  │
│  Qtd. Easy Anual:    _ │  Smartphones: R$ ___                │
│  Qtd. Película:      _ │  ... (demais)                       │
│  Qtd. Vale Saúde:    _ │  Subtotal Bloco 2: R$ ___           │
│  [Calcular] [Limpar]   │  ═══════════════════════════════    │
│                        │  TOTAL GERAL: R$ ___                │
└────────────────────────┴─────────────────────────────────────┘
```

**Aba Gerente:**
```
├────────────────────────┬─────────────────────────────────────┤
│  PRODUTOS/SVAS EQUIPE  │  META DA LOJA (tempo real)          │
│  Receita Smartphone: _ │  Ponderado: 84,8% │ 🟡 Intermediário│
│  Receita Eletrôn.:   _ │  Acelerador: ❌ INATIVO             │
│  Receita Essenciais: _ │  ─────────────────────────────────  │
│  Receita Seguros:    _ │  RV PRODUTOS/SVAS                   │
│  Qtd. Serv. Digit.:  _ │  Smartphones: R$ ___                │
│  Qtd. Novos Neg.:    _ │  ... (demais)                       │
│  Qtd. Película:      _ │  Subtotal s/ ace.: R$ ___           │
│                        │  Subtotal c/ ace.: R$ ___           │
│  META DA LOJA          │  ─────────────────────────────────  │
│  Área: [Com/Sem Fibra] │  RV META DA LOJA                    │
│  Pós:  Meta__ Res.__   │  Faixa: Intermediário → 20%         │
│  Ctrl: Meta__ Res.__   │  RV Meta Loja: R$ ___               │
│  FTTH: Meta__ Res.__   │  ═══════════════════════════════    │
│                        │  SALÁRIO BASE: R$ 3.500             │
│  CARGO                 │  RV s/ acelerador: R$ ___           │
│  Salário base: _______ │  RV c/ acelerador: R$ ___           │
│  Base cargo col.: ___  │  TOTAL s/ ace.:  R$ ___             │
│  [Calcular] [Limpar]   │  TOTAL c/ ace.:  R$ ___             │
└────────────────────────┴─────────────────────────────────────┘
```
```
│  [Tabela de referência colapsável — faixas consultor + faixas PPL gerente] │
└────────────────────────────────────────────────────────────────────────────┘
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

## 8. Módulo de Cálculo Puro (`calcularComissao.ts`)

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

**`src/lib/calcularFaixaGeral.test.js`** — testa a faixa geral e o acelerador do consultor:
- Soma = 0 → faixa Laranja, acelerador inativo
- Soma = 30 → faixa Laranja, acelerador inativo (abaixo de 31)
- Soma = 31 → faixa Amarela, acelerador inativo
- Soma = 47 → faixa Amarela, acelerador inativo (abaixo de 48)
- Soma = 48 → faixa Verde, acelerador **ativo** ← caso crítico
- Soma = 64 → faixa Verde, acelerador ativo (abaixo de 65)
- Soma = 65 → faixa Púrpura, acelerador ativo
- Soma = 200 → faixa Púrpura, acelerador ativo (sem teto superior)

**`src/lib/calcularGerente.test.js`** — testa a lógica do gerente:
- Atingimento ponderado C/Fixa: Pós=70%, Ctrl=103%, FTTH=83% → ponderado ≈ 84,8% → faixa Intermediário → acelerador inativo
- Atingimento ponderado ≥ 100% → acelerador ativo → subtotalComAce > subtotalSemAce
- FTTH truncado em 130% → ponderado não ultrapassa 130% por esse indicador
- tipoArea = "sem_fibra" → FTTH ignorado, pesos Pós/Ctrl = 50% cada
- Faixa PPL: ating=0.849 → "intermediario" (20%); ating=0.85 → "intermediario"; ating=0.899 → "intermediario"; ating=0.90 → "bom"
- totalSemAce = salarioBase + rvTotalSemAce (verificar com os valores do exemplo: R$3.500 + R$1.618 = R$5.118)
- Película sem acelerador → mesmo valor independente do aceleradorAtivo

---

## 9. Formato de Saída do CSV de Modelo

Gerar um botão "Baixar modelo CSV" que exporta um arquivo com as colunas esperadas e uma linha de exemplo preenchida com valores fictícios para guiar o usuário.

---

## 10. O que NÃO implementar nesta versão

- Novo sistema de autenticação ou login — **usar o `AuthContext` existente**
- Novas rotas de API no `api-helorite` — toda lógica é client-side
- Novo `vite.config`, `tailwind.config` ou `package.json` — herdar do projeto
- Novo sistema de RBAC — **usar `canAccessFeature()` e `accessControl.ts` existentes**
- Múltiplos consultores simultâneos na mesma tela
- Histórico de simulações persistido
- Comparativo com modelo anterior (Lojas v1)
- PWA ou modo offline

---

## 11. Ordem de Implementação Recomendada

1. Abrir o repositório `centrao-business` e confirmar estrutura de `src/config/accessControl.ts`, `src/contexts/AuthContext.tsx`, `src/services/authService.ts`
2. Editar `accessControl.ts` — adicionar `'simulador_comissionamento_lojas'`
3. Criar `src/lib/simulador/tipos.ts` — interfaces TypeScript (ver Seção 2.6)
4. Implementar `calcularFaixaGeral.ts` com testes (`calcularFaixaGeral.test.ts`)
5. Implementar `calcularComissao.ts` com testes (`calcularComissao.test.ts`) — consultor
6. Implementar `calcularGerente.ts` com testes (`calcularGerente.test.ts`) — inclui `calcularAtingimentoPonderado()`
7. Criar `src/pages/SimuladorComissionamento/index.tsx` — guard via `canAccessFeature()`, inferência de cargo pelo `useAuth()`
8. Implementar `ConsultorView.tsx` + componentes (`FormularioConsultor.tsx`, `CardFaixaGeral.tsx`, `ResultadoConsultor.tsx`)
9. Implementar `GerenteView.tsx` + componentes (`FormularioGerente.tsx`, `CardAtingimentoPPL.tsx`, `ResultadoGerente.tsx`)
10. Implementar `UploadArquivo.tsx` (verificar se `xlsx`/SheetJS já é dependência — instalar se não for)
11. Implementar `TabelaFaixas.tsx` (colapsável — faixas consultor + tabela PPL gerente)
12. Adicionar `<ProtectedRoute feature="simulador_comissionamento_lojas">` no router principal
13. Executar `npm run build` — resolver erros de tipagem TypeScript
14. Testar manualmente:
    - Usuário sem feature → redirecionado corretamente
    - `gerente_loja` → abre na tab Gerente; `vendedor` → abre na tab Consultor
    - Casos de borda: Consultor soma 47 vs 48; Gerente ponderado 99,9% vs 100,0%

---

## 12. Entrega

- Todos os arquivos dentro do repositório `centrao-business/src/` nas pastas descritas na Seção 2.3
- Edição de `src/config/accessControl.ts` com a nova feature `simulador_comissionamento_lojas`
- Edição do arquivo de rotas principal para incluir a `<ProtectedRoute>` do simulador
- SQL de seed para `role_features` (conforme Seção 2.2) — entregar como arquivo ou comentário no PR
- Rodar `npm run build` dentro do `centrao-business` e confirmar que o build TypeScript passa sem erros
- Testar manualmente com usuário de role `gerente_loja` (tab Gerente como default) e `vendedor` (tab Consultor como default)

---

## Referências de Negócio

- Modelo documentado em: `Modelo Comissionamento Lojas v2.md` (mesmo diretório deste arquivo)
- Modelo anterior (para comparação): `Proposta Vivo - Lojas.md`
