import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { BarChart3, Zap } from 'lucide-react'

const COR_FAIXA = {
  Laranja: 'bg-orange-500 text-white',
  Amarela: 'bg-yellow-400 text-black',
  Verde: 'bg-green-500 text-white',
  Purpura: 'bg-purple-600 text-white',
}

function CardFaixaGeral({ faixaGeral }) {
  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Faixa Geral
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
          <span className="text-sm font-medium">Soma de movimentos</span>
          <span className="font-semibold">{faixaGeral.somaMovimentos}</span>
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
          <span className="text-sm font-medium">Faixa</span>
          <Badge className={COR_FAIXA[faixaGeral.faixa] ?? 'bg-slate-200 text-slate-800'}>{faixaGeral.faixa}</Badge>
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
          <span className="text-sm font-medium">Acelerador</span>
          <Badge
            className={
              faixaGeral.aceleradorAtivo
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }
          >
            <Zap className="w-3 h-3 mr-1" />
            {faixaGeral.aceleradorAtivo ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>

        <p className="text-[11px] text-muted-foreground">Gatilho do acelerador: soma de movimentos maior ou igual a 48.</p>
      </CardContent>
    </Card>
  )
}

export default CardFaixaGeral
