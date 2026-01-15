'use client';

import { useState, useEffect } from 'react';
import {
    Car, Users, DollarSign, TrendingUp, Plus, ArrowRight, Clock,
    Target, AlertCircle, Phone, MessageSquare, Zap, Star, Calendar
} from 'lucide-react';
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { Lead, Vehicle, Sale } from '@/lib/types';

interface DashboardStats {
    totalVehicles: number;
    availableVehicles: number;
    totalLeads: number;
    newLeads: number;
    hotLeads: number;
    salesThisMonth: number;
    revenueThisMonth: number;
    conversionRate: number;
}

const statusColors: Record<string, string> = {
    new: 'bg-blue-500',
    contacted: 'bg-purple-500',
    interested: 'bg-green-500',
    negotiating: 'bg-yellow-500',
    closed: 'bg-success-500',
    lost: 'bg-gray-500',
};

const statusLabels: Record<string, string> = {
    new: 'Novo',
    contacted: 'Contactado',
    interested: 'Interessado',
    negotiating: 'Em Negociação',
    closed: 'Fechado',
    lost: 'Perdido',
};

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalVehicles: 0,
        availableVehicles: 0,
        totalLeads: 0,
        newLeads: 0,
        hotLeads: 0,
        salesThisMonth: 0,
        revenueThisMonth: 0,
        conversionRate: 0,
    });
    const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
    const [recentVehicles, setRecentVehicles] = useState<Vehicle[]>([]);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        async function fetchDashboardData() {
            const supabase = createClient();
            if (!supabase) {
                setLoading(false);
                return;
            }

            try {
                // Get user info
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    console.log('User ID:', user.id);

                    // Try to get name from profile first
                    const { data: profile, error: profileError } = await supabase
                        .from('user_profiles')
                        .select('name')
                        .eq('id', user.id)
                        .single();

                    console.log('Profile data:', profile, 'Error:', profileError);

                    if (profile?.name) {
                        setUserName(profile.name);
                    } else if (user.email) {
                        setUserName(user.email.split('@')[0]);
                    }
                }

                // Fetch vehicles
                const { data: vehicles } = await supabase
                    .from('vehicles')
                    .select('*')
                    .order('created_at', { ascending: false });

                const vehicleList = (vehicles as Vehicle[]) || [];
                const availableVehicles = vehicleList.filter(v => v.status === 'available');

                // Fetch leads
                const { data: leads } = await supabase
                    .from('leads')
                    .select('*')
                    .order('created_at', { ascending: false });

                const leadList = (leads as Lead[]) || [];
                const newLeads = leadList.filter(l => l.status === 'new');
                const hotLeads = leadList.filter(l => ['interested', 'negotiating'].includes(l.status));

                // Fetch sales this month
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);

                const { data: sales } = await supabase
                    .from('sales')
                    .select('*')
                    .gte('sale_date', startOfMonth.toISOString());

                const salesList = (sales as Sale[]) || [];
                const revenueThisMonth = salesList.reduce((sum, s) => sum + (s.sale_price || 0), 0);

                // Calculate conversion rate
                const closedLeads = leadList.filter(l => l.status === 'closed').length;
                const conversionRate = leadList.length > 0
                    ? Math.round((closedLeads / leadList.length) * 100)
                    : 0;

                setStats({
                    totalVehicles: vehicleList.length,
                    availableVehicles: availableVehicles.length,
                    totalLeads: leadList.length,
                    newLeads: newLeads.length,
                    hotLeads: hotLeads.length,
                    salesThisMonth: salesList.length,
                    revenueThisMonth,
                    conversionRate,
                });

                setRecentLeads(leadList.slice(0, 5));
                setRecentVehicles(vehicleList.slice(0, 4));
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    const formatPrice = (value: number) => {
        return value.toLocaleString('pt-BR');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Hoje';
        if (days === 1) return 'Ontem';
        if (days < 7) return `${days} dias atrás`;
        return d.toLocaleDateString('pt-BR');
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-20 bg-gray-800/50 rounded-2xl"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-28 bg-gray-800/50 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 p-6 sm:p-8">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwTTMwIC0xMHY2MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50"></div>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-white/80 text-sm mb-1">{getGreeting()},</p>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white capitalize">{userName || 'Vendedor'}</h1>
                        <p className="text-white/70 mt-1">Aqui está o resumo do seu negócio hoje</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/vehicles/new">
                            <Button className="bg-white text-primary-600 hover:bg-white/90" leftIcon={<Plus className="w-5 h-5" />}>
                                Novo Veículo
                            </Button>
                        </Link>
                        <Link href="/leads/new">
                            <Button variant="ghost" className="text-white border-white/30 hover:bg-white/10" leftIcon={<Users className="w-5 h-5" />}>
                                Novo Lead
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Vehicles */}
                <Link href="/vehicles">
                    <Card variant="interactive" className="h-full group">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-foreground-muted">Veículos Disponíveis</p>
                                    <p className="text-3xl font-bold mt-1 group-hover:text-primary-400 transition-colors">{stats.availableVehicles}</p>
                                    <p className="text-xs text-foreground-subtle mt-1">{stats.totalVehicles} no total</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-500/5 flex items-center justify-center">
                                    <Car className="w-6 h-6 text-primary-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Leads */}
                <Link href="/leads">
                    <Card variant="interactive" className="h-full group">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-foreground-muted">Leads Ativos</p>
                                    <p className="text-3xl font-bold mt-1 group-hover:text-success-400 transition-colors">{stats.totalLeads}</p>
                                    {stats.newLeads > 0 && (
                                        <p className="text-xs text-success-400 mt-1 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse"></span>
                                            {stats.newLeads} novos
                                        </p>
                                    )}
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success-500/20 to-success-500/5 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-success-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Sales */}
                <Link href="/sales">
                    <Card variant="interactive" className="h-full group">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-foreground-muted">Vendas do Mês</p>
                                    <p className="text-3xl font-bold mt-1 group-hover:text-warning-400 transition-colors">{stats.salesThisMonth}</p>
                                    <p className="text-xs text-foreground-subtle mt-1">R$ {formatPrice(stats.revenueThisMonth)}</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning-500/20 to-warning-500/5 flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-warning-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Conversion */}
                <Card className="h-full">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-foreground-muted">Taxa de Conversão</p>
                                <p className="text-3xl font-bold mt-1">{stats.conversionRate}%</p>
                                {stats.hotLeads > 0 && (
                                    <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                                        <Zap className="w-3 h-3" />
                                        {stats.hotLeads} leads quentes
                                    </p>
                                )}
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
                                <Target className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Leads */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Hot Leads Alert */}
                    {stats.hotLeads > 0 && (
                        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-yellow-400">Leads Quentes!</h3>
                                        <p className="text-sm text-foreground-muted">
                                            Você tem {stats.hotLeads} lead{stats.hotLeads > 1 ? 's' : ''} interessado{stats.hotLeads > 1 ? 's' : ''} ou em negociação
                                        </p>
                                    </div>
                                    <Link href="/leads?filter=hot">
                                        <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black">
                                            Ver agora
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Leads */}
                    <Card variant="glass">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-success-400" />
                                Leads Recentes
                            </CardTitle>
                            <Link href="/leads">
                                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                                    Ver todos
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {recentLeads.length > 0 ? (
                                <div className="space-y-3">
                                    {recentLeads.map(lead => (
                                        <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                                            <Link href={`/leads/${lead.id}`} className="flex items-center gap-3 flex-1 cursor-pointer">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-sm font-semibold">
                                                    {lead.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{lead.name}</p>
                                                    <p className="text-xs text-foreground-muted">{lead.vehicle_interest || lead.phone}</p>
                                                </div>
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${statusColors[lead.status]}`}></span>
                                                <span className="text-xs text-foreground-muted hidden sm:block">{statusLabels[lead.status]}</span>
                                                <a
                                                    href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center hover:bg-green-500/30 transition-colors ml-2"
                                                >
                                                    <MessageSquare className="w-4 h-4 text-green-400" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-success-500/10 flex items-center justify-center">
                                        <Users className="w-7 h-7 text-success-400" />
                                    </div>
                                    <p className="text-foreground-muted mb-4">Nenhum lead ainda</p>
                                    <Link href="/leads/new">
                                        <Button variant="secondary" size="sm">Cadastrar lead</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Vehicles */}
                    <Card variant="glass">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Car className="w-5 h-5 text-primary-400" />
                                Veículos Recentes
                            </CardTitle>
                            <Link href="/vehicles">
                                <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                                    Ver todos
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {recentVehicles.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {recentVehicles.map(vehicle => (
                                        <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
                                            <div className="rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors cursor-pointer overflow-hidden">
                                                <div className="aspect-video bg-gray-700/50 flex items-center justify-center">
                                                    {vehicle.images && vehicle.images.length > 0 ? (
                                                        <img src={vehicle.images[0]} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Car className="w-8 h-8 text-gray-500" />
                                                    )}
                                                </div>
                                                <div className="p-3">
                                                    <p className="font-medium text-sm truncate">{vehicle.brand} {vehicle.model}</p>
                                                    <p className="text-xs text-success-400">R$ {formatPrice(vehicle.price)}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-500/10 flex items-center justify-center">
                                        <Car className="w-7 h-7 text-primary-400" />
                                    </div>
                                    <p className="text-foreground-muted mb-4">Nenhum veículo cadastrado</p>
                                    <Link href="/vehicles/new">
                                        <Button size="sm">Adicionar veículo</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Quick Actions & Stats */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                Ações Rápidas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/vehicles/new">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-500/10 border border-primary-500/30 hover:bg-primary-500/20 transition-colors cursor-pointer">
                                    <Car className="w-5 h-5 text-primary-400" />
                                    <span className="font-medium">Cadastrar Veículo</span>
                                </div>
                            </Link>
                            <Link href="/leads/new">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-success-500/10 border border-success-500/30 hover:bg-success-500/20 transition-colors cursor-pointer">
                                    <Users className="w-5 h-5 text-success-400" />
                                    <span className="font-medium">Cadastrar Lead</span>
                                </div>
                            </Link>
                            <Link href="/sales/new">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-warning-500/10 border border-warning-500/30 hover:bg-warning-500/20 transition-colors cursor-pointer">
                                    <DollarSign className="w-5 h-5 text-warning-400" />
                                    <span className="font-medium">Registrar Venda</span>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Performance Summary */}
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                                Resumo de Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30">
                                <span className="text-sm text-foreground-muted">Veículos vendidos</span>
                                <span className="font-bold">{stats.salesThisMonth}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30">
                                <span className="text-sm text-foreground-muted">Faturamento do mês</span>
                                <span className="font-bold text-success-400">R$ {formatPrice(stats.revenueThisMonth)}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30">
                                <span className="text-sm text-foreground-muted">Ticket médio</span>
                                <span className="font-bold">
                                    R$ {stats.salesThisMonth > 0 ? formatPrice(stats.revenueThisMonth / stats.salesThisMonth) : '0'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30">
                                <span className="text-sm text-foreground-muted">Meta de conversão</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 rounded-full bg-gray-700">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-success-500"
                                            style={{ width: `${Math.min(stats.conversionRate, 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-bold text-sm">{stats.conversionRate}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Today's Date */}
                    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                        <CardContent className="p-4 text-center">
                            <Calendar className="w-6 h-6 mx-auto mb-2 text-foreground-muted" />
                            <p className="text-lg font-bold">
                                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                            <p className="text-sm text-foreground-muted mt-1">Boas vendas! 🚗</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
