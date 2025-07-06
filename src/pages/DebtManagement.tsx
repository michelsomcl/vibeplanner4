import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit,
  DollarSign,
  Calendar,
  TrendingDown,
  AlertCircle
} from "lucide-react";

export default function DebtManagement() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    total_amount: '',
    remaining_installments: '',
    installment_value: '',
    interest_rate: '',
    due_date: '',
    status: 'active',
    payoff_method: 'snowball',
    observations: ''
  });

  const { data: client } = useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do cliente não fornecido');
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: debts, isLoading } = useQuery({
    queryKey: ['debts', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do cliente não fornecido');
      
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('client_id', id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const createDebtMutation = useMutation({
    mutationFn: async (debtData: any) => {
      const { data, error } = await supabase
        .from('debts')
        .insert([{ ...debtData, client_id: id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', id] });
      toast({
        title: "Dívida criada com sucesso!",
        description: "A nova dívida foi adicionada ao planejamento.",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar dívida",
        description: "Ocorreu um erro ao salvar a dívida. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateDebtMutation = useMutation({
    mutationFn: async ({ debtId, debtData }: { debtId: string, debtData: any }) => {
      const { data, error } = await supabase
        .from('debts')
        .update(debtData)
        .eq('id', debtId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', id] });
      toast({
        title: "Dívida atualizada com sucesso!",
        description: "As informações da dívida foram atualizadas.",
      });
      setIsDialogOpen(false);
      setEditingDebt(null);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar dívida",
        description: "Ocorreu um erro ao atualizar a dívida. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteDebtMutation = useMutation({
    mutationFn: async (debtId: string) => {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', debtId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', id] });
      toast({
        title: "Dívida removida com sucesso!",
        description: "A dívida foi removida do planejamento.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover dívida",
        description: "Ocorreu um erro ao remover a dívida. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      institution: '',
      total_amount: '',
      remaining_installments: '',
      installment_value: '',
      interest_rate: '',
      due_date: '',
      status: 'active',
      payoff_method: 'snowball',
      observations: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const debtData = {
      ...formData,
      total_amount: parseFloat(formData.total_amount),
      remaining_installments: parseInt(formData.remaining_installments),
      installment_value: parseFloat(formData.installment_value),
      interest_rate: parseFloat(formData.interest_rate),
    };

    if (editingDebt) {
      updateDebtMutation.mutate({ debtId: editingDebt.id, debtData });
    } else {
      createDebtMutation.mutate(debtData);
    }
  };

  const handleEdit = (debt: any) => {
    setEditingDebt(debt);
    setFormData({
      name: debt.name,
      institution: debt.institution,
      total_amount: debt.total_amount.toString(),
      remaining_installments: debt.remaining_installments.toString(),
      installment_value: debt.installment_value.toString(),
      interest_rate: debt.interest_rate.toString(),
      due_date: debt.due_date,
      status: debt.status,
      payoff_method: debt.payoff_method || 'snowball',
      observations: debt.observations || ''
    });
    setIsDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500';
      case 'negotiated': return 'bg-yellow-500';
      case 'paid': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'negotiated': return 'Negociada';
      case 'paid': return 'Quitada';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to={`/client/${id}`}>
              <Button variant="outline" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reestruturação Financeira</h1>
              <p className="text-gray-600">{client?.name}</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingDebt(null); resetForm(); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Dívida
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingDebt ? 'Editar Dívida' : 'Nova Dívida'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome da Dívida</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="institution">Instituição</Label>
                    <Input
                      id="institution"
                      value={formData.institution}
                      onChange={(e) => setFormData({...formData, institution: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="total_amount">Valor Total</Label>
                    <Input
                      id="total_amount"
                      type="number"
                      step="0.01"
                      value={formData.total_amount}
                      onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="remaining_installments">Parcelas Restantes</Label>
                    <Input
                      id="remaining_installments"
                      type="number"
                      value={formData.remaining_installments}
                      onChange={(e) => setFormData({...formData, remaining_installments: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="installment_value">Valor da Parcela</Label>
                    <Input
                      id="installment_value"
                      type="number"
                      step="0.01"
                      value={formData.installment_value}
                      onChange={(e) => setFormData({...formData, installment_value: e.target.value})}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="interest_rate">Taxa de Juros (%)</Label>
                    <Input
                      id="interest_rate"
                      type="number"
                      step="0.01"
                      value={formData.interest_rate}
                      onChange={(e) => setFormData({...formData, interest_rate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="due_date">Data de Vencimento</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativa</SelectItem>
                        <SelectItem value="negotiated">Negociada</SelectItem>
                        <SelectItem value="paid">Quitada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="payoff_method">Método de Quitação</Label>
                  <Select value={formData.payoff_method} onValueChange={(value) => setFormData({...formData, payoff_method: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="snowball">Snowball (menor saldo primeiro)</SelectItem>
                      <SelectItem value="avalanche">Avalanche (maior juros primeiro)</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({...formData, observations: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createDebtMutation.isPending || updateDebtMutation.isPending}>
                    {editingDebt ? 'Atualizar' : 'Criar'} Dívida
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {debts?.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma dívida cadastrada
            </h3>
            <p className="text-gray-600 mb-6">
              Comece adicionando as dívidas do cliente para estruturar o plano de quitação.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {debts?.map((debt) => (
              <Card key={debt.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{debt.name}</CardTitle>
                      <p className="text-sm text-gray-600">{debt.institution}</p>
                    </div>
                    <Badge className={`${getStatusColor(debt.status)} text-white`}>
                      {getStatusText(debt.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium">Valor Total</p>
                        <p className="text-green-600">{formatCurrency(debt.total_amount)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium">Parcela</p>
                        <p className="text-blue-600">{formatCurrency(debt.installment_value)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="font-medium">Vencimento</p>
                        <p className="text-orange-600">{formatDate(debt.due_date)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium">Restantes</p>
                      <p>{debt.remaining_installments}x</p>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="font-medium">Taxa de Juros</p>
                    <p className="text-red-600">{debt.interest_rate}% a.m.</p>
                  </div>
                  
                  {debt.observations && (
                    <div className="text-sm">
                      <p className="font-medium">Observações</p>
                      <p className="text-gray-600">{debt.observations}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(debt)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDebtMutation.mutate(debt.id)}
                      disabled={deleteDebtMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
