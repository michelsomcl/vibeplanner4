
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  PiggyBank,
  Scale,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const FinalReport = () => {
  const { id } = useParams();
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const clients = JSON.parse(localStorage.getItem('vibeplanner_clients') || '[]');
    const foundClient = clients.find((c: any) => c.id === id);
    setClient(foundClient);
  }, [id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Mock consolidated data
  const reportData = {
    financial: {
      monthlyIncome: 10400,
      monthlyExpenses: 7850,
      monthlySavings: 2550,
      savingsRate: 24.5
    },
    debts: {
      totalDebt: 188500,
      monthlyPayments: 1650,
      incomeCommitment: 15.9,
      estimatedPayoffTime: 42
    },
    assets: {
      totalAssets: 825000,
      monthlyGrowth: 4200,
      projectedValue5Years: 1275000
    },
    retirement: {
      currentAge: 35,
      retirementAge: 60,
      currentAccumulated: 125000,
      monthlyContribution: 1500,
      projectedValue: 950000,
      monthlyIncome: 6800
    },
    goals: [
      { name: "Casa de Campo", progress: 17, target: 500000, current: 85000 },
      { name: "Carro Novo", progress: 43.75, target: 80000, current: 35000 },
      { name: "Viagem Europa", progress: 48, target: 25000, current: 12000 }
    ]
  };

  if (!client) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Relatório Final</h1>
          <p className="text-gray-600 mt-2">Resumo completo do planejamento - {client.name}</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório PDF
        </Button>
      </div>

      {/* Executive Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">Situação Atual</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Renda Mensal:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(reportData.financial.monthlyIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gastos Mensais:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(reportData.financial.monthlyExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sobra Mensal:</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(reportData.financial.monthlySavings)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Taxa de Poupança:</span>
                  <span className="font-semibold text-primary">{reportData.financial.savingsRate}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">Patrimônio</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ativos Totais:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(reportData.assets.totalAssets)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dívidas Totais:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(reportData.debts.totalDebt)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">Patrimônio Líquido:</span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(reportData.assets.totalAssets - reportData.debts.totalDebt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Poupança</p>
                <p className="text-2xl font-bold text-green-600">{reportData.financial.savingsRate}%</p>
                <p className="text-xs text-gray-500">Ideal: 20%+</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Endividamento</p>
                <p className="text-2xl font-bold text-orange-600">{reportData.debts.incomeCommitment}%</p>
                <p className="text-xs text-gray-500">da renda</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aposentadoria</p>
                <p className="text-2xl font-bold text-blue-600">25 anos</p>
                <p className="text-xs text-gray-500">até a meta</p>
              </div>
              <PiggyBank className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score Geral</p>
                <p className="text-2xl font-bold text-primary">8.2/10</p>
                <p className="text-xs text-gray-500">Muito Bom</p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Debt Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Análise de Dívidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Situação Atual</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total das dívidas:</span>
                  <span className="font-semibold">{formatCurrency(reportData.debts.totalDebt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pagamento mensal:</span>
                  <span className="font-semibold">{formatCurrency(reportData.debts.monthlyPayments)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tempo para quitação:</span>
                  <span className="font-semibold">{reportData.debts.estimatedPayoffTime} meses</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Recomendação</h4>
              <p className="text-sm text-green-700">
                Utilizar estratégia avalanche para economia de R$ 12.450 em juros.
                Prazo de quitação pode ser reduzido em 8 meses.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Asset Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Crescimento Patrimonial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Projeção 5 Anos</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Patrimônio atual:</span>
                  <span className="font-semibold">{formatCurrency(reportData.assets.totalAssets)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Crescimento mensal:</span>
                  <span className="font-semibold">{formatCurrency(reportData.assets.monthlyGrowth)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor projetado:</span>
                  <span className="font-semibold">{formatCurrency(reportData.assets.projectedValue5Years)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Performance</h4>
              <p className="text-sm text-blue-700">
                Crescimento médio de 9.2% ao ano. Meta de R$ 1.5M até 2030 está no caminho certo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Progresso das Metas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.goals.map((goal, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{goal.name}</h4>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</p>
                    <p className="text-sm text-gray-500">{goal.progress.toFixed(1)}% concluído</p>
                  </div>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Retirement Planning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-purple-600" />
            Planejamento Previdenciário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Situação Atual</h4>
              <div className="bg-purple-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Valor acumulado:</span>
                  <span className="font-semibold">{formatCurrency(reportData.retirement.currentAccumulated)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Aporte mensal:</span>
                  <span className="font-semibold">{formatCurrency(reportData.retirement.monthlyContribution)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Anos até aposentadoria:</span>
                  <span className="font-semibold">{reportData.retirement.retirementAge - reportData.retirement.currentAge}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Projeção</h4>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Valor aos 60 anos:</span>
                  <span className="font-semibold">{formatCurrency(reportData.retirement.projectedValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Renda mensal estimada:</span>
                  <span className="font-semibold">{formatCurrency(reportData.retirement.monthlyIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recomendação:</span>
                  <span className="font-semibold text-orange-600">Aumentar aportes</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Plano de Ação Recomendado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <h4 className="font-semibold text-red-800">Prioridade Alta</h4>
              <ul className="mt-2 text-sm text-red-700 space-y-1">
                <li>• Renegociar cartão de crédito (juros de 15.2%)</li>
                <li>• Aumentar reserva de emergência para 6 meses</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h4 className="font-semibold text-yellow-800">Prioridade Média</h4>
              <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                <li>• Aumentar aporte previdenciário em R$ 350/mês</li>
                <li>• Diversificar investimentos (60% renda fixa, 40% variável)</li>
              </ul>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <h4 className="font-semibold text-green-800">Prioridade Baixa</h4>
              <ul className="mt-2 text-sm text-green-700 space-y-1">
                <li>• Revisar seguro de vida</li>
                <li>• Formalizar testamento</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores de Sucesso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">✓</div>
              <h4 className="font-semibold mb-1">Taxa de Poupança</h4>
              <p className="text-sm text-gray-600">Acima de 20% (atual: 24.5%)</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-orange-600 mb-2">⚠</div>
              <h4 className="font-semibold mb-1">Endividamento</h4>
              <p className="text-sm text-gray-600">Abaixo de 30% (atual: 15.9%)</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">📈</div>
              <h4 className="font-semibold mb-1">Crescimento</h4>
              <p className="text-sm text-gray-600">Meta: +8% ao ano</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinalReport;
