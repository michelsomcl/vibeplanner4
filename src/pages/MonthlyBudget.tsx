
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, Calendar, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BudgetItemForm from "@/components/BudgetItemForm";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import BudgetSummaryCards from "@/components/budget/BudgetSummaryCards";
import BudgetItemsList from "@/components/budget/BudgetItemsList";

const MonthlyBudget = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<'income' | 'expense'>('income');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Get client data
  const { data: client, isLoading: clientLoading } = useQuery({
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
  const { data: categories, isLoading: categoriesLoading } = useQuery({
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

  // Get current month's budget items
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
  const { data: budgetItems, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget-items', id, currentMonth],
    queryFn: async () => {
      if (!id) return [];
      
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
        .eq('month_year', currentMonth);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Check if current month is already closed
  const { data: monthClosure, isLoading: closureLoading } = useQuery({
    queryKey: ['budget-closure', id, currentMonth],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('budget_closures')
        .select('*')
        .eq('client_id', id)
        .eq('month_year', currentMonth)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Initialize categories mutation
  const initializeCategories = useMutation({
    mutationFn: async () => {
      const defaultCategories = [
        { name: 'Salário', type: 'income' },
        { name: 'Freelances', type: 'income' },
        { name: 'Rendimentos', type: 'income' },
        { name: 'Outros Rendimentos', type: 'income' },
        { name: 'Moradia', type: 'expense' },
        { name: 'Alimentação', type: 'expense' },
        { name: 'Transporte', type: 'expense' },
        { name: 'Saúde', type: 'expense' },
        { name: 'Educação', type: 'expense' },
        { name: 'Lazer', type: 'expense' },
        { name: 'Vestuário', type: 'expense' },
        { name: 'Financeiro', type: 'expense' },
        { name: 'Outros', type: 'expense' }
      ];

      const { error } = await supabase
        .from('budget_categories')
        .upsert(defaultCategories, { 
          onConflict: 'name,type',
          ignoreDuplicates: true 
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
      toast.success('Categorias inicializadas com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao inicializar categorias:', error);
      toast.error('Erro ao inicializar categorias');
    },
  });

  // Close month mutation
  const closeMonthMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('ID do cliente não fornecido');
      
      const income = budgetItems?.filter(item => item.budget_categories?.type === 'income') || [];
      const expenses = budgetItems?.filter(item => item.budget_categories?.type === 'expense') || [];

      const totalPlannedIncome = income.reduce((sum, item) => sum + (item.planned_amount || 0), 0);
      const totalActualIncome = income.reduce((sum, item) => sum + (item.actual_amount || 0), 0);
      const totalPlannedExpenses = expenses.reduce((sum, item) => sum + (item.planned_amount || 0), 0);
      const totalActualExpenses = expenses.reduce((sum, item) => sum + (item.actual_amount || 0), 0);

      // Save closure data
      const { error: closureError } = await supabase
        .from('budget_closures')
        .insert({
          client_id: id,
          month_year: currentMonth,
          total_planned_income: totalPlannedIncome,
          total_actual_income: totalActualIncome,
          total_planned_expenses: totalPlannedExpenses,
          total_actual_expenses: totalActualExpenses,
        });

      if (closureError) throw closureError;

      // Get next month
      const nextMonthDate = new Date(currentMonth);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      const nextMonth = nextMonthDate.toISOString().slice(0, 7) + '-01';

      // Create new budget items for next month with planned amounts from current month
      const nextMonthItems = budgetItems?.map(item => ({
        client_id: id,
        category_id: item.category_id,
        name: item.name,
        month_year: nextMonth,
        planned_amount: item.planned_amount || 0,
        actual_amount: 0,
        is_fixed: item.is_fixed
      })) || [];

      if (nextMonthItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('budget_items')
          .insert(nextMonthItems);

        if (itemsError) throw itemsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-closure', id, currentMonth] });
      queryClient.invalidateQueries({ queryKey: ['budget-items'] });
      toast.success('Mês fechado com sucesso! Novo ciclo iniciado.');
    },
    onError: (error) => {
      console.error('Erro ao fechar mês:', error);
      toast.error('Erro ao fechar mês');
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
      queryClient.invalidateQueries({ queryKey: ['budget-items', id, currentMonth] });
      toast.success('Item excluído com sucesso!');
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error) => {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item');
    },
  });

  // Initialize categories if empty
  useEffect(() => {
    if (categories && categories.length === 0) {
      initializeCategories.mutate();
    }
  }, [categories]);

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

  const handleCloseMonth = () => {
    closeMonthMutation.mutate();
  };

  const isLoading = clientLoading || categoriesLoading || budgetLoading || closureLoading;
  const isMonthClosed = !!monthClosure;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cliente não encontrado</h1>
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
        <div>
          <h1 className="text-3xl font-bold text-primary">Orçamento Mensal</h1>
          <p className="text-gray-600 mt-2">
            Controle financeiro - {client?.name}
            {isMonthClosed && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <Lock className="mr-1 h-3 w-3" />
                Mês Fechado
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {!isMonthClosed && (
            <>
              <Button 
                variant="outline" 
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => setIncomeFormOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Receita
              </Button>
              <Button 
                variant="outline" 
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => setExpenseFormOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Despesa
              </Button>
            </>
          )}
          {!isMonthClosed && budgetItems && budgetItems.length > 0 && (
            <Button 
              onClick={handleCloseMonth}
              disabled={closeMonthMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {closeMonthMutation.isPending ? 'Fechando...' : 'Fechar Mês'}
            </Button>
          )}
        </div>
      </div>

      {/* Month Closed Alert */}
      {isMonthClosed && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Lock className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-800">Mês Fechado</h3>
                <p className="text-blue-700 text-sm mt-1">
                  Este mês foi fechado em {new Date(monthClosure.closure_date).toLocaleDateString('pt-BR')}. 
                  Os dados foram salvos no histórico e não podem mais ser editados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
        isReadOnly={isMonthClosed}
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
        isReadOnly={isMonthClosed}
      />

      {/* Forms */}
      {!isMonthClosed && (
        <>
          <BudgetItemForm
            isOpen={incomeFormOpen}
            onClose={handleFormClose}
            clientId={id!}
            type="income"
            editItem={editingType === 'income' ? editingItem : undefined}
          />
          
          <BudgetItemForm
            isOpen={expenseFormOpen}
            onClose={handleFormClose}
            clientId={id!}
            type="expense"
            editItem={editingType === 'expense' ? editingItem : undefined}
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
    </div>
  );
};

export default MonthlyBudget;
