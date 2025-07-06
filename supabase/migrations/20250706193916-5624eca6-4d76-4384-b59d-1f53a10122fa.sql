
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retirement_planning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.succession_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heirs ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela clients (acesso público por enquanto)
CREATE POLICY "Allow all operations on clients" ON public.clients
FOR ALL USING (true) WITH CHECK (true);

-- Políticas para a tabela debts
CREATE POLICY "Allow all operations on debts" ON public.debts
FOR ALL USING (true) WITH CHECK (true);

-- Políticas para a tabela assets
CREATE POLICY "Allow all operations on assets" ON public.assets
FOR ALL USING (true) WITH CHECK (true);

-- Políticas para a tabela financial_goals
CREATE POLICY "Allow all operations on financial_goals" ON public.financial_goals
FOR ALL USING (true) WITH CHECK (true);

-- Políticas para a tabela budget_items
CREATE POLICY "Allow all operations on budget_items" ON public.budget_items
FOR ALL USING (true) WITH CHECK (true);

-- Políticas para a tabela retirement_planning
CREATE POLICY "Allow all operations on retirement_planning" ON public.retirement_planning
FOR ALL USING (true) WITH CHECK (true);

-- Políticas para a tabela succession_assets
CREATE POLICY "Allow all operations on succession_assets" ON public.succession_assets
FOR ALL USING (true) WITH CHECK (true);

-- Políticas para a tabela heirs
CREATE POLICY "Allow all operations on heirs" ON public.heirs
FOR ALL USING (true) WITH CHECK (true);

-- A tabela budget_categories não precisa de RLS restritivo pois são categorias padrão
CREATE POLICY "Allow all operations on budget_categories" ON public.budget_categories
FOR ALL USING (true) WITH CHECK (true);
