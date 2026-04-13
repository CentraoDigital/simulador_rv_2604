import { calcularFaixaGeral } from './calcularFaixaGeral.ts'

function test() {
  console.log('Iniciando testes de faixa geral...')

  const r0 = calcularFaixaGeral(0, 0, 0)
  console.assert(r0.somaMovimentos === 0, 'Soma 0 inválida')
  console.assert(r0.faixa === 'Laranja', 'Soma 0 deveria ser Laranja')
  console.assert(r0.aceleradorAtivo === false, 'Soma 0 não deveria ativar acelerador')

  const r30 = calcularFaixaGeral(10, 10, 10)
  console.assert(r30.faixa === 'Laranja', 'Soma 30 deveria ser Laranja')
  console.assert(r30.aceleradorAtivo === false, 'Soma 30 não deveria ativar acelerador')

  const r31 = calcularFaixaGeral(10, 10, 11)
  console.assert(r31.faixa === 'Amarela', 'Soma 31 deveria ser Amarela')
  console.assert(r31.aceleradorAtivo === false, 'Soma 31 não deveria ativar acelerador')

  const r47 = calcularFaixaGeral(15, 16, 16)
  console.assert(r47.faixa === 'Amarela', 'Soma 47 deveria ser Amarela')
  console.assert(r47.aceleradorAtivo === false, 'Soma 47 não deveria ativar acelerador')

  const r48 = calcularFaixaGeral(16, 16, 16)
  console.assert(r48.faixa === 'Verde', 'Soma 48 deveria ser Verde')
  console.assert(r48.aceleradorAtivo === true, 'Soma 48 deveria ativar acelerador')

  const r64 = calcularFaixaGeral(20, 22, 22)
  console.assert(r64.faixa === 'Verde', 'Soma 64 deveria ser Verde')
  console.assert(r64.aceleradorAtivo === true, 'Soma 64 deveria ativar acelerador')

  const r65 = calcularFaixaGeral(20, 22, 23)
  console.assert(r65.faixa === 'Purpura', 'Soma 65 deveria ser Púrpura')
  console.assert(r65.aceleradorAtivo === true, 'Soma 65 deveria ativar acelerador')

  const r200 = calcularFaixaGeral(100, 50, 50)
  console.assert(r200.faixa === 'Purpura', 'Soma 200 deveria ser Púrpura')
  console.assert(r200.aceleradorAtivo === true, 'Soma 200 deveria ativar acelerador')

  console.log('Todos os testes de faixa geral passaram com sucesso!')
}

test()
