import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, TrendingUp, Target, Trash2, Calculator } from "lucide-react";

export default function AssetAccumulation() {
  const { id: clientId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'assets' | 'goals'>('assets');
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);

  const [assetFormData, setAssetFormData] = useState({
    type: "",
    description: "",
    current_value: "",
    expected_return: "",
    observations: "",
    goal_id: "",
  });

  const [goalFormData, setGoalFormData] = useState({
    name: "",
    target_value: "",
    current_value: "",
    monthly_contribution: "",
    start_month: "",
    end_month: "",
    observations: "",
  });

  const { data: assets } = useQuery({
    queryKey: ['assets', clientId],
    queryFn: async () => {
      if (!clientId) throw new Error('ID do cliente não fornecido');
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  const { data: goals } = useQuery({
    queryKey: ['financial_goals', clientId],
    queryFn: async () => {
      if (!clientId) throw new Error('ID do cliente não fornecido');
      
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });

  const createAssetMutation = useMutation({
    mutationFn: async (data: typeof assetFormData) => {
      if (!clientId) throw new Error('ID do cliente não fornecido');
      
      const { data: asset, error } = await supabase
        .from('assets')
        .insert([{
          client_id: clientId,
          type: data.type,
          description: data.description,
          current_value: parseFloat(data.current_value),
          expected_return: data.expected_return ? parseFloat(data.expected_return) : 0,
          observations: data.observations || null,
        }])
        .select()
        .single();

      if (error) throw error;

      // If goal is selected, add asset value to goal
      if (data.goal_id) {
        const goal = goals?.find(g => g.id === data.goal_id);
        if (goal) {
          const newCurrentValue = goal.current_value + parseFloat(data.current_value);
          const progress = Math.min((newCurrentValue / goal.target_value) * 100, 100);

          await supabase
            .from('financial_goals')
            .update({
              current_value: newCurrentValue,
              progress: progress
            })
            .eq('id', data.goal_id);
        }
      }

      return asset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', clientId] });
      queryClient.invalidateQueries({ queryKey: ['financial_goals', clientId] });
      toast({ title: "Ativo cadastrado com sucesso!" });
      setShowAssetForm(false);
      setAssetFormData({ type: "", description: "", current_value: "", expected_return: "", observations: "", goal_id: "" });
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: typeof goalFormData) => {
      if (!clientId) throw new Error('ID do cliente não fornecido');
      
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

      const { data: goal, error } = await supabase
        .from('financial_goals')
        .insert([{
          client_id: clientId,
          name: data.name,
          target_value: targetValue,
          current_value: currentValue,
          monthly_contribution: monthlyAverage,
          deadline: data.end_month + '-01',
          progress: progress,
          observations: data.observations || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return goal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_goals', clientId] });
      toast({ title: "Meta cadastrada com sucesso!" });
      setShowGoalForm(false);
      setGoalFormData({ name: "", target_value: "", current_value: "", monthly_contribution: "", start_month: "", end_month: "", observations: "" });
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateRealReturn = (nominalReturn: number, inflation: number = 4) => {
    return ((1 + nominalReturn / 100) / (1 + inflation / 100) - 1) * 100;
  };

  const totalAssets = assets?.reduce((sum, asset) => sum + asset.current_value, 0) || 0;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Acúmulo de Patrimônio</h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'assets'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'goals'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Metas Financeiras
          </button>
        </div>

        {/* Assets Tab */}
        {activeTab === 'assets' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold">Ativos</h2>
                  <p className="text-sm text-gray-600">
                    Total: {formatCurrency(totalAssets)}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowAssetForm(!showAssetForm)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Ativo
              </Button>
            </div>

            {/* Asset Form */}
            {showAssetForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Novo Ativo</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); createAssetMutation.mutate(assetFormData); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo</Label>
                        <Input
                          id="type"
                          value={assetFormData.type}
                          onChange={(e) => setAssetFormData(prev => ({ ...prev, type: e.target.value }))}
                          placeholder="Ex: Imóvel, Investimento, Reserva"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="current_value">Valor Atual (R$)</Label>
                        <Input
                          id="current_value"
                          type="number"
                          step="0.01"
                          value={assetFormData.current_value}
                          onChange={(e) => setAssetFormData(prev => ({ ...prev, current_value: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expected_return">Rentabilidade Esperada (%)</Label>
                        <Input
                          id="expected_return"
                          type="number"
                          step="0.01"
                          value={assetFormData.expected_return}
                          onChange={(e) => setAssetFormData(prev => ({ ...prev, expected_return: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="goal_select">Meta Financeira (Opcional)</Label>
                        <Select value={assetFormData.goal_id} onValueChange={(value) => setAssetFormData(prev => ({ ...prev, goal_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma meta" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Nenhuma meta</SelectItem>
                            {goals?.map((goal) => (
                              <SelectItem key={goal.id} value={goal.id}>
                                {goal.name} - {formatCurrency(goal.target_value)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Input
                        id="description"
                        value={assetFormData.description}
                        onChange={(e) => setAssetFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descrição do ativo"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observations">Observações</Label>
                      <Textarea
                        id="observations"
                        value={assetFormData.observations}
                        onChange={(e) => setAssetFormData(prev => ({ ...prev, observations: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button type="button" variant="outline" onClick={() => setShowAssetForm(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createAssetMutation.isPending}>
                        {createAssetMutation.isPending ? "Salvando..." : "Salvar Ativo"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Assets List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets?.map((asset) => (
                <Card key={asset.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{asset.type}</h3>
                        <p className="text-sm text-gray-600">{asset.description}</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
              ))}
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Target className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold">Metas Financeiras</h2>
                  <p className="text-sm text-gray-600">
                    {goals?.length || 0} meta{goals?.length !== 1 ? 's' : ''} cadastrada{goals?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowGoalForm(!showGoalForm)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Meta
              </Button>
            </div>

            {/* Goal Form */}
            {showGoalForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Nova Meta Financeira</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); createGoalMutation.mutate(goalFormData); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome da Meta</Label>
                        <Input
                          id="name"
                          value={goalFormData.name}
                          onChange={(e) => setGoalFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Casa própria, Reserva de emergência"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="target_value">Valor Desejado (R$)</Label>
                        <Input
                          id="target_value"
                          type="number"
                          step="0.01"
                          value={goalFormData.target_value}
                          onChange={(e) => setGoalFormData(prev => ({ ...prev, target_value: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="current_value">Valor Atual (R$)</Label>
                        <Input
                          id="current_value"
                          type="number"
                          step="0.01"
                          value={goalFormData.current_value}
                          onChange={(e) => setGoalFormData(prev => ({ ...prev, current_value: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="start_month">Mês Inicial</Label>
                        <Input
                          id="start_month"
                          type="month"
                          value={goalFormData.start_month}
                          onChange={(e) => setGoalFormData(prev => ({ ...prev, start_month: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end_month">Mês Final</Label>
                        <Input
                          id="end_month"
                          type="month"
                          value={goalFormData.end_month}
                          onChange={(e) => setGoalFormData(prev => ({ ...prev, end_month: e.target.value }))}
                          required
                        />
                      </div>

                      {goalFormData.start_month && goalFormData.end_month && goalFormData.target_value && goalFormData.current_value && (
                        <div className="space-y-2">
                          <Label>Aporte Mensal Calculado</Label>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <span className="font-medium text-blue-700">
                              {(() => {
                                const startDate = new Date(goalFormData.start_month + '-01');
                                const endDate = new Date(goalFormData.end_month + '-01');
                                const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                                                  (endDate.getMonth() - startDate.getMonth()) + 1;
                                const remainingValue = parseFloat(goalFormData.target_value) - parseFloat(goalFormData.current_value || '0');
                                const monthlyAverage = monthsDiff > 0 ? remainingValue / monthsDiff : 0;
                                return formatCurrency(monthlyAverage);
                              })()}
                            </span>
                            <p className="text-sm text-blue-600 mt-1">
                              {(() => {
                                const startDate = new Date(goalFormData.start_month + '-01');
                                const endDate = new Date(goalFormData.end_month + '-01');
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
                        value={goalFormData.observations}
                        onChange={(e) => setGoalFormData(prev => ({ ...prev, observations: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button type="button" variant="outline" onClick={() => setShowGoalForm(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createGoalMutation.isPending}>
                        {createGoalMutation.isPending ? "Salvando..." : "Salvar Meta"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Goals List */}
            <div className="space-y-4">
              {goals?.map((goal) => {
                const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
                return (
                  <Card key={goal.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>Meta: {formatCurrency(goal.target_value)}</span>
                            <span>Atual: {formatCurrency(goal.current_value)}</span>
                            {goal.monthly_contribution > 0 && (
                              <span>Aporte: {formatCurrency(goal.monthly_contribution)}/mês</span>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso</span>
                          <span className="font-medium">{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      {goal.deadline && (
                        <div className="mt-3 text-sm text-gray-600">
                          <span>Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
