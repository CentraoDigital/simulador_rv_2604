import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Separator } from './ui/Separator'
import { Badge } from './ui/Badge'
import { Briefcase, Wallet, Zap } from 'lucide-react'

const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)

const LinhaValor = ({ label, valor, detalhe }) => (
  <div className="flex justify-between py-1 border-b border-muted last:border-0">
    <div className="flex flex-col">
      <span className="text-muted-foreground">{label}</span>
      {detalhe ? <span className="text-[10px] text-muted-foreground italic px-0.5">{detalhe}</span> : null}
    </div>
    <span className="font-medium">{formatarMoeda(valor)}</span>
  </div>
)

function ResultadoGerente({ resultado }) {
  const { blocoSVAs, metaLoja, salarioBase, rvTotalSemAce, rvTotalComAce, totalSemAce, totalComAce } = resultado

  return (
    <Card className="h-full border-primary/20 shadow-md">
      <CardHeader className="bg-primary/5 border-b pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="text-primary" />
            Resultado Gerente
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
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Produtos / SVAs
            </h3>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Sem ace: {formatarMoeda(blocoSVAs.subtotalSemAce)}</p>
              <p className="text-sm font-semibold">Com ace: {formatarMoeda(blocoSVAs.subtotalComAce)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <LinhaValor label="Smartphones" valor={blocoSVAs.smartphone.totalComAce} detalhe={`Base ${(blocoSVAs.smartphone.taxaBase * 100).toFixed(2)}% / Ace ${(blocoSVAs.smartphone.taxaAcelerador * 100).toFixed(2)}%`} />
            <LinhaValor label="Eletrônicos" valor={blocoSVAs.eletronicos.totalComAce} detalhe={`Base ${(blocoSVAs.eletronicos.taxaBase * 100).toFixed(2)}% / Ace ${(blocoSVAs.eletronicos.taxaAcelerador * 100).toFixed(2)}%`} />
            <LinhaValor label="Essenciais" valor={blocoSVAs.essenciais.totalComAce} detalhe={`Base ${(blocoSVAs.essenciais.taxaBase * 100).toFixed(2)}% / Ace ${(blocoSVAs.essenciais.taxaAcelerador * 100).toFixed(2)}%`} />
            <LinhaValor label="Seguros" valor={blocoSVAs.seguros.totalComAce} detalhe={`Base ${(blocoSVAs.seguros.taxaBase * 100).toFixed(2)}% / Ace ${(blocoSVAs.seguros.taxaAcelerador * 100).toFixed(2)}%`} />
            <LinhaValor label="Serviços Digitais" valor={blocoSVAs.servicosDigitais.totalComAce} detalhe={`Qtd ${blocoSVAs.servicosDigitais.quantidade}`} />
            <LinhaValor label="Novos Negócios" valor={blocoSVAs.novosNegocios.totalComAce} detalhe={`Qtd ${blocoSVAs.novosNegocios.quantidade}`} />
            <LinhaValor label="Película" valor={blocoSVAs.pelicula.totalComAce} detalhe={`Qtd ${blocoSVAs.pelicula.quantidade} (sem acelerador)`} />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="font-semibold">Meta da Loja</h3>
          <LinhaValor label="Faixa PPL" valor={metaLoja.rvMetaLoja} detalhe={`${(metaLoja.pctCargoColetivo * 100).toFixed(0)}% do cargo coletivo`} />
          <LinhaValor label="Salário Base" valor={salarioBase} />
          <LinhaValor label="RV Total sem acelerador" valor={rvTotalSemAce} />
          <LinhaValor label="RV Total com acelerador" valor={rvTotalComAce} />
        </div>

        <div className="mt-8 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-widest opacity-90">Total Final</span>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-90">Sem ace: {formatarMoeda(totalSemAce)}</p>
              <p className="text-2xl md:text-3xl font-black">Com ace: {formatarMoeda(totalComAce)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ResultadoGerente
