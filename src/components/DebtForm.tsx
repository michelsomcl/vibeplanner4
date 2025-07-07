
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DebtFormProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  editDebt?: any;
}

const DebtForm = ({ isOpen, onClose, clientId, editDebt }: DebtFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    total_amount: '',
    installment_value: '',
    remaining_installments: '',
    interest_rate: '',
    due_date: '',
    payoff_method: 'snowball',
    observations: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (editDebt) {
      setFormData({
        name: editDebt.name || '',
        institution: editDebt.institution || '',
        total_amount: editDebt.total_amount?.toString() || '',
        installment_value: editDebt.installment_value?.toString() || '',
        remaining_installments: editDebt.remaining_installments?.toString() || '',
        interest_rate: editDebt.interest_rate?.toString() || '',
        due_date: editDebt.due_date || '',
        payoff_method: editDebt.payoff_method || 'snowball',
        observations: editDebt.observations || ''
      });
    } else {
      resetForm();
    }
  }, [editDebt, isOpen]);

  const createDebtMutation = useMutation({
    mutationFn: async (debtData: any) => {
      const { data, error } = await supabase
        .from('debts')
        .insert([{
          ...debtData,
          client_id: clientId,
          total_amount: parseFloat(debtData.total_amount) || 0,
          installment_value: parseFloat(debtData.installment_value) || 0,
          remaining_installments: parseInt(debtData.remaining_installments) || 0,
          interest_rate: parseFloat(debtData.interest_rate) || 0,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', clientId] });
      toast.success('Dívida adicionada com sucesso!');
      onClose();
      resetForm();
    },
    onError: (error) => {
      console.error('Erro ao criar dívida:', error);
      toast.error('Erro ao adicionar dívida');
    },
  });

  const updateDebtMutation = useMutation({
    mutationFn: async (debtData: any) => {
      const { data, error } = await supabase
        .from('debts')
        .update({
          name: debtData.name,
          institution: debtData.institution,
          total_amount: parseFloat(debtData.total_amount) || 0,
          installment_value: parseFloat(debtData.installment_value) || 0,
          remaining_installments: parseInt(debtData.remaining_installments) || 0,
          interest_rate: parseFloat(debtData.interest_rate) || 0,
          due_date: debtData.due_date,
          payoff_method: debtData.payoff_method,
          observations: debtData.observations,
        })
        .eq('id', editDebt.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', clientId] });
      toast.success('Dívida atualizada com sucesso!');
      onClose();
      resetForm();
    },
    onError: (error) => {
      console.error('Erro ao atualizar dívida:', error);
      toast.error('Erro ao atualizar dívida');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      institution: '',
      total_amount: '',
      installment_value: '',
      remaining_installments: '',
      interest_rate: '',
      due_date: '',
      payoff_method: 'snowball',
      observations: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.institution) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editDebt) {
      updateDebtMutation.mutate(formData);
    } else {
      createDebtMutation.mutate(formData);
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const isLoading = createDebtMutation.isPending || updateDebtMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editDebt ? 'Editar' : 'Nova'} Dívida
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome da Dívida *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Cartão de Crédito"
                required
              />
            </div>
            <div>
              <Label htmlFor="institution">Instituição *</Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => setFormData({...formData, institution: e.target.value})}
                placeholder="Ex: Banco do Brasil"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total">Valor Total</Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="installment">Valor da Parcela</Label>
              <Input
                id="installment"
                type="number"
                step="0.01"
                value={formData.installment_value}
                onChange={(e) => setFormData({...formData, installment_value: e.target.value})}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="installments">Parcelas Restantes</Label>
              <Input
                id="installments"
                type="number"
                value={formData.remaining_installments}
                onChange={(e) => setFormData({...formData, remaining_installments: e.target.value})}
                placeholder="12"
              />
            </div>
            <div>
              <Label htmlFor="interest">Taxa de Juros (% a.m.)</Label>
              <Input
                id="interest"
                type="number"
                step="0.01"
                value={formData.interest_rate}
                onChange={(e) => setFormData({...formData, interest_rate: e.target.value})}
                placeholder="2.5"
              />
            </div>
            <div>
              <Label htmlFor="due_date">Data de Vencimento</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="method">Método de Quitação</Label>
            <Select 
              value={formData.payoff_method} 
              onValueChange={(value) => setFormData({...formData, payoff_method: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="snowball">Bola de Neve</SelectItem>
                <SelectItem value="avalanche">Avalanche</SelectItem>
                <SelectItem value="minimum">Pagamento Mínimo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {editDebt ? 'Atualizar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DebtForm;
