-- Otimização de Performance - Índices para Tabela vehicles

-- =========================================================
-- 1. Criação de Índices
-- =========================================================

-- 1. Índice para ordenação padrão (Listagem por data decrescente)
-- Melhoria: Acelera queries com ORDER BY created_at DESC (usado na listagem principal)
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at_desc ON vehicles(created_at DESC);

-- 2. Índice composto para busca (Marca + Modelo)
-- Melhoria: Acelera queries que filtram por brand e model
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_model ON vehicles(brand, model);

-- 3. Índice para filtros de preço
-- Melhoria: Acelera queries de faixa de preço (Ex: WHERE price BETWEEN 50000 AND 100000)
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON vehicles(price);

-- 4. Índice para chave estrangeira de usuário (Multi-tenancy)
-- Melhoria: Acelera queries que filtram por dono do veículo (WHERE user_id = '...')
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);

-- 5. Índice para Status
-- Melhoria: Acelera a filtragem de veículos disponíveis vs vendidos
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);

-- =========================================================
-- 2. Validação
-- =========================================================

-- Listar todos os índices da tabela vehicles para confirmação
SELECT 
    indexname as nome_indice, 
    indexdef as definicao 
FROM pg_indexes 
WHERE tablename = 'vehicles';

-- =========================================================
-- 3. Análise de Performance (EXPLAIN ANALYZE)
-- =========================================================

-- Use os comandos abaixo para verificar se o Postgres está usando os índices criados.
-- O 'EXPLAIN ANALYZE' executa a query real, então cuidado com UPDATE/DELETE.

-- Cenário A: Listagem padrão da Home (Ordenada por data)
EXPLAIN ANALYZE
SELECT id, brand, model, price, images, created_at 
FROM vehicles 
WHERE status = 'available'
ORDER BY created_at DESC 
LIMIT 12;

-- Cenário B: Busca por Marca (Ex: Toyota)
EXPLAIN ANALYZE
SELECT id, brand, model, price 
FROM vehicles 
WHERE brand ILIKE 'Toyota%' 
ORDER BY price ASC;

-- Cenário C: Filtragem por Faixa de Preço
EXPLAIN ANALYZE
SELECT id, brand, model, price 
FROM vehicles 
WHERE price BETWEEN 50000 AND 150000 
ORDER BY price DESC;
