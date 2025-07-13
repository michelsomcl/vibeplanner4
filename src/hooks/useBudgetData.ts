
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useBudgetData = (clientId: string | undefined) => {
  const queryClient = useQueryClient();

  // Get client data
  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      if (!clientId) throw new Error('ID do cliente não fornecido');
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
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

  return {
    client,
    clientLoading,
    categories,
    categoriesLoading,
    initializeCategories
  };
};
