# Simulador de Comissionamento Lojas v2 — Centrão Digital

Aplicação web desenvolvida em React + TypeScript + Vite para simular o novo modelo de comissionamento individual de consultores de lojas Vivo.

## 🚀 Tecnologias
- **React 18 + TypeScript** (Vite)
- **Tailwind CSS** (Estilização)
- **Lucide React** (Ícones)
- **SheetJS (XLSX)** (Processamento de arquivos)

## 📋 Funcionalidades
- **Cálculo em Tempo Real**: Os resultados são atualizados conforme os dados são alterados no formulário.
- **Entrada Manual**: Campos organizados por blocos de remuneração (Serviços, Produtos/SVAs).
- **Modo Gerente**: Simulação específica com produtividade ponderada, faixa PPL e totais sem/com acelerador.
- **Importação de Arquivo**: Suporte para `.csv` e `.xlsx` com mapeamento inteligente de colunas.
- **Baixar Modelo**: Função para exportar o arquivo base com as colunas esperadas pelo sistema.
- **Visualização por Faixas**: Badges coloridos indicando o nível atingido (Laranja, Amarela, Verde, Púrpura).
- **Faixa Geral por Movimentos**: Soma automática de Fibra + Controle + Pós Puro com classificação Laranja/Amarela/Verde/Púrpura.
- **Aceleradores**: Aplicação automática das taxas aceleradas quando a soma de movimentos for >= 48.

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

## 🌐 Publicação no GitHub Pages
- O projeto está configurado para deploy automático via GitHub Actions (`.github/workflows/deploy-pages.yml`).
- A cada push na branch `main`, o workflow gera o build e publica em **Settings > Pages**.
- O `base` do Vite é ajustado automaticamente para o nome do repositório durante o deploy, mantendo `/` no desenvolvimento local.

## 🧪 Testes
Para validar a lógica de cálculo puramente via terminal:
```bash
npm run test
```

---
*Documentação Interna — Centrão Digital*
