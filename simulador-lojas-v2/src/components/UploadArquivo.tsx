import React, { useMemo, useRef, useState } from 'react'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { FileUp, FileText, Download, AlertCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

const ALIASES_CONSULTOR = {
  volume_fibra: ['volume_fibra', 'fibra', 'volume fibra'],
  volume_controle: ['volume_controle', 'controle', 'volume controle'],
  volume_pos_puro: ['volume_pos_puro', 'pos_puro', 'pos puro', 'volume pos puro'],
  receita_smartphone: ['receita_smartphone', 'smartphone', 'receita smartphone'],
  receita_eletronicos: ['receita_eletronicos', 'eletronicos', 'demais eletronicos', 'receita eletronicos'],
  receita_essenciais: ['receita_essenciais', 'essenciais', 'receita essenciais'],
  receita_seguros: ['receita_seguros', 'seguros', 'receita seguros'],
  qtd_servicos_digitais: ['qtd_servicos_digitais', 'servicos_digitais', 'servicos digitais', 'serviços digitais', 'digitais'],
  qtd_easy_anual: ['qtd_easy_anual', 'easy_anual', 'easy anual', 'easy'],
  qtd_pelicula: ['qtd_pelicula', 'pelicula', 'pelicula'],
  qtd_vale_saude: ['qtd_vale_saude', 'vale_saude', 'vale saude', 'vale saúde'],
}

const ALIASES_GERENTE = {
  receita_smartphone: ['receita_smartphone', 'smartphone', 'receita smartphone'],
  receita_eletronicos: ['receita_eletronicos', 'eletronicos', 'demais eletronicos', 'receita eletronicos'],
  receita_essenciais: ['receita_essenciais', 'essenciais', 'receita essenciais'],
  receita_seguros: ['receita_seguros', 'seguros', 'receita seguros'],
  qtd_servicos_digitais: ['qtd_servicos_digitais', 'servicos_digitais', 'servicos digitais', 'serviços digitais', 'digitais'],
  qtd_novos_negocios: ['qtd_novos_negocios', 'novos_negocios', 'novos negocios', 'novos negócios'],
  qtd_pelicula: ['qtd_pelicula', 'pelicula', 'película'],
  tipo_area: ['tipo_area', 'tipo area', 'área', 'area', 'tipo'],
  meta_pos_puro: ['meta_pos_puro', 'meta pos puro'],
  resultado_pos_puro: ['resultado_pos_puro', 'resultado pos puro'],
  meta_controle: ['meta_controle', 'meta controle'],
  resultado_controle: ['resultado_controle', 'resultado controle'],
  meta_ftth: ['meta_ftth', 'meta fibra', 'meta ftth'],
  resultado_ftth: ['resultado_ftth', 'resultado fibra', 'resultado ftth'],
  salario_base: ['salario_base', 'salario base', 'salário base'],
  valor_base_cargo_coletivo: ['valor_base_cargo_coletivo', 'base cargo coletivo', 'valor cargo coletivo'],
}

const COLUNAS_CONSULTOR = Object.keys(ALIASES_CONSULTOR)
const COLUNAS_GERENTE = Object.keys(ALIASES_GERENTE)

function normalizarTipoArea(valor) {
  const chave = normalizarChave(valor).replace(/_/g, '')
  if (['comfibra', 'comfixa', 'cfixa', 'cfibra'].includes(chave)) return 'com_fibra'
  if (['semfibra', 'semfixa', 'sfixa', 'sfibra'].includes(chave)) return 'sem_fibra'
  throw new Error(`Valor inválido para tipo_area: ${valor}`)
}

function normalizarChave(valor) {
  return String(valor ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function normalizarNumero(valor) {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : 0
  }

  const texto = String(valor ?? '').trim()
  if (!texto) {
    return 0
  }

  let normalizado = texto
  if (normalizado.includes(',') && normalizado.includes('.')) {
    normalizado = normalizado.replace(/\./g, '').replace(',', '.')
  } else if (normalizado.includes(',')) {
    normalizado = normalizado.replace(',', '.')
  }

  const numero = Number(normalizado)
  return Number.isFinite(numero) ? numero : 0
}

const MODELO_CONSULTOR = {
  volume_fibra: 10,
  volume_controle: 25,
  volume_pos_puro: 8,
  receita_smartphone: 5000,
  receita_eletronicos: 1200,
  receita_essenciais: 450,
  receita_seguros: 300,
  qtd_servicos_digitais: 5,
  qtd_easy_anual: 1,
  qtd_pelicula: 2,
  qtd_vale_saude: 1,
}

const MODELO_GERENTE = {
  receita_smartphone: 50000,
  receita_eletronicos: 18000,
  receita_essenciais: 7000,
  receita_seguros: 3500,
  qtd_servicos_digitais: 60,
  qtd_novos_negocios: 25,
  qtd_pelicula: 40,
  tipo_area: 'com_fibra',
  meta_pos_puro: 0.4,
  resultado_pos_puro: 0.35,
  meta_controle: 0.8,
  resultado_controle: 0.82,
  meta_ftth: 0.3,
  resultado_ftth: 0.28,
  salario_base: 3500,
  valor_base_cargo_coletivo: 3500,
}

const UploadArquivo = ({ onImport, mode = 'consultor' }) => {
  const fileInputRef = useRef(null)
  const [error, setError] = useState(null)
  const colunasObrigatorias = useMemo(() => (mode === 'gerente' ? COLUNAS_GERENTE : COLUNAS_CONSULTOR), [mode])
  const aliases = useMemo(() => (mode === 'gerente' ? ALIASES_GERENTE : ALIASES_CONSULTOR), [mode])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

        if (jsonData.length === 0) {
          throw new Error('O arquivo está vazio.')
        }

        const rawData = jsonData.find((row) =>
          Object.values(row).some((value) => String(value ?? '').trim() !== ''),
        )
        if (!rawData) {
          throw new Error('Nenhuma linha de dados encontrada após o cabeçalho.')
        }

        const chaveParaColunaReal = {}
        Object.keys(rawData).forEach((colunaOriginal) => {
          chaveParaColunaReal[normalizarChave(colunaOriginal)] = colunaOriginal
        })

        const colunasAusentes = []
        const colunaRealPorCampo = {}
        for (const colunaObrigatoria of colunasObrigatorias) {
          const aliasesNormalizados = [colunaObrigatoria, ...(aliases[colunaObrigatoria] ?? [])].map(normalizarChave)
          const colunaEncontrada = aliasesNormalizados.find((alias) => chaveParaColunaReal[alias] !== undefined)
          if (!colunaEncontrada) {
            colunasAusentes.push(colunaObrigatoria)
            continue
          }
          colunaRealPorCampo[colunaObrigatoria] = chaveParaColunaReal[colunaEncontrada]
        }

        if (colunasAusentes.length > 0) {
          throw new Error(`Colunas obrigatórias ausentes: ${colunasAusentes.join(', ')}`)
        }

        const processedData = {}

        for (const campo of colunasObrigatorias) {
          const colunaReal = colunaRealPorCampo[campo]
          const valor = rawData[colunaReal]
          if (campo === 'tipo_area') {
            processedData[campo] = normalizarTipoArea(valor)
          } else {
            processedData[campo] = normalizarNumero(valor)
          }
        }

        onImport(processedData)
      } catch (err) {
        console.error(err)
        setError(err.message || 'Erro ao processar o arquivo. Verifique o formato.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const baixarModelo = () => {
    const modelo = [mode === 'gerente' ? MODELO_GERENTE : MODELO_CONSULTOR]
    
    const ws = XLSX.utils.json_to_sheet(modelo)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `modelo_simulador_${mode}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <Card className="border-dashed border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <FileUp className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg">Clique para importar CSV ou Excel</p>
            <p className="text-sm text-muted-foreground">
              {mode === 'gerente'
                ? 'Importe os dados de equipe, produtividade e cargo do gerente.'
                : 'Importe os volumes e produtos do consultor.'}
            </p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".csv, .xlsx, .xls"
            onChange={handleFileUpload}
          />
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-3">
          <FileText className="text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Não possui o modelo?</p>
            <p className="text-xs text-muted-foreground">Baixe o arquivo base com as colunas corretas.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={baixarModelo}>
          <Download className="w-4 h-4 mr-2" />
          Baixar Modelo CSV
        </Button>
      </div>
    </div>
  )
}

export default UploadArquivo
