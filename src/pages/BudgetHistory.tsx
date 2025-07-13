
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BudgetHistoryHeader from "@/components/budget/BudgetHistoryHeader";
import BudgetHistoryList from "@/components/budget/BudgetHistoryList";
import BudgetSummaryCards from "@/components/budget/BudgetSummaryCards";
import BudgetItemsList from "@/components/budget/BudgetItemsList";
import BudgetForms from "@/components/budget/BudgetForms";
import { useBudgetData } from "@/hooks/useBudgetData";

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

  const { client } = useBudgetData(id);

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
      <BudgetHistoryHeader
        clientName={client?.name || ''}
        selectedCycle={selectedCycle}
        onBack={() => navigate(`/client/${id}/budget`)}
        onBackToHistory={() => setSelectedCycle(null)}
      />

      {!selectedCycle ? (
        <BudgetHistoryList
          closedCycles={closedCycles}
          formatCurrency={formatCurrency}
          onSelectCycle={setSelectedCycle}
          onReopenCycle={handleReopenCycle}
        />
      ) : (
        <>
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
              <BudgetSummaryCards
                totalActualIncome={totalActualIncome}
                totalPlannedIncome={totalPlannedIncome}
                totalActualExpenses={totalActualExpenses}
                totalPlannedExpenses={totalPlannedExpenses}
                actualBalance={actualBalance}
                plannedBalance={plannedBalance}
                formatCurrency={formatCurrency}
              />

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

              <BudgetForms
                incomeFormOpen={incomeFormOpen}
                expenseFormOpen={expenseFormOpen}
                deleteDialogOpen={deleteDialogOpen}
                editingItem={editingItem}
                editingType={editingType}
                itemToDelete={itemToDelete}
                clientId={id!}
                monthYear={selectedCycle}
                isReadOnly={false}
                onFormClose={handleFormClose}
                onDeleteClose={() => setDeleteDialogOpen(false)}
                onConfirmDelete={confirmDelete}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BudgetHistory;
