-- =====================================================
-- MULTI-USER TEAM FEATURE - MIGRATION
-- VendorCarro - Organizations & Team Members
-- =====================================================

-- 1. ORGANIZATIONS TABLE
-- The main "account" that users belong to
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    max_members INTEGER DEFAULT 3,
    plan TEXT CHECK (plan IN ('free', 'pro', 'business')) DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ORGANIZATION MEMBERS TABLE
-- Links users to organizations with roles
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
    invited_by UUID REFERENCES auth.users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 3. ORGANIZATION INVITES TABLE
-- Pending invitations
CREATE TABLE IF NOT EXISTS organization_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    token TEXT UNIQUE NOT NULL,
    invited_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ADD organization_id TO EXISTING TABLES
-- These columns will link existing data to organizations

-- Add to vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add to sales
ALTER TABLE sales ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON organization_invites(email);
CREATE INDEX IF NOT EXISTS idx_org_invites_token ON organization_invites(token);
CREATE INDEX IF NOT EXISTS idx_vehicles_org ON vehicles(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_org ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_org ON sales(organization_id);

-- 6. ROW LEVEL SECURITY POLICIES

-- Enable RLS on new tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can see orgs they belong to
CREATE POLICY "Users can view their organizations"
ON organizations FOR SELECT
USING (
    id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

-- Organizations: Only owner can update
CREATE POLICY "Owner can update organization"
ON organizations FOR UPDATE
USING (owner_id = auth.uid());

-- Organization Members: Members can see other members in their org
CREATE POLICY "Members can view org members"
ON organization_members FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

-- Organization Members: Owner and admin can insert (invite)
CREATE POLICY "Owner and admin can add members"
ON organization_members FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

-- Organization Members: Owner can delete (remove members), admin can remove members but not admins/owner
CREATE POLICY "Owner can remove any member"
ON organization_members FOR DELETE
USING (
    organization_id IN (
        SELECT om.organization_id FROM organization_members om
        JOIN organizations o ON o.id = om.organization_id
        WHERE o.owner_id = auth.uid()
    )
);

-- Organization Invites: Owner and admin can manage invites
CREATE POLICY "Owner and admin can manage invites"
ON organization_invites FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

-- Update vehicles RLS to use organization
DROP POLICY IF EXISTS "Users can manage own vehicles" ON vehicles;
CREATE POLICY "Users can view org vehicles"
ON vehicles FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid() -- Fallback for legacy data
);

CREATE POLICY "Members can insert org vehicles"
ON vehicles FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Members can update org vehicles"
ON vehicles FOR UPDATE
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Owner and admin can delete vehicles"
ON vehicles FOR DELETE
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

-- Update leads RLS to use organization
DROP POLICY IF EXISTS "Users can manage own leads" ON leads;
CREATE POLICY "Users can view org leads"
ON leads FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
);

CREATE POLICY "Members can insert org leads"
ON leads FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Members can update org leads"
ON leads FOR UPDATE
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Owner and admin can delete leads"
ON leads FOR DELETE
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

-- Update sales RLS to use organization
DROP POLICY IF EXISTS "Users can manage own sales" ON sales;
CREATE POLICY "Users can view org sales"
ON sales FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
);

CREATE POLICY "Owner and admin can insert sales"
ON sales FOR INSERT
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

CREATE POLICY "Owner and admin can update sales"
ON sales FOR UPDATE
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

CREATE POLICY "Owner can delete sales"
ON sales FOR DELETE
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND role = 'owner'
    )
);

-- 7. FUNCTION TO AUTO-CREATE ORGANIZATION ON USER SIGNUP
CREATE OR REPLACE FUNCTION handle_new_user_organization()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
    user_name TEXT;
    org_slug TEXT;
BEGIN
    -- Get user's name from email
    user_name := split_part(NEW.email, '@', 1);
    org_slug := lower(replace(user_name, '.', '-')) || '-' || substr(gen_random_uuid()::text, 1, 8);
    
    -- Create organization
    INSERT INTO organizations (name, slug, owner_id)
    VALUES (user_name || '''s Loja', org_slug, NEW.id)
    RETURNING id INTO org_id;
    
    -- Add user as owner
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (org_id, NEW.id, 'owner');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created_org ON auth.users;
CREATE TRIGGER on_auth_user_created_org
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user_organization();
