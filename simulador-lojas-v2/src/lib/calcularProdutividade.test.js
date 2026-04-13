import { calcularProdutividade } from './calcularProdutividade.js'

function assertClose(actual, expected, message) {
  const epsilon = 0.000001
  console.assert(Math.abs(actual - expected) < epsilon, message)
}

function test() {
  console.log('Iniciando testes de produtividade...')

  const cFixa = calcularProdutividade({
    tipoArea: 'com_fibra',
    metaPosPuro: 0.4,
    resultadoPosPuro: 0.4,
    metaControle: 0.8,
    resultadoControle: 0.752,
    metaFTTH: 0.3,
    resultadoFTTH: 0.399,
  })
  assertClose(cFixa.atingimentoPonderado, 1.135, 'C/Fibra deveria resultar em 113,5%')
  console.assert(cFixa.aceleradorAtivo === true, 'C/Fibra deveria ativar acelerador')

  const sFixa = calcularProdutividade({
    tipoArea: 'sem_fibra',
    metaPosPuro: 1,
    resultadoPosPuro: 1,
    metaControle: 1,
    resultadoControle: 0.94,
    metaFTTH: 1,
    resultadoFTTH: 10,
  })
  assertClose(sFixa.atingimentoPonderado, 0.97, 'S/Fibra deveria resultar em 97%')
  console.assert(sFixa.aceleradorAtivo === false, 'S/Fibra não deveria ativar acelerador')
  assertClose(sFixa.detalhes.ftth.peso, 0, 'Peso de FTTH deveria ser 0 na área sem fibra')
  assertClose(sFixa.detalhes.ftth.contrib, 0, 'Contribuição de FTTH deveria ser 0 na área sem fibra')

  const ftthSemTruncar = calcularProdutividade({
    tipoArea: 'com_fibra',
    metaPosPuro: 1,
    resultadoPosPuro: 1,
    metaControle: 1,
    resultadoControle: 1,
    metaFTTH: 1,
    resultadoFTTH: 1.2,
  })
  assertClose(ftthSemTruncar.detalhes.ftth.atingCap, 1.2, 'FTTH < 130% não deve truncar')

  const ftthComTruncar = calcularProdutividade({
    tipoArea: 'com_fibra',
    metaPosPuro: 1,
    resultadoPosPuro: 1,
    metaControle: 1,
    resultadoControle: 1,
    metaFTTH: 1,
    resultadoFTTH: 2,
  })
  assertClose(ftthComTruncar.detalhes.ftth.atingCap, 1.3, 'FTTH > 130% deve truncar em 130%')

  const metaZero = calcularProdutividade({
    tipoArea: 'com_fibra',
    metaPosPuro: 0,
    resultadoPosPuro: 10,
    metaControle: 0,
    resultadoControle: 10,
    metaFTTH: 0,
    resultadoFTTH: 10,
  })
  assertClose(metaZero.detalhes.posPuro.atingBruto, 0, 'Meta zero deve gerar atingimento zero (Pos Puro)')
  assertClose(metaZero.detalhes.controle.atingBruto, 0, 'Meta zero deve gerar atingimento zero (Controle)')
  assertClose(metaZero.detalhes.ftth.atingBruto, 0, 'Meta zero deve gerar atingimento zero (FTTH)')

  console.log('Todos os testes de produtividade passaram com sucesso!')
}

test()
