# Simulador de Comissionamento Lojas v2

Esse projeto consiste na criação de uma aplicação web com React, Vite, Tailwind CSS e componentes no estilo shadcn/ui. O objetivo é simular o novo modelo de comissionamento individual de consultores de lojas Vivo (Modelo Lojas v2). O processamento será estritamente client-side, permitindo entrada manual e upload de planilhas via `SheetJS`.

Destaque principal para a criação do algoritmo estrito de cálculos e a interface dinâmica descrita na documentação.

## User Review Required

O planejamento abaixo detalha as etapas baseadas no SPEC do documento fornecido: `docs/SPEC-simulador-comissionamento-lojas-v2.md`. Favor aprovar este plano para começarmos imediatamente!

> [!NOTE]
> Todo o projeto ficará restrito à pasta `./simulador-lojas-v2`, utilizando apenas Client-Side logic, sem integração com banco de dados ou backend, conforme solicitado na spec.

## Proposed Changes

### 1. Scaffold do Projeto & UI Base

- Iniciaremos criando o front-end via `vite` e instalando as dependências de roteamento, UI e Excel listadas na spec: `npm create vite@latest simulador-lojas-v2 -- --template react`, `tailwindcss`, `lucide-react`, `xlsx`.
- Criação/Configuração do `tailwind.config.js` e estrutura de estilos base (`index.css`).
- Serão criados na mão os componentes da shadcn/ui em `src/components/ui/` (Button, Card, Input, Label, Tabs, Badge, Separator) sem usar a CLI.

#### [NEW] simulador-lojas-v2/package.json
#### [NEW] simulador-lojas-v2/tailwind.config.js
#### [NEW] simulador-lojas-v2/postcss.config.js
#### [NEW] simulador-lojas-v2/src/components/ui/*.jsx

---

### 2. Lógica de Cálculo de Comissões e Testes

- O arquivo concentrará de forma determinística (pura) o cálculo do **Bloco 1 (Serviços)** e **Bloco 2 (Produtos/SVAs/Seguros)** e os gatilhos de aceleração a partir do `metaAtingida`. 
- Geração de testes unitários sem framework, contendo verificações de casos extremos usando asserções base do Node.js/JS.

#### [NEW] simulador-lojas-v2/src/lib/calcularComissao.js
#### [NEW] simulador-lojas-v2/src/lib/calcularComissao.test.js

---

### 3. Gerenciamento de Estado (Custom Hook)

- Um Custom Hook que reterá o estado compartilhado entre os formulários e os resultados dinâmicos em tempo real, calculando a cada redenderização através do `calcularComissao`.

#### [NEW] simulador-lojas-v2/src/hooks/useSimulador.js

---

### 4. Componentes UI do Simulador

- **FormularioConsultor.jsx**: Contempla a grade de inputs controlados (ativos, receitas parciais) e a confirmação de Meta (Toggle/Switch).
- **UploadArquivo.jsx**: Ficará responsável pelo _drag n drop_ e upload de CSV/Excel iterando a biblioteca _SheetJS_ (xlsx), parseando as colunas e injetando as variáveis no global state. Opção p/ "Baixar modelo CSV".
- **ResultadoComissao.jsx**: Panel resumindo totais (Bloco1 x Bloco 2 = Total Geral) com badges identificadoras.
- **TabelaFaixas.jsx**: Componente com os thresholds (Gatilhos x Valores) referenciados na spec de forma colapsável.

#### [NEW] simulador-lojas-v2/src/components/FormularioConsultor.jsx
#### [NEW] simulador-lojas-v2/src/components/UploadArquivo.jsx
#### [NEW] simulador-lojas-v2/src/components/ResultadoComissao.jsx
#### [NEW] simulador-lojas-v2/src/components/TabelaFaixas.jsx

---

### 5. Aplicação Principal e Fechamento

Incorpar esses blocos diretamente em `App.jsx`, alinhando os layouts (as duas abas "Formulário Manual | Importar Arquivo" num header central - Cores da marca do Centrão Digital) finalizando com design responsivo e validações limpas.

#### [MODIFY] simulador-lojas-v2/src/App.jsx

## Open Questions

Não há dúvidas neste momento. A documentação (SPEC) está completa e auto-explicativa, além de definir claramente testes requeridos e os gatilhos matemáticos. Prossiga aprovando este plano para eu disparar a criação do projeto Vite e o resto das pastas conforme requerido.

## Verification Plan

### Automated Tests
- Execução do simulador via linha de comando rodando o arquivo `calcularComissao.test.js` para certificar todas as assertions criadas.

### Manual Verification
- Faremos o comando `npm run build` para garantir que a build termine limpa.
- Eu rodarei o servidor dev `npm run dev` para assegurar que a importação do CSV com a lib SheetJS está operacional bem como as mudanças ao vivo que o usuário aplicar ao formulário.
