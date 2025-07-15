
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Calendar } from "lucide-react";

interface BudgetCycle {
  id: string;
  month_year: string;
  closure_date: string;
  total_planned_income?: number;
  total_actual_income?: number;
  total_planned_expenses?: number;
  total_actual_expenses?: number;
}

interface BudgetHistoryListProps {
  closedCycles: BudgetCycle[] | undefined;
  formatCurrency: (value: number) => string;
  onSelectCycle: (monthYear: string) => void;
  onReopenCycle: (monthYear: string) => void;
}

const BudgetHistoryList = ({ 
  closedCycles, 
  formatCurrency, 
  onSelectCycle, 
  onReopenCycle 
}: BudgetHistoryListProps) => {
  const formatMonthYear = (monthYear: string) => {
    // Parse the date string correctly as YYYY-MM-DD
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    
    console.log('Formatting month year in history list:', {
      input: monthYear,
      year: parseInt(year),
      month: parseInt(month) - 1,
      date: date.toISOString(),
      formatted: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    });
    
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    }).replace(/^\w/, c => c.toUpperCase());
  };

  if (!closedCycles || closedCycles.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum ciclo fechado
          </h3>
          <p className="text-gray-500">
            Quando você fechar um mês, ele aparecerá aqui no histórico.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {closedCycles.map((cycle) => (
        <Card key={cycle.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {formatMonthYear(cycle.month_year)}
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Fechado em {new Date(cycle.closure_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectCycle(cycle.month_year)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReopenCycle(cycle.month_year)}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Reabrir
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Receita Planejada</p>
                <p className="font-medium text-green-600">
                  {formatCurrency(cycle.total_planned_income || 0)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Receita Realizada</p>
                <p className="font-medium text-green-700">
                  {formatCurrency(cycle.total_actual_income || 0)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Despesa Planejada</p>
                <p className="font-medium text-red-600">
                  {formatCurrency(cycle.total_planned_expenses || 0)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Despesa Realizada</p>
                <p className="font-medium text-red-700">
                  {formatCurrency(cycle.total_actual_expenses || 0)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Saldo Real:</span>
                <span className={`font-bold ${
                  (cycle.total_actual_income || 0) - (cycle.total_actual_expenses || 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatCurrency(
                    (cycle.total_actual_income || 0) - (cycle.total_actual_expenses || 0)
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BudgetHistoryList;
