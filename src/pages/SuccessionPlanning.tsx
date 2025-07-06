
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Building, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SuccessionPlanning = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isHeirDialogOpen, setIsHeirDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);
  const [editingHeir, setEditingHeir] = useState<any>(null);

  const [assetFormData, setAssetFormData] = useState({
    asset_name: '',
    asset_type: '',
    estimated_value: '',
    observations: ''
  });

  const [heirFormData, setHeirFormData] = useState({
    name: '',
    relationship: '',
    percentage: '',
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

  const { data: successionAssets, isLoading: assetsLoading } = useQuery({
    queryKey: ['succession-assets', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('succession_assets')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: heirs, isLoading: heirsLoading } = useQuery({
    queryKey: ['heirs', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('heirs')
        .select('*')
        .eq('client_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const createAssetMutation = useMutation({
    mutationFn: async (assetData: any) => {
      const { data, error } = await supabase
        .from('succession_assets')
        .insert([{ ...assetData, client_id: id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['succession-assets', id] });
      toast.success('Bem patrimonial adicionado com sucesso!');
      setIsAssetDialogOpen(false);
      resetAssetForm();
    },
    onError: (error) => {
      console.error('Erro ao criar bem:', error);
      toast.error('Erro ao adicionar bem patrimonial');
    },
  });

  const createHeirMutation = useMutation({
    mutationFn: async (heirData: any) => {
      const { data, error } = await supabase
        .from('heirs')
        .insert([{ ...heirData, client_id: id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heirs', id] });
      toast.success('Herdeiro adicionado com sucesso!');
      setIsHeirDialogOpen(false);
      resetHeirForm();
    },
    onError: (error) => {
      console.error('Erro ao criar herdeiro:', error);
      toast.error('Erro ao adicionar herdeiro');
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: string) => {
      const { error } = await supabase
        .from('succession_assets')
        .delete()
        .eq('id', assetId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['succession-assets', id] });
      toast.success('Bem patrimonial removido com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao remover bem:', error);
      toast.error('Erro ao remover bem patrimonial');
    },
  });

  const deleteHeirMutation = useMutation({
    mutationFn: async (heirId: string) => {
      const { error } = await supabase
        .from('heirs')
        .delete()
        .eq('id', heirId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['heirs', id] });
      toast.success('Herdeiro removido com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao remover herdeiro:', error);
      toast.error('Erro ao remover herdeiro');
    },
  });

  const resetAssetForm = () => {
    setAssetFormData({
      asset_name: '',
      asset_type: '',
      estimated_value: '',
      observations: ''
    });
    setEditingAsset(null);
  };

  const resetHeirForm = () => {
    setHeirFormData({
      name: '',
      relationship: '',
      percentage: '',
      observations: ''
    });
    setEditingHeir(null);
  };

  const handleAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const assetData = {
      ...assetFormData,
      estimated_value: parseFloat(assetFormData.estimated_value)
    };

    createAssetMutation.mutate(assetData);
  };

  const handleHeirSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const heirData = {
      ...heirFormData,
      percentage: parseFloat(heirFormData.percentage)
    };

    createHeirMutation.mutate(heirData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalAssetValue = successionAssets?.reduce((sum, asset) => sum + asset.estimated_value, 0) || 0;
  const totalHeirsPercentage = heirs?.reduce((sum, heir) => sum + heir.percentage, 0) || 0;

  const isLoading = assetsLoading || heirsLoading;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Planejamento Sucessório</h1>
          <p className="text-gray-600 mt-2">{client?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bens Patrimoniais */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Bens Patrimoniais
              </CardTitle>
              <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetAssetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Bem
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Bem Patrimonial</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAssetSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="asset_name">Nome do Bem</Label>
                      <Input
                        id="asset_name"
                        value={assetFormData.asset_name}
                        onChange={(e) => setAssetFormData({...assetFormData, asset_name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="asset_type">Tipo</Label>
                      <Select value={assetFormData.asset_type} onValueChange={(value) => setAssetFormData({...assetFormData, asset_type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="imovel">Imóvel</SelectItem>
                          <SelectItem value="veiculo">Veículo</SelectItem>
                          <SelectItem value="investimento">Investimento</SelectItem>
                          <SelectItem value="empresa">Empresa</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="estimated_value">Valor Estimado</Label>
                      <Input
                        id="estimated_value"
                        type="number"
                        step="0.01"
                        value={assetFormData.estimated_value}
                        onChange={(e) => setAssetFormData({...assetFormData, estimated_value: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="asset_observations">Observações</Label>
                      <Textarea
                        id="asset_observations"
                        value={assetFormData.observations}
                        onChange={(e) => setAssetFormData({...assetFormData, observations: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAssetDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createAssetMutation.isPending}>
                        Adicionar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {successionAssets?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p>Nenhum bem patrimonial cadastrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {successionAssets?.map((asset) => (
                  <div key={asset.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{asset.asset_name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {asset.asset_type}
                        </Badge>
                        <p className="text-2xl font-bold text-green-600 mt-2">
                          {formatCurrency(asset.estimated_value)}
                        </p>
                        {asset.observations && (
                          <p className="text-sm text-gray-600 mt-2">{asset.observations}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteAssetMutation.mutate(asset.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total do Patrimônio:</span>
                    <span className="text-green-600">{formatCurrency(totalAssetValue)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Herdeiros */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Herdeiros
              </CardTitle>
              <Dialog open={isHeirDialogOpen} onOpenChange={setIsHeirDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetHeirForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Herdeiro
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Herdeiro</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleHeirSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="heir_name">Nome</Label>
                      <Input
                        id="heir_name"
                        value={heirFormData.name}
                        onChange={(e) => setHeirFormData({...heirFormData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="relationship">Grau de Parentesco</Label>
                      <Select value={heirFormData.relationship} onValueChange={(value) => setHeirFormData({...heirFormData, relationship: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o parentesco" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conjuge">Cônjuge</SelectItem>
                          <SelectItem value="filho">Filho(a)</SelectItem>
                          <SelectItem value="pai">Pai</SelectItem>
                          <SelectItem value="mae">Mãe</SelectItem>
                          <SelectItem value="irmao">Irmão(ã)</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="percentage">Percentual (%)</Label>
                      <Input
                        id="percentage"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={heirFormData.percentage}
                        onChange={(e) => setHeirFormData({...heirFormData, percentage: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="heir_observations">Observações</Label>
                      <Textarea
                        id="heir_observations"
                        value={heirFormData.observations}
                        onChange={(e) => setHeirFormData({...heirFormData, observations: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsHeirDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createHeirMutation.isPending}>
                        Adicionar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {heirs?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <p>Nenhum herdeiro cadastrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {heirs?.map((heir) => (
                  <div key={heir.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{heir.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {heir.relationship}
                        </Badge>
                        <p className="text-xl font-bold text-blue-600 mt-2">
                          {heir.percentage}%
                        </p>
                        <p className="text-sm text-gray-600">
                          Valor estimado: {formatCurrency(totalAssetValue * (heir.percentage / 100))}
                        </p>
                        {heir.observations && (
                          <p className="text-sm text-gray-600 mt-2">{heir.observations}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteHeirMutation.mutate(heir.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Percentual distribuído:</span>
                    <span className={totalHeirsPercentage === 100 ? 'text-green-600' : 'text-red-600'}>
                      {totalHeirsPercentage}%
                    </span>
                  </div>
                  {totalHeirsPercentage !== 100 && (
                    <p className="text-sm text-red-600">
                      {totalHeirsPercentage > 100 
                        ? 'Percentual excede 100%' 
                        : `Faltam ${100 - totalHeirsPercentage}% para completar a herança`
                      }
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuccessionPlanning;
