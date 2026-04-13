import { useState, useMemo } from 'react'
import { calcularComissao } from '../lib/calcularComissao'
import { calcularGerente } from '../lib/calcularGerente'

const initialConsultor = {
  volumeFibra: 0,
  volumeControle: 0,
  volumePosPuro: 0,
  receitaSmartphone: 0,
  receitaEletronicos: 0,
  receitaEssenciais: 0,
  receitaSeguros: 0,
  qtdServicosDigitais: 0,
  qtdEasyAnual: 0,
  qtdPelicula: 0,
  qtdValeSaude: 0,
}

const initialGerente = {
  receitaSmartphone: 0,
  receitaEletronicos: 0,
  receitaEssenciais: 0,
  receitaSeguros: 0,
  qtdServicosDigitais: 0,
  qtdNovosNegocios: 0,
  qtdPelicula: 0,
  tipoArea: 'com_fibra',
  metaPosPuro: 0,
  resultadoPosPuro: 0,
  metaControle: 0,
  resultadoControle: 0,
  metaFTTH: 0,
  resultadoFTTH: 0,
  salarioBase: 3500,
  valorBaseCargoColetivo: 3500,
}

export function useSimulador() {
  const [dadosConsultor, setDadosConsultor] = useState(initialConsultor)
  const [dadosGerente, setDadosGerente] = useState(initialGerente)

  const handleChangeConsultor = (field, value) => {
    setDadosConsultor((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleChangeGerente = (field, value) => {
    setDadosGerente((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const limparConsultor = () => setDadosConsultor(initialConsultor)
  const limparGerente = () => setDadosGerente(initialGerente)

  const resultadoConsultor = useMemo(() => calcularComissao(dadosConsultor), [dadosConsultor])
  const resultadoGerente = useMemo(() => calcularGerente(dadosGerente), [dadosGerente])

  return {
    dadosConsultor,
    dadosGerente,
    handleChangeConsultor,
    handleChangeGerente,
    limparConsultor,
    limparGerente,
    resultadoConsultor,
    resultadoGerente,
    setDadosConsultor,
    setDadosGerente,
  }
}
