
import { useQuery } from "@tanstack/react-query";
import { Plus, Users, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">VibePlanner</h1>
          <p className="text-xl opacity-90 mb-8">
            Sistema Profissional de Planejamento Financeiro
          </p>
          <Link to="/client/new">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
              <Plus className="mr-2 h-5 w-5" />
              Novo Cliente
            </Button>
          </Link>
        </div>
      </div>

      {/* Clients Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold text-gray-900">Seus Clientes</h2>
          </div>
          <div className="text-sm text-gray-600">
            {clients?.length || 0} cliente{clients?.length !== 1 ? 's' : ''} cadastrado{clients?.length !== 1 ? 's' : ''}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : clients?.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum cliente cadastrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece criando seu primeiro cliente para iniciar o planejamento financeiro.
            </p>
            <Link to="/client/new">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Cliente
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients?.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">{client.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">{client.phone}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Status: {client.has_planning ? (
                      <span className="text-green-600 font-medium">Com planejamento</span>
                    ) : (
                      <span className="text-orange-600 font-medium">Sem plano definido</span>
                    )}
                  </div>

                  <Link to={`/client/${client.id}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      📂 Acessar Planejamento
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
