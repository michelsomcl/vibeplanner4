
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import EditClientDialog from "@/components/EditClientDialog";
import { ArrowLeft, Edit } from "lucide-react";
import ClientInfoCard from "@/components/client/ClientInfoCard";
import PlanningModulesCard from "@/components/client/PlanningModulesCard";

export default function ClientDetails() {
  const { id } = useParams<{ id: string }>();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
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
          
          <Button 
            onClick={() => setEditDialogOpen(true)}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Editar Cliente</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações do Cliente */}
          <div className="lg:col-span-1">
            <ClientInfoCard
              client={client}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          </div>

          {/* Módulos de Planejamento */}
          <div className="lg:col-span-2">
            <PlanningModulesCard clientId={id!} />
          </div>
        </div>

        {/* Dialog de Edição */}
        <EditClientDialog
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          client={client}
        />
      </div>
    </div>
  );
}
