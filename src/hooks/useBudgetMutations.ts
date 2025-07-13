
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBudgetMutations = (clientId: string | undefined, currentOpenCycle?: string | null) => {
  const queryClient = useQueryClient();

  // Close month mutation
  const closeMonthMutation = useMutation({
    mutationFn: async (budgetItems: any[]) => {
      if (!clientId || !currentOpenCycle) throw new Error('Dados necessários não disponíveis');
      
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
          client_id: clientId,
          month_year: currentOpenCycle,
          total_planned_income: totalPlannedIncome,
          total_actual_income: totalActualIncome,
          total_planned_expenses: totalPlannedExpenses,
          total_actual_expenses: totalActualExpenses,
        });

      if (closureError) throw closureError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-open-cycle', clientId] });
      queryClient.invalidateQueries({ queryKey: ['budget-closure'] });
      queryClient.invalidateQueries({ queryKey: ['budget-items'] });
      toast.success('Mês fechado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao fechar mês:', error);
      toast.error('Erro ao fechar mês');
    },
  });

  // Copy from previous month mutation
  const copyFromPreviousMonthMutation = useMutation({
    mutationFn: async ({ previousMonthData, budgetItems }: { previousMonthData: any[], budgetItems: any[] }) => {
      if (!clientId || !currentOpenCycle || !previousMonthData || previousMonthData.length === 0) {
        throw new Error('Dados necessários não disponíveis');
      }

      // Check if current month already has items
      const existingItemsCount = budgetItems?.length || 0;
      if (existingItemsCount > 0) {
        throw new Error('O mês atual já possui lançamentos. Limpe os dados primeiro se desejar copiar do mês anterior.');
      }

      // Create new items for current month with only planned amounts
      const newItems = previousMonthData.map(item => ({
        client_id: clientId,
        category_id: item.category_id,
        name: item.name,
        month_year: currentOpenCycle,
        planned_amount: item.planned_amount || 0,
        actual_amount: 0,
        is_fixed: item.is_fixed
      }));

      const { error } = await supabase
        .from('budget_items')
        .insert(newItems);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-items', clientId, currentOpenCycle] });
      toast.success('Metas e orçamentos copiados do mês anterior com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao copiar do mês anterior:', error);
      toast.error(error.message || 'Erro ao copiar dados do mês anterior');
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
      queryClient.invalidateQueries({ queryKey: ['budget-items', clientId, currentOpenCycle] });
      toast.success('Item excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item');
    },
  });

  return {
    closeMonthMutation,
    copyFromPreviousMonthMutation,
    deleteItemMutation
  };
};
