'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updatePasswordAction(password: string) {
    const supabase = await createClient();

    // 1. Check if user is authenticated (via cookies)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Sessão expirada. Recarregue a página.' };
    }

    // 2. Update password
    const { error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) {
        return { error: error.message };
    }

    // 3. Revalidate path (optional here)
    revalidatePath('/onboarding');

    return { success: true };
}
