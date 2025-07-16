
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditGoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  goal: any;
  clientId: string;
  formatCurrency: (value: number) => string;
}

const EditGoalForm = ({ isOpen, onClose, goal, clientId, formatCurrency }: EditGoalFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    target_value: "",
    current_value: "",
    start_month: "",
    end_month: "",
    observations: ""
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (goal) {
      // Extract start month from deadline for editing
      const deadline = goal.deadline ? new Date(goal.deadline) : new Date();
      const currentDate = new Date();
      const startMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      setFormData({
        name: goal.name || "",
        target_value: goal.target_value?.toString() || "",
        current_value: goal.current_value?.toString() || "",
        start_month: startMonth.toISOString().substring(0, 7),
        end_month: goal.deadline ? goal.deadline.substring(0, 7) : "",
        observations: goal.observations || ""
      });
    }
  }, [goal]);

  const updateGoalMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const currentValue = parseFloat(data.current_value) || 0;
      const targetValue = parseFloat(data.target_value);
      const progress = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;

      // Calculate months between start and end dates
      const startDate = new Date(data.start_month + '-01');
      const endDate = new Date(data.end_month + '-01');
      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                        (endDate.getMonth() - startDate.getMonth()) + 1;
      const remainingValue = targetValue - currentValue;
      const monthlyAverage = monthsDiff > 0 ? remainingValue / monthsDiff : 0;

      const { error } = await supabase
        .from('financial_goals')
        .update({
          name: data.name,
          target_value: targetValue,
          current_value: currentValue,
          monthly_contribution: monthlyAverage,
          deadline: data.end_month + '-01',
          progress: progress,
          observations: data.observations || null
        })
        .eq('id', goal.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_goals', clientId] });
      toast.success('Meta atualizada com sucesso!');
      onClose();
    },
    onError: (error) => {
      console.error('Erro ao atualizar meta:', error);
      toast.error('Erro ao atualizar meta');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.target_value || !formData.start_month || !formData.end_month) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    updateGoalMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Meta Financeira</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Meta *</Label>
              <Input 
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Casa própria, Reserva de emergência"
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_value">Valor Desejado (R$) *</Label>
              <Input 
                id="target_value"
                type="number" 
                step="0.01"
                value={formData.target_value}
                onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_value">Valor Atual (R$)</Label>
              <Input 
                id="current_value"
                type="number" 
                step="0.01"
                value={formData.current_value}
                onChange={(e) => setFormData(prev => ({ ...prev, current_value: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_month">Mês Inicial *</Label>
              <Input 
                id="start_month"
                type="month"
                value={formData.start_month}
                onChange={(e) => setFormData(prev => ({ ...prev, start_month: e.target.value }))}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_month">Mês Final *</Label>
              <Input 
                id="end_month"
                type="month"
                value={formData.end_month}
                onChange={(e) => setFormData(prev => ({ ...prev, end_month: e.target.value }))}
                required 
              />
            </div>

            {formData.start_month && formData.end_month && formData.target_value && formData.current_value && (
              <div className="space-y-2">
                <Label>Aporte Mensal Calculado</Label>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-700">
                    {(() => {
                      const startDate = new Date(formData.start_month + '-01');
                      const endDate = new Date(formData.end_month + '-01');
                      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                                        (endDate.getMonth() - startDate.getMonth()) + 1;
                      const remainingValue = parseFloat(formData.target_value) - parseFloat(formData.current_value || '0');
                      const monthlyAverage = monthsDiff > 0 ? remainingValue / monthsDiff : 0;
                      return formatCurrency(monthlyAverage);
                    })()}
                  </span>
                  <p className="text-sm text-blue-600 mt-1">
                    {(() => {
                      const startDate = new Date(formData.start_month + '-01');
                      const endDate = new Date(formData.end_month + '-01');
                      const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                                        (endDate.getMonth() - startDate.getMonth()) + 1;
                      return `Período: ${monthsDiff} meses`;
                    })()}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea 
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateGoalMutation.isPending}>
              {updateGoalMutation.isPending ? 'Atualizando...' : 'Atualizar Meta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGoalForm;
