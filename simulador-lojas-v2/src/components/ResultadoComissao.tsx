import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Badge } from './ui/Badge'
import { Separator } from './ui/Separator'
import { TrendingUp, Award, Zap } from 'lucide-react'

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

const getBadgeColor = (faixa) => {
  switch (faixa) {
    case 'Laranja': return 'bg-orange-500 text-white'
    case 'Amarela': return 'bg-yellow-400 text-black'
    case 'Verde': return 'bg-green-500 text-white'
    case 'Purpura':
    case 'Púrpura': return 'bg-purple-600 text-white'
    default: return 'bg-gray-400 text-white'
  }
}

const ResultadoComissao = ({ resultado }) => {
  const { bloco1, bloco2, aceleradorAtivo, totalGeral } = resultado

  return (
    <Card className="h-full border-primary/20 shadow-md">
      <CardHeader className="bg-primary/5 border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="text-primary" />
            Resultado Simulado
          </CardTitle>
          <Badge
            className={
              aceleradorAtivo
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }
          >
            <Zap className="w-3 h-3 mr-1" />
            {aceleradorAtivo ? 'Acelerador Ativo' : 'Acelerador Inativo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* BLOCO 1 */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Bloco 1 — Serviços
            </h3>
            <span className="text-xl font-bold">{formatarMoeda(bloco1.subtotal)}</span>
          </div>
          
          <div className="grid gap-3">
            {[
              { label: 'Fibra (FTTH)', ...bloco1.fibra },
              { label: 'Controle', ...bloco1.controle },
              { label: 'Pós Puro', ...bloco1.posPuro }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    {item.label}
                    <Badge className={getBadgeColor(item.faixa)}>{item.faixa}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Vol: {item.volume} × {formatarMoeda(item.valorUnitario)}
                  </p>
                </div>
                <span className="font-semibold">{formatarMoeda(item.total)}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* BLOCO 2 */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Bloco 2 — Produtos/SVAs
            </h3>
            <span className="text-xl font-bold">{formatarMoeda(bloco2.subtotal)}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <DetailItem label="Smartphones" value={bloco2.smartphone.total} detail={`Taxa: ${(bloco2.smartphone.taxa * 100).toFixed(2)}%`} />
            <DetailItem label="Eletrônicos" value={bloco2.eletronicos.total} detail={`Taxa: ${(bloco2.eletronicos.taxa * 100).toFixed(2)}%`} />
            <DetailItem label="Essenciais" value={bloco2.essenciais.total} detail={`Taxa: ${(bloco2.essenciais.taxa * 100).toFixed(2)}%`} />
            <DetailItem label="Seguros" value={bloco2.seguros.total} detail={`Taxa: ${(bloco2.seguros.taxa * 100).toFixed(2)}%`} />
            <DetailItem label="Digitais" value={bloco2.servicosDigitais.total} detail={`Qtd: ${bloco2.servicosDigitais.quantidade} × ${formatarMoeda(bloco2.servicosDigitais.valorUnit)}`} />
            <DetailItem label="Vale Saúde" value={bloco2.valeSaude.total} detail={`Qtd: ${bloco2.valeSaude.quantidade} × ${formatarMoeda(bloco2.valeSaude.valorUnit)}`} />
            <DetailItem label="Easy Anual" value={bloco2.easyAnual.total} detail={`Qtd: ${bloco2.easyAnual.quantidade} × ${formatarMoeda(bloco2.easyAnual.valorUnit)}`} />
            <DetailItem label="Película" value={bloco2.pelicula.total} detail={`Qtd: ${bloco2.pelicula.quantidade} × ${formatarMoeda(bloco2.pelicula.valorUnit)}`} />
          </div>
        </div>

        {/* TOTAL GERAL */}
        <div className="mt-8 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg transform transition-transform hover:scale-[1.02]">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <span className="text-sm font-medium uppercase tracking-widest opacity-90">Total Comissão Estimada</span>
            <span className="text-4xl md:text-5xl font-black">{formatarMoeda(totalGeral)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const DetailItem = ({ label, value, detail }) => (
  <div className="flex justify-between py-1 border-b border-muted last:border-0">
    <div className="flex flex-col">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground italic px-0.5">{detail}</span>
    </div>
    <span className="font-medium">{formatarMoeda(value)}</span>
  </div>
)

export default ResultadoComissao
