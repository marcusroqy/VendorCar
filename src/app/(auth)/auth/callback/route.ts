import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const redirectTo = searchParams.get('redirectTo') || '/dashboard';
    const error_param = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    // Log incoming request for debugging
    console.log('Auth callback received:', { code: code?.slice(0, 10) + '...', redirectTo, error_param, error_description });

    // Handle OAuth error from provider
    if (error_param) {
        console.error('OAuth error from provider:', error_param, error_description);
        return NextResponse.redirect(`${origin}/login?error=${error_param}`);
    }

    if (code) {
        const supabase = await createClient();

        if (supabase) {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
                console.error('Error exchanging code for session:', error.message);
                return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
            }

            if (data.session) {
                console.log('Session created successfully for:', data.session.user.email);
                // Redirect to dashboard or specified redirectTo
                return NextResponse.redirect(`${origin}${redirectTo}`);
            }
        } else {
            console.error('Supabase client not available');
            return NextResponse.redirect(`${origin}/login?error=config`);
        }
    }

    // No code provided
    console.error('No code provided in callback');
    return NextResponse.redirect(`${origin}/login?error=no_code`);
}

