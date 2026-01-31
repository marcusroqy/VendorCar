import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/organizations
 * Returns the organization the current user belongs to
 */
export async function GET() {
    try {
        const supabase = await createClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's organization membership
        const { data: membership, error: memberError } = await supabase
            .from('organization_members')
            .select(`
                id,
                role,
                joined_at,
                organization:organizations(*)
            `)
            .eq('user_id', user.id)
            .single();

        if (memberError || !membership) {
            return NextResponse.json({ error: 'No organization found' }, { status: 404 });
        }

        // Handle Supabase join which may return array
        const org = Array.isArray(membership.organization)
            ? membership.organization[0]
            : membership.organization;
        const orgId = (org as { id: string } | null)?.id;

        if (!orgId) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        // Get organization members
        const { data: members } = await supabase
            .from('organization_members')
            .select(`
                id,
                user_id,
                role,
                joined_at,
                display_name
            `)
            .eq('organization_id', orgId);

        // Fetch user profiles for all members
        const memberUserIds = members?.map(m => m.user_id) || [];
        const { data: profiles } = await supabase
            .from('user_profiles')
            .select('id, name, avatar_url')
            .in('id', memberUserIds);

        // Merge profile data into members
        const membersWithProfiles = members?.map(member => {
            const profile = profiles?.find(p => p.id === member.user_id);
            return {
                ...member,
                user: {
                    name: profile?.name || null,
                    avatar_url: profile?.avatar_url || null,
                }
            };
        }) || [];

        // Get pending invites
        const { data: invites } = await supabase
            .from('organization_invites')
            .select('*')
            .eq('organization_id', orgId)
            .gt('expires_at', new Date().toISOString());

        return NextResponse.json({
            organization: org,
            role: membership.role,
            members: membersWithProfiles,
            invites: invites || [],
        });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

/**
 * PUT /api/organizations
 * Update organization name
 */
export async function PUT(request: Request) {
    try {
        const supabase = await createClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone, email, website, address, logo_url } = body;

        // Construct update object
        const updates: any = { updated_at: new Date().toISOString() };
        if (name) updates.name = name;
        if (phone) updates.phone = phone;
        if (email) updates.email = email;
        if (website) updates.website = website;
        if (address) updates.address = address; // assumes JSONB or text
        if (logo_url) updates.logo_url = logo_url;

        // Check if user is owner or admin via organization_members
        const { data: membership } = await supabase
            .from('organization_members')
            .select('organization_id, role')
            .eq('user_id', user.id)
            .in('role', ['owner', 'admin'])
            .single();

        if (!membership) {
            return NextResponse.json({ error: 'You do not have permission to update this organization' }, { status: 403 });
        }

        const orgId = membership.organization_id;

        const { data, error } = await supabase
            .from('organizations')
            .update(updates)
            .eq('id', orgId)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ organization: data });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

/**
 * POST /api/organizations
 * Create a new organization
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone, email, website, address, logo_url } = body;

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Generate slug from name
        const slug = name
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^\w\s-]/g, '') // Remove special chars
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
            + '-' + Math.random().toString(36).substring(2, 7); // Add random suffix for uniqueness

        // 1. Create Organization
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({
                name,
                slug,
                owner_id: user.id,
                phone: phone || null,
                email: email || null,
                website: website || null,
                address: address || null,
                logo_url: logo_url || null
            })
            .select()
            .single();

        if (orgError) {
            return NextResponse.json({ error: orgError.message }, { status: 500 });
        }



        // ... (existing imports)

        // ...

        // 2. Add creator as Owner using Service Role (Bypass RLS)
        // This avoids "Infinite Recursion" policies on the members table
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        let memberError;

        if (serviceRoleKey) {
            const adminClient = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            });

            const { error } = await adminClient
                .from('organization_members')
                .insert({
                    organization_id: org.id,
                    user_id: user.id,
                    role: 'owner',
                    status: 'active'
                });
            memberError = error;
        } else {
            // Fallback to normal client (risky if RLS is broken)
            const { error } = await supabase
                .from('organization_members')
                .insert({
                    organization_id: org.id,
                    user_id: user.id,
                    role: 'owner',
                    status: 'active'
                });
            memberError = error;
        }

        if (memberError) {
            // Rollback org creation if member addition fails
            await supabase.from('organizations').delete().eq('id', org.id);
            return NextResponse.json({ error: `Failed to add owner member: ${memberError.message}` }, { status: 500 });
        }

        return NextResponse.json({ organization: org });
    } catch (e) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
