import { useState, useMemo } from 'react'
import { calcularComissao } from '../lib/calcularComissao'

const initialState = {
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
  tipoArea: 'com_fibra',
  metaPosPuro: 0,
  resultadoPosPuro: 0,
  metaControle: 0,
  resultadoControle: 0,
  metaFTTH: 0,
  resultadoFTTH: 0,
}

export function useSimulador() {
  const [dados, setDados] = useState(initialState)

  const handleChange = (field, value) => {
    setDados(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const limpar = () => setDados(initialState)

  const resultado = useMemo(() => {
    return calcularComissao(dados)
  }, [dados])

  return {
    dados,
    handleChange,
    limpar,
    resultado,
    setDados,
  }
}
