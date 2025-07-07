
-- Tabela para registrar pagamentos das dívidas
CREATE TABLE public.debt_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  debt_id UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  payment_amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trigger para atualizar updated_at
CREATE TRIGGER debt_payments_updated_at_trigger
  BEFORE UPDATE ON public.debt_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Adicionar campo observations às dívidas (se não existir)
ALTER TABLE public.debts 
ADD COLUMN IF NOT EXISTS payment_observations TEXT;

-- Tabela para histórico mensal de orçamento (complementar aos budget_items existentes)
CREATE TABLE public.monthly_budget_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  month_year DATE NOT NULL, -- formato YYYY-MM-01
  total_planned_income NUMERIC DEFAULT 0,
  total_actual_income NUMERIC DEFAULT 0,
  total_planned_expenses NUMERIC DEFAULT 0,
  total_actual_expenses NUMERIC DEFAULT 0,
  commitment_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, month_year)
);

-- Trigger para atualizar updated_at
CREATE TRIGGER monthly_budget_summary_updated_at_trigger
  BEFORE UPDATE ON public.monthly_budget_summary
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS policies para debt_payments
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on debt_payments" 
  ON public.debt_payments 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- RLS policies para monthly_budget_summary
ALTER TABLE public.monthly_budget_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on monthly_budget_summary" 
  ON public.monthly_budget_summary 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
