# Estratégia de Cache e ISR

Este documento detalha a estratégia de cache implementada para otimizar a performance do VendorCarro, garantindo dados frescos onde necessário e velocidade em páginas de alto tráfego.

## Configuração Global
- **Fetch Cache**: `default-cache` (configurado em `layout.tsx`)
  - Por padrão, requisições `fetch` são cacheadas a menos que especificado contrário.

## Estratégias por Rota

### 1. Listagem de Veículos (`/vehicles`)
- **Estratégia**: ISR (Incremental Static Regeneration)
- **Revalidação**: 60 segundos
- **Comportamento**: A página é gerada estaticamente e atualizada em background no máximo uma vez por minuto. Garante listagem rápida mesmo com alto tráfego.
- **Arquivo**: `src/app/(dashboard)/vehicles/page.tsx`

### 2. Detalhes do Veículo (`/vehicles/[id]`)
- **Estratégia**: ISR Híbrido + Fallback Blocking
- **Revalidação**: 300 segundos (5 minutos)
- **Pré-renderização**: Os 20 veículos mais recentes são gerados no build/revalidação (`generateStaticParams`).
- **Novos Veículos**: Veículos não cacheados são gerados sob demanda (`fallback: blocking`) e então cacheados.
- **Arquivo**: `src/app/(dashboard)/vehicles/[id]/page.tsx`

### 3. Dashboard (`/dashboard`)
- **Estratégia**: SSR (Server-Side Rendering) Dinâmico
- **Configuração**: `force-dynamic`
- **Comportamento**: Sempre renderiza no servidor a cada requisição para garantir que dados sensíveis e estatísticas em tempo real do usuário estejam corretos.
- **Arquivo**: `src/app/(dashboard)/dashboard/page.tsx`

### 4. API Routes (`/api/vehicles`)
- **Estratégia**: HTTP Caching
- **Headers**: 
  - `s-maxage=60`: Cache em CDN/Vercel Edge por 60s.
  - `stale-while-revalidate=120`: Permite uso de dado obsoleto por mais 120s enquanto revalida.
- **Arquivo**: `src/app/api/vehicles/route.ts`

## Como Validar
- Verifique os headers de resposta `X-Nextjs-Cache` (HIT/MISS/STALE).
- Em desenvolvimento (`next dev`), o cache tem comportamento diferente (geralmente ignorado ou curto). A estratégia completa é ativa em produção (`next build` && `next start`).
