# VendorCarro 🚗

Plataforma SaaS para vendedores de veículos gerenciarem estoque, leads e vendas.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

## ✨ Features

- 🚘 **Gestão de Veículos** - Cadastre com fotos, preços e status
- 👥 **Controle de Leads** - Acompanhe interessados e negociações
- 🔗 **Links Compartilháveis** - Cada veículo gera um link único
- 📱 **Mobile-First** - Funciona perfeitamente no celular
- 🔐 **Autenticação** - Login com Google ou Magic Link
- 💳 **Freemium** - Grátis até 3 veículos, PRO ilimitado

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google OAuth, Magic Link)
- **State**: React Query, Zustand
- **Forms**: React Hook Form, Zod

## 🚀 Getting Started

### Pré-requisitos

- Node.js 20+
- npm ou pnpm
- Conta no [Supabase](https://supabase.com)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/vendorcarro.git
cd vendorcarro

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Rode o projeto
npm run dev
```

### Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 16)
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Área logada
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # Componentes base (Button, Card, Input...)
│   ├── layout/            # Layout (Sidebar, Header...)
│   └── providers/         # Context providers
├── features/              # Módulos por feature
│   ├── vehicles/          # CRUD de veículos
│   ├── leads/             # Gestão de leads
│   └── auth/              # Autenticação
├── lib/
│   ├── supabase/          # Clientes Supabase
│   └── utils/             # Funções utilitárias
└── types/                 # TypeScript types
```

## 🎨 Design System

- Premium Dark Theme
- Glassmorphism sutil
- Micro-animações
- Touch-optimized (44px+ targets)

## 📄 License

MIT © 2026 VendorCarro
# vendorcar
