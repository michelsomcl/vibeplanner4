
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  User, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Building, 
  Users,
  Download,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FinalReport = () => {
  const { id } = useParams();

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

  const { data: debts } = useQuery({
    queryKey: ['debts', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('client_id', id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: assets } = useQuery({
    queryKey: ['assets', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('client_id', id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: goals } = useQuery({
    queryKey: ['financial-goals', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('client_id', id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: retirementPlan } = useQuery({
    queryKey: ['retirement-planning', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('retirement_planning')
        .select('*')
        .eq('client_id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: successionAssets } = useQuery({
    queryKey: ['succession-assets', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('succession_assets')
        .select('*')
        .eq('client_id', id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: heirs } = useQuery({
    queryKey: ['heirs', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('heirs')
        .select('*')
        .eq('client_id', id);
      
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

  // Cálculos resumidos
  const totalDebts = debts?.reduce((sum, debt) => sum + debt.total_amount, 0) || 0;
  const totalAssets = assets?.reduce((sum, asset) => sum + asset.current_value, 0) || 0;
  const totalGoals = goals?.reduce((sum, goal) => sum + goal.target_value, 0) || 0;
  const completedGoals = goals?.filter(goal => (goal.progress || 0) >= 100).length || 0;
  const totalSuccessionAssets = successionAssets?.reduce((sum, asset) => sum + asset.estimated_value, 0) || 0;
  const netWorth = totalAssets - totalDebts;

  if (!client) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Relatório Financeiro Final
          </h1>
          <p className="text-gray-600 mt-2">Análise completa do planejamento financeiro</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Nome:</strong> {client.name}</p>
              <p><strong>Email:</strong> {client.email}</p>
              <p><strong>Telefone:</strong> {client.phone}</p>
            </div>
            <div>
              {client.birth_date && <p><strong>Data de Nascimento:</strong> {formatDate(client.birth_date)}</p>}
              {client.profession && <p><strong>Profissão:</strong> {client.profession}</p>}
              {client.marital_status && <p><strong>Estado Civil:</strong> {client.marital_status}</p>}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Renda Mensal</p>
              <p className="text-xl font-bold text-green-800">
                {formatCurrency(client.monthly_income || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Capital Disponível</p>
              <p className="text-xl font-bold text-blue-800">
                {formatCurrency(client.available_capital || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Patrimonial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumo Patrimonial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700">Total de Ativos</p>
              <p className="text-2xl font-bold text-green-800">
                {formatCurrency(totalAssets)}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-red-700">Total de Dívidas</p>
              <p className="text-2xl font-bold text-red-800">
                {formatCurrency(totalDebts)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-700">Patrimônio Líquido</p>
              <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                {formatCurrency(netWorth)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objetivos Financeiros */}
      {goals && goals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objetivos Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-sm text-purple-700">Total de Objetivos</p>
                <p className="text-xl font-bold text-purple-800">{goals.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-sm text-green-700">Objetivos Concluídos</p>
                <p className="text-xl font-bold text-green-800">{completedGoals}</p>
              </div>
            </div>
            <div className="space-y-3">
              {goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{goal.name}</p>
                    <p className="text-sm text-gray-600">
                      Meta: {formatCurrency(goal.target_value)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Progress value={goal.progress || 0} className="w-20 mb-1" />
                    <p className="text-xs text-gray-500">{(goal.progress || 0).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planejamento de Aposentadoria */}
      {retirementPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Planejamento de Aposentadoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Idade Atual</p>
                <p className="text-xl font-bold">{retirementPlan.current_age} anos</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Aposentadoria aos</p>
                <p className="text-xl font-bold">{retirementPlan.retirement_age} anos</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Contribuição Mensal</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(retirementPlan.monthly_contribution || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Planejamento Sucessório */}
      {(successionAssets && successionAssets.length > 0) || (heirs && heirs.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Planejamento Sucessório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Building className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-700">Bens Cadastrados</p>
                <p className="text-xl font-bold text-blue-800">{successionAssets?.length || 0}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-700">Valor Total</p>
                <p className="text-xl font-bold text-green-800">
                  {formatCurrency(totalSuccessionAssets)}
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-purple-700">Herdeiros</p>
                <p className="text-xl font-bold text-purple-800">{heirs?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observações e Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle>Observações e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {netWorth < 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800">⚠️ Atenção: Patrimônio Líquido Negativo</h4>
                <p className="text-red-700 mt-1">
                  Recomenda-se priorizar a quitação de dívidas antes de novos investimentos.
                </p>
              </div>
            )}
            
            {totalDebts > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800">💡 Gestão de Dívidas</h4>
                <p className="text-yellow-700 mt-1">
                  Considere estratégias de quitação como snowball ou avalanche para reduzir o endividamento.
                </p>
              </div>
            )}

            {!retirementPlan && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800">🎯 Planejamento de Aposentadoria</h4>
                <p className="text-blue-700 mt-1">
                  Recomenda-se iniciar o planejamento previdenciário o quanto antes para aproveitar os juros compostos.
                </p>
              </div>
            )}

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800">✅ Próximos Passos</h4>
              <ul className="text-green-700 mt-1 list-disc list-inside space-y-1">
                <li>Revisar e atualizar o planejamento trimestralmente</li>
                <li>Monitorar o progresso dos objetivos financeiros</li>
                <li>Manter a disciplina nos investimentos mensais</li>
                <li>Revisar estratégias conforme mudanças na vida pessoal</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rodapé */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-gray-500">
            <p>Relatório gerado em {new Date().toLocaleDateString('pt-BR')}</p>
            <p className="mt-1">Este relatório é confidencial e destina-se exclusivamente ao cliente.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinalReport;
