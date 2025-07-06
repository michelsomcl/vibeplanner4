
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BudgetItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  type: 'income' | 'expense';
}

const BudgetItemForm = ({ isOpen, onClose, clientId, type }: BudgetItemFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    planned_amount: '',
    actual_amount: '',
    category_id: '',
    is_fixed: false
  });

  const queryClient = useQueryClient();
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

  const { data: categories } = useQuery({
    queryKey: ['budget-categories'],
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
    createItemMutation.mutate(formData);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Nova {type === 'income' ? 'Receita' : 'Despesa'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder={`Nome da ${type === 'income' ? 'receita' : 'despesa'}`}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria *</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => setFormData({...formData, category_id: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="planned">Valor Planejado</Label>
              <Input
                id="planned"
                type="number"
                step="0.01"
                value={formData.planned_amount}
                onChange={(e) => setFormData({...formData, planned_amount: e.target.value})}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="actual">Valor Real</Label>
              <Input
                id="actual"
                type="number"
                step="0.01"
                value={formData.actual_amount}
                onChange={(e) => setFormData({...formData, actual_amount: e.target.value})}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="fixed"
              checked={formData.is_fixed}
              onCheckedChange={(checked) => setFormData({...formData, is_fixed: checked})}
            />
            <Label htmlFor="fixed">Item fixo</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createItemMutation.isPending}>
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetItemForm;
