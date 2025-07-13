import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BudgetFormFields from "./budget-form/BudgetFormFields";

interface BudgetItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  type: 'income' | 'expense';
  editItem?: any;
  monthYear?: string;
}

const BudgetItemForm = ({ isOpen, onClose, clientId, type, editItem, monthYear }: BudgetItemFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    planned_amount: '',
    actual_amount: '',
    category_id: '',
    is_fixed: false
  });

  const queryClient = useQueryClient();
  const currentMonth = monthYear || new Date().toISOString().slice(0, 7) + '-01';

  // Reset form data when editItem changes or dialog opens
  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name || '',
        planned_amount: editItem.planned_amount?.toString() || '',
        actual_amount: editItem.actual_amount?.toString() || '',
        category_id: editItem.category_id || '',
        is_fixed: editItem.is_fixed || false
      });
    } else {
      resetForm();
    }
  }, [editItem, isOpen]);

  const { data: categories } = useQuery({
    queryKey: ['budget-categories', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('type', type)
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      const { data, error } = await supabase
        .from('budget_items')
        .insert([{
          ...itemData,
          client_id: clientId,
          month_year: currentMonth,
          planned_amount: parseFloat(itemData.planned_amount) || 0,
          actual_amount: parseFloat(itemData.actual_amount) || 0,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-items', clientId, currentMonth] });
      toast.success(`${type === 'income' ? 'Receita' : 'Despesa'} adicionada com sucesso!`);
      onClose();
      resetForm();
    },
    onError: (error) => {
      console.error('Erro ao criar item:', error);
      toast.error(`Erro ao adicionar ${type === 'income' ? 'receita' : 'despesa'}`);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      const { data, error } = await supabase
        .from('budget_items')
        .update({
          name: itemData.name,
          planned_amount: parseFloat(itemData.planned_amount) || 0,
          actual_amount: parseFloat(itemData.actual_amount) || 0,
          category_id: itemData.category_id,
          is_fixed: itemData.is_fixed,
        })
        .eq('id', editItem.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-items', clientId, currentMonth] });
      toast.success(`${type === 'income' ? 'Receita' : 'Despesa'} atualizada com sucesso!`);
      onClose();
      resetForm();
    },
    onError: (error) => {
      console.error('Erro ao atualizar item:', error);
      toast.error(`Erro ao atualizar ${type === 'income' ? 'receita' : 'despesa'}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      planned_amount: '',
      actual_amount: '',
      category_id: '',
      is_fixed: false
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editItem) {
      updateItemMutation.mutate(formData);
    } else {
      createItemMutation.mutate(formData);
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const isLoading = createItemMutation.isPending || updateItemMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editItem ? 'Editar' : 'Nova'} {type === 'income' ? 'Receita' : 'Despesa'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <BudgetFormFields
            formData={formData}
            setFormData={setFormData}
            categories={categories || []}
            type={type}
          />

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {editItem ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetItemForm;
