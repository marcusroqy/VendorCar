'use client';

import Link from 'next/link';
import { Car, Users, DollarSign, Target, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { m, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

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

interface StatsGridProps {
    stats: DashboardStats;
}

function CountUp({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });
    const displayValue = useTransform(springValue, (current) =>
        prefix + Math.round(current).toLocaleString('pt-BR') + suffix
    );

    useEffect(() => {
        motionValue.set(value);
    }, [value, motionValue]);

    return <m.span>{displayValue}</m.span>;
}

export default function StatsGrid({ stats }: StatsGridProps) {
    const formatPrice = (value: number) => {
        return value.toLocaleString('pt-BR');
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <m.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
            {/* Vehicles */}
            <m.div variants={item}>
                <Link href="/vehicles">
                    <Card variant="glass" className="h-full group hover:border-primary-500/50 hover:bg-primary-500/5 transition-all duration-300">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-foreground-muted font-medium">Veículos Disponíveis</p>
                                    <p className="text-3xl font-bold mt-2 group-hover:text-primary-400 transition-colors">
                                        <CountUp value={stats.availableVehicles} />
                                    </p>
                                    <p className="text-xs text-foreground-subtle mt-1 flex items-center gap-1">
                                        <Car className="w-3 h-3" />
                                        {stats.totalVehicles} cadastrados
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500/20 to-primary-500/5 flex items-center justify-center border border-primary-500/20 shadow-lg shadow-primary-500/10 group-hover:scale-110 transition-transform duration-300">
                                    <Car className="w-6 h-6 text-primary-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </m.div>

            {/* Leads */}
            <m.div variants={item}>
                <Link href="/leads">
                    <Card variant="glass" className="h-full group hover:border-success-500/50 hover:bg-success-500/5 transition-all duration-300">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-foreground-muted font-medium">Leads Ativos</p>
                                    <p className="text-3xl font-bold mt-2 group-hover:text-success-400 transition-colors">
                                        <CountUp value={stats.totalLeads} />
                                    </p>
                                    {stats.newLeads > 0 ? (
                                        <p className="text-xs text-success-400 mt-1 flex items-center gap-1 font-medium bg-success-500/10 px-2 py-0.5 rounded-full w-fit">
                                            <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse"></span>
                                            {stats.newLeads} novos
                                        </p>
                                    ) : (
                                        <p className="text-xs text-foreground-subtle mt-1">Nenhum novo lead</p>
                                    )}
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-success-500/20 to-success-500/5 flex items-center justify-center border border-success-500/20 shadow-lg shadow-success-500/10 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-6 h-6 text-success-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </m.div>

            {/* Sales */}
            <m.div variants={item}>
                <Link href="/sales">
                    <Card variant="glass" className="h-full group hover:border-warning-500/50 hover:bg-warning-500/5 transition-all duration-300">
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-foreground-muted font-medium">Vendas do Mês</p>
                                    <p className="text-3xl font-bold mt-2 group-hover:text-warning-400 transition-colors">
                                        <CountUp value={stats.salesThisMonth} />
                                    </p>
                                    <p className="text-xs text-foreground-subtle mt-1 font-medium text-warning-400/80">
                                        R$ {formatPrice(stats.revenueThisMonth)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-warning-500/20 to-warning-500/5 flex items-center justify-center border border-warning-500/20 shadow-lg shadow-warning-500/10 group-hover:scale-110 transition-transform duration-300">
                                    <DollarSign className="w-6 h-6 text-warning-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </m.div>

            {/* Conversion */}
            <m.div variants={item}>
                <Card variant="glass" className="h-full group hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-foreground-muted font-medium">Taxa de Conversão</p>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <p className="text-3xl font-bold group-hover:text-blue-400 transition-colors">
                                        <CountUp value={stats.conversionRate} suffix="%" />
                                    </p>
                                </div>
                                {stats.hotLeads > 0 ? (
                                    <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1 font-medium bg-yellow-500/10 px-2 py-0.5 rounded-full w-fit">
                                        <Zap className="w-3 h-3" />
                                        {stats.hotLeads} quentes
                                    </p>
                                ) : (
                                    <p className="text-xs text-foreground-subtle mt-1">Metas em dia</p>
                                )}
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform duration-300">
                                <Target className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </m.div>
        </m.div>
    );
}
