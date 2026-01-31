'use client';

import Link from 'next/link';
import { Users, ArrowRight, MessageSquare, Phone } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, CardTitle } from '@/components/ui';
import { Lead } from '@/lib/types';
import { m } from 'framer-motion';

interface RecentLeadsProps {
    leads: Lead[];
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

export default function RecentLeads({ leads }: RecentLeadsProps) {
    return (
        <Card variant="glass" className="overflow-hidden border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-success-500/20 to-transparent">
                        <Users className="w-5 h-5 text-success-400" />
                    </div>
                    Leads Recentes
                </CardTitle>
                <Link href="/leads">
                    <Button variant="ghost" size="sm" className="hover:bg-white/5" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        Ver todos
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                {leads.length > 0 ? (
                    <div className="space-y-3">
                        {leads.map((lead, index) => (
                            <m.div
                                key={lead.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-300"
                            >
                                <Link href={`/leads/${lead.id}`} className="flex items-center gap-4 flex-1 cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-black/20">
                                        {lead.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white group-hover:text-primary-400 transition-colors">{lead.name}</p>
                                        <p className="text-xs text-foreground-muted truncate max-w-[150px] sm:max-w-[200px]">
                                            {lead.vehicle_interest || lead.phone}
                                        </p>
                                    </div>
                                </Link>

                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end mr-2">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusColors[lead.status]} shadow-[0_0_8px_currentColor]`}></span>
                                            <span className="text-xs font-medium text-foreground-muted hidden sm:block">{statusLabels[lead.status]}</span>
                                        </div>
                                    </div>

                                    <a
                                        href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 hover:bg-green-500 hover:text-white transition-all duration-300 transform hover:scale-110 shadow-lg shadow-green-500/10"
                                        title="Chamar no WhatsApp"
                                    >
                                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                                        </svg>
                                    </a>
                                </div>
                            </m.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 flex flex-col items-center">
                        <div className="w-16 h-16 mb-4 rounded-full bg-success-500/10 flex items-center justify-center animate-pulse">
                            <Users className="w-8 h-8 text-success-400" />
                        </div>
                        <p className="text-foreground-muted mb-6">Nenhum lead encontrado.</p>
                        <Link href="/leads/new">
                            <Button className="bg-success-600 hover:bg-success-700 text-white shadow-lg shadow-success-500/20">
                                Cadastrar primeiro lead
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
