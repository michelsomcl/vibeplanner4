
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Edit, Calculator } from "lucide-react";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

interface AssetCardProps {
  asset: any;
  clientId: string;
  formatCurrency: (value: number) => string;
  calculateRealReturn: (nominalReturn: number, inflation?: number) => number;
}

export default function AssetCard({ asset, clientId, formatCurrency, calculateRealReturn }: AssetCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: string) => {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', clientId] });
      toast({
        title: "Ativo excluído com sucesso!"
      });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      console.error('Erro ao excluir ativo:', error);
      toast({
        title: "Erro ao excluir ativo",
        variant: "destructive"
      });
    }
  });

  const handleDelete = () => {
    deleteAssetMutation.mutate(asset.id);
  };

  return (
    <>
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">{asset.type}</h3>
              <p className="text-sm text-gray-600">{asset.description}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="text-blue-600">
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Valor Atual:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(asset.current_value)}
              </span>
            </div>
            {asset.expected_return > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Rentabilidade Bruta:</span>
                  <span className="font-medium">{asset.expected_return}% a.a.</span>
                </div>
                <div className="flex justify-between">
                  <span>Rentabilidade Real:</span>
                  <span className="font-medium text-blue-600">
                    {calculateRealReturn(asset.expected_return).toFixed(2)}% a.a.
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                  <Calculator className="inline h-3 w-3 mr-1" />
                  Rentabilidade real considerando IPCA médio de 4% a.a.
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        itemName={asset.description}
        itemType="ativo"
      />
    </>
  );
}
