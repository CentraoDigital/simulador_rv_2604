import React, { useRef, useState } from 'react'
import { Card, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { FileUp, FileText, Download, AlertCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

const COLUNAS_OBRIGATORIAS = [
  'volume_fibra',
  'volume_controle',
  'volume_pos_puro',
  'receita_smartphone',
  'receita_eletronicos',
  'receita_essenciais',
  'receita_seguros',
  'qtd_servicos_digitais',
  'qtd_easy_anual',
  'qtd_pelicula',
  'qtd_vale_saude',
]

const ALIASES = {
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

const UploadArquivo = ({ onImport }) => {
  const fileInputRef = useRef(null)
  const [error, setError] = useState(null)

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
        for (const colunaObrigatoria of COLUNAS_OBRIGATORIAS) {
          const aliasesNormalizados = [colunaObrigatoria, ...(ALIASES[colunaObrigatoria] ?? [])].map(normalizarChave)
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

        for (const campo of COLUNAS_OBRIGATORIAS) {
          const colunaReal = colunaRealPorCampo[campo]
          const valor = rawData[colunaReal]
          processedData[campo] = normalizarNumero(valor)
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
    const modelo = [{
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
    }]
    
    const ws = XLSX.utils.json_to_sheet(modelo)
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'modelo_simulador_v2.csv'
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
            <p className="text-sm text-muted-foreground">O arquivo deve conter todas as colunas obrigatórias do modelo.</p>
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
