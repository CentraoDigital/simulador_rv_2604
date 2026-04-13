import React from 'react'
import { Input } from './ui/Input'
import { Label } from './ui/Label'

function FormularioProdutividade({ dados, handleChange }) {
  const onNumberChange = (e) => {
    const { name, value } = e.target
    handleChange(name, value === '' ? 0 : Number.parseFloat(value))
  }

  const onTipoAreaChange = (e) => {
    handleChange('tipoArea', e.target.value)
  }

  const comFibra = dados.tipoArea === 'com_fibra'

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Produtividade</h3>

      <div className="space-y-2">
        <Label htmlFor="tipoArea">Tipo de Área da Loja</Label>
        <select
          id="tipoArea"
          name="tipoArea"
          value={dados.tipoArea}
          onChange={onTipoAreaChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="com_fibra">Com Fibra</option>
          <option value="sem_fibra">Sem Fibra</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="metaPosPuro">Meta Pós Puro</Label>
          <Input
            id="metaPosPuro"
            name="metaPosPuro"
            type="number"
            min="0"
            step="0.01"
            value={dados.metaPosPuro || ''}
            onChange={onNumberChange}
            placeholder="0,40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="resultadoPosPuro">Resultado Pós Puro</Label>
          <Input
            id="resultadoPosPuro"
            name="resultadoPosPuro"
            type="number"
            min="0"
            step="0.01"
            value={dados.resultadoPosPuro || ''}
            onChange={onNumberChange}
            placeholder="0,40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="metaControle">Meta Controle</Label>
          <Input
            id="metaControle"
            name="metaControle"
            type="number"
            min="0"
            step="0.01"
            value={dados.metaControle || ''}
            onChange={onNumberChange}
            placeholder="0,80"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="resultadoControle">Resultado Controle</Label>
          <Input
            id="resultadoControle"
            name="resultadoControle"
            type="number"
            min="0"
            step="0.01"
            value={dados.resultadoControle || ''}
            onChange={onNumberChange}
            placeholder="0,75"
          />
        </div>
      </div>

      {comFibra ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="metaFTTH">Meta FTTH</Label>
            <Input
              id="metaFTTH"
              name="metaFTTH"
              type="number"
              min="0"
              step="0.01"
              value={dados.metaFTTH || ''}
              onChange={onNumberChange}
              placeholder="0,30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resultadoFTTH">Resultado FTTH</Label>
            <Input
              id="resultadoFTTH"
              name="resultadoFTTH"
              type="number"
              min="0"
              step="0.01"
              value={dados.resultadoFTTH || ''}
              onChange={onNumberChange}
              placeholder="0,40"
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          FTTH desconsiderado para área sem fibra (peso 0% no cálculo ponderado).
        </p>
      )}
    </div>
  )
}

export default FormularioProdutividade
