import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { ChevronDown, ChevronUp } from 'lucide-react'

const TabelaFaixas = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="mt-6">
      <CardHeader 
        className="cursor-pointer flex flex-row items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="text-lg">Tabela de Referência das Faixas</CardTitle>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </CardHeader>
      {isOpen && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-bold mb-2 text-primary">Fibra (FTTH)</h4>
              <ul className="space-y-1">
                <li>🟠 Laranja (0-5): R$ 20,00</li>
                <li>🟡 Amarela (6-10): R$ 40,00</li>
                <li>🟢 Verde (10-15): R$ 60,00</li>
                <li>🟣 Púrpura (15+): R$ 80,00</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2 text-primary">Controle</h4>
              <ul className="space-y-1">
                <li>🟠 Laranja (0-20): R$ 10,00</li>
                <li>🟡 Amarela (20-27): R$ 20,00</li>
                <li>🟢 Verde (27-34): R$ 30,00</li>
                <li>🟣 Púrpura (34+): R$ 40,00</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2 text-primary">Pós Puro</h4>
              <ul className="space-y-1">
                <li>🟠 Laranja (0-5): R$ 10,00</li>
                <li>🟡 Amarela (5-10): R$ 20,00</li>
                <li>🟢 Verde (10-15): R$ 30,00</li>
                <li>🟣 Púrpura (15+): R$ 40,00</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            <p>* O valor unitário se aplica a todas as unidades do período caso a faixa seja atingida.</p>
            <p>* Aceleradores do Bloco 2 são ativados pela faixa geral de movimentos: Verde (48+) ou Púrpura (65+).</p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default TabelaFaixas
