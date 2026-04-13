import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { ChevronDown, ChevronUp } from 'lucide-react'

const TabelaFaixas = ({ modo = 'consultor' }) => {
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
          {modo === 'consultor' ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-bold mb-2 text-primary">Faixa PPL (Meta da Loja)</h4>
                <ul className="space-y-1">
                  <li>Super: ≥ 105% → 100%</li>
                  <li>Top: ≥ 100% → 80%</li>
                  <li>Ótimo: ≥ 95% → 60%</li>
                  <li>Bom: ≥ 90% → 40%</li>
                  <li>Intermediário: ≥ 85% → 20%</li>
                  <li>Oportunidade: &lt; 85% → 0%</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-2 text-primary">Produtos/SVAs Gerente</h4>
                <ul className="space-y-1">
                  <li>Smartphones: 0,13% / 0,26%</li>
                  <li>Eletrônicos: 0,18% / 0,36%</li>
                  <li>Essenciais: 0,4% / 0,8%</li>
                  <li>Seguros: 20% / 40%</li>
                  <li>Digitais: R$ 2 / R$ 5</li>
                  <li>Novos Negócios: R$ 5 / R$ 10</li>
                  <li>Película: R$ 3 (sem acelerador)</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            {modo === 'consultor' ? (
              <>
                <p>* O valor unitário se aplica a todas as unidades do período caso a faixa seja atingida.</p>
                <p>* Aceleradores do Bloco 2 são ativados pela faixa geral de movimentos: Verde (48+) ou Púrpura (65+).</p>
              </>
            ) : (
              <>
                <p>* Acelerador do gerente depende do atingimento ponderado da loja (&gt;= 100%).</p>
                <p>* RV Meta Loja = Base Cargo Coletivo × percentual da faixa PPL.</p>
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default TabelaFaixas
