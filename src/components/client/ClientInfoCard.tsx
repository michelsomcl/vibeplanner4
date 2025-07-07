
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail, Calendar, Briefcase } from "lucide-react";

interface ClientInfoCardProps {
  client: any;
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string | null) => string;
}

const ClientInfoCard = ({ client, formatCurrency, formatDate }: ClientInfoCardProps) => {
  return (
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
  );
};

export default ClientInfoCard;
