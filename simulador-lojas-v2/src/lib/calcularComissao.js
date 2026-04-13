import { calcularProdutividade } from './calcularProdutividade.js'

const TABELAS_BLOCO1 = {
  fibra: [
    { min: 0, max: 5, valor: 20, nome: 'Laranja' },
    { min: 6, max: 10, valor: 40, nome: 'Amarela' },
    { min: 10, max: 15, valor: 60, nome: 'Verde' },
    { min: 15, max: null, valor: 80, nome: 'Purpura' },
  ],
  controle: [
    { min: 0, max: 20, valor: 10, nome: 'Laranja' },
    { min: 20, max: 27, valor: 20, nome: 'Amarela' },
    { min: 27, max: 34, valor: 30, nome: 'Verde' },
    { min: 34, max: null, valor: 40, nome: 'Purpura' },
  ],
  posPuro: [
    { min: 0, max: 5, valor: 10, nome: 'Laranja' },
    { min: 5, max: 10, valor: 20, nome: 'Amarela' },
    { min: 10, max: 15, valor: 30, nome: 'Verde' },
    { min: 15, max: null, valor: 40, nome: 'Purpura' },
  ],
}

function toNumero(valor) {
  const numero = Number(valor)
  if (!Number.isFinite(numero) || numero < 0) {
    return 0
  }
  return numero
}

function toInteiroPositivo(valor) {
  return Math.floor(toNumero(valor))
}

function getFaixa(volume, faixas) {
  for (const faixa of faixas) {
    if (volume >= faixa.min && (faixa.max === null || volume <= faixa.max)) {
      return faixa
    }
  }
  return faixas[0]
}

function calcularServico(volume, faixas) {
  const faixa = getFaixa(volume, faixas)
  return {
    volume,
    faixa: faixa.nome,
    valorUnitario: faixa.valor,
    total: volume * faixa.valor,
  }
}

function resProduto(receita, taxaBase, taxaAcelerador, aceleradorAtivo, temAcelerador) {
  const taxa = aceleradorAtivo && temAcelerador ? taxaAcelerador : taxaBase
  return {
    receita,
    taxa,
    total: receita * taxa,
  }
}

function resQtd(quantidade, valorBase, valorAcelerador, aceleradorAtivo, temAcelerador) {
  const valorUnit = aceleradorAtivo && temAcelerador ? valorAcelerador : valorBase
  return {
    quantidade,
    valorUnit,
    total: quantidade * valorUnit,
  }
}

/**
 * @param {Object} dados - Campos do formulário
 * @returns {Object} resultado com detalhamento por item e total geral
 */
export function calcularComissao(dados) {
  const produtividade = calcularProdutividade(dados)
  const { aceleradorAtivo } = produtividade

  const resFibra = calcularServico(toInteiroPositivo(dados.volumeFibra), TABELAS_BLOCO1.fibra)
  const resControle = calcularServico(toInteiroPositivo(dados.volumeControle), TABELAS_BLOCO1.controle)
  const resPosPuro = calcularServico(toInteiroPositivo(dados.volumePosPuro), TABELAS_BLOCO1.posPuro)
  const subtotalBloco1 = resFibra.total + resControle.total + resPosPuro.total

  const bloco2 = {
    smartphone: resProduto(toNumero(dados.receitaSmartphone), 0.006, 0.015, aceleradorAtivo, true),
    eletronicos: resProduto(toNumero(dados.receitaEletronicos), 0.015, 0.03, aceleradorAtivo, true),
    essenciais: resProduto(toNumero(dados.receitaEssenciais), 0.05, 0.1, aceleradorAtivo, true),
    seguros: resProduto(toNumero(dados.receitaSeguros), 0.5, 1, aceleradorAtivo, true),
    servicosDigitais: resQtd(toInteiroPositivo(dados.qtdServicosDigitais), 2, 5, aceleradorAtivo, true),
    easyAnual: resQtd(toInteiroPositivo(dados.qtdEasyAnual), 25, 25, aceleradorAtivo, false),
    pelicula: resQtd(toInteiroPositivo(dados.qtdPelicula), 10, 10, aceleradorAtivo, false),
    valeSaude: resQtd(toInteiroPositivo(dados.qtdValeSaude), 5, 10, aceleradorAtivo, true),
  }

  const subtotalBloco2 = Object.values(bloco2).reduce((acc, item) => acc + item.total, 0)

  return {
    bloco1: {
      fibra: resFibra,
      controle: resControle,
      posPuro: resPosPuro,
      subtotal: subtotalBloco1,
    },
    bloco2: {
      ...bloco2,
      subtotal: subtotalBloco2,
    },
    produtividade,
    aceleradorAtivo,
    totalGeral: subtotalBloco1 + subtotalBloco2,
  }
}
