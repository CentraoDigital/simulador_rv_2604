import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { Separator } from './ui/Separator'
import { Briefcase, Store, TrendingUp, Zap } from 'lucide-react'

const formatarMoeda = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)

const formatarPercentual = (valor) => `${((valor || 0) * 100).toFixed(2)}%`

function CardConsultor({ resultadoConsultor }) {
  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" />
            Vendedor (Consultor)
          </CardTitle>
          <Badge
            className={
              resultadoConsultor.aceleradorAtivo
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }
          >
            <Zap className="w-3 h-3 mr-1" />
            {resultadoConsultor.aceleradorAtivo ? 'Acelerador Ativo' : 'Acelerador Inativo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Soma Movimentos</p>
            <p className="font-semibold">{resultadoConsultor.faixaGeral.somaMovimentos}</p>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Faixa Geral</p>
            <p className="font-semibold">{resultadoConsultor.faixaGeral.faixa}</p>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Bloco 1</p>
            <p className="font-semibold">{formatarMoeda(resultadoConsultor.bloco1.subtotal)}</p>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Bloco 2</p>
            <p className="font-semibold">{formatarMoeda(resultadoConsultor.bloco2.subtotal)}</p>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between rounded-lg bg-primary text-primary-foreground p-3">
          <span className="text-xs uppercase tracking-wide">Total Simulado</span>
          <span className="text-lg font-black">{formatarMoeda(resultadoConsultor.totalGeral)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function CardGerente({ resultadoGerente }) {
  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Gerente
          </CardTitle>
          <Badge
            className={
              resultadoGerente.metaLoja.aceleradorAtivo
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }
          >
            <Zap className="w-3 h-3 mr-1" />
            {resultadoGerente.metaLoja.aceleradorAtivo ? 'Acelerador Ativo' : 'Acelerador Inativo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Atingimento</p>
            <p className="font-semibold">{formatarPercentual(resultadoGerente.metaLoja.atingimentoPonderado)}</p>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Faixa PPL</p>
            <p className="font-semibold uppercase">{resultadoGerente.metaLoja.faixaPPL}</p>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">RV sem Acelerador</p>
            <p className="font-semibold">{formatarMoeda(resultadoGerente.rvTotalSemAce)}</p>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">RV com Acelerador</p>
            <p className="font-semibold">{formatarMoeda(resultadoGerente.rvTotalComAce)}</p>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between rounded-lg bg-slate-900 text-white p-3">
            <span className="text-xs uppercase tracking-wide">Total sem Ace</span>
            <span className="font-black">{formatarMoeda(resultadoGerente.totalSemAce)}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-primary text-primary-foreground p-3">
            <span className="text-xs uppercase tracking-wide">Total com Ace</span>
            <span className="font-black">{formatarMoeda(resultadoGerente.totalComAce)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DashboardModos({ resultadoConsultor, resultadoGerente }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="font-semibold">Dashboard de Simulações</h2>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <CardConsultor resultadoConsultor={resultadoConsultor} />
        <CardGerente resultadoGerente={resultadoGerente} />
      </div>
    </section>
  )
}

export default DashboardModos
