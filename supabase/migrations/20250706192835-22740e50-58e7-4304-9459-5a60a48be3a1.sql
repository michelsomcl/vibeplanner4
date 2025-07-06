
-- Tabela de clientes
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  birth_date DATE,
  marital_status TEXT,
  profession TEXT,
  monthly_income DECIMAL(12,2) DEFAULT 0,
  available_capital DECIMAL(12,2) DEFAULT 0,
  observations TEXT,
  has_planning BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de dívidas
CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  remaining_installments INTEGER NOT NULL,
  installment_value DECIMAL(10,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'negotiated', 'paid')),
  payoff_method TEXT DEFAULT 'snowball' CHECK (payoff_method IN ('snowball', 'avalanche', 'other')),
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de ativos
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  current_value DECIMAL(15,2) NOT NULL,
  expected_return DECIMAL(5,2) DEFAULT 0,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de metas financeiras
CREATE TABLE public.financial_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_value DECIMAL(15,2) NOT NULL,
  current_value DECIMAL(15,2) DEFAULT 0,
  monthly_contribution DECIMAL(10,2) DEFAULT 0,
  deadline DATE,
  progress DECIMAL(5,2) DEFAULT 0,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de categorias de orçamento
CREATE TABLE public.budget_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de itens do orçamento
CREATE TABLE public.budget_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.budget_categories(id),
  name TEXT NOT NULL,
  planned_amount DECIMAL(10,2) DEFAULT 0,
  actual_amount DECIMAL(10,2) DEFAULT 0,
  is_fixed BOOLEAN DEFAULT false,
  month_year DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de previdência
CREATE TABLE public.retirement_planning (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  current_age INTEGER NOT NULL,
  retirement_age INTEGER NOT NULL,
  accumulated_amount DECIMAL(15,2) DEFAULT 0,
  monthly_contribution DECIMAL(10,2) DEFAULT 0,
  desired_retirement_income DECIMAL(10,2) DEFAULT 0,
  expected_return DECIMAL(5,2) DEFAULT 6.0,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id)
);

-- Tabela de bens para planejamento sucessório
CREATE TABLE public.succession_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  estimated_value DECIMAL(15,2) NOT NULL,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de herdeiros
CREATE TABLE public.heirs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir categorias padrão de orçamento
INSERT INTO public.budget_categories (name, type) VALUES
-- Receitas
('Salário', 'income'),
('Freelances', 'income'),
('Investimentos', 'income'),
('Outras Receitas', 'income'),
-- Despesas
('Moradia', 'expense'),
('Alimentação', 'expense'),
('Transporte', 'expense'),
('Saúde', 'expense'),
('Educação', 'expense'),
('Lazer', 'expense'),
('Vestuário', 'expense'),
('Comunicação', 'expense'),
('Outras Despesas', 'expense');

-- Índices para melhor performance
CREATE INDEX idx_debts_client_id ON public.debts(client_id);
CREATE INDEX idx_assets_client_id ON public.assets(client_id);
CREATE INDEX idx_financial_goals_client_id ON public.financial_goals(client_id);
CREATE INDEX idx_budget_items_client_id ON public.budget_items(client_id);
CREATE INDEX idx_budget_items_month_year ON public.budget_items(month_year);
CREATE INDEX idx_succession_assets_client_id ON public.succession_assets(client_id);
CREATE INDEX idx_heirs_client_id ON public.heirs(client_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER handle_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_financial_goals_updated_at
  BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_budget_items_updated_at
  BEFORE UPDATE ON public.budget_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_retirement_planning_updated_at
  BEFORE UPDATE ON public.retirement_planning
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_succession_assets_updated_at
  BEFORE UPDATE ON public.succession_assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_heirs_updated_at
  BEFORE UPDATE ON public.heirs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
