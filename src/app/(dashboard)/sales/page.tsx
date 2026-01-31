import { DollarSign, Plus, TrendingUp, Car } from 'lucide-react';
import Link from 'next/link';
import { Button, Card, CardContent } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { Sale } from '@/lib/types';

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

export default async function SalesPage() {
    const supabase = await createClient();
    let sales: Sale[] = [];

    if (supabase) {
        const { data } = await supabase
            .from('sales')
            .select(`
                *,
                vehicle:vehicles(brand, model, images),
                lead:leads(name, email)
            `)
            .order('sale_date', { ascending: false });

        if (data) {
            sales = data as unknown as Sale[];
        }
    }

    const hasData = sales.length > 0;
    const totalSales = sales.reduce((acc, sale) => acc + sale.sale_price, 0);
    const averageTicket = hasData ? totalSales / sales.length : 0;

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
                                <p className="text-2xl font-bold">{formatCurrency(totalSales)}</p>
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
                                <p className="text-2xl font-bold">{sales.length}</p>
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
                                <p className="text-2xl font-bold">{formatCurrency(averageTicket)}</p>
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
                    <CardContent className="p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 text-foreground-muted uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Data</th>
                                        <th className="px-6 py-4">Veículo</th>
                                        <th className="px-6 py-4">Cliente</th>
                                        <th className="px-6 py-4 text-right">Valor</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {sales.map((sale) => (
                                        <tr
                                            key={sale.id}
                                            className="hover:bg-white/5 transition-colors group relative"
                                        >
                                            <td className="px-6 py-4 font-medium">
                                                <Link href={`/sales/${sale.id}`} className="absolute inset-0 z-10" />
                                                {formatDate(sale.sale_date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {sale.vehicle ? (
                                                    <span className="font-medium text-foreground">
                                                        {sale.vehicle.brand} {sale.vehicle.model}
                                                    </span>
                                                ) : (
                                                    <span className="text-foreground-muted italic">Veículo removido</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {sale.lead?.name || <span className="text-foreground-muted italic">Desconhecido</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-success-400">
                                                {formatCurrency(sale.sale_price)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-500/20 text-success-400">
                                                    Concluída
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
