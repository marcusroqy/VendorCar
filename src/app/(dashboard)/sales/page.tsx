import { DollarSign, Plus, TrendingUp, Car, Users } from 'lucide-react';
import Link from 'next/link';
import { Button, Card, CardContent } from '@/components/ui';

export default function SalesPage() {
    // TODO: Fetch real data from Supabase
    const sales: unknown[] = [];
    const hasData = sales.length > 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Vendas</h1>
                    <p className="text-foreground-muted">Histórico de vendas realizadas</p>
                </div>
                <Link href="/sales/new">
                    <Button leftIcon={<Plus className="w-5 h-5" />}>
                        Nova Venda
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="glass">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-success-500/10 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-success-500" />
                            </div>
                            <div>
                                <p className="text-sm text-foreground-muted">Total Vendas</p>
                                <p className="text-2xl font-bold">R$ 0</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card variant="glass">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                                <Car className="w-6 h-6 text-primary-500" />
                            </div>
                            <div>
                                <p className="text-sm text-foreground-muted">Veículos Vendidos</p>
                                <p className="text-2xl font-bold">0</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card variant="glass">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-secondary-500/10 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-secondary-500" />
                            </div>
                            <div>
                                <p className="text-sm text-foreground-muted">Ticket Médio</p>
                                <p className="text-2xl font-bold">R$ 0</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Empty State or List */}
            {!hasData ? (
                <Card variant="glass">
                    <CardContent className="py-16">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning-500/10 flex items-center justify-center">
                                <DollarSign className="w-10 h-10 text-warning-500" />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">Nenhuma venda registrada</h2>
                            <p className="text-foreground-muted mb-6 max-w-sm mx-auto">
                                Registre sua primeira venda conectando um lead com um veículo do seu estoque.
                            </p>
                            <Link href="/sales/new">
                                <Button size="lg" leftIcon={<Plus className="w-5 h-5" />}>
                                    Registrar primeira venda
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card variant="glass">
                    <CardContent className="p-6">
                        {/* TODO: Sales list will go here */}
                        <p className="text-foreground-muted">Lista de vendas...</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
