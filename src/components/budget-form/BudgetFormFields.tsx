
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface BudgetFormFieldsProps {
  formData: {
    name: string;
    planned_amount: string;
    actual_amount: string;
    category_id: string;
    is_fixed: boolean;
  };
  setFormData: (data: any) => void;
  categories: any[];
  type: 'income' | 'expense';
}

const BudgetFormFields = ({ formData, setFormData, categories, type }: BudgetFormFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder={`Nome da ${type === 'income' ? 'receita' : 'despesa'}`}
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Categoria *</Label>
        <Select 
          value={formData.category_id} 
          onValueChange={(value) => setFormData({...formData, category_id: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="planned">Valor Planejado</Label>
          <Input
            id="planned"
            type="number"
            step="0.01"
            value={formData.planned_amount}
            onChange={(e) => setFormData({...formData, planned_amount: e.target.value})}
            placeholder="0,00"
          />
        </div>
        <div>
          <Label htmlFor="actual">Valor Real</Label>
          <Input
            id="actual"
            type="number"
            step="0.01"
            value={formData.actual_amount}
            onChange={(e) => setFormData({...formData, actual_amount: e.target.value})}
            placeholder="0,00"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="fixed"
          checked={formData.is_fixed}
          onCheckedChange={(checked) => setFormData({...formData, is_fixed: checked})}
        />
        <Label htmlFor="fixed">Item fixo</Label>
      </div>
    </>
  );
};

export default BudgetFormFields;
