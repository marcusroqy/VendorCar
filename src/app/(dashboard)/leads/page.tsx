import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function LeadsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Leads</h1>
                    <p className="text-foreground-muted">Acompanhe seus clientes interessados</p>
                </div>
                <Link href="/leads/new">
                    <Button leftIcon={<Plus className="w-5 h-5" />}>
                        Novo Lead
                    </Button>
                </Link>
            </div>

            {/* Empty State */}
            <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-500/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Nenhum lead ainda</h2>
                <p className="text-foreground-muted mb-6 max-w-sm mx-auto">
                    Quando clientes entrarem em contato através dos seus veículos, eles aparecerão aqui automaticamente.
                </p>
                <Link href="/leads/new">
                    <Button variant="secondary" size="lg">
                        <Plus className="w-5 h-5" />
                        Cadastrar lead manualmente
                    </Button>
                </Link>
            </div>
        </div>
    );
}
