
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, Clock, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DebtSummaryCardsProps {
  totalDebt: number;
  totalMonthlyPayment: number;
  debtToIncomeRatio: number;
  formatCurrency: (value: number) => string;
}

const DebtSummaryCards = ({
  totalDebt,
  totalMonthlyPayment,
  debtToIncomeRatio,
  formatCurrency
}: DebtSummaryCardsProps) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-4 border rounded-lg text-center">
        <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Total de Dívidas</p>
        <p className="text-xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
      </div>
      <div className="p-4 border rounded-lg text-center">
        <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
        <p className="text-gray-600 text-sm">Pagamento Mensal</p>
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
  );
};

export default DebtSummaryCards;
