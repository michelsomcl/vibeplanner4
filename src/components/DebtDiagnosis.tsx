
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";
import DebtSummaryCards from "./debt-diagnosis/DebtSummaryCards";
import PayoffStrategy from "./debt-diagnosis/PayoffStrategy";
import GoalsProgress from "./debt-diagnosis/GoalsProgress";

interface DebtDiagnosisProps {
  debts: any[];
  monthlyIncome?: number;
}

const DebtDiagnosis = ({ debts, monthlyIncome = 0 }: DebtDiagnosisProps) => {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Diagnóstico da Situação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DebtSummaryCards
            totalDebt={totalDebt}
            totalMonthlyPayment={totalMonthlyPayment}
            debtToIncomeRatio={debtToIncomeRatio}
            formatCurrency={formatCurrency}
          />

          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Comprometimento da Renda</span>
              <span className="text-sm">{debtToIncomeRatio.toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.min(debtToIncomeRatio, 100)} 
              className={`h-3 ${
                debtToIncomeRatio >= 50 ? '[&>div]:bg-red-500' : 
                debtToIncomeRatio >= 30 ? '[&>div]:bg-orange-500' : 
                debtToIncomeRatio >= 15 ? '[&>div]:bg-yellow-500' : 
                '[&>div]:bg-green-500'
              }`} 
            />
            <p className="text-xs text-gray-500 mt-1">
              Recomendado: até 30% da renda
            </p>
          </div>
        </CardContent>
      </Card>

      <PayoffStrategy activeDebts={activeDebts} formatCurrency={formatCurrency} />
      <GoalsProgress />
    </div>
  );
};

export default DebtDiagnosis;
