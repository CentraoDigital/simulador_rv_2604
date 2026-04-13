import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { Gauge, Zap } from 'lucide-react'

const formatPercent = (valor, casas = 1) => `${(valor * 100).toFixed(casas)}%`

const LinhaIndicador = ({ label, detalhe }) => (
  <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
    <span className="text-sm font-medium">{label}</span>
    <span className="text-xs text-muted-foreground">
      {formatPercent(detalhe.atingCap)} x {formatPercent(detalhe.peso)} ={' '}
      <span className="font-semibold text-foreground">{formatPercent(detalhe.contrib, 2)}</span>
    </span>
  </div>
)

function CardAtingimentoPPL({ metaLoja }) {
  const progresso = Math.min(metaLoja.atingimentoPonderado, 1.3) / 1.3

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            Meta da Loja (PPL)
          </CardTitle>
          <Badge
            className={
              metaLoja.aceleradorAtivo
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }
          >
            <Zap className="w-3 h-3 mr-1" />
            {metaLoja.aceleradorAtivo ? 'Acelerador Ativo' : 'Acelerador Inativo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <LinhaIndicador label="Pós Puro" detalhe={metaLoja.detalhes.posPuro} />
        <LinhaIndicador label="Controle" detalhe={metaLoja.detalhes.controle} />
        <LinhaIndicador label="FTTH" detalhe={metaLoja.detalhes.ftth} />

        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Atingimento ponderado</span>
            <span className="font-semibold">{formatPercent(metaLoja.atingimentoPonderado, 2)}</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
            <div className={metaLoja.aceleradorAtivo ? 'h-full bg-primary' : 'h-full bg-slate-500'} style={{ width: `${(progresso * 100).toFixed(2)}%` }} />
          </div>
          <div className="flex justify-between text-xs pt-1">
            <span className="text-muted-foreground">Faixa PPL</span>
            <span className="font-semibold uppercase">{metaLoja.faixaPPL}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CardAtingimentoPPL
