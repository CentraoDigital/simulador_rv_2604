import { calcularGerente } from './calcularGerente.ts'

function assertClose(actual: number, expected: number, message: string) {
  const epsilon = 0.000001
  console.assert(Math.abs(actual - expected) < epsilon, message)
}

function baseInput() {
  return {
    receitaSmartphone: 10000,
    receitaEletronicos: 5000,
    receitaEssenciais: 2000,
    receitaSeguros: 1000,
    qtdServicosDigitais: 10,
    qtdNovosNegocios: 4,
    qtdPelicula: 3,
    tipoArea: 'com_fibra',
    metaPosPuro: 1,
    resultadoPosPuro: 1,
    metaControle: 1,
    resultadoControle: 1,
    metaFTTH: 1,
    resultadoFTTH: 1,
    salarioBase: 3500,
    valorBaseCargoColetivo: 3500,
  }
}

function test() {
  console.log('Iniciando testes de gerente...')

  const casoIntermediario = calcularGerente({
    ...baseInput(),
    metaPosPuro: 1,
    resultadoPosPuro: 0.7,
    metaControle: 1,
    resultadoControle: 1.03,
    metaFTTH: 1,
    resultadoFTTH: 0.83,
  })
  assertClose(casoIntermediario.metaLoja.atingimentoPonderado, 0.8475, 'Ponderado deveria ser 84,75%')
  console.assert(casoIntermediario.metaLoja.faixaPPL === 'intermediario', 'Faixa PPL deveria ser intermediario')
  assertClose(casoIntermediario.metaLoja.pctCargoColetivo, 0.2, 'Pct cargo coletivo deveria ser 20%')
  assertClose(casoIntermediario.metaLoja.rvMetaLoja, 700, 'RV meta loja deveria ser 700')
  console.assert(casoIntermediario.metaLoja.aceleradorAtivo === false, 'Acelerador deveria estar inativo')

  const casoAtivo = calcularGerente(baseInput())
  console.assert(casoAtivo.metaLoja.aceleradorAtivo === true, 'Acelerador deveria estar ativo com 100%')
  console.assert(
    casoAtivo.blocoSVAs.subtotalComAce > casoAtivo.blocoSVAs.subtotalSemAce,
    'Subtotal com acelerador deveria ser maior',
  )

  const casoFtthTruncado = calcularGerente({
    ...baseInput(),
    metaFTTH: 1,
    resultadoFTTH: 2,
  })
  assertClose(casoFtthTruncado.metaLoja.detalhes.ftth.atingCap, 1.3, 'FTTH deveria truncar em 130%')

  const casoSemFibra = calcularGerente({
    ...baseInput(),
    tipoArea: 'sem_fibra',
    metaFTTH: 1,
    resultadoFTTH: 10,
  })
  assertClose(casoSemFibra.metaLoja.detalhes.ftth.peso, 0, 'Peso FTTH deveria ser 0 em sem fibra')
  assertClose(casoSemFibra.metaLoja.detalhes.ftth.contrib, 0, 'Contribuição FTTH deveria ser 0 em sem fibra')

  const faixa0849 = calcularGerente({
    ...baseInput(),
    metaPosPuro: 1,
    resultadoPosPuro: 0.849,
    metaControle: 1,
    resultadoControle: 0.849,
    metaFTTH: 1,
    resultadoFTTH: 0.849,
  })
  console.assert(faixa0849.metaLoja.faixaPPL === 'intermediario', '0.849 deveria cair em intermediario')

  const faixa090 = calcularGerente({
    ...baseInput(),
    metaPosPuro: 1,
    resultadoPosPuro: 0.9,
    metaControle: 1,
    resultadoControle: 0.9,
    metaFTTH: 1,
    resultadoFTTH: 0.9,
  })
  console.assert(faixa090.metaLoja.faixaPPL === 'bom', '0.90 deveria cair em bom')

  const peliculaSemAce = calcularGerente(baseInput())
  assertClose(
    peliculaSemAce.blocoSVAs.pelicula.totalSemAce,
    peliculaSemAce.blocoSVAs.pelicula.totalComAce,
    'Película não deveria mudar com acelerador',
  )

  console.log('Todos os testes de gerente passaram com sucesso!')
}

test()
