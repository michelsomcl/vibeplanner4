
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";

const MonthlyBudget = () => {
  const { id } = useParams();
  const [client, setClient] = useState<any>(null);
  const [income, setIncome] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    const clients = JSON.parse(localStorage.getItem('vibeplanner_clients') || '[]');
    const foundClient = clients.find((c: any) => c.id === id);
    setClient(foundClient);

    // Mock income data
    setIncome([
      { id: 1, description: "Salário Principal", planned: 8500, actual: 8500, category: "Fixa" },
      { id: 2, description: "Freelances", planned: 1500, actual: 1200, category: "Variável" },
      { id: 3, description: "Rendimentos", planned: 400, actual: 420, category: "Variável" }
    ]);

    // Mock expenses data
    setExpenses([
      { id: 1, description: "Aluguel", planned: 2200, actual: 2200, category: "Moradia" },
      { id: 2, description: "Mercado", planned: 800, actual: 950, category: "Alimentação" },
      { id: 3, description: "Combustível", planned: 400, actual: 380, category: "Transporte" },
      { id: 4, description: "Academia", planned: 120, actual: 120, category: "Saúde" },
      { id: 5, description: "Streaming", planned: 50, actual: 65, category: "Lazer" },
      { id: 6, description: "Cartão Crédito", planned: 1200, actual: 1350, category: "Financeiro" }
    ]);
  }, [id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalPlannedIncome = income.reduce((sum, item) => sum + item.planned, 0);
  const totalActualIncome = income.reduce((sum, item) => sum + item.actual, 0);
  const totalPlannedExpenses = expenses.reduce((sum, item) => sum + item.planned, 0);
  const totalActualExpenses = expenses.reduce((sum, item) => sum + item.actual, 0);
  
  const plannedBalance = totalPlannedIncome - totalPlannedExpenses;
  const actualBalance = totalActualIncome - totalActualExpenses;

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Moradia': 'bg-blue-100 text-blue-800',
      'Alimentação': 'bg-green-100 text-green-800',
      'Transporte': 'bg-yellow-100 text-yellow-800',
      'Saúde': 'bg-red-100 text-red-800',
      'Lazer': 'bg-purple-100 text-purple-800',
      'Financeiro': 'bg-orange-100 text-orange-800',
      'Fixa': 'bg-gray-100 text-gray-800',
      'Variável': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getVariance = (planned: number, actual: number) => {
    const variance = ((actual - planned) / planned) * 100;
    return variance;
  };

  if (!client) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Orçamento Mensal</h1>
          <p className="text-gray-600 mt-2">Controle financeiro - {client.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
            <Plus className="mr-2 h-4 w-4" />
            Nova Receita
          </Button>
          <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
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
          <div className="space-y-3">
            {income.map((item) => {
              const variance = getVariance(item.planned, item.actual);
              return (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <Badge className={getCategoryColor(item.category)} variant="secondary">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.actual)}</p>
                      <p className="text-sm text-gray-500">Meta: {formatCurrency(item.planned)}</p>
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
          <div className="space-y-3">
            {expenses.map((item) => {
              const variance = getVariance(item.planned, item.actual);
              const progressValue = (item.actual / item.planned) * 100;
              
              return (
                <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <Badge className={getCategoryColor(item.category)} variant="secondary">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(item.actual)}</p>
                        <p className="text-sm text-gray-500">Orçado: {formatCurrency(item.planned)}</p>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyBudget;
