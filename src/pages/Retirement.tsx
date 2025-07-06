
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PiggyBank, Clock, TrendingUp, Calculator } from "lucide-react";

const Retirement = () => {
  const { id } = useParams();
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const clients = JSON.parse(localStorage.getItem('vibeplanner_clients') || '[]');
    const foundClient = clients.find((c: any) => c.id === id);
    setClient(foundClient);
  }, [id]);

  // Mock retirement data
  const retirementData = {
    currentAge: 35,
    retirementAge: 60,
    currentAccumulated: 125000,
    monthlyContribution: 1500,
    desiredMonthlyIncome: 8000,
    projectedValue: 950000,
    shortfall: 200000
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const yearsToRetirement = retirementData.retirementAge - retirementData.currentAge;
  const progressPercentage = (retirementData.currentAccumulated / retirementData.projectedValue) * 100;

  if (!client) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Previdência</h1>
          <p className="text-gray-600 mt-2">Planejamento para aposentadoria - {client.name}</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Calculator className="mr-2 h-4 w-4" />
          Recalcular Projeção
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Idade Atual</p>
                <p className="text-2xl font-bold text-primary">{retirementData.currentAge}</p>
                <p className="text-xs text-gray-500">anos</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aposentadoria</p>
                <p className="text-2xl font-bold text-blue-600">{retirementData.retirementAge}</p>
                <p className="text-xs text-gray-500">anos</p>
              </div>
              <PiggyBank className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Faltam</p>
                <p className="text-2xl font-bold text-orange-600">{yearsToRetirement}</p>
                <p className="text-xs text-gray-500">anos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progresso</p>
                <p className="text-2xl font-bold text-green-600">{progressPercentage.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">da meta</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5 text-primary" />
            Situação Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Valor Acumulado</h4>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(retirementData.currentAccumulated)}
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Aporte Mensal</h4>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(retirementData.monthlyContribution)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Renda Desejada</h4>
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(retirementData.desiredMonthlyIncome)}
                </p>
                <p className="text-purple-600 text-sm">por mês na aposentadoria</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">Valor Necessário</h4>
                <p className="text-3xl font-bold text-orange-600">
                  {formatCurrency(retirementData.projectedValue)}
                </p>
                <p className="text-orange-600 text-sm">para atingir a meta</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progresso da Meta</span>
              <span className="text-sm font-medium">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-sm text-gray-600">
              Faltam {formatCurrency(retirementData.projectedValue - retirementData.currentAccumulated)} para atingir a meta
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Projeção de Aposentadoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Cenário com Aportes Atuais</h4>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor projetado aos 60 anos:</span>
                  <span className="font-semibold">{formatCurrency(retirementData.projectedValue)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Renda mensal estimada:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(6800)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Diferença da meta:</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(1200)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Para Atingir a Meta</h4>
              
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-700">Aporte necessário:</span>
                  <span className="font-semibold text-blue-800">{formatCurrency(1850)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-blue-700">Aumento necessário:</span>
                  <span className="font-semibold text-blue-800">+{formatCurrency(350)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-blue-700">% da renda atual:</span>
                  <span className="font-semibold text-blue-800">21.8%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Aumentar Contribuição Mensal
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Para atingir a renda desejada de {formatCurrency(retirementData.desiredMonthlyIncome)}, 
                    é recomendado aumentar o aporte mensal em {formatCurrency(350)}, totalizando {formatCurrency(1850)} por mês.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Diversificar Investimentos
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Considere diversificar entre diferentes tipos de investimentos para otimizar 
                    o rendimento ao longo dos próximos {yearsToRetirement} anos.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Revisar Anualmente
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Realize revisões anuais do planejamento previdenciário para ajustar 
                    as contribuições conforme mudanças na renda e objetivos.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Retirement;
