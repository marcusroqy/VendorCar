import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function VehiclesPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Veículos</h1>
                    <p className="text-foreground-muted">Gerencie seu estoque de veículos</p>
                </div>
                <Link href="/vehicles/new">
                    <Button leftIcon={<Plus className="w-5 h-5" />}>
                        Novo Veículo
                    </Button>
                </Link>
            </div>

            {/* Empty State */}
            <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-500/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">Nenhum veículo cadastrado</h2>
                <p className="text-foreground-muted mb-6 max-w-sm mx-auto">
                    Adicione seu primeiro veículo para começar a gerar links compartilháveis e receber leads.
                </p>
                <Link href="/vehicles/new">
                    <Button size="lg">
                        <Plus className="w-5 h-5" />
                        Adicionar meu primeiro veículo
                    </Button>
                </Link>
            </div>
        </div>
    );
}
