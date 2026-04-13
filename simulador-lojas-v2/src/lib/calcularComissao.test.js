import { calcularComissao } from './calcularComissao.js'

function assertClose(actual, expected, message) {
  const epsilon = 0.000001
  console.assert(Math.abs(actual - expected) < epsilon, message)
}

function dadosProdutividadeAtiva() {
  return {
    tipoArea: 'com_fibra',
    metaPosPuro: 0.4,
    resultadoPosPuro: 0.4,
    metaControle: 0.8,
    resultadoControle: 0.8,
    metaFTTH: 0.3,
    resultadoFTTH: 0.3,
  }
}

function dadosProdutividadeInativa() {
  return {
    tipoArea: 'sem_fibra',
    metaPosPuro: 1,
    resultadoPosPuro: 1,
    metaControle: 1,
    resultadoControle: 0.9,
  }
}

function test() {
  console.log('Iniciando testes de cálculo...')

  const res0 = calcularComissao({})
  console.assert(res0.totalGeral === 0, 'Erro: Total Geral deveria ser 0')
  console.assert(res0.bloco1.subtotal === 0, 'Erro: Bloco 1 deveria ser 0')
  console.assert(res0.bloco2.subtotal === 0, 'Erro: Bloco 2 deveria ser 0')

  const resF5 = calcularComissao({ volumeFibra: 5 })
  console.assert(resF5.bloco1.fibra.valorUnitario === 20, 'Fibra 5: deveria ser R$ 20')
  const resF6 = calcularComissao({ volumeFibra: 6 })
  console.assert(resF6.bloco1.fibra.valorUnitario === 40, 'Fibra 6: deveria ser R$ 40')
  const resF10 = calcularComissao({ volumeFibra: 10 })
  console.assert(resF10.bloco1.fibra.valorUnitario === 40, 'Fibra 10: deveria permanecer na faixa Amarela')
  const resF15 = calcularComissao({ volumeFibra: 15 })
  console.assert(resF15.bloco1.fibra.valorUnitario === 60, 'Fibra 15: deveria ser R$ 60')
  const resF16 = calcularComissao({ volumeFibra: 16 })
  console.assert(resF16.bloco1.fibra.valorUnitario === 80, 'Fibra 16: deveria ser R$ 80')

  const dadosB2 = { receitaSmartphone: 1000, qtdValeSaude: 10 }
  const resBase = calcularComissao({ ...dadosB2, ...dadosProdutividadeInativa() })
  const resAcelerado = calcularComissao({ ...dadosB2, ...dadosProdutividadeAtiva() })
  assertClose(resBase.bloco2.smartphone.total, 6, 'Erro Smartphone Base')
  assertClose(resAcelerado.bloco2.smartphone.total, 15, 'Erro Smartphone Acelerado')
  assertClose(resBase.bloco2.valeSaude.total, 50, 'Erro Vale Saúde Base')
  assertClose(resAcelerado.bloco2.valeSaude.total, 100, 'Erro Vale Saúde Acelerado')

  const resEasyBase = calcularComissao({ qtdEasyAnual: 1, ...dadosProdutividadeInativa() })
  const resEasyAcelerado = calcularComissao({ qtdEasyAnual: 1, ...dadosProdutividadeAtiva() })
  console.assert(resEasyBase.bloco2.easyAnual.total === 25, 'Easy Anual erro base')
  console.assert(resEasyAcelerado.bloco2.easyAnual.total === 25, 'Easy Anual erro acelerado')

  const resPeliculaBase = calcularComissao({ qtdPelicula: 2, ...dadosProdutividadeInativa() })
  const resPeliculaAcelerado = calcularComissao({ qtdPelicula: 2, ...dadosProdutividadeAtiva() })
  console.assert(resPeliculaBase.bloco2.pelicula.total === 20, 'Película erro base')
  console.assert(resPeliculaAcelerado.bloco2.pelicula.total === 20, 'Película erro acelerado')

  console.log('Todos os testes de comissão passaram com sucesso!')
}

test()
