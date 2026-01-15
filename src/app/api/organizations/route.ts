import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
        const { name } = body;

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Check if user is owner
        const { data: org } = await supabase
            .from('organizations')
            .select('id')
            .eq('owner_id', user.id)
            .single();

        if (!org) {
            return NextResponse.json({ error: 'Only owner can update organization' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('organizations')
            .update({ name, updated_at: new Date().toISOString() })
            .eq('id', org.id)
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
