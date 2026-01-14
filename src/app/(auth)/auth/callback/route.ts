import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const redirectTo = searchParams.get('redirectTo') || '/dashboard';
    const type = searchParams.get('type');

    if (code) {
        const supabase = await createClient();

        if (supabase) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);

            if (!error) {
                // Redirect to dashboard or specified redirectTo
                return NextResponse.redirect(`${origin}${redirectTo}`);
            }
        }
    }

    // Auth error, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth`);
}
