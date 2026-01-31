import { ArrowLeft, Calendar, Car, CreditCard, DollarSign, FileText, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { Sale } from '@/lib/types';

interface SalePageProps {
    params: Promise<{ id: string }>;
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

const paymentMethodLabels: Record<string, string> = {
    cash: 'À Vista',
    financing: 'Financiamento',
    consortium: 'Consórcio',
    trade: 'Troca',
    trade_plus_cash: 'Troca + Volta',
};

export default async function SaleDetailsPage({ params }: SalePageProps) {
    const { id } = await params;
    const supabase = await createClient();

    let sale: Sale | null = null;

    if (supabase) {
        const { data } = await supabase
            .from('sales')
            .select(`
                *,
                vehicle:vehicles(*),
                lead:leads(*)
            `)
            .eq('id', id)
            .single();

        if (data) {
            sale = data as unknown as Sale;
        }
    }

    if (!sale) {
        notFound();
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/sales">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Detalhes da Venda</h1>
                    <p className="text-foreground-muted">
                        Realizada em {formatDate(sale.sale_date)}
                    </p>
                </div>
                <div className="ml-auto">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-500/20 text-success-400">
                        Concluída
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Financial Details */}
                <Card variant="glass" className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-success-400" />
                            Resumo Financeiro
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm text-foreground-muted mb-1">Valor da Venda</p>
                                <p className="text-2xl font-bold text-success-400">{formatCurrency(sale.sale_price)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-foreground-muted mb-1">Método de Pagamento</p>
                                <p className="font-medium flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    {paymentMethodLabels[sale.payment_method] || sale.payment_method}
                                </p>
                            </div>
                            {sale.down_payment && (
                                <div>
                                    <p className="text-sm text-foreground-muted mb-1">Entrada</p>
                                    <p className="font-medium">{formatCurrency(sale.down_payment)}</p>
                                </div>
                            )}
                            {sale.installments && (
                                <div>
                                    <p className="text-sm text-foreground-muted mb-1">Parcelas</p>
                                    <p className="font-medium">{sale.installments}x</p>
                                </div>
                            )}
                            {sale.discount && (
                                <div>
                                    <p className="text-sm text-foreground-muted mb-1">Desconto Aplicado</p>
                                    <p className="font-medium text-error-400">-{formatCurrency(sale.discount)}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Vehicle Details */}
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="w-5 h-5 text-primary-400" />
                            Veículo Vendido
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sale.vehicle ? (
                            <div className="flex gap-4">
                                <div className="w-24 h-24 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    {sale.vehicle.images && sale.vehicle.images.length > 0 ? (
                                        <Image
                                            src={sale.vehicle.images[0]}
                                            alt={`${sale.vehicle.brand} ${sale.vehicle.model}`}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Car className="w-8 h-8 text-gray-600" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{sale.vehicle.brand} {sale.vehicle.model}</h3>
                                    <p className="text-foreground-muted text-sm mb-2">{sale.vehicle.year} • {sale.vehicle.fuel}</p>
                                    <Link href={`/vehicles/${sale.vehicle.id}`}>
                                        <Button variant="secondary" size="sm">
                                            Ver Veículo
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <p className="text-foreground-muted italic">Veículo não encontrado ou removido.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Customer Details */}
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-secondary-400" />
                            Dados do Cliente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {sale.lead ? (
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-foreground-muted">Nome</p>
                                    <p className="font-medium">{sale.lead.name}</p>
                                </div>
                                {sale.lead.email && (
                                    <div>
                                        <p className="text-sm text-foreground-muted">Email</p>
                                        <p className="font-medium">{sale.lead.email}</p>
                                    </div>
                                )}
                                {sale.lead.phone && (
                                    <div>
                                        <p className="text-sm text-foreground-muted">Telefone</p>
                                        <p className="font-medium">{sale.lead.phone}</p>
                                    </div>
                                )}
                                <Link href={`/leads/${sale.lead.id}`}>
                                    <Button variant="secondary" size="sm" className="mt-2" fullWidth>
                                        Ver Lead
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <p className="text-foreground-muted italic">Cliente não encontrado.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Notes */}
                {sale.notes && (
                    <Card variant="glass" className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Observações
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground-muted leading-relaxed whitespace-pre-wrap">
                                {sale.notes}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
