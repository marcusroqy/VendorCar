import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

/**
 * POST /api/organizations/invite
 * Send invitation to join organization
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
        const { email, role = 'member' } = body;

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        if (!['admin', 'member'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Get user's organization and check role
        const { data: membership } = await supabase
            .from('organization_members')
            .select('organization_id, role, organization:organizations(id, name, max_members)')
            .eq('user_id', user.id)
            .single();

        if (!membership || !['owner', 'admin'].includes(membership.role)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        // Handle Supabase join which returns array
        const orgData = Array.isArray(membership.organization)
            ? membership.organization[0]
            : membership.organization;
        const org = orgData as { id: string; name: string; max_members: number } | null;

        if (!org) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        // Check member limit
        const { count: memberCount } = await supabase
            .from('organization_members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id);

        const { count: inviteCount } = await supabase
            .from('organization_invites')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id)
            .gt('expires_at', new Date().toISOString());

        const totalMembers = (memberCount || 0) + (inviteCount || 0);
        if (totalMembers >= org.max_members) {
            return NextResponse.json({
                error: `Limite de ${org.max_members} membros atingido. Faça upgrade para adicionar mais.`
            }, { status: 400 });
        }

        // Check if email is already a member
        const { data: existingMember } = await supabase
            .from('organization_members')
            .select('id')
            .eq('organization_id', org.id)
            .eq('user_id', (
                await supabase.from('auth.users').select('id').eq('email', email).single()
            ).data?.id);

        if (existingMember) {
            return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
        }

        // Check for existing invite
        const { data: existingInvite } = await supabase
            .from('organization_invites')
            .select('id')
            .eq('organization_id', org.id)
            .eq('email', email.toLowerCase())
            .gt('expires_at', new Date().toISOString())
            .single();

        if (existingInvite) {
            return NextResponse.json({ error: 'Invite already sent to this email' }, { status: 400 });
        }

        // Generate invite token
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        // Create invite
        const { data: invite, error: inviteError } = await supabase
            .from('organization_invites')
            .insert({
                organization_id: org.id,
                email: email.toLowerCase(),
                role,
                token,
                invited_by: user.id,
                expires_at: expiresAt.toISOString(),
            })
            .select()
            .single();

        if (inviteError) {
            return NextResponse.json({ error: inviteError.message }, { status: 500 });
        }

        // TODO: Send email with invite link
        // For now, return the invite link directly
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${token}`;

        return NextResponse.json({
            success: true,
            invite,
            inviteLink,
            message: `Convite enviado para ${email}. Link válido por 7 dias.`
        });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/organizations/invite
 * Cancel a pending invite
 */
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const inviteId = searchParams.get('id');

        if (!inviteId) {
            return NextResponse.json({ error: 'Invite ID required' }, { status: 400 });
        }

        // Get user's organization and check role
        const { data: membership } = await supabase
            .from('organization_members')
            .select('organization_id, role')
            .eq('user_id', user.id)
            .single();

        if (!membership || !['owner', 'admin'].includes(membership.role)) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        const { error } = await supabase
            .from('organization_invites')
            .delete()
            .eq('id', inviteId)
            .eq('organization_id', membership.organization_id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
