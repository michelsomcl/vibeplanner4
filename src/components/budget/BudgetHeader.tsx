
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, History, Copy, Calendar, Lock } from "lucide-react";

interface BudgetHeaderProps {
  clientName: string;
  monthYear: string;
  isMonthClosed: boolean;
  hasPreviousMonthData: boolean;
  isCopyingFromPrevious: boolean;
  availableMonths: string[];
  onMonthChange: (monthYear: string) => void;
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
  availableMonths,
  onMonthChange,
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

  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    
    // Add current and next few months
    for (let i = -6; i <= 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthStr = date.toISOString().slice(0, 7) + '-01';
      options.push(monthStr);
    }
    
    // Add available months from database
    availableMonths.forEach(month => {
      if (!options.includes(month)) {
        options.push(month);
      }
    });
    
    // Sort and remove duplicates
    return [...new Set(options)].sort().reverse();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Orçamento Mensal</h1>
          <p className="text-gray-600 mt-2">
            {clientName}
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

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Mês:</span>
          <Select value={monthYear} onValueChange={onMonthChange}>
            <SelectTrigger className="w-48">
              <SelectValue>
                {formatMonthYear(monthYear)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {generateMonthOptions().map((month) => (
                <SelectItem key={month} value={month}>
                  {formatMonthYear(month)}
                  {availableMonths.includes(month) && (
                    <span className="ml-2 text-xs text-blue-600">• com dados</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default BudgetHeader;
