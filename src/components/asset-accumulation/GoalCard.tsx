
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Edit } from "lucide-react";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

interface GoalCardProps {
  goal: any;
  clientId: string;
  formatCurrency: (value: number) => string;
}

export default function GoalCard({ goal, clientId, formatCurrency }: GoalCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', goalId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_goals', clientId] });
      toast({
        title: "Meta excluída com sucesso!"
      });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      console.error('Erro ao excluir meta:', error);
      toast({
        title: "Erro ao excluir meta",
        variant: "destructive"
      });
    }
  });

  const handleDelete = () => {
    deleteGoalMutation.mutate(goal.id);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getStartEndMonths = () => {
    if (!goal.deadline) return null;
    
    // Use the actual creation date and deadline from the database
    const createdDate = new Date(goal.created_at);
    const deadlineDate = new Date(goal.deadline);
    
    // Format the start month from creation date
    const startMonth = formatDate(goal.created_at);
    
    // Format the end month from deadline
    const endMonth = formatDate(goal.deadline);
    
    return {
      start: startMonth,
      end: endMonth
    };
  };

  const progress = Math.min(goal.current_value / goal.target_value * 100, 100);
  const remainingValue = Math.max(goal.target_value - goal.current_value, 0);
  const months = getStartEndMonths();

  return (
    <>
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">{goal.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span>Meta: {formatCurrency(goal.target_value)}</span>
                <span>Atual: {formatCurrency(goal.current_value)}</span>
                <span>Restante: {formatCurrency(remainingValue)}</span>
                {goal.monthly_contribution > 0 && (
                  <span>Aporte: {formatCurrency(goal.monthly_contribution)}/mês</span>
                )}
              </div>
              {months && (
                <div className="text-sm text-gray-500 mt-2">
                  <span>Período: {months.start} até {months.end}</span>
                </div>
              )}
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
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        itemName={goal.name}
        itemType="meta"
      />
    </>
  );
}
