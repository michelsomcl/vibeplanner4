
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, TrendingUp, TrendingDown, Edit, Trash } from "lucide-react";

interface BudgetItemsListProps {
  items: any[];
  type: 'income' | 'expense';
  formatCurrency: (value: number) => string;
  getCategoryColor: (categoryName: string) => string;
  getVariance: (planned: number, actual: number) => number;
  onAddItem: () => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (item: any) => void;
}

const BudgetItemsList = ({
  items,
  type,
  formatCurrency,
  getCategoryColor,
  getVariance,
  onAddItem,
  onEditItem,
  onDeleteItem
}: BudgetItemsListProps) => {
  const isIncome = type === 'income';
  const title = isIncome ? 'Receitas' : 'Despesas';
  const icon = isIncome ? TrendingUp : TrendingDown;
  const iconColor = isIncome ? 'text-green-600' : 'text-red-600';
  const emptyMessage = `Nenhum${isIncome ? 'a receita' : 'a despesa'} cadastrad${isIncome ? 'a' : 'a'} para este mês.`;
  const addButtonText = `Adicionar ${isIncome ? 'Receita' : 'Despesa'}`;

  const IconComponent = icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className={`h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>{emptyMessage}</p>
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={onAddItem}
            >
              <Plus className="mr-2 h-4 w-4" />
              {addButtonText}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const variance = getVariance(item.planned_amount || 0, item.actual_amount || 0);
              const progressValue = isIncome 
                ? 100 
                : (item.planned_amount || 0) > 0 ? ((item.actual_amount || 0) / (item.planned_amount || 0)) * 100 : 0;
              
              return (
                <div key={item.id} className={`p-4 border rounded-lg hover:bg-gray-50 ${!isIncome ? 'space-y-2' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <Badge className={getCategoryColor(item.budget_categories?.name || '')} variant="secondary">
                          {item.budget_categories?.name}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.actual_amount || 0)}</p>
                        <p className="text-sm text-gray-500">
                          {isIncome ? 'Meta' : 'Orçado'}: {formatCurrency(item.planned_amount || 0)}
                        </p>
                      </div>
                      
                      <div className="text-right min-w-[80px]">
                        <p className={`text-sm font-medium ${
                          isIncome 
                            ? (variance >= 0 ? 'text-green-600' : 'text-red-600')
                            : (variance <= 0 ? 'text-green-600' : 'text-red-600')
                        }`}>
                          {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEditItem(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onDeleteItem(item)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {!isIncome && (
                    <div className="space-y-1">
                      <Progress 
                        value={Math.min(progressValue, 100)} 
                        className={`h-2 ${progressValue > 100 ? '[&>div]:bg-red-500' : '[&>div]:bg-blue-500'}`}
                      />
                      <p className="text-xs text-gray-500">
                        {progressValue.toFixed(1)}% do orçado
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetItemsList;
