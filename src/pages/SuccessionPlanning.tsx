
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Scale, Home, Car, Banknote, Users, Plus, FileText } from "lucide-react";

const SuccessionPlanning = () => {
  const { id } = useParams();
  const [client, setClient] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [heirs, setHeirs] = useState<any[]>([]);

  useEffect(() => {
    const clients = JSON.parse(localStorage.getItem('vibeplanner_clients') || '[]');
    const foundClient = clients.find((c: any) => c.id === id);
    setClient(foundClient);

    // Mock assets data
    setAssets([
      {
        id: 1,
        name: "Casa Principal",
        type: "Imóvel",
        value: 450000,
        description: "Residência familiar - 3 quartos",
        heirs: [
          { name: "Cônjuge", percentage: 50 },
          { name: "Filho 1", percentage: 25 },
          { name: "Filho 2", percentage: 25 }
        ]
      },
      {
        id: 2,
        name: "Apartamento Centro",
        type: "Imóvel",
        value: 280000,
        description: "Investimento para locação",
        heirs: [
          { name: "Filho 1", percentage: 50 },
          { name: "Filho 2", percentage: 50 }
        ]
      },
      {
        id: 3,
        name: "Veículo",
        type: "Veículo",
        value: 85000,
        description: "Honda Civic 2022",
        heirs: [
          { name: "Cônjuge", percentage: 100 }
        ]
      },
      {
        id: 4,
        name: "Investimentos",
        type: "Financeiro",
        value: 320000,
        description: "Ações, fundos e títulos",
        heirs: [
          { name: "Cônjuge", percentage: 40 },
          { name: "Filho 1", percentage: 30 },
          { name: "Filho 2", percentage: 30 }
        ]
      }
    ]);

    // Mock heirs data
    setHeirs([
      {
        id: 1,
        name: "Maria Silva (Cônjuge)",
        relationship: "Cônjuge",
        percentage: 47.4,
        estimatedValue: 540200
      },
      {
        id: 2,
        name: "João Silva Filho",
        relationship: "Filho",
        percentage: 26.3,
        estimatedValue: 299400
      },
      {
        id: 3,
        name: "Ana Silva",
        relationship: "Filha",
        percentage: 26.3,
        estimatedValue: 299400
      }
    ]);
  }, [id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalAssetValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'Imóvel': return Home;
      case 'Veículo': return Car;
      case 'Financeiro': return Banknote;
      default: return FileText;
    }
  };

  const getAssetColor = (type: string) => {
    switch (type) {
      case 'Imóvel': return 'bg-blue-100 text-blue-800';
      case 'Veículo': return 'bg-green-100 text-green-800';
      case 'Financeiro': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!client) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Planejamento Sucessório</h1>
          <p className="text-gray-600 mt-2">Gestão de bens e herança - {client.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
            <Plus className="mr-2 h-4 w-4" />
            Novo Bem
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Users className="mr-2 h-4 w-4" />
            Novo Herdeiro
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Patrimônio Total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAssetValue)}</p>
              </div>
              <Scale className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Bens</p>
                <p className="text-2xl font-bold text-blue-600">{assets.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Herdeiros</p>
                <p className="text-2xl font-bold text-purple-600">{heirs.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-2xl font-bold text-orange-600">Planejado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Bens Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assets.map((asset) => {
              const IconComponent = getAssetIcon(asset.type);
              return (
                <Card key={asset.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{asset.name}</h3>
                              <Badge className={getAssetColor(asset.type)} variant="secondary">
                                {asset.type}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{asset.description}</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(asset.value)}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Divisão entre Herdeiros:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {asset.heirs.map((heir, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{heir.name}</span>
                                <span className="text-sm font-bold text-primary">{heir.percentage}%</span>
                              </div>
                              <Progress value={heir.percentage} className="h-2" />
                              <p className="text-xs text-gray-600 mt-1">
                                {formatCurrency((asset.value * heir.percentage) / 100)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Heirs Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Herdeiros e Percentuais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {heirs.map((heir) => (
              <Card key={heir.id} className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{heir.name}</h3>
                        <Badge variant="outline">{heir.relationship}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-sm text-gray-500">Percentual Total:</span>
                          <p className="text-xl font-bold text-purple-600">{heir.percentage.toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Valor Estimado:</span>
                          <p className="text-xl font-bold text-green-600">{formatCurrency(heir.estimatedValue)}</p>
                        </div>
                      </div>

                      <Progress value={heir.percentage} className="w-64 h-3" />
                    </div>
                    
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Observações e Recomendações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Documentação Legal
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Recomenda-se a elaboração de testamento para formalizar a distribuição dos bens 
                    conforme o planejamento estabelecido.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Revisão Periódica
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>É importante revisar o planejamento sucessório a cada 2-3 anos ou sempre que 
                    houver mudanças significativas no patrimônio ou na estrutura familiar.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Planejamento Tributário
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Considere estratégias de planejamento tributário para otimizar a transmissão 
                    do patrimônio e reduzir custos com inventário.</p>
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

export default SuccessionPlanning;
