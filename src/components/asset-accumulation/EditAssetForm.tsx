
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditAssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
  clientId: string;
  formatCurrency: (value: number) => string;
}

const EditAssetForm = ({ isOpen, onClose, asset, clientId, formatCurrency }: EditAssetFormProps) => {
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    current_value: "",
    expected_return: "",
    maturity_date: "",
    observations: ""
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (asset) {
      setFormData({
        type: asset.type || "",
        description: asset.description || "",
        current_value: asset.current_value?.toString() || "",
        expected_return: asset.expected_return?.toString() || "",
        maturity_date: asset.maturity_date || "",
        observations: asset.observations || ""
      });
    }
  }, [asset]);

  const updateAssetMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('assets')
        .update({
          type: data.type,
          description: data.description,
          current_value: parseFloat(data.current_value),
          expected_return: data.expected_return ? parseFloat(data.expected_return) : null,
          maturity_date: data.maturity_date || null,
          observations: data.observations || null
        })
        .eq('id', asset.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', clientId] });
      toast.success('Ativo atualizado com sucesso!');
      onClose();
    },
    onError: (error) => {
      console.error('Erro ao atualizar ativo:', error);
      toast.error('Erro ao atualizar ativo');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.description || !formData.current_value) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    updateAssetMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Ativo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Input 
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                placeholder="Ex: Imóvel, Investimento, Reserva"
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_value">Valor Atual (R$) *</Label>
              <Input 
                id="current_value"
                type="number" 
                step="0.01"
                value={formData.current_value}
                onChange={(e) => setFormData(prev => ({ ...prev, current_value: e.target.value }))}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_return">Rentabilidade Esperada (%)</Label>
              <Input 
                id="expected_return"
                type="number" 
                step="0.01"
                value={formData.expected_return}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_return: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maturity_date">Data de Vencimento</Label>
              <Input 
                id="maturity_date"
                type="date"
                value={formData.maturity_date}
                onChange={(e) => setFormData(prev => ({ ...prev, maturity_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input 
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição do ativo"
              required 
            />
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

          {/* Show projected value if return and maturity date are provided */}
          {formData.current_value && formData.expected_return && formData.maturity_date && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Projeção de Retorno</h4>
              <div className="text-sm text-blue-700">
                {(() => {
                  const currentValue = parseFloat(formData.current_value);
                  const expectedReturn = parseFloat(formData.expected_return);
                  const maturityDate = new Date(formData.maturity_date);
                  const currentDate = new Date();
                  const monthsToMaturity = (maturityDate.getFullYear() - currentDate.getFullYear()) * 12 + 
                                          (maturityDate.getMonth() - currentDate.getMonth());
                  
                  if (monthsToMaturity > 0) {
                    const yearsToMaturity = monthsToMaturity / 12;
                    const projectedValue = currentValue * Math.pow(1 + expectedReturn / 100, yearsToMaturity);
                    const monetaryReturn = projectedValue - currentValue;
                    
                    return (
                      <>
                        <p>Período: {monthsToMaturity} meses ({yearsToMaturity.toFixed(1)} anos)</p>
                        <p>Valor Projetado: {formatCurrency(projectedValue)}</p>
                        <p>Retorno Monetário: {formatCurrency(monetaryReturn)}</p>
                      </>
                    );
                  } else {
                    return <p>Data de vencimento deve ser futura</p>;
                  }
                })()}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateAssetMutation.isPending}>
              {updateAssetMutation.isPending ? 'Atualizando...' : 'Atualizar Ativo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssetForm;
