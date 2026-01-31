-- Allow Admins to update organization details (Avatar, Name, etc)

-- 1. Drop the restrictive "Owner only" policy
DROP POLICY IF EXISTS "Owner can update organization" ON organizations;

-- 2. Create a more permissive policy for Owner AND Admin
CREATE POLICY "Owner and admin can update organization"
ON organizations FOR UPDATE
USING (
    id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
);
