
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import BudgetHeader from "@/components/budget/BudgetHeader";
import BudgetAlerts from "@/components/budget/BudgetAlerts";
import BudgetSummaryCards from "@/components/budget/BudgetSummaryCards";
import BudgetItemsList from "@/components/budget/BudgetItemsList";
import BudgetForms from "@/components/budget/BudgetForms";
import { useBudgetData } from "@/hooks/useBudgetData";
import { useBudgetMutations } from "@/hooks/useBudgetMutations";

const MonthlyBudget = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<'income' | 'expense'>('income');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const { client, clientLoading, categories, initializeCategories } = useBudgetData(id);

  // Find the current open cycle - simplified logic
  const { data: currentOpenCycle, isLoading: openCycleLoading } = useQuery({
    queryKey: ['current-open-cycle', id],
    queryFn: async () => {
      if (!id) return null;

      const today = new Date();
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 7) + '-01';
      
      console.log('Checking current month:', currentMonth);
      
      // Check if current month is closed
      const { data: currentClosure } = await supabase
        .from('budget_closures')
        .select('*')
        .eq('client_id', id)
        .eq('month_year', currentMonth)
        .maybeSingle();

      console.log('Current month closure:', currentClosure);

      // If current month is not closed, use it
      if (!currentClosure) {
        console.log('Using current month:', currentMonth);
        return currentMonth;
      }

      // If current month is closed, check next month
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().slice(0, 7) + '-01';
      
      console.log('Checking next month:', nextMonth);
      
      const { data: nextClosure } = await supabase
        .from('budget_closures')
        .select('*')
        .eq('client_id', id)
        .eq('month_year', nextMonth)
        .maybeSingle();

      console.log('Next month closure:', nextClosure);

      // If next month is not closed, use it
      if (!nextClosure) {
        console.log('Using next month:', nextMonth);
        return nextMonth;
      }

      // If both current and next month are closed, use current month anyway
      // This prevents jumping too far into the future
      console.log('Both months closed, defaulting to current month:', currentMonth);
      return currentMonth;
    },
    enabled: !!id,
  });

  // Get budget items for the current open cycle
  const { data: budgetItems, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget-items', id, currentOpenCycle],
    queryFn: async () => {
      if (!id || !currentOpenCycle) return [];
      
      console.log('Fetching budget items for cycle:', currentOpenCycle);
      
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
        .eq('month_year', currentOpenCycle);
      
      if (error) throw error;
      console.log('Budget items found:', data?.length || 0);
      return data;
    },
    enabled: !!id && !!currentOpenCycle,
  });

  // Get previous month data for copying
  const { data: previousMonthData } = useQuery({
    queryKey: ['previous-month-items', id, currentOpenCycle],
    queryFn: async () => {
      if (!id || !currentOpenCycle) return [];
      
      const currentDate = new Date(currentOpenCycle);
      const previousMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const previousMonth = previousMonthDate.toISOString().slice(0, 7) + '-01';
      
      console.log('Checking previous month data for:', previousMonth);
      
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
        .eq('month_year', previousMonth);
      
      if (error) throw error;
      console.log('Previous month data found:', data?.length || 0, 'items');
      return data;
    },
    enabled: !!id && !!currentOpenCycle,
  });

  // Check if current cycle is closed
  const { data: monthClosure } = useQuery({
    queryKey: ['budget-closure', id, currentOpenCycle],
    queryFn: async () => {
      if (!id || !currentOpenCycle) return null;
      
      const { data, error } = await supabase
        .from('budget_closures')
        .select('*')
        .eq('client_id', id)
        .eq('month_year', currentOpenCycle)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!currentOpenCycle,
  });

  const { closeMonthMutation, copyFromPreviousMonthMutation, deleteItemMutation } = 
    useBudgetMutations(id, currentOpenCycle);

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
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleFormClose = () => {
    setIncomeFormOpen(false);
    setExpenseFormOpen(false);
    setEditingItem(null);
  };

  const handleCloseMonth = () => {
    if (budgetItems) {
      closeMonthMutation.mutate(budgetItems);
    }
  };

  const handleViewHistory = () => {
    navigate(`/client/${id}/budget/history`);
  };

  const handleCopyFromPreviousMonth = () => {
    if (!previousMonthData || previousMonthData.length === 0) {
      return;
    }

    if (confirm('Deseja copiar as metas e orçamentos do mês anterior? Os valores realizados permanecerão vazios.')) {
      copyFromPreviousMonthMutation.mutate({
        previousMonthData,
        budgetItems: budgetItems || []
      });
    }
  };

  const isLoading = clientLoading || budgetLoading || openCycleLoading;
  const isMonthClosed = !!monthClosure;
  
  // Check if there's previous month data
  const hasPreviousMonthData = previousMonthData && previousMonthData.length > 0;

  console.log('Debug info:', {
    currentOpenCycle,
    hasPreviousMonthData,
    previousMonthDataLength: previousMonthData?.length || 0,
    isMonthClosed,
    budgetItemsLength: budgetItems?.length || 0
  });

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
      <BudgetHeader
        clientName={client?.name || ''}
        monthYear={currentOpenCycle || ''}
        isMonthClosed={isMonthClosed}
        hasPreviousMonthData={hasPreviousMonthData}
        isCopyingFromPrevious={copyFromPreviousMonthMutation.isPending}
        onViewHistory={handleViewHistory}
        onCopyFromPreviousMonth={handleCopyFromPreviousMonth}
        onAddIncome={() => setIncomeFormOpen(true)}
        onAddExpense={() => setExpenseFormOpen(true)}
        onCloseMonth={handleCloseMonth}
        isClosingMonth={closeMonthMutation.isPending}
        hasBudgetItems={!!(budgetItems && budgetItems.length > 0)}
      />

      <BudgetAlerts
        isMonthClosed={isMonthClosed}
        closureDate={monthClosure?.closure_date}
        actualBalance={actualBalance}
      />

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
        isReadOnly={isMonthClosed}
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
        isReadOnly={isMonthClosed}
      />

      <BudgetForms
        incomeFormOpen={incomeFormOpen}
        expenseFormOpen={expenseFormOpen}
        deleteDialogOpen={deleteDialogOpen}
        editingItem={editingItem}
        editingType={editingType}
        itemToDelete={itemToDelete}
        clientId={id!}
        monthYear={currentOpenCycle}
        isReadOnly={isMonthClosed}
        onFormClose={handleFormClose}
        onDeleteClose={() => setDeleteDialogOpen(false)}
        onConfirmDelete={confirmDelete}
      />
    </div>
  );
};

export default MonthlyBudget;
