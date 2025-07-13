
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react";

interface BudgetItemsListProps {
  items: any[];
  type: 'income' | 'expense';
  formatCurrency: (value: number) => string;
  getCategoryColor: (categoryName: string) => string;
  getVariance: (planned: number, actual: number) => number;
  onAddItem: () => void;
  onEditItem: (item: any) => void;
  onDeleteItem: (item: any) => void;
  isReadOnly?: boolean;
}

const BudgetItemsList = ({
  items,
  type,
  formatCurrency,
  getCategoryColor,
  getVariance,
  onAddItem,
  onEditItem,
  onDeleteItem,
  isReadOnly = false
}: BudgetItemsListProps) => {
  const title = type === 'income' ? 'Receitas' : 'Despesas';
  const icon = type === 'income' ? TrendingUp : TrendingDown;
  const colorClass = type === 'income' ? 'text-green-600' : 'text-red-600';
  const IconComponent = icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-2 ${colorClass}`}>
            <IconComponent className="h-5 w-5" />
            {title}
          </CardTitle>
          {!isReadOnly && (
            <Button variant="outline" size="sm" onClick={onAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum item cadastrado</p>
            {!isReadOnly && (
              <Button variant="outline" className="mt-4" onClick={onAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar {type === 'income' ? 'Receita' : 'Despesa'}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const variance = getVariance(item.planned_amount || 0, item.actual_amount || 0);
              const varianceColor = variance > 0 ? 'text-green-600' : variance < 0 ? 'text-red-600' : 'text-gray-600';
              
              return (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge className={getCategoryColor(item.budget_categories?.name || '')}>
                        {item.budget_categories?.name}
                      </Badge>
                      {item.is_fixed && (
                        <Badge variant="outline" className="text-xs">
                          Fixo
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Planejado</p>
                        <p className="font-medium">{formatCurrency(item.planned_amount || 0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Realizado</p>
                        <p className="font-medium">{formatCurrency(item.actual_amount || 0)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Variação</p>
                        <p className={`font-medium ${varianceColor}`}>
                          {variance > 0 ? '+' : ''}{variance.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  {!isReadOnly && (
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteItem(item)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
