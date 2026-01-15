-- ========================================
-- ATUALIZAÇÃO: Novos Roles e RLS Fix
-- Execute no SQL Editor do Supabase
-- ========================================

-- 1. Adicionar coluna display_name aos membros
ALTER TABLE organization_members 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 2. Atualizar o enum de roles para incluir novos cargos
ALTER TABLE organization_members 
DROP CONSTRAINT IF EXISTS organization_members_role_check;

ALTER TABLE organization_members
ADD CONSTRAINT organization_members_role_check 
CHECK (role IN ('owner', 'admin', 'vendedor', 'rh', 'contabilidade', 'member'));

ALTER TABLE organization_invites
DROP CONSTRAINT IF EXISTS organization_invites_role_check;

ALTER TABLE organization_invites
ADD CONSTRAINT organization_invites_role_check 
CHECK (role IN ('owner', 'admin', 'vendedor', 'rh', 'contabilidade', 'member'));

-- 3. CORRIGIR RLS para organization_invites (CRÍTICO)
DROP POLICY IF EXISTS "Org admins can insert invites" ON organization_invites;
DROP POLICY IF EXISTS "Org admins can manage invites" ON organization_invites;

-- Política para INSERIR convites (admins e owners podem convidar)
CREATE POLICY "Org admins can insert invites"
ON organization_invites FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_members.organization_id = organization_invites.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
);

-- Política para VER convites
CREATE POLICY "Org members can view invites"
ON organization_invites FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_members.organization_id = organization_invites.organization_id
        AND organization_members.user_id = auth.uid()
    )
);

-- Política para DELETAR convites
CREATE POLICY "Org admins can delete invites"
ON organization_invites FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_members.organization_id = organization_invites.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
);

-- 4. RLS para editar display_name do membro
DROP POLICY IF EXISTS "Members can update own display_name" ON organization_members;

CREATE POLICY "Members can update own display_name"
ON organization_members FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 5. Política para admins editarem qualquer membro
CREATE POLICY "Admins can update members"
ON organization_members FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM organization_members AS admin_check
        WHERE admin_check.organization_id = organization_members.organization_id
        AND admin_check.user_id = auth.uid()
        AND admin_check.role IN ('owner', 'admin')
    )
);

-- ========================================
-- PRONTO! Agora os convites devem funcionar
-- ========================================
