import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Input } from './ui/Input'
import { Label } from './ui/Label'
import { Separator } from './ui/Separator'
import { Button } from './ui/Button'
import { RefreshCcw } from 'lucide-react'
import FormularioProdutividade from './FormularioProdutividade'

const FormularioConsultor = ({ dados, handleChange, limpar }) => {
  const onNumberChange = (e) => {
    const { name, value } = e.target
    handleChange(name, value === '' ? 0 : Number.parseFloat(value))
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Dados do Consultor</CardTitle>
        <Button variant="ghost" size="sm" onClick={limpar} className="text-muted-foreground hover:text-primary">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Limpar
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormularioProdutividade dados={dados} handleChange={handleChange} />

        <Separator />

        {/* BLOCO 1 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Bloco 1 — Serviços</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="volumeFibra">Fibra (FTTH)</Label>
              <Input 
                id="volumeFibra" 
                name="volumeFibra" 
                type="number" 
                min="0"
                value={dados.volumeFibra || ""} 
                onChange={onNumberChange} 
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volumeControle">Controle</Label>
              <Input 
                id="volumeControle" 
                name="volumeControle" 
                type="number" 
                min="0"
                value={dados.volumeControle || ""} 
                onChange={onNumberChange}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volumePosPuro">Pós Puro</Label>
              <Input 
                id="volumePosPuro" 
                name="volumePosPuro" 
                type="number" 
                min="0"
                value={dados.volumePosPuro || ""} 
                onChange={onNumberChange}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* BLOCO 2 - Receitas */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Bloco 2 — Receitas (R$)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receitaSmartphone">Receita Smartphones</Label>
              <Input 
                id="receitaSmartphone" 
                name="receitaSmartphone" 
                type="number" 
                min="0"
                step="0.01"
                value={dados.receitaSmartphone || ""} 
                onChange={onNumberChange}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receitaEletronicos">Demais Eletrônicos</Label>
              <Input 
                id="receitaEletronicos" 
                name="receitaEletronicos" 
                type="number" 
                min="0"
                step="0.01"
                value={dados.receitaEletronicos || ""} 
                onChange={onNumberChange}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receitaEssenciais">Essenciais</Label>
              <Input 
                id="receitaEssenciais" 
                name="receitaEssenciais" 
                type="number" 
                min="0"
                step="0.01"
                value={dados.receitaEssenciais || ""} 
                onChange={onNumberChange}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receitaSeguros">Seguros</Label>
              <Input 
                id="receitaSeguros" 
                name="receitaSeguros" 
                type="number" 
                min="0"
                step="0.01"
                value={dados.receitaSeguros || ""} 
                onChange={onNumberChange}
                placeholder="0,00"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* BLOCO 2 - Quantidades */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Bloco 2 — Quantidades</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qtdServicosDigitais">Digitais</Label>
              <Input 
                id="qtdServicosDigitais" 
                name="qtdServicosDigitais" 
                type="number" 
                min="0"
                value={dados.qtdServicosDigitais || ""} 
                onChange={onNumberChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qtdValeSaude">Vale Saúde</Label>
              <Input 
                id="qtdValeSaude" 
                name="qtdValeSaude" 
                type="number" 
                min="0"
                value={dados.qtdValeSaude || ""} 
                onChange={onNumberChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qtdEasyAnual">Easy Anual</Label>
              <Input 
                id="qtdEasyAnual" 
                name="qtdEasyAnual" 
                type="number" 
                min="0"
                value={dados.qtdEasyAnual || ""} 
                onChange={onNumberChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qtdPelicula">Película</Label>
              <Input 
                id="qtdPelicula" 
                name="qtdPelicula" 
                type="number" 
                min="0"
                value={dados.qtdPelicula || ""} 
                onChange={onNumberChange}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FormularioConsultor
