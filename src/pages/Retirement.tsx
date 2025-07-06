
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, Target, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Retirement = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    current_age: '',
    retirement_age: '',
    monthly_contribution: '',
    accumulated_amount: '',
    desired_retirement_income: '',
    expected_return: '6.0',
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

  const { data: retirementPlan, isLoading } = useQuery({
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

  useEffect(() => {
    if (retirementPlan) {
      setFormData({
        current_age: retirementPlan.current_age?.toString() || '',
        retirement_age: retirementPlan.retirement_age?.toString() || '',
        monthly_contribution: retirementPlan.monthly_contribution?.toString() || '',
        accumulated_amount: retirementPlan.accumulated_amount?.toString() || '',
        desired_retirement_income: retirementPlan.desired_retirement_income?.toString() || '',
        expected_return: retirementPlan.expected_return?.toString() || '6.0',
        observations: retirementPlan.observations || ''
      });
    }
  }, [retirementPlan]);

  const saveRetirementPlan = useMutation({
    mutationFn: async (planData: any) => {
      if (retirementPlan) {
        const { data, error } = await supabase
          .from('retirement_planning')
          .update(planData)
          .eq('id', retirementPlan.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('retirement_planning')
          .insert([{ ...planData, client_id: id }])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retirement-planning', id] });
      toast.success('Planejamento de aposentadoria salvo com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar o planejamento');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const planData = {
      current_age: parseInt(formData.current_age),
      retirement_age: parseInt(formData.retirement_age),
      monthly_contribution: parseFloat(formData.monthly_contribution),
      accumulated_amount: parseFloat(formData.accumulated_amount),
      desired_retirement_income: parseFloat(formData.desired_retirement_income),
      expected_return: parseFloat(formData.expected_return),
      observations: formData.observations
    };

    saveRetirementPlan.mutate(planData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Cálculos de projeção
  const currentAge = parseInt(formData.current_age) || 0;
  const retirementAge = parseInt(formData.retirement_age) || 65;
  const monthlyContribution = parseFloat(formData.monthly_contribution) || 0;
  const accumulatedAmount = parseFloat(formData.accumulated_amount) || 0;
  const expectedReturn = parseFloat(formData.expected_return) || 6;
  const desiredIncome = parseFloat(formData.desired_retirement_income) || 0;

  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const monthsToRetirement = yearsToRetirement * 12;
  
  // Cálculo do valor futuro com juros compostos
  const monthlyRate = expectedReturn / 100 / 12;
  const futureValue = accumulatedAmount * Math.pow(1 + monthlyRate, monthsToRetirement) +
    monthlyContribution * ((Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate);

  // Renda mensal estimada (regra dos 4%)
  const estimatedMonthlyIncome = futureValue * 0.04 / 12;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Planejamento de Aposentadoria</h1>
          <p className="text-gray-600 mt-2">{client?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Dados do Planejamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current_age">Idade Atual</Label>
                  <Input
                    id="current_age"
                    type="number"
                    value={formData.current_age}
                    onChange={(e) => setFormData({...formData, current_age: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="retirement_age">Idade de Aposentadoria</Label>
                  <Input
                    id="retirement_age"
                    type="number"
                    value={formData.retirement_age}
                    onChange={(e) => setFormData({...formData, retirement_age: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="monthly_contribution">Contribuição Mensal</Label>
                <Input
                  id="monthly_contribution"
                  type="number"
                  step="0.01"
                  value={formData.monthly_contribution}
                  onChange={(e) => setFormData({...formData, monthly_contribution: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="accumulated_amount">Valor Já Acumulado</Label>
                <Input
                  id="accumulated_amount"
                  type="number"
                  step="0.01"
                  value={formData.accumulated_amount}
                  onChange={(e) => setFormData({...formData, accumulated_amount: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="desired_retirement_income">Renda Desejada na Aposentadoria</Label>
                <Input
                  id="desired_retirement_income"
                  type="number"
                  step="0.01"
                  value={formData.desired_retirement_income}
                  onChange={(e) => setFormData({...formData, desired_retirement_income: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="expected_return">Rentabilidade Esperada (%)</Label>
                <Input
                  id="expected_return"
                  type="number"
                  step="0.1"
                  value={formData.expected_return}
                  onChange={(e) => setFormData({...formData, expected_return: e.target.value})}
                />
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

              <Button type="submit" className="w-full" disabled={saveRetirementPlan.isPending}>
                Salvar Planejamento
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Projeções */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Projeção de Aposentadoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Anos para aposentadoria</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{yearsToRetirement}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Valor projetado</span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(futureValue)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Renda mensal estimada</span>
                </div>
                <span className="text-xl font-bold text-purple-600">
                  {formatCurrency(estimatedMonthlyIncome)}
                </span>
              </div>

              {desiredIncome > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Meta de renda mensal</span>
                    <span>{formatCurrency(desiredIncome)}</span>
                  </div>
                  <Progress 
                    value={Math.min((estimatedMonthlyIncome / desiredIncome) * 100, 100)} 
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 text-center">
                    {((estimatedMonthlyIncome / desiredIncome) * 100).toFixed(1)}% da meta
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {yearsToRetirement > 0 && monthlyContribution > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Contribuições</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Contribuição mensal:</span>
                  <span>{formatCurrency(monthlyContribution)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total de contribuições:</span>
                  <span>{formatCurrency(monthlyContribution * monthsToRetirement)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Rendimento projetado:</span>
                  <span className="text-green-600">
                    {formatCurrency(futureValue - accumulatedAmount - (monthlyContribution * monthsToRetirement))}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Retirement;
