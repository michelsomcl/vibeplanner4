
import { Button } from "@/components/ui/button";
import { Plus, History, Copy, Calendar, Lock } from "lucide-react";

interface BudgetHeaderProps {
  clientName: string;
  monthYear: string;
  isMonthClosed: boolean;
  hasPreviousMonthData: boolean;
  isCopyingFromPrevious: boolean;
  onViewHistory: () => void;
  onCopyFromPreviousMonth: () => void;
  onAddIncome: () => void;
  onAddExpense: () => void;
  onCloseMonth: () => void;
  isClosingMonth: boolean;
  hasBudgetItems: boolean;
}

const BudgetHeader = ({
  clientName,
  monthYear,
  isMonthClosed,
  hasPreviousMonthData,
  isCopyingFromPrevious,
  onViewHistory,
  onCopyFromPreviousMonth,
  onAddIncome,
  onAddExpense,
  onCloseMonth,
  isClosingMonth,
  hasBudgetItems
}: BudgetHeaderProps) => {
  const formatMonthYear = (monthYear: string) => {
    const date = new Date(monthYear);
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    }).replace(/^\w/, c => c.toUpperCase());
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-primary">Orçamento Mensal</h1>
        <p className="text-gray-600 mt-2">
          {clientName} - {formatMonthYear(monthYear)}
          {isMonthClosed && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <Lock className="mr-1 h-3 w-3" />
              Mês Fechado
            </span>
          )}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onViewHistory}
          className="border-gray-500 text-gray-600 hover:bg-gray-50"
        >
          <History className="mr-2 h-4 w-4" />
          Histórico
        </Button>
        {!isMonthClosed && hasPreviousMonthData && (
          <Button
            variant="outline"
            onClick={onCopyFromPreviousMonth}
            disabled={isCopyingFromPrevious}
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Copy className="mr-2 h-4 w-4" />
            {isCopyingFromPrevious ? 'Copiando...' : 'Copiar Mês Anterior'}
          </Button>
        )}
        {!isMonthClosed && (
          <>
            <Button 
              variant="outline" 
              className="border-green-500 text-green-600 hover:bg-green-50"
              onClick={onAddIncome}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Receita
            </Button>
            <Button 
              variant="outline" 
              className="border-red-500 text-red-600 hover:bg-red-50"
              onClick={onAddExpense}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Despesa
            </Button>
          </>
        )}
        {!isMonthClosed && hasBudgetItems && (
          <Button 
            onClick={onCloseMonth}
            disabled={isClosingMonth}
            className="bg-primary hover:bg-primary/90"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {isClosingMonth ? 'Fechando...' : 'Fechar Mês'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default BudgetHeader;
