const FAIXAS_GERAIS = [
  { faixa: 'Purpura', min: 65, aceleradorAtivo: true },
  { faixa: 'Verde', min: 48, aceleradorAtivo: true },
  { faixa: 'Amarela', min: 31, aceleradorAtivo: false },
  { faixa: 'Laranja', min: 0, aceleradorAtivo: false },
]

function toInteiroPositivo(valor) {
  const numero = Number(valor)
  if (!Number.isFinite(numero) || numero < 0) {
    return 0
  }
  return Math.floor(numero)
}

export function calcularFaixaGeral(volumeFibra, volumeControle, volumePosPuro) {
  const soma = toInteiroPositivo(volumeFibra) + toInteiroPositivo(volumeControle) + toInteiroPositivo(volumePosPuro)
  const faixaAtual = FAIXAS_GERAIS.find((faixa) => soma >= faixa.min) ?? FAIXAS_GERAIS[FAIXAS_GERAIS.length - 1]

  return {
    somaMovimentos: soma,
    faixa: faixaAtual.faixa,
    aceleradorAtivo: faixaAtual.aceleradorAtivo,
  }
}
