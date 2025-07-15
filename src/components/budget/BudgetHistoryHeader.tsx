
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Edit } from "lucide-react";

interface BudgetHistoryHeaderProps {
  clientName: string;
  selectedCycle: string | null;
  onBack: () => void;
  onBackToHistory?: () => void;
}

const BudgetHistoryHeader = ({ 
  clientName, 
  selectedCycle, 
  onBack, 
  onBackToHistory 
}: BudgetHistoryHeaderProps) => {
  const formatMonthYear = (monthYear: string) => {
    // Parse the date string correctly as YYYY-MM-DD
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    
    console.log('Formatting month year in history:', {
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

  if (selectedCycle) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBackToHistory}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-primary">
              {formatMonthYear(selectedCycle)}
            </h2>
            <p className="text-gray-600">Ciclo fechado - Editável</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-primary">Histórico de Orçamentos</h1>
          <p className="text-gray-600 mt-2">
            {clientName} - Ciclos fechados
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetHistoryHeader;
