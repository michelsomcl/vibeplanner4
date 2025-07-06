import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BudgetItemForm from "@/components/BudgetItemForm";

const MonthlyBudget = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);

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

  // Get budget categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['budget-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  // Get current month's budget items
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01'; // YYYY-MM-01 format
  const { data: budgetItems, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget-items', id, currentMonth],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('budget_items')
        .select(`
          *,
          budget_categories (
            name,
            type
          )
        `)
        .eq('client_id', id)
        .eq('month_year', currentMonth);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Initialize categories mutation
  const initializeCategories = useMutation({
    mutationFn: async () => {
      const defaultCategories = [
        // Income categories
        { name: 'Salário', type: 'income' },
        { name: 'Freelances', type: 'income' },
        { name: 'Rendimentos', type: 'income' },
        { name: 'Outros Rendimentos', type: 'income' },
        // Expense categories
        { name: 'Moradia', type: 'expense' },
        { name: 'Alimentação', type: 'expense' },
        { name: 'Transporte', type: 'expense' },
        { name: 'Saúde', type: 'expense' },
        { name: 'Educação', type: 'expense' },
        { name: 'Lazer', type: 'expense' },
        { name: 'Vestuário', type: 'expense' },
        { name: 'Financeiro', type: 'expense' },
        { name: 'Outros', type: 'expense' }
      ];

      const { error } = await supabase
        .from('budget_categories')
        .upsert(defaultCategories, { 
          onConflict: 'name,type',
          ignoreDuplicates: true 
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-categories'] });
      toast.success('Categorias inicializadas com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao inicializar categorias:', error);
      toast.error('Erro ao inicializar categorias');
    },
  });

  // Initialize categories if empty
  useEffect(() => {
    if (categories && categories.length === 0) {
      initializeCategories.mutate();
    }
  }, [categories]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const income = budgetItems?.filter(item => item.budget_categories?.type === 'income') || [];
  const expenses = budgetItems?.filter(item => item.budget_categories?.type === 'expense') || [];

  const totalPlannedIncome = income.reduce((sum, item) => sum + (item.planned_amount || 0), 0);
  const totalActualIncome = income.reduce((sum, item) => sum + (item.actual_amount || 0), 0);
  const totalPlannedExpenses = expenses.reduce((sum, item) => sum + (item.planned_amount || 0), 0);
  const totalActualExpenses = expenses.reduce((sum, item) => sum + (item.actual_amount || 0), 0);
  
  const plannedBalance = totalPlannedIncome - totalPlannedExpenses;
  const actualBalance = totalActualIncome - totalActualExpenses;

  const getCategoryColor = (categoryName: string) => {
    const colors: { [key: string]: string } = {
      'Moradia': 'bg-blue-100 text-blue-800',
      'Alimentação': 'bg-green-100 text-green-800',
      'Transporte': 'bg-yellow-100 text-yellow-800',
      'Saúde': 'bg-red-100 text-red-800',
      'Lazer': 'bg-purple-100 text-purple-800',
      'Financeiro': 'bg-orange-100 text-orange-800',
      'Salário': 'bg-gray-100 text-gray-800',
      'Freelances': 'bg-indigo-100 text-indigo-800',
      'Rendimentos': 'bg-teal-100 text-teal-800'
    };
    return colors[categoryName] || 'bg-gray-100 text-gray-800';
  };

  const getVariance = (planned: number, actual: number) => {
    if (planned === 0) return 0;
    const variance = ((actual - planned) / planned) * 100;
    return variance;
  };

  const isLoading = clientLoading || categoriesLoading || budgetLoading;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Orçamento Mensal</h1>
          <p className="text-gray-600 mt-2">Controle financeiro - {client?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-green-500 text-green-600 hover:bg-green-50"
            onClick={() => setIncomeFormOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Receita
          </Button>
          <Button 
            variant="outline" 
            className="border-red-500 text-red-600 hover:bg-red-50"
            onClick={() => setExpenseFormOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalActualIncome)}</p>
                <p className="text-xs text-gray-500">Planejado: {formatCurrency(totalPlannedIncome)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Despesa Total</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalActualExpenses)}</p>
                <p className="text-xs text-gray-500">Planejado: {formatCurrency(totalPlannedExpenses)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Real</p>
                <p className={`text-2xl font-bold ${actualBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(actualBalance)}
                </p>
                <p className="text-xs text-gray-500">Planejado: {formatCurrency(plannedBalance)}</p>
              </div>
              <DollarSign className={`h-8 w-8 ${actualBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Poupança</p>
                <p className="text-2xl font-bold text-primary">
                  {totalActualIncome > 0 ? ((actualBalance / totalActualIncome) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-gray-500">da receita</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for negative balance */}
      {actualBalance < 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-600 mt-1" />
              <div>
                <h3 className="font-semibold text-red-800">Atenção: Orçamento no Vermelho</h3>
                <p className="text-red-700 text-sm mt-1">
                  As despesas estão superando as receitas. Revise o orçamento e identifique oportunidades de redução de custos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Income Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Receitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {income.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma receita cadastrada para este mês.</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => setIncomeFormOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Receita
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {income.map((item) => {
                const variance = getVariance(item.planned_amount || 0, item.actual_amount || 0);
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <Badge className={getCategoryColor(item.budget_categories?.name || '')} variant="secondary">
                          {item.budget_categories?.name}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.actual_amount || 0)}</p>
                        <p className="text-sm text-gray-500">Meta: {formatCurrency(item.planned_amount || 0)}</p>
                      </div>
                      
                      <div className="text-right min-w-[80px]">
                        <p className={`text-sm font-medium ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
                        </p>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expenses Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Despesas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma despesa cadastrada para este mês.</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={() => setExpenseFormOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Despesa
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((item) => {
                const variance = getVariance(item.planned_amount || 0, item.actual_amount || 0);
                const progressValue = (item.planned_amount || 0) > 0 ? ((item.actual_amount || 0) / (item.planned_amount || 0)) * 100 : 0;
                
                return (
                  <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <Badge className={getCategoryColor(item.budget_categories?.name || '')} variant="secondary">
                            {item.budget_categories?.name}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.actual_amount || 0)}</p>
                          <p className="text-sm text-gray-500">Orçado: {formatCurrency(item.planned_amount || 0)}</p>
                        </div>
                        
                        <div className="text-right min-w-[80px]">
                          <p className={`text-sm font-medium ${variance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
                          </p>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Progress 
                        value={Math.min(progressValue, 100)} 
                        className={`h-2 ${progressValue > 100 ? '[&>div]:bg-red-500' : '[&>div]:bg-blue-500'}`}
                      />
                      <p className="text-xs text-gray-500">
                        {progressValue.toFixed(1)}% do orçado
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forms */}
      <BudgetItemForm
        isOpen={incomeFormOpen}
        onClose={() => setIncomeFormOpen(false)}
        clientId={id!}
        type="income"
      />
      
      <BudgetItemForm
        isOpen={expenseFormOpen}
        onClose={() => setExpenseFormOpen(false)}
        clientId={id!}
        type="expense"
      />
    </div>
  );
};

export default MonthlyBudget;
