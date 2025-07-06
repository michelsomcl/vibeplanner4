
-- Habilitar RLS na tabela budget_categories que estava faltando
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir todas as operações na tabela budget_categories
-- (mantendo a mesma estrutura das outras tabelas)
CREATE POLICY "Allow all operations on budget_categories" ON public.budget_categories
FOR ALL USING (true) WITH CHECK (true);
