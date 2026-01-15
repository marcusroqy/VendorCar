import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const isDev = process.env.NODE_ENV === 'development';

function log(...args: unknown[]) {
    if (isDev) console.log(...args);
}

function logError(...args: unknown[]) {
    if (isDev) console.error(...args);
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const redirectTo = searchParams.get('redirectTo') || '/dashboard';
    const error_param = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    log('Auth callback received:', {
        code: code?.slice(0, 10) + '...',
        token_hash: token_hash?.slice(0, 10) + '...',
        type,
        redirectTo,
        error_param,
        error_description
    });

    // Handle OAuth error from provider
    if (error_param) {
        logError('OAuth error from provider:', error_param, error_description);
        return NextResponse.redirect(`${origin}/login?error=${error_param}`);
    }

    const supabase = await createClient();
    if (!supabase) {
        logError('Supabase client not available');
        return NextResponse.redirect(`${origin}/login?error=config`);
    }

    // Handle Magic Link (email OTP) - uses token_hash
    if (token_hash && type) {
        const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as 'email' | 'signup' | 'magiclink' | 'recovery' | 'invite',
        });

        if (error) {
            logError('Error verifying magic link:', error.message);
            return NextResponse.redirect(`${origin}/login?error=verification_failed`);
        }

        if (data.session) {
            log('Magic link session created for:', data.session.user.email);
            return NextResponse.redirect(`${origin}${redirectTo}`);
        }
    }

    // Handle OAuth callback - uses code
    if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            logError('Error exchanging code for session:', error.message);
            return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
        }

        if (data.session) {
            log('OAuth session created for:', data.session.user.email);
            return NextResponse.redirect(`${origin}${redirectTo}`);
        }
    }

    // No valid callback parameters
    logError('No valid callback parameters provided');
    return NextResponse.redirect(`${origin}/login?error=no_code`);
}
