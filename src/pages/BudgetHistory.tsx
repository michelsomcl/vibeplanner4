
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Eye, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BudgetItemForm from "@/components/BudgetItemForm";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import BudgetSummaryCards from "@/components/budget/BudgetSummaryCards";
import BudgetItemsList from "@/components/budget/BudgetItemsList";

const BudgetHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<'income' | 'expense'>('income');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Get client data
  const { data: client } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do cliente não fornecido');
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Get budget categories
  const { data: categories } = useQuery({
    queryKey: ['budget-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Get closed budget cycles
  const { data: closedCycles, isLoading: cyclesLoading } = useQuery({
    queryKey: ['closed-cycles', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('budget_closures')
        .select('*')
        .eq('client_id', id)
        .order('month_year', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Get budget items for selected cycle
  const { data: budgetItems, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget-items', id, selectedCycle],
    queryFn: async () => {
      if (!id || !selectedCycle) return [];
      
      const { data, error } = await supabase
        .from('budget_items')
        .select(`
          *,
          budget_categories (
            name,
            type
          )
        `)
        .eq('client_id', id)
        .eq('month_year', selectedCycle);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!selectedCycle,
  });

  // Update budget item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, data }: { itemId: string; data: any }) => {
      const { error } = await supabase
        .from('budget_items')
        .update(data)
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-items', id, selectedCycle] });
      toast.success('Item atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar item:', error);
      toast.error('Erro ao atualizar item');
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-items', id, selectedCycle] });
      toast.success('Item excluído com sucesso!');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error) => {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item');
    },
  });

  // Reopen cycle mutation
  const reopenCycleMutation = useMutation({
    mutationFn: async (monthYear: string) => {
      const { error } = await supabase
        .from('budget_closures')
        .delete()
        .eq('client_id', id)
        .eq('month_year', monthYear);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closed-cycles', id] });
      toast.success('Ciclo reaberto com sucesso!');
      setSelectedCycle(null);
    },
    onError: (error) => {
      console.error('Erro ao reabrir ciclo:', error);
      toast.error('Erro ao reabrir ciclo');
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryColor = (categoryName: string) => {
    const colors: { [key: string]: string } = {
      'Moradia': 'bg-blue-100 text-blue-800',
      'Alimentação': 'bg-green-100 text-green-800',
      'Transporte': 'bg-yellow-100 text-yellow-800',
      'Saúde': 'bg-red-100 text-red-800',
      'Lazer': 'bg-purple-100 text-purple-800',
      'Financeiro': 'bg-orange-100 text-orange-800',
      'Salário': 'bg-gray-100 text-gray-800',
      'Freelances': 'bg-indigo-100 text-indigo-800',
      'Rendimentos': 'bg-teal-100 text-teal-800'
    };
    return colors[categoryName] || 'bg-gray-100 text-gray-800';
  };

  const getVariance = (planned: number, actual: number) => {
    if (planned === 0) return 0;
    const variance = ((actual - planned) / planned) * 100;
    return variance;
  };

  const formatMonthYear = (monthYear: string) => {
    const date = new Date(monthYear);
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    }).replace(/^\w/, c => c.toUpperCase());
  };

  const handleEditItem = (item: any, type: 'income' | 'expense') => {
    setEditingItem(item);
    setEditingType(type);
    if (type === 'income') {
      setIncomeFormOpen(true);
    } else {
      setExpenseFormOpen(true);
    }
  };

  const handleDeleteItem = (item: any) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate(itemToDelete.id);
    }
  };

  const handleFormClose = () => {
    setIncomeFormOpen(false);
    setExpenseFormOpen(false);
    setEditingItem(null);
  };

  const handleReopenCycle = (monthYear: string) => {
    if (confirm('Tem certeza que deseja reabrir este ciclo? Ele voltará a ser editável.')) {
      reopenCycleMutation.mutate(monthYear);
    }
  };

  if (cyclesLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const income = budgetItems?.filter(item => item.budget_categories?.type === 'income') || [];
  const expenses = budgetItems?.filter(item => item.budget_categories?.type === 'expense') || [];

  const totalPlannedIncome = income.reduce((sum, item) => sum + (item.planned_amount || 0), 0);
  const totalActualIncome = income.reduce((sum, item) => sum + (item.actual_amount || 0), 0);
  const totalPlannedExpenses = expenses.reduce((sum, item) => sum + (item.planned_amount || 0), 0);
  const totalActualExpenses = expenses.reduce((sum, item) => sum + (item.actual_amount || 0), 0);
  
  const plannedBalance = totalPlannedIncome - totalPlannedExpenses;
  const actualBalance = totalActualIncome - totalActualExpenses;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/client/${id}/budget`)}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Histórico de Orçamentos</h1>
            <p className="text-gray-600 mt-2">
              {client?.name} - Ciclos fechados
            </p>
          </div>
        </div>
      </div>

      {!selectedCycle ? (
        /* Cycles List */
        <>
          {closedCycles && closedCycles.length === 0 ? (
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
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {closedCycles?.map((cycle) => (
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
                          onClick={() => setSelectedCycle(cycle.month_year)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReopenCycle(cycle.month_year)}
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
          )}
        </>
      ) : (
        /* Selected Cycle Details */
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedCycle(null)}
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

          {budgetLoading ? (
            <div className="animate-pulse space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <BudgetSummaryCards
                totalActualIncome={totalActualIncome}
                totalPlannedIncome={totalPlannedIncome}
                totalActualExpenses={totalActualExpenses}
                totalPlannedExpenses={totalPlannedExpenses}
                actualBalance={actualBalance}
                plannedBalance={plannedBalance}
                formatCurrency={formatCurrency}
              />

              {/* Income Section */}
              <BudgetItemsList
                items={income}
                type="income"
                formatCurrency={formatCurrency}
                getCategoryColor={getCategoryColor}
                getVariance={getVariance}
                onAddItem={() => setIncomeFormOpen(true)}
                onEditItem={(item) => handleEditItem(item, 'income')}
                onDeleteItem={handleDeleteItem}
                isReadOnly={false}
              />

              {/* Expenses Section */}
              <BudgetItemsList
                items={expenses}
                type="expense"
                formatCurrency={formatCurrency}
                getCategoryColor={getCategoryColor}
                getVariance={getVariance}
                onAddItem={() => setExpenseFormOpen(true)}
                onEditItem={(item) => handleEditItem(item, 'expense')}
                onDeleteItem={handleDeleteItem}
                isReadOnly={false}
              />

              {/* Forms */}
              <BudgetItemForm
                isOpen={incomeFormOpen}
                onClose={handleFormClose}
                clientId={id!}
                type="income"
                editItem={editingType === 'income' ? editingItem : undefined}
                monthYear={selectedCycle}
              />
              
              <BudgetItemForm
                isOpen={expenseFormOpen}
                onClose={handleFormClose}
                clientId={id!}
                type="expense"
                editItem={editingType === 'expense' ? editingItem : undefined}
                monthYear={selectedCycle}
              />

              <DeleteConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                itemName={itemToDelete?.name || ''}
                itemType={itemToDelete?.budget_categories?.type === 'income' ? 'receita' : 'despesa'}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BudgetHistory;
