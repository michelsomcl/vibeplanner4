
import { Card, CardContent } from "@/components/ui/card";
import { Lock, AlertCircle } from "lucide-react";

interface BudgetAlertsProps {
  isMonthClosed: boolean;
  closureDate?: string;
  actualBalance: number;
}

const BudgetAlerts = ({ isMonthClosed, closureDate, actualBalance }: BudgetAlertsProps) => {
  return (
    <>
      {/* Month Closed Alert */}
      {isMonthClosed && closureDate && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Lock className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-800">Mês Fechado</h3>
                <p className="text-blue-700 text-sm mt-1">
                  Este mês foi fechado em {new Date(closureDate).toLocaleDateString('pt-BR')}. 
                  Os dados foram salvos no histórico e não podem mais ser editados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert for negative balance */}
      {actualBalance < 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
              <div>
                <h3 className="font-semibold text-red-800">Atenção: Orçamento no Vermelho</h3>
                <p className="text-red-700 text-sm mt-1">
                  As despesas estão superando as receitas. Revise o orçamento e identifique oportunidades de redução de custos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default BudgetAlerts;
