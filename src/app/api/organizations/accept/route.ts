import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/organizations/accept
 * Accept an organization invite
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
        const { token } = body;

        if (!token || typeof token !== 'string') {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        // Find the invite
        const { data: invite, error: inviteError } = await supabase
            .from('organization_invites')
            .select('*, organization:organizations(id, name)')
            .eq('token', token)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (inviteError || !invite) {
            return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 });
        }

        // Check if invite email matches user email
        if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
            return NextResponse.json({
                error: 'This invite was sent to a different email address'
            }, { status: 403 });
        }

        // Check if user is already a member of another organization
        const { data: existingMembership } = await supabase
            .from('organization_members')
            .select('id, organization:organizations(name)')
            .eq('user_id', user.id)
            .single();

        if (existingMembership) {
            // User is already in an org - for now, prevent joining multiple
            const orgName = Array.isArray(existingMembership.organization)
                ? existingMembership.organization[0]?.name
                : (existingMembership.organization as { name: string } | null)?.name;
            return NextResponse.json({
                error: `Você já é membro de "${orgName || 'outra organização'}". Saia primeiro para aceitar este convite.`
            }, { status: 400 });
        }

        const org = invite.organization as { id: string; name: string };

        // Add user to organization
        const { error: memberError } = await supabase
            .from('organization_members')
            .insert({
                organization_id: org.id,
                user_id: user.id,
                role: invite.role,
                invited_by: invite.invited_by,
            });

        if (memberError) {
            return NextResponse.json({ error: memberError.message }, { status: 500 });
        }

        // Delete the invite
        await supabase
            .from('organization_invites')
            .delete()
            .eq('id', invite.id);

        return NextResponse.json({
            success: true,
            organization: org,
            message: `Você agora é membro de "${org.name}"!`
        });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

/**
 * GET /api/organizations/accept?token=xxx
 * Get invite details (for showing accept page)
 */
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        // Find the invite
        const { data: invite, error: inviteError } = await supabase
            .from('organization_invites')
            .select('email, role, expires_at, organization:organizations(id, name)')
            .eq('token', token)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (inviteError || !invite) {
            return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 });
        }

        return NextResponse.json({
            email: invite.email,
            role: invite.role,
            organization: invite.organization,
            expires_at: invite.expires_at,
        });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
