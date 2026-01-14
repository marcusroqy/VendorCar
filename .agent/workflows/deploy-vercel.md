---
description: Como fazer deploy da aplicação no Vercel
---

# Deploy no Vercel

O método mais fácil e recomendado para fazer o deploy desta aplicação Next.js é usando o **Vercel**. Siga os passos abaixo:

## 1. Preparar o Repositório

Certifique-se de que seu código está salvo no GitHub.

1. Se ainda não fez, crie um repositório no GitHub.
2. Envie seu código:
```bash
git add .
git commit -m "Preparando para deploy"
git push
```

## 2. Criar Projeto no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login (pode usar sua conta do GitHub).
2. Clique em **"Add New..."** -> **"Project"**.
3. Em **"Import Git Repository"**, encontre seu repositório `vendorcarro` e clique em **"Import"**.

## 3. Configurar Variáveis de Ambiente

Na tela de configuração do projeto ("Configure Project"):

1. Abra a seção **"Environment Variables"**.
2. Adicione as variáveis do Supabase (você encontra esses valores no seu arquivo `.env.local` ou no painel do Supabase em Project Settings > API):

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | *Sua URL do Supabase* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Sua chave anon public do Supabase* |

> **Nota:** É crucial adicionar essas variáveis para que a aplicação consiga conectar ao banco de dados.

## 4. Deploy

1. Clique em **"Deploy"**.
2. Aguarde o processo de build terminar.
3. Quando finalizar, você receberá uma URL (ex: `vendorcarro.vercel.app`) para acessar sua aplicação.

## 5. Configuração Adicional (Supabase Auth)

Para que o login (Google ou Email) funcione na URL de produção:

1. Vá no painel do **Supabase** -> **Authentication** -> **URL Configuration**.
2. Em **Site URL**, coloque a URL do seu site em produção (ex: `https://vendorcarro.vercel.app`).
3. Se estiver usando Google OAuth, adicione também essa URL nas **Redirect URLs** (ex: `https://vendorcarro.vercel.app/auth/callback`).
4. Se estiver usando Google OAuth com **Google Cloud Console**, adicione a nova URL nas "Origens JavaScript autorizadas" e "URIs de redirecionamento autorizados" nas credenciais do Google.

Pronto! Sua aplicação estará no ar. 🚀
