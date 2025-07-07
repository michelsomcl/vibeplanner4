
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface BudgetSummaryCardsProps {
  totalActualIncome: number;
  totalPlannedIncome: number;
  totalActualExpenses: number;
  totalPlannedExpenses: number;
  actualBalance: number;
  plannedBalance: number;
  formatCurrency: (value: number) => string;
}

const BudgetSummaryCards = ({
  totalActualIncome,
  totalPlannedIncome,
  totalActualExpenses,
  totalPlannedExpenses,
  actualBalance,
  plannedBalance,
  formatCurrency
}: BudgetSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Total</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalActualIncome)}</p>
              <p className="text-xs text-gray-500">Planejado: {formatCurrency(totalPlannedIncome)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Despesa Total</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalActualExpenses)}</p>
              <p className="text-xs text-gray-500">Planejado: {formatCurrency(totalPlannedExpenses)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Real</p>
              <p className={`text-2xl font-bold ${actualBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(actualBalance)}
              </p>
              <p className="text-xs text-gray-500">Planejado: {formatCurrency(plannedBalance)}</p>
            </div>
            <DollarSign className={`h-8 w-8 ${actualBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Poupança</p>
              <p className="text-2xl font-bold text-primary">
                {totalActualIncome > 0 ? ((actualBalance / totalActualIncome) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-gray-500">da receita</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetSummaryCards;
