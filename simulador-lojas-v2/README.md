# Simulador de Comissionamento Lojas v2 — Centrão Digital

Aplicação web desenvolvida em React + Vite para simular o novo modelo de comissionamento individual de consultores de lojas Vivo.

## 🚀 Tecnologias
- **React 18** (Vite)
- **Tailwind CSS** (Estilização)
- **Lucide React** (Ícones)
- **SheetJS (XLSX)** (Processamento de arquivos)

## 📋 Funcionalidades
- **Cálculo em Tempo Real**: Os resultados são atualizados conforme os dados são alterados no formulário.
- **Entrada Manual**: Campos organizados por blocos de remuneração (Serviços, Produtos/SVAs).
- **Importação de Arquivo**: Suporte para `.csv` e `.xlsx` com mapeamento inteligente de colunas.
- **Baixar Modelo**: Função para exportar o arquivo base com as colunas esperadas pelo sistema.
- **Visualização por Faixas**: Badges coloridos indicando o nível atingido (Laranja, Amarela, Verde, Púrpura).
- **Produtividade Ponderada**: Cálculo automático do atingimento com pesos por tipo de área (com/sem fibra).
- **Aceleradores**: Aplicação automática das taxas aceleradas quando o atingimento ponderado >= 100%.

## 🛠️ Como Executar

### Pré-requisitos
- Node.js instalado (v18+)

### Instalação
1. Entre na pasta do projeto:
```bash
cd simulador-lojas-v2
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

### Build para Produção
Para gerar a versão final otimizada:
```bash
npm run build
```

## 🧪 Testes
Para validar a lógica de cálculo puramente via terminal:
```bash
node src/lib/calcularComissao.test.js
node src/lib/calcularProdutividade.test.js
```

---
*Documentação Interna — Centrão Digital*
