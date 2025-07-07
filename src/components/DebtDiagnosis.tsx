import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Target, TrendingDown, Clock, CheckCircle } from "lucide-react";
interface DebtDiagnosisProps {
  debts: any[];
  monthlyIncome?: number;
}
const DebtDiagnosis = ({
  debts,
  monthlyIncome = 0
}: DebtDiagnosisProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const activeDebts = debts.filter(debt => debt.status === 'active');
  const totalDebt = activeDebts.reduce((sum, debt) => sum + debt.total_amount, 0);
  const totalMonthlyPayment = activeDebts.reduce((sum, debt) => sum + debt.installment_value, 0);
  const debtToIncomeRatio = monthlyIncome > 0 ? totalMonthlyPayment / monthlyIncome * 100 : 0;

  // Ordenar dívidas para método snowball (menor saldo) e avalanche (maior juros)
  const snowballOrder = [...activeDebts].sort((a, b) => a.total_amount - b.total_amount);
  const avalancheOrder = [...activeDebts].sort((a, b) => b.interest_rate - a.interest_rate);

  // Calcular tempo médio para quitação
  const averageMonthsToPayoff = activeDebts.length > 0 ? activeDebts.reduce((sum, debt) => sum + debt.remaining_installments, 0) / activeDebts.length : 0;

  // Diagnóstico da situação
  const getDiagnosisLevel = () => {
    if (debtToIncomeRatio >= 50) return {
      level: 'critical',
      color: 'bg-red-500',
      text: 'Crítica'
    };
    if (debtToIncomeRatio >= 30) return {
      level: 'high',
      color: 'bg-orange-500',
      text: 'Alta'
    };
    if (debtToIncomeRatio >= 15) return {
      level: 'moderate',
      color: 'bg-yellow-500',
      text: 'Moderada'
    };
    return {
      level: 'low',
      color: 'bg-green-500',
      text: 'Baixa'
    };
  };
  const diagnosis = getDiagnosisLevel();
  const getRecommendedMethod = () => {
    const highInterestCount = activeDebts.filter(debt => debt.interest_rate > 3).length;
    const totalDebtsCount = activeDebts.length;
    if (highInterestCount / totalDebtsCount > 0.6) {
      return {
        method: 'avalanche',
        reason: 'Muitas dívidas com juros altos. Priorize as de maior taxa de juros.'
      };
    } else {
      return {
        method: 'snowball',
        reason: 'Priorize quitação das menores dívidas para ganhar motivação.'
      };
    }
  };
  const recommendation = getRecommendedMethod();
  return <div className="space-y-6">
      {/* Diagnóstico Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Diagnóstico da Situação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Total de Dívidas</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Pagamento Mensal das dívidas</p>
              <p className="text-xl font-bold text-orange-600">{formatCurrency(totalMonthlyPayment)}</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Comprometimento</p>
              <p className="text-xl font-bold text-blue-600">{debtToIncomeRatio.toFixed(1)}%</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="flex justify-center mb-2">
                <Badge className={`${diagnosis.color} text-white`}>
                  {diagnosis.text}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">Situação</p>
              <p className="text-sm font-medium">da Renda</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Comprometimento da Renda</span>
                <span className="text-sm">{debtToIncomeRatio.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(debtToIncomeRatio, 100)} className={`h-3 ${debtToIncomeRatio >= 50 ? '[&>div]:bg-red-500' : debtToIncomeRatio >= 30 ? '[&>div]:bg-orange-500' : debtToIncomeRatio >= 15 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`} />
              <p className="text-xs text-gray-500 mt-1">
                Recomendado: até 30% da renda
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estratégia Recomendada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Estratégia de Quitação Recomendada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              Método {recommendation.method === 'snowball' ? 'Bola de Neve' : 'Avalanche'} Recomendado
            </h3>
            <p className="text-blue-700 text-sm">{recommendation.reason}</p>
          </div>

          {/* Ordem de Quitação */}
          <div className="space-y-3">
            <h4 className="font-medium">Ordem de Quitação Sugerida:</h4>
            {(recommendation.method === 'snowball' ? snowballOrder : avalancheOrder).map((debt, index) => <div key={debt.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{debt.name}</p>
                    <p className="text-sm text-gray-600">{debt.institution}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(debt.total_amount)}</p>
                  <p className="text-sm text-gray-600">{debt.interest_rate}% a.m.</p>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>

      {/* Metas e Progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Metas de Quitação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Meta de Curto Prazo (6 meses)</h4>
              <p className="text-sm text-gray-600 mb-2">
                Quitar as 2 menores dívidas ou reduzir 20% do total
              </p>
              <Progress value={15} className="mb-2" />
              <p className="text-xs text-gray-500">Progresso atual: 15%</p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Meta de Longo Prazo (24 meses)</h4>
              <p className="text-sm text-gray-600 mb-2">
                Quitar todas as dívidas ou reduzir comprometimento para menos de 15%
              </p>
              <Progress value={5} className="mb-2" />
              <p className="text-xs text-gray-500">Progresso atual: 5%</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">💡 Dicas para Acelerar a Quitação:</h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Negocie descontos para pagamento à vista</li>
              <li>• Considere renda extra para pagamentos adicionais</li>
              <li>• Evite contrair novas dívidas durante o processo</li>
              <li>• Redirecione valores de dívidas quitadas para as próximas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default DebtDiagnosis;