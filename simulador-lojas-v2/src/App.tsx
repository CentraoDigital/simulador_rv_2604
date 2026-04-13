import { useSimulador } from './hooks/useSimulador'
import FormularioConsultor from './components/FormularioConsultor'
import FormularioGerente from './components/FormularioGerente'
import ResultadoComissao from './components/ResultadoComissao'
import ResultadoGerente from './components/ResultadoGerente'
import CardFaixaGeral from './components/CardFaixaGeral'
import CardAtingimentoPPL from './components/CardAtingimentoPPL'
import UploadArquivo from './components/UploadArquivo'
import TabelaFaixas from './components/TabelaFaixas'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/Tabs'
import { TrendingUp } from 'lucide-react'

function App() {
  const {
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
  } = useSimulador()

  const handleImportConsultor = (novoDado) => {
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

    setDadosConsultor((prev) => {
      const estadoAtualizado = { ...prev }
      Object.keys(novoDado).forEach((key) => {
        if (mapaEstado[key]) {
          estadoAtualizado[mapaEstado[key]] = novoDado[key]
        }
      })
      return estadoAtualizado
    })
  }

  const handleImportGerente = (novoDado) => {
    const mapaEstado = {
      receita_smartphone: 'receitaSmartphone',
      receita_eletronicos: 'receitaEletronicos',
      receita_essenciais: 'receitaEssenciais',
      receita_seguros: 'receitaSeguros',
      qtd_servicos_digitais: 'qtdServicosDigitais',
      qtd_novos_negocios: 'qtdNovosNegocios',
      qtd_pelicula: 'qtdPelicula',
      tipo_area: 'tipoArea',
      meta_pos_puro: 'metaPosPuro',
      resultado_pos_puro: 'resultadoPosPuro',
      meta_controle: 'metaControle',
      resultado_controle: 'resultadoControle',
      meta_ftth: 'metaFTTH',
      resultado_ftth: 'resultadoFTTH',
      salario_base: 'salarioBase',
      valor_base_cargo_coletivo: 'valorBaseCargoColetivo',
    }

    setDadosGerente((prev) => {
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
        <Tabs defaultValue="consultor" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
            <TabsTrigger value="consultor" className="text-base">👤 Consultor</TabsTrigger>
            <TabsTrigger value="gerente" className="text-base">👔 Gerente</TabsTrigger>
          </TabsList>

          <TabsContent value="consultor">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                <Tabs defaultValue="manual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                    <TabsTrigger value="manual" className="text-base">🕒 Entrada Manual</TabsTrigger>
                    <TabsTrigger value="arquivo" className="text-base">📁 Importar Arquivo</TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual">
                    <FormularioConsultor dados={dadosConsultor} handleChange={handleChangeConsultor} limpar={limparConsultor} />
                  </TabsContent>

                  <TabsContent value="arquivo">
                    <UploadArquivo mode="consultor" onImport={handleImportConsultor} />
                  </TabsContent>
                </Tabs>

                <TabelaFaixas modo="consultor" />
              </div>

              <div className="lg:col-span-12 xl:col-span-5">
                <div className="sticky top-24">
                  <div className="space-y-4">
                    <CardFaixaGeral faixaGeral={resultadoConsultor.faixaGeral} />
                    <ResultadoComissao resultado={resultadoConsultor} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gerente">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                <Tabs defaultValue="manual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
                    <TabsTrigger value="manual" className="text-base">🕒 Entrada Manual</TabsTrigger>
                    <TabsTrigger value="arquivo" className="text-base">📁 Importar Arquivo</TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual">
                    <FormularioGerente dados={dadosGerente} handleChange={handleChangeGerente} limpar={limparGerente} />
                  </TabsContent>

                  <TabsContent value="arquivo">
                    <UploadArquivo mode="gerente" onImport={handleImportGerente} />
                  </TabsContent>
                </Tabs>

                <TabelaFaixas modo="gerente" />
              </div>

              <div className="lg:col-span-12 xl:col-span-5">
                <div className="sticky top-24">
                  <div className="space-y-4">
                    <CardAtingimentoPPL metaLoja={resultadoGerente.metaLoja} />
                    <ResultadoGerente resultado={resultadoGerente} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
