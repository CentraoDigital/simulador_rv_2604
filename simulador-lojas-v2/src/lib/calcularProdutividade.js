const TETO_ATINGIMENTO = 1.3

export const PESOS = {
  com_fibra: { posPuro: 0.25, controle: 0.25, ftth: 0.5 },
  sem_fibra: { posPuro: 0.5, controle: 0.5, ftth: 0.0 },
}

function toNumero(valor) {
  const numero = Number(valor)
  if (!Number.isFinite(numero) || numero < 0) {
    return 0
  }
  return numero
}

function calcularAtingimento(meta, resultado) {
  const metaNumero = toNumero(meta)
  const resultadoNumero = toNumero(resultado)
  if (metaNumero <= 0) {
    return 0
  }
  return resultadoNumero / metaNumero
}

function montarDetalhe(atingBruto, peso) {
  const atingCap = Math.min(atingBruto, TETO_ATINGIMENTO)
  return {
    atingBruto,
    atingCap,
    peso,
    contrib: atingCap * peso,
  }
}

export function normalizarTipoArea(tipoArea) {
  if (tipoArea === 'sem_fibra') return 'sem_fibra'
  return 'com_fibra'
}

export function calcularProdutividade({
  tipoArea,
  metaPosPuro,
  resultadoPosPuro,
  metaControle,
  resultadoControle,
  metaFTTH,
  resultadoFTTH,
}) {
  const tipoAreaNormalizado = normalizarTipoArea(tipoArea)
  const pesos = PESOS[tipoAreaNormalizado]

  const detalhePosPuro = montarDetalhe(calcularAtingimento(metaPosPuro, resultadoPosPuro), pesos.posPuro)
  const detalheControle = montarDetalhe(calcularAtingimento(metaControle, resultadoControle), pesos.controle)
  const detalheFTTH = montarDetalhe(calcularAtingimento(metaFTTH, resultadoFTTH), pesos.ftth)

  const atingimentoPonderado = detalhePosPuro.contrib + detalheControle.contrib + detalheFTTH.contrib

  return {
    tipoArea: tipoAreaNormalizado,
    detalhes: {
      posPuro: detalhePosPuro,
      controle: detalheControle,
      ftth: detalheFTTH,
    },
    atingimentoPonderado,
    aceleradorAtivo: atingimentoPonderado >= 1,
  }
}
