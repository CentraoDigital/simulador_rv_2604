import React from 'react'
import { useSimulador } from './hooks/useSimulador'
import FormularioConsultor from './components/FormularioConsultor'
import ResultadoComissao from './components/ResultadoComissao'
import CardFaixaGeral from './components/CardFaixaGeral'
import UploadArquivo from './components/UploadArquivo'
import TabelaFaixas from './components/TabelaFaixas'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/Tabs'
import { TrendingUp } from 'lucide-react'

function App() {
  const { dados, handleChange, limpar, resultado, setDados } = useSimulador()

  const handleImport = (novoDado) => {
    // Mapear campos vindos do upload para os nomes internos do estado
    const mapaEstado = {
      volume_fibra: 'volumeFibra',
      volume_controle: 'volumeControle',
      volume_pos_puro: 'volumePosPuro',
      receita_smartphone: 'receitaSmartphone',
      receita_eletronicos: 'receitaEletronicos',
      receita_essenciais: 'receitaEssenciais',
      receita_seguros: 'receitaSeguros',
      qtd_servicos_digitais: 'qtdServicosDigitais',
      qtd_easy_anual: 'qtdEasyAnual',
      qtd_pelicula: 'qtdPelicula',
      qtd_vale_saude: 'qtdValeSaude',
    }

    setDados((prev) => {
      const estadoAtualizado = { ...prev }
      Object.keys(novoDado).forEach((key) => {
        if (mapaEstado[key]) {
          estadoAtualizado[mapaEstado[key]] = novoDado[key]
        }
      })
      return estadoAtualizado
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Simulador de Comissionamento</h1>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Lojas Vivo v2 — Centrão Digital</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Coluna Esquerda: Entrada */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                <TabsTrigger value="manual" className="text-base">🕒 Entrada Manual</TabsTrigger>
                <TabsTrigger value="arquivo" className="text-base">📁 Importar Arquivo</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual">
                <FormularioConsultor 
                  dados={dados} 
                  handleChange={handleChange} 
                  limpar={limpar} 
                />
              </TabsContent>
              
              <TabsContent value="arquivo">
                <UploadArquivo onImport={handleImport} />
              </TabsContent>
            </Tabs>
            
            <TabelaFaixas />
          </div>

          {/* Coluna Direita: Resultado */}
          <div className="lg:col-span-12 xl:col-span-5">
            <div className="sticky top-24">
              <div className="space-y-4">
                <CardFaixaGeral faixaGeral={resultado.faixaGeral} />
                <ResultadoComissao resultado={resultado} />
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="mt-20 border-t py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Centrão Digital — Simulador de Comissionamento Lojas v2</p>
          <p className="mt-1">Ferramenta para uso interno. Os valores são estimativas baseadas nas regras vigentes.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
