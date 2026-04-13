import { calcularProdutividade } from './calcularProdutividade.ts'

const TABELA_GERENTE = {
  smartphone: { base: 0.0013, acelerador: 0.0026, tipo: 'percentual' },
  eletronicos: { base: 0.0018, acelerador: 0.0036, tipo: 'percentual' },
  essenciais: { base: 0.004, acelerador: 0.008, tipo: 'percentual' },
  seguros: { base: 0.2, acelerador: 0.4, tipo: 'percentual' },
  servicosDigitais: { base: 2, acelerador: 5, tipo: 'fixo' },
  novosNegocios: { base: 5, acelerador: 10, tipo: 'fixo' },
  pelicula: { base: 3, acelerador: null, tipo: 'fixo' },
}

const FAIXAS_PPL = [
  { nome: 'super', minAting: 1.05, pct: 1.0 },
  { nome: 'top', minAting: 1.0, pct: 0.8 },
  { nome: 'otimo', minAting: 0.95, pct: 0.6 },
  { nome: 'bom', minAting: 0.9, pct: 0.4 },
  { nome: 'intermediario', minAting: 0.85, pct: 0.2 },
  { nome: 'oportunidade', minAting: 0, pct: 0.0 },
]

function toNumero(valor: unknown) {
  const numero = Number(valor)
  if (!Number.isFinite(numero) || numero < 0) return 0
  return numero
}

function toInteiro(valor: unknown) {
  return Math.floor(toNumero(valor))
}

function getFaixaPPL(atingimentoPonderado: number) {
  const atingimentoNormalizado = Math.round(atingimentoPonderado * 100) / 100
  return FAIXAS_PPL.find((faixa) => atingimentoNormalizado >= faixa.minAting) ?? FAIXAS_PPL[FAIXAS_PPL.length - 1]
}

function calcPercentual(receita: number, base: number, acelerador: number | null) {
  const taxaComAce = acelerador ?? base
  return {
    receita,
    taxaBase: base,
    taxaAcelerador: taxaComAce,
    totalSemAce: receita * base,
    totalComAce: receita * taxaComAce,
  }
}

function calcFixo(quantidade: number, base: number, acelerador: number | null) {
  const valorComAce = acelerador ?? base
  return {
    quantidade,
    valorBase: base,
    valorAcelerador: valorComAce,
    totalSemAce: quantidade * base,
    totalComAce: quantidade * valorComAce,
  }
}

export function calcularGerente(dados: any) {
  const produtividade = calcularProdutividade({
    tipoArea: dados.tipoArea,
    metaPosPuro: dados.metaPosPuro,
    resultadoPosPuro: dados.resultadoPosPuro,
    metaControle: dados.metaControle,
    resultadoControle: dados.resultadoControle,
    metaFTTH: dados.metaFTTH,
    resultadoFTTH: dados.resultadoFTTH,
  })

  const faixaPPL = getFaixaPPL(produtividade.atingimentoPonderado)
  const salarioBase = toNumero(dados.salarioBase)
  const valorBaseCargoColetivo = toNumero(dados.valorBaseCargoColetivo)
  const rvMetaLoja = valorBaseCargoColetivo * faixaPPL.pct

  const blocoSVAs = {
    smartphone: calcPercentual(toNumero(dados.receitaSmartphone), TABELA_GERENTE.smartphone.base, TABELA_GERENTE.smartphone.acelerador),
    eletronicos: calcPercentual(toNumero(dados.receitaEletronicos), TABELA_GERENTE.eletronicos.base, TABELA_GERENTE.eletronicos.acelerador),
    essenciais: calcPercentual(toNumero(dados.receitaEssenciais), TABELA_GERENTE.essenciais.base, TABELA_GERENTE.essenciais.acelerador),
    seguros: calcPercentual(toNumero(dados.receitaSeguros), TABELA_GERENTE.seguros.base, TABELA_GERENTE.seguros.acelerador),
    servicosDigitais: calcFixo(toInteiro(dados.qtdServicosDigitais), TABELA_GERENTE.servicosDigitais.base, TABELA_GERENTE.servicosDigitais.acelerador),
    novosNegocios: calcFixo(toInteiro(dados.qtdNovosNegocios), TABELA_GERENTE.novosNegocios.base, TABELA_GERENTE.novosNegocios.acelerador),
    pelicula: calcFixo(toInteiro(dados.qtdPelicula), TABELA_GERENTE.pelicula.base, TABELA_GERENTE.pelicula.acelerador),
  }

  const subtotalSemAce = Object.values(blocoSVAs).reduce((acc, item: any) => acc + item.totalSemAce, 0)
  const subtotalComAce = Object.values(blocoSVAs).reduce((acc, item: any) => acc + item.totalComAce, 0)
  const rvTotalSemAce = subtotalSemAce + rvMetaLoja
  const rvTotalComAce = subtotalComAce + rvMetaLoja

  return {
    blocoSVAs: {
      ...blocoSVAs,
      subtotalSemAce,
      subtotalComAce,
    },
    metaLoja: {
      tipoArea: produtividade.tipoArea,
      detalhes: produtividade.detalhes,
      atingimentoPonderado: produtividade.atingimentoPonderado,
      faixaPPL: faixaPPL.nome,
      pctCargoColetivo: faixaPPL.pct,
      rvMetaLoja,
      aceleradorAtivo: produtividade.aceleradorAtivo,
    },
    salarioBase,
    rvTotalSemAce,
    rvTotalComAce,
    totalSemAce: salarioBase + rvTotalSemAce,
    totalComAce: salarioBase + rvTotalComAce,
  }
}
