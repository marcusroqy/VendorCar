import { Suspense } from 'react';
import { LoginForm } from './login-form';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}>
            <LoginForm />
        </Suspense>
    );
}
