
-- Adicionar campo de vencimento para títulos de investimento
ALTER TABLE public.assets 
ADD COLUMN maturity_date DATE;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN public.assets.maturity_date IS 'Data de vencimento para títulos de investimento';
