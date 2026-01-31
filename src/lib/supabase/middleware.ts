import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function updateSession(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Skip auth if Supabase is not configured
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project.supabase.co') {
        console.warn('⚠️ Supabase not configured. Skipping auth middleware.');
        return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet: CookieToSet[]) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                supabaseResponse = NextResponse.next({
                    request,
                });
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                );
            },
        },
    });

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // DEBUG LOGGING
    if (user) {
        console.log('Middleware: User found', user.id);
    } else {
        console.log('Middleware: No user found');
    }
    // END DEBUG

    // ==========================================================
    // ONBOARDING REDIRECT LOGIC
    // ==========================================================
    if (user) {
        // Quick check for onboarding status (avoids full DB fetch in middleware if possible, but safe here for now)
        // Ideally this should be in user_metadata or custom claims for performance
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();

        const isOnboardingCompleted = profile?.onboarding_completed === true;
        const isOnboardingPage = request.nextUrl.pathname === '/onboarding';

        // 1. User needs onboarding but is somewhere else (e.g. dashboard)
        if (!isOnboardingCompleted && !isOnboardingPage && !request.nextUrl.pathname.startsWith('/auth')) {
            const url = request.nextUrl.clone();
            url.pathname = '/onboarding';
            return NextResponse.redirect(url);
        }

        // 2. User finished onboarding but tries to access it again
        if (isOnboardingCompleted && isOnboardingPage) {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }
    }

    // Protected routes
    const protectedPaths = ['/dashboard', '/vehicles', '/leads', '/sales', '/settings', '/onboarding'];
    const isProtectedPath = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtectedPath && !user) {
        // No user, redirect to login
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirectTo', request.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    // Auth pages - redirect to dashboard (or onboarding) if logged in
    const authPaths = ['/login', '/register'];
    const isAuthPath = authPaths.some((path) => request.nextUrl.pathname.startsWith(path));

    if (isAuthPath && user) {
        const url = request.nextUrl.clone();
        // The redirection logic above (Block 1) handles the destination (onboarding vs dashboard)
        // so we just let it fall through or force a refresh to hit that logic?
        // Actually, we should redirect to dashboard, and let Block 1 intercept if needed.
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
