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
import nextDynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';

// Dynamic Imports with Loading States
const StatsGrid = nextDynamic(() => import('@/components/dashboard/StatsGrid'), {
    loading: () => (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-800/50 rounded-2xl"></div>
            ))}
        </div>
    )
});

const RecentLeads = nextDynamic(() => import('@/components/dashboard/RecentLeads'), {
    loading: () => <div className="h-96 bg-gray-800/50 rounded-2xl animate-pulse"></div>
});

const RecentVehicles = nextDynamic(() => import('@/components/dashboard/RecentVehicles'), {
    loading: () => <div className="h-96 bg-gray-800/50 rounded-2xl animate-pulse"></div>
});

const SalesChart = nextDynamic(() => import('@/components/dashboard/SalesChart'), {
    loading: () => <div className="h-[300px] bg-gray-800/50 rounded-2xl animate-pulse"></div>
});

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

interface SalesChartData {
    month: string;
    value: number;
    count: number;
}

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
    const [salesChartData, setSalesChartData] = useState<SalesChartData[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState('6months');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        async function fetchDashboardData() {
            const supabase = createClient();
            if (!supabase) {
                setLoading(false);
                return;
            }

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // Fetch LAST 24 MONTHS for flexibility
                    const startDate = new Date();
                    startDate.setMonth(startDate.getMonth() - 24);
                    startDate.setDate(1);
                    startDate.setHours(0, 0, 0, 0);

                    // Fetch all data in parallel
                    const [profileResult, vehiclesResult, leadsResult, salesResult] = await Promise.all([
                        supabase.from('user_profiles').select('name').eq('id', user.id).single(),
                        supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
                        supabase.from('leads').select('*').order('created_at', { ascending: false }),
                        supabase.from('sales').select('*').gte('sale_date', startDate.toISOString()).order('sale_date', { ascending: true })
                    ]);

                    // Process Profile
                    const profile = profileResult.data;
                    if (profile?.name) {
                        setUserName(profile.name);
                    } else if (user.email) {
                        setUserName(user.email.split('@')[0]);
                    }

                    // Process Vehicles
                    const vehiclesList = (vehiclesResult.data as Vehicle[]) || [];
                    const availableVehicles = vehiclesList.filter(v => v.status === 'available');

                    // Process Leads
                    const leadsList = (leadsResult.data as Lead[]) || [];
                    const newLeads = leadsList.filter(l => l.status === 'new');
                    const hotLeads = leadsList.filter(l => ['interested', 'negotiating'].includes(l.status));

                    // Process Sales
                    const salesList = (salesResult.data as Sale[]) || [];

                    // Filter sales for current month for stats
                    const now = new Date();
                    const currentMonthSales = salesList.filter(s => {
                        const saleDate = new Date(s.sale_date);
                        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
                    });

                    const revenueThisMonth = currentMonthSales.reduce((sum, s) => sum + (s.sale_price || 0), 0);

                    // --- Process Sales Chart Data Based on Period ---
                    let chartStart = new Date();
                    let monthsToProcess = 6;

                    if (selectedPeriod === '6months') {
                        chartStart.setMonth(now.getMonth() - 5);
                        chartStart.setDate(1);
                        monthsToProcess = 6;
                    } else {
                        // Specific Year
                        const year = parseInt(selectedPeriod);
                        chartStart = new Date(year, 0, 1);
                        monthsToProcess = 12;
                    }

                    // Create robust YYYY-MM map
                    const chartDataMap = new Map<string, { monthName: string, value: number, count: number }>();

                    // Initialize buckets
                    for (let i = 0; i < monthsToProcess; i++) {
                        const d = new Date(chartStart);
                        d.setMonth(chartStart.getMonth() + i);

                        const year = d.getFullYear();
                        const month = d.getMonth() + 1;
                        const key = `${year}-${month.toString().padStart(2, '0')}`;
                        const monthName = d.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

                        chartDataMap.set(key, { monthName, value: 0, count: 0 });
                    }

                    // Fill buckets
                    salesList.forEach(sale => {
                        const d = new Date(sale.sale_date);
                        const year = d.getFullYear();
                        const month = d.getMonth() + 1;
                        const key = `${year}-${month.toString().padStart(2, '0')}`;

                        if (chartDataMap.has(key)) {
                            const entry = chartDataMap.get(key)!;
                            chartDataMap.set(key, {
                                ...entry,
                                value: entry.value + (sale.sale_price || 0),
                                count: entry.count + 1
                            });
                        }
                    });

                    // Convert back to array
                    const chartData = Array.from(chartDataMap.values()).map(item => ({
                        month: item.monthName,
                        value: item.value,
                        count: item.count
                    }));

                    setSalesChartData(chartData);

                    // Calculate conversion rate
                    const closedLeads = leadsList.filter(l => l.status === 'closed').length;
                    const conversionRate = leadsList.length > 0
                        ? Math.round((closedLeads / leadsList.length) * 100)
                        : 0;

                    setStats({
                        totalVehicles: vehiclesList.length,
                        availableVehicles: availableVehicles.length,
                        totalLeads: leadsList.length,
                        newLeads: newLeads.length,
                        hotLeads: hotLeads.length,
                        salesThisMonth: currentMonthSales.length,
                        revenueThisMonth,
                        conversionRate,
                    });

                    setRecentLeads(leadsList.slice(0, 5));
                    setRecentVehicles(vehiclesList.slice(0, 4));
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, [selectedPeriod]);

    const formatPrice = (value: number) => {
        return value.toLocaleString('pt-BR');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 p-6 sm:p-8 shadow-2xl shadow-primary-500/10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwTTMwIC0xMHY2MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-30 mix-blend-overlay"></div>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p className="text-white/80 text-sm mb-1 font-medium tracking-wide uppercase opacity-80">{getGreeting()},</p>
                        <h1 className="text-3xl sm:text-4xl font-bold text-white capitalize tracking-tight">{userName || 'Vendedor'}</h1>
                        <p className="text-white/70 mt-2 font-light">Aqui está o resumo do seu negócio hoje</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/vehicles/new">
                            <Button className="bg-white text-primary-600 hover:bg-white/90 shadow-lg shadow-black/10" leftIcon={<Plus className="w-5 h-5" />}>
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
            <StatsGrid stats={stats} />

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Leads & Charts */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Hot Leads Alert */}
                    {stats.hotLeads > 0 && (
                        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            <CardContent className="p-4 relative">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center animate-pulse">
                                        <Zap className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-yellow-400">Leads Quentes!</h3>
                                        <p className="text-sm text-foreground-muted">
                                            Você tem {stats.hotLeads} lead{stats.hotLeads > 1 ? 's' : ''} interessado{stats.hotLeads > 1 ? 's' : ''} ou em negociação
                                        </p>
                                    </div>
                                    <Link href="/leads?filter=hot">
                                        <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold shadow-lg shadow-yellow-500/20">
                                            Ver agora
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Sales Chart - NEW */}
                    <SalesChart
                        data={salesChartData}
                        period={selectedPeriod}
                        onPeriodChange={setSelectedPeriod}
                    />

                    {/* Recent Leads */}
                    <RecentLeads leads={recentLeads} />
                </div>

                {/* Right Column - Vehicles & Stats */}
                <div className="space-y-6">
                    {/* Recent Vehicles */}
                    <RecentVehicles vehicles={recentVehicles} />

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
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all cursor-pointer group">
                                    <div className="p-2 rounded-lg bg-primary-500/20 group-hover:bg-primary-500/30 transition-colors">
                                        <Car className="w-4 h-4 text-primary-400" />
                                    </div>
                                    <span className="font-medium group-hover:text-primary-400 transition-colors">Cadastrar Veículo</span>
                                </div>
                            </Link>
                            <Link href="/leads/new">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-success-500/10 hover:border-success-500/30 transition-all cursor-pointer group">
                                    <div className="p-2 rounded-lg bg-success-500/20 group-hover:bg-success-500/30 transition-colors">
                                        <Users className="w-4 h-4 text-success-400" />
                                    </div>
                                    <span className="font-medium group-hover:text-success-400 transition-colors">Cadastrar Lead</span>
                                </div>
                            </Link>
                            <Link href="/sales/new">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-warning-500/10 hover:border-warning-500/30 transition-all cursor-pointer group">
                                    <div className="p-2 rounded-lg bg-warning-500/20 group-hover:bg-warning-500/30 transition-colors">
                                        <DollarSign className="w-4 h-4 text-warning-400" />
                                    </div>
                                    <span className="font-medium group-hover:text-warning-400 transition-colors">Registrar Venda</span>
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
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                <span className="text-sm text-foreground-muted">Veículos vendidos</span>
                                <span className="font-bold">{stats.salesThisMonth}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                <span className="text-sm text-foreground-muted">Faturamento do mês</span>
                                <span className="font-bold text-success-400">R$ {formatPrice(stats.revenueThisMonth)}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                <span className="text-sm text-foreground-muted">Ticket médio</span>
                                <span className="font-bold">
                                    R$ {stats.salesThisMonth > 0 ? formatPrice(stats.revenueThisMonth / stats.salesThisMonth) : '0'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                <span className="text-sm text-foreground-muted">Meta de conversão</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 rounded-full bg-gray-700/50">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-success-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                            style={{ width: `${Math.min(stats.conversionRate, 100)}%` }}
                                        ></div>
                                    </div>
                                    <span className="font-bold text-sm">{stats.conversionRate}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Today's Date */}
                    <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-white/5">
                        <CardContent className="p-4 text-center">
                            <Calendar className="w-6 h-6 mx-auto mb-2 text-foreground-muted opacity-50" />
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
