import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Autenticação',
    description: 'Entre ou crie sua conta no VendorCarro',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {children}
        </div>
    );
}
