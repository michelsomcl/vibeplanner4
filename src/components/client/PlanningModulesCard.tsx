
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  TrendingUp,
  DollarSign,
  Calendar,
  PiggyBank,
  Scale,
  FileText
} from "lucide-react";

interface PlanningModulesCardProps {
  clientId: string;
}

const PlanningModulesCard = ({ clientId }: PlanningModulesCardProps) => {
  const planningModules = [
    {
      title: "Reestruturação Financeira",
      description: "Gestão e quitação de dívidas",
      icon: TrendingUp,
      color: "bg-red-500",
      link: `/client/${clientId}/debts`
    },
    {
      title: "Acúmulo de Patrimônio",
      description: "Ativos e metas financeiras",
      icon: DollarSign,
      color: "bg-green-500",
      link: `/client/${clientId}/assets`
    },
    {
      title: "Orçamento Mensal",
      description: "Controle de receitas e despesas",
      icon: Calendar,
      color: "bg-blue-500",
      link: `/client/${clientId}/budget`
    },
    {
      title: "Previdência",
      description: "Planejamento para aposentadoria",
      icon: PiggyBank,
      color: "bg-purple-500",
      link: `/client/${clientId}/retirement`
    },
    {
      title: "Planejamento Sucessório",
      description: "Gestão de bens e herdeiros",
      icon: Scale,
      color: "bg-yellow-500",
      link: `/client/${clientId}/succession`
    },
    {
      title: "Relatório Final",
      description: "Resumo completo do planejamento",
      icon: FileText,
      color: "bg-gray-500",
      link: `/client/${clientId}/report`
    }
  ];

  return (
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
  );
};

export default PlanningModulesCard;
