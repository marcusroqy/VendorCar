import { Car, Users, DollarSign, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

// Stats data - will come from Supabase later
const stats = [
    { label: 'Veículos Ativos', value: '0', icon: Car, href: '/vehicles', color: 'primary' },
    { label: 'Leads Novos', value: '0', icon: Users, href: '/leads', color: 'success' },
    { label: 'Vendas do Mês', value: '0', icon: DollarSign, href: '/sales', color: 'warning' },
    { label: 'Visualizações', value: '0', icon: TrendingUp, color: 'info' },
];

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-foreground-muted">Bem-vindo ao VendorCarro</p>
                </div>
                <Link href="/vehicles/new">
                    <Button leftIcon={<Plus className="w-5 h-5" />}>
                        Novo Veículo
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Card
                        key={stat.label}
                        variant={stat.href ? 'interactive' : 'default'}
                        padding="md"
                        className="relative overflow-hidden"
                    >
                        {stat.href ? (
                            <Link href={stat.href} className="absolute inset-0" />
                        ) : null}
                        <CardContent className="p-0">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-foreground-muted">{stat.label}</p>
                                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                </div>
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${stat.color}-500/10`}
                                >
                                    <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Empty State - Vehicles */}
                <Card variant="glass" padding="lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="w-5 h-5 text-primary-400" />
                            Veículos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-500/10 flex items-center justify-center">
                                <Car className="w-8 h-8 text-primary-400" />
                            </div>
                            <h3 className="font-semibold mb-2">Nenhum veículo cadastrado</h3>
                            <p className="text-sm text-foreground-muted mb-6">
                                Comece adicionando seu primeiro veículo
                            </p>
                            <Link href="/vehicles/new">
                                <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                                    Adicionar veículo
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Empty State - Leads */}
                <Card variant="glass" padding="lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-success-500" />
                            Leads Recentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-500/10 flex items-center justify-center">
                                <Users className="w-8 h-8 text-success-500" />
                            </div>
                            <h3 className="font-semibold mb-2">Nenhum lead ainda</h3>
                            <p className="text-sm text-foreground-muted mb-6">
                                Os leads aparecerão quando clientes entrarem em contato
                            </p>
                            <Link href="/leads">
                                <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                                    Ver todos os leads
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
