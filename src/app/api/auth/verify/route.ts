import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Server-side endpoint for verifying user session
 * Use this endpoint instead of checking auth on the client for sensitive operations
 */
export async function GET() {
    try {
        const supabase = await createClient();

        if (!supabase) {
            return NextResponse.json({ authenticated: false, error: 'Server configuration error' }, { status: 500 });
        }

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        // Return only safe user data (no tokens)
        return NextResponse.json({
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                created_at: user.created_at,
            }
        });
    } catch {
        return NextResponse.json({ authenticated: false, error: 'Server error' }, { status: 500 });
    }
}
