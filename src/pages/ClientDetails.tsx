
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Briefcase,
  DollarSign,
  FileText,
  TrendingUp,
  PiggyBank,
  Scale
} from "lucide-react";

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();

  const { data: client, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
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

  if (!client) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cliente não encontrado</h1>
          <Link to="/">
            <Button>Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const planningModules = [
    {
      title: "Reestruturação Financeira",
      description: "Gestão e quitação de dívidas",
      icon: TrendingUp,
      color: "bg-red-500",
      link: `/client/${id}/debts`
    },
    {
      title: "Acúmulo de Patrimônio",
      description: "Ativos e metas financeiras",
      icon: DollarSign,
      color: "bg-green-500",
      link: `/client/${id}/assets`
    },
    {
      title: "Orçamento Mensal",
      description: "Controle de receitas e despesas",
      icon: Calendar,
      color: "bg-blue-500",
      link: `/client/${id}/budget`
    },
    {
      title: "Previdência",
      description: "Planejamento para aposentadoria",
      icon: PiggyBank,
      color: "bg-purple-500",
      link: `/client/${id}/retirement`
    },
    {
      title: "Planejamento Sucessório",
      description: "Gestão de bens e herdeiros",
      icon: Scale,
      color: "bg-yellow-500",
      link: `/client/${id}/succession`
    },
    {
      title: "Relatório Final",
      description: "Resumo completo do planejamento",
      icon: FileText,
      color: "bg-gray-500",
      link: `/client/${id}/report`
    }
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
          <Badge variant={client.has_planning ? "default" : "secondary"}>
            {client.has_planning ? "Com planejamento" : "Sem plano definido"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações do Cliente */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Informações Pessoais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{client.phone}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{client.email}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Nascimento: {formatDate(client.birth_date)}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{client.profession || 'Não informado'}</span>
                </div>
                
                {client.marital_status && (
                  <div className="text-sm">
                    <span className="font-medium">Estado Civil:</span> {client.marital_status}
                  </div>
                )}
                
                <div className="pt-4 border-t space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Renda Mensal:</span><br />
                    <span className="text-green-600 font-semibold">
                      {formatCurrency(client.monthly_income || 0)}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Capital Disponível:</span><br />
                    <span className="text-blue-600 font-semibold">
                      {formatCurrency(client.available_capital || 0)}
                    </span>
                  </div>
                </div>
                
                {client.observations && (
                  <div className="pt-4 border-t">
                    <span className="font-medium text-sm">Observações:</span>
                    <p className="text-sm text-gray-600 mt-1">{client.observations}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Módulos de Planejamento */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Módulos de Planejamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planningModules.map((module, index) => {
                    const IconComponent = module.icon;
                    return (
                      <Link key={index} to={module.link}>
                        <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${module.color} text-white`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{module.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
