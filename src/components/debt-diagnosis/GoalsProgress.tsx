
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from "lucide-react";

const GoalsProgress = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Metas de Quitação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">Meta de Curto Prazo (6 meses)</h4>
            <p className="text-sm text-gray-600 mb-2">
              Quitar as 2 menores dívidas ou reduzir 20% do total
            </p>
            <Progress value={15} className="mb-2" />
            <p className="text-xs text-gray-500">Progresso atual: 15%</p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-3">Meta de Longo Prazo (24 meses)</h4>
            <p className="text-sm text-gray-600 mb-2">
              Quitar todas as dívidas ou reduzir comprometimento para menos de 15%
            </p>
            <Progress value={5} className="mb-2" />
            <p className="text-xs text-gray-500">Progresso atual: 5%</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">💡 Dicas para Acelerar a Quitação:</h4>
          <ul className="text-green-700 text-sm space-y-1">
            <li>• Negocie descontos para pagamento à vista</li>
            <li>• Considere renda extra para pagamentos adicionais</li>
            <li>• Evite contrair novas dívidas durante o processo</li>
            <li>• Redirecione valores de dívidas quitadas para as próximas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsProgress;
