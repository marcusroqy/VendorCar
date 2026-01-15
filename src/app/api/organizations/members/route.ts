import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * DELETE /api/organizations/members?id=xxx
 * Remove a member from the organization
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
        const memberId = searchParams.get('id');

        if (!memberId) {
            return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
        }

        // Get user's organization and check role
        const { data: myMembership } = await supabase
            .from('organization_members')
            .select('organization_id, role')
            .eq('user_id', user.id)
            .single();

        if (!myMembership) {
            return NextResponse.json({ error: 'Not a member of any organization' }, { status: 403 });
        }

        // Get the member to be removed
        const { data: targetMember } = await supabase
            .from('organization_members')
            .select('id, user_id, role, organization_id')
            .eq('id', memberId)
            .single();

        if (!targetMember || targetMember.organization_id !== myMembership.organization_id) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        // Permission checks
        if (targetMember.role === 'owner') {
            return NextResponse.json({ error: 'Cannot remove the owner' }, { status: 403 });
        }

        if (myMembership.role === 'member') {
            return NextResponse.json({ error: 'Only owner and admin can remove members' }, { status: 403 });
        }

        if (myMembership.role === 'admin' && targetMember.role === 'admin') {
            return NextResponse.json({ error: 'Admin cannot remove other admins' }, { status: 403 });
        }

        // Remove the member
        const { error } = await supabase
            .from('organization_members')
            .delete()
            .eq('id', memberId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/organizations/members
 * Update a member's role
 */
export async function PATCH(request: Request) {
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
        const { memberId, role } = body;

        if (!memberId || !role) {
            return NextResponse.json({ error: 'Member ID and role required' }, { status: 400 });
        }

        if (!['admin', 'member'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Only owner can change roles
        const { data: myMembership } = await supabase
            .from('organization_members')
            .select('organization_id, role')
            .eq('user_id', user.id)
            .single();

        if (!myMembership || myMembership.role !== 'owner') {
            return NextResponse.json({ error: 'Only owner can change roles' }, { status: 403 });
        }

        // Get the member to update
        const { data: targetMember } = await supabase
            .from('organization_members')
            .select('id, role, organization_id')
            .eq('id', memberId)
            .single();

        if (!targetMember || targetMember.organization_id !== myMembership.organization_id) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }

        if (targetMember.role === 'owner') {
            return NextResponse.json({ error: 'Cannot change owner role' }, { status: 403 });
        }

        // Update role
        const { error } = await supabase
            .from('organization_members')
            .update({ role })
            .eq('id', memberId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
