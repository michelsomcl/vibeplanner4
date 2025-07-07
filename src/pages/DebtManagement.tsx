
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Calendar, Building, CreditCard, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DebtForm from "@/components/DebtForm";
import DebtPaymentForm from "@/components/DebtPaymentForm";
import DebtDiagnosis from "@/components/DebtDiagnosis";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

const DebtManagement = () => {
  const { id } = useParams();
  const [debtFormOpen, setDebtFormOpen] = useState(false);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [editingDebt, setEditingDebt] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState<any>(null);

  // Get client data
  const { data: client, isLoading: clientLoading } = useQuery({
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

  // Get debts
  const { data: debts, isLoading: debtsLoading } = useQuery({
    queryKey: ['debts', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Get debt payments
  const { data: debtPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['debt-payments', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('debt_payments')
        .select(`
          *,
          debts (
            name,
            institution
          )
        `)
        .eq('client_id', id)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

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
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'renegotiated':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'paid':
        return 'Quitada';
      case 'renegotiated':
        return 'Renegociada';
      default:
        return status;
    }
  };

  const handleRegisterPayment = (debt: any) => {
    setSelectedDebt(debt);
    setPaymentFormOpen(true);
  };

  const handleEditDebt = (debt: any) => {
    setEditingDebt(debt);
    setDebtFormOpen(true);
  };

  const handleFormClose = () => {
    setDebtFormOpen(false);
    setPaymentFormOpen(false);
    setEditingDebt(null);
    setSelectedDebt(null);
  };

  const isLoading = clientLoading || debtsLoading || paymentsLoading;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cliente não encontrado</h1>
        </div>
      </div>
    );
  }

  const activeDebts = debts?.filter(debt => debt.status === 'active') || [];
  const totalDebt = activeDebts.reduce((sum, debt) => sum + debt.total_amount, 0);
  const totalMonthlyPayment = activeDebts.reduce((sum, debt) => sum + debt.installment_value, 0);
  const totalPayments = debtPayments?.reduce((sum, payment) => sum + payment.payment_amount, 0) || 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Reestruturação Financeira</h1>
          <p className="text-gray-600 mt-2">Gestão de dívidas - {client?.name}</p>
        </div>
        <Button onClick={() => setDebtFormOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nova Dívida</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Dívidas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebt)}</p>
                <p className="text-xs text-gray-500">{activeDebts.length} dívidas ativas</p>
              </div>
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagamento Mensal</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalMonthlyPayment)}</p>
                <p className="text-xs text-gray-500">soma das parcelas</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pago</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPayments)}</p>
                <p className="text-xs text-gray-500">pagamentos registrados</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comprometimento</p>
                <p className="text-2xl font-bold text-blue-600">
                  {client.monthly_income > 0 ? ((totalMonthlyPayment / client.monthly_income) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-gray-500">da renda mensal</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debt Diagnosis */}
      {debts && debts.length > 0 && (
        <DebtDiagnosis debts={debts} monthlyIncome={client.monthly_income} />
      )}

      {/* Debts List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Dívidas</CardTitle>
        </CardHeader>
        <CardContent>
          {!debts || debts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma dívida cadastrada.</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => setDebtFormOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeira Dívida
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {debts.map((debt) => (
                <div key={debt.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{debt.name}</h3>
                        <Badge className={getStatusColor(debt.status)}>
                          {getStatusText(debt.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span>{debt.institution}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total: </span>
                          <span className="font-medium text-red-600">{formatCurrency(debt.total_amount)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Parcela: </span>
                          <span className="font-medium">{formatCurrency(debt.installment_value)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Vencimento: </span>
                          <span>{formatDate(debt.due_date)}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-2">
                        <div>
                          <span className="text-gray-600">Juros: </span>
                          <span className="font-medium">{debt.interest_rate}% a.m.</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Parcelas restantes: </span>
                          <span className="font-medium">{debt.remaining_installments}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Método: </span>
                          <span className="font-medium capitalize">{debt.payoff_method}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        onClick={() => handleRegisterPayment(debt)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <DollarSign className="h-4 w-4 mr-1" />
                        Registrar Pagamento
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditDebt(debt)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                  
                  {debt.observations && (
                    <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                      <span className="font-medium">Observações:</span> {debt.observations}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      {debtPayments && debtPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pagamentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {debtPayments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{payment.debts?.name}</p>
                    <p className="text-sm text-gray-600">{payment.debts?.institution}</p>
                    <p className="text-xs text-gray-500">{formatDate(payment.payment_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(payment.payment_amount)}</p>
                    {payment.observations && (
                      <p className="text-xs text-gray-500 max-w-32 truncate">{payment.observations}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forms */}
      <DebtForm
        isOpen={debtFormOpen}
        onClose={handleFormClose}
        clientId={id!}
        editDebt={editingDebt}
      />
      
      <DebtPaymentForm
        isOpen={paymentFormOpen}
        onClose={handleFormClose}
        debt={selectedDebt}
        clientId={id!}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => {}}
        itemName={debtToDelete?.name || ''}
        itemType="dívida"
      />
    </div>
  );
};

export default DebtManagement;
