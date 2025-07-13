
-- Criar tabela para armazenar histórico de fechamentos mensais
CREATE TABLE public.budget_closures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  month_year DATE NOT NULL, -- formato YYYY-MM-01
  total_planned_income NUMERIC DEFAULT 0,
  total_actual_income NUMERIC DEFAULT 0,
  total_planned_expenses NUMERIC DEFAULT 0,
  total_actual_expenses NUMERIC DEFAULT 0,
  closure_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, month_year)
);

-- Trigger para atualizar updated_at
CREATE TRIGGER budget_closures_updated_at_trigger
  BEFORE UPDATE ON public.budget_closures
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS policies para budget_closures
ALTER TABLE public.budget_closures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on budget_closures" 
  ON public.budget_closures 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
