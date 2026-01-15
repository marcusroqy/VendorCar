-- ========================================
-- UPLOAD DE FOTOS: Avatar e Logo
-- Execute no SQL Editor do Supabase
-- ========================================

-- 1. Adicionar avatar_url na tabela user_profiles (se não existir)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Adicionar logo_url na tabela organizations
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 3. Criar bucket para avatars (execute no Storage do Supabase)
-- Vá em Storage > Create a new bucket > Nome: "avatars" > Public: ON

-- 4. Criar bucket para logos (execute no Storage do Supabase)
-- Vá em Storage > Create a new bucket > Nome: "logos" > Public: ON

-- 5. Políticas de Storage para avatars
-- (Execute após criar os buckets)

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Política: usuários podem fazer upload de seu próprio avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: usuários podem atualizar seu próprio avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: usuários podem deletar seu próprio avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: todos podem ver avatars (bucket público)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Política: admins/owners podem fazer upload de logo da org
CREATE POLICY "Org admins can upload logo"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'logos'
    AND EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_members.organization_id::text = (storage.foldername(name))[1]
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
);

-- Política: admins/owners podem atualizar logo da org
CREATE POLICY "Org admins can update logo"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'logos'
    AND EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_members.organization_id::text = (storage.foldername(name))[1]
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
);

-- Política: todos podem ver logos (bucket público)
CREATE POLICY "Logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

-- ========================================
-- PRONTO! Agora você pode fazer upload de avatars e logos
-- ========================================
