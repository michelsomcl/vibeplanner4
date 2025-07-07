
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

interface PayoffStrategyProps {
  activeDebts: any[];
  formatCurrency: (value: number) => string;
}

const PayoffStrategy = ({ activeDebts, formatCurrency }: PayoffStrategyProps) => {
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
  const snowballOrder = [...activeDebts].sort((a, b) => a.total_amount - b.total_amount);
  const avalancheOrder = [...activeDebts].sort((a, b) => b.interest_rate - a.interest_rate);

  return (
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

        <div className="space-y-3">
          <h4 className="font-medium">Ordem de Quitação Sugerida:</h4>
          {(recommendation.method === 'snowball' ? snowballOrder : avalancheOrder).map((debt, index) => (
            <div key={debt.id} className="flex items-center justify-between p-3 border rounded-lg">
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PayoffStrategy;
