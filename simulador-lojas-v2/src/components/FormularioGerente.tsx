import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Separator } from './ui/Separator'
import { Button } from './ui/Button'
import { RefreshCcw } from 'lucide-react'
import FormularioProdutividade from './FormularioProdutividade'

function FormularioGerente({ dados, handleChange, limpar }) {
  const onNumberChange = (e) => {
    const { name, value } = e.target
    handleChange(name, value === '' ? 0 : Number.parseFloat(value))
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Dados do Gerente</CardTitle>
        <Button variant="ghost" size="sm" onClick={limpar} className="text-muted-foreground hover:text-primary">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Limpar
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Produtos/SVAs da Equipe</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receitaSmartphone">Receita Smartphones (R$)</Label>
              <Input id="receitaSmartphone" name="receitaSmartphone" type="number" min="0" step="0.01" value={dados.receitaSmartphone || ''} onChange={onNumberChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receitaEletronicos">Receita Eletrônicos (R$)</Label>
              <Input id="receitaEletronicos" name="receitaEletronicos" type="number" min="0" step="0.01" value={dados.receitaEletronicos || ''} onChange={onNumberChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receitaEssenciais">Receita Essenciais (R$)</Label>
              <Input id="receitaEssenciais" name="receitaEssenciais" type="number" min="0" step="0.01" value={dados.receitaEssenciais || ''} onChange={onNumberChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receitaSeguros">Receita Seguros (R$)</Label>
              <Input id="receitaSeguros" name="receitaSeguros" type="number" min="0" step="0.01" value={dados.receitaSeguros || ''} onChange={onNumberChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qtdServicosDigitais">Qtd. Serviços Digitais</Label>
              <Input id="qtdServicosDigitais" name="qtdServicosDigitais" type="number" min="0" value={dados.qtdServicosDigitais || ''} onChange={onNumberChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qtdNovosNegocios">Qtd. Novos Negócios</Label>
              <Input id="qtdNovosNegocios" name="qtdNovosNegocios" type="number" min="0" value={dados.qtdNovosNegocios || ''} onChange={onNumberChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qtdPelicula">Qtd. Película</Label>
              <Input id="qtdPelicula" name="qtdPelicula" type="number" min="0" value={dados.qtdPelicula || ''} onChange={onNumberChange} />
            </div>
          </div>
        </div>

        <Separator />

        <FormularioProdutividade dados={dados} handleChange={handleChange} />

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Dados do Cargo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salarioBase">Salário Base (R$)</Label>
              <Input id="salarioBase" name="salarioBase" type="number" min="0" step="0.01" value={dados.salarioBase || ''} onChange={onNumberChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorBaseCargoColetivo">Base Cargo Coletivo (R$)</Label>
              <Input
                id="valorBaseCargoColetivo"
                name="valorBaseCargoColetivo"
                type="number"
                min="0"
                step="0.01"
                value={dados.valorBaseCargoColetivo || ''}
                onChange={onNumberChange}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FormularioGerente
