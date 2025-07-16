
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DebtPaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  debt: any;
  clientId: string;
}

const DebtPaymentForm = ({ isOpen, onClose, debt, clientId }: DebtPaymentFormProps) => {
  const [formData, setFormData] = useState({
    payment_amount: '',
    payment_date: new Date(),
    observations: ''
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (debt) {
      setFormData({
        payment_amount: debt.installment_value?.toString() || '',
        payment_date: new Date(),
        observations: ''
      });
    }
  }, [debt]);

  const createPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const paymentAmount = parseFloat(data.payment_amount);
      
      // First, register the payment
      const { error: paymentError } = await supabase
        .from('debt_payments')
        .insert([{
          debt_id: debt.id,
          client_id: clientId,
          payment_amount: paymentAmount,
          payment_date: data.payment_date.toISOString().split('T')[0],
          observations: data.observations
        }]);
      
      if (paymentError) throw paymentError;

      // Update the debt information
      const newTotalAmount = Math.max(0, debt.total_amount - paymentAmount);
      const newRemainingInstallments = Math.max(0, debt.remaining_installments - 1);
      
      // Check if debt is fully paid
      const isFullyPaid = newTotalAmount <= 0 || newRemainingInstallments <= 0;
      const newStatus = isFullyPaid ? 'paid' : debt.status;
      
      const { error: debtError } = await supabase
        .from('debts')
        .update({
          total_amount: newTotalAmount,
          remaining_installments: newRemainingInstallments,
          status: newStatus
        })
        .eq('id', debt.id);
      
      if (debtError) throw debtError;

      return { paymentAmount, isFullyPaid };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['debt-payments', clientId] });
      queryClient.invalidateQueries({ queryKey: ['debts', clientId] });
      
      if (result.isFullyPaid) {
        toast.success('Pagamento registrado! Dívida quitada com sucesso!');
      } else {
        toast.success('Pagamento registrado com sucesso!');
      }
      
      onClose();
      resetForm();
    },
    onError: (error) => {
      console.error('Erro ao registrar pagamento:', error);
      toast.error('Erro ao registrar pagamento');
    },
  });

  const resetForm = () => {
    setFormData({
      payment_amount: debt?.installment_value?.toString() || '',
      payment_date: new Date(),
      observations: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.payment_amount) {
      toast.error('Valor do pagamento é obrigatório');
      return;
    }

    const paymentAmount = parseFloat(formData.payment_amount);
    if (paymentAmount > debt.total_amount) {
      toast.error('Valor do pagamento não pode ser maior que o total da dívida');
      return;
    }

    createPaymentMutation.mutate(formData);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <p className="text-sm text-gray-600">{debt?.name} - {debt?.institution}</p>
          <div className="text-xs text-gray-500 mt-2">
            <p>Total da dívida: {formatCurrency(debt?.total_amount || 0)}</p>
            <p>Parcelas restantes: {debt?.remaining_installments || 0}</p>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="payment_amount">Valor do Pagamento (R$) *</Label>
            <Input
              id="payment_amount"
              type="number"
              step="0.01"
              value={formData.payment_amount}
              onChange={(e) => setFormData({...formData, payment_amount: e.target.value})}
              max={debt?.total_amount}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Máximo: {formatCurrency(debt?.total_amount || 0)}
            </p>
          </div>

          <div>
            <Label>Data do Pagamento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.payment_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.payment_date ? format(formData.payment_date, "dd/MM/yyyy") : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.payment_date}
                  onSelect={(date) => setFormData({...formData, payment_date: date || new Date()})}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
              placeholder="Informações adicionais sobre o pagamento"
              rows={3}
            />
          </div>

          {/* Payment Impact Preview */}
          {formData.payment_amount && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <h4 className="font-medium text-blue-900 mb-2">Impacto do Pagamento:</h4>
              <div className="space-y-1 text-blue-700">
                <p>Valor atual da dívida: {formatCurrency(debt?.total_amount || 0)}</p>
                <p>Após pagamento: {formatCurrency(Math.max(0, (debt?.total_amount || 0) - parseFloat(formData.payment_amount)))}</p>
                <p>Parcelas restantes: {Math.max(0, (debt?.remaining_installments || 0) - 1)}</p>
                {(debt?.total_amount || 0) - parseFloat(formData.payment_amount) <= 0 && (
                  <p className="font-bold text-green-700">✓ Dívida será quitada!</p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createPaymentMutation.isPending}>
              {createPaymentMutation.isPending ? 'Registrando...' : 'Registrar Pagamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DebtPaymentForm;
