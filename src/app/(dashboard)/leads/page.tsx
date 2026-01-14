import { Plus, Users, Phone, Mail, Car, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button, Card, CardContent } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { Lead } from '@/lib/types';

const statusColors: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-400',
    contacted: 'bg-purple-500/20 text-purple-400',
    interested: 'bg-success-500/20 text-success-400',
    negotiating: 'bg-warning-500/20 text-warning-400',
    closed: 'bg-success-500/20 text-success-400',
    lost: 'bg-gray-500/20 text-gray-400',
};

const statusLabels: Record<string, string> = {
    new: 'Novo',
    contacted: 'Contactado',
    interested: 'Interessado',
    negotiating: 'Em Negociação',
    closed: 'Fechado',
    lost: 'Perdido',
};

function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(dateString));
}

export default async function LeadsPage() {
    const supabase = await createClient();
    let leads: Lead[] = [];

    if (supabase) {
        const { data } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        leads = (data as Lead[]) || [];
    }

    const hasLeads = leads.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Leads</h1>
                    <p className="text-foreground-muted">
                        {hasLeads
                            ? `${leads.length} lead${leads.length > 1 ? 's' : ''} cadastrado${leads.length > 1 ? 's' : ''}`
                            : 'Acompanhe seus clientes interessados'
                        }
                    </p>
                </div>
                <Link href="/leads/new">
                    <Button leftIcon={<Plus className="w-5 h-5" />}>
                        Novo Lead
                    </Button>
                </Link>
            </div>

            {!hasLeads ? (
                /* Empty State */
                <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-500/10 flex items-center justify-center">
                        <Users className="w-10 h-10 text-success-500" />
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
            ) : (
                /* Leads List */
                <div className="space-y-3">
                    {leads.map((lead) => (
                        <Card key={lead.id} variant="glass" className="hover:border-primary-500/30 transition-all">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <Link href={`/leads/${lead.id}`} className="flex items-center gap-4 flex-1 cursor-pointer">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                                            {lead.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                        </div>

                                        {/* Info */}
                                        <div>
                                            <h3 className="font-semibold">{lead.name}</h3>
                                            <div className="flex items-center gap-3 text-sm text-foreground-muted">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {lead.phone}
                                                </span>
                                                {lead.email && (
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {lead.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="flex items-center gap-2 sm:gap-3">
                                        {/* Quick Actions */}
                                        <a
                                            href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center hover:bg-green-500/30 transition-colors"
                                            title="WhatsApp"
                                        >
                                            <span className="text-lg">💬</span>
                                        </a>
                                        <a
                                            href={`tel:${lead.phone.replace(/\D/g, '')}`}
                                            className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/30 transition-colors"
                                            title="Ligar"
                                        >
                                            <Phone className="w-4 h-4 text-blue-400" />
                                        </a>

                                        {/* Info badges - hidden on mobile */}
                                        {lead.vehicle_interest && (
                                            <span className="hidden lg:flex items-center gap-1 text-sm text-foreground-muted">
                                                <Car className="w-4 h-4" />
                                                {lead.vehicle_interest}
                                            </span>
                                        )}
                                        <span className="hidden md:flex items-center gap-1 text-sm text-foreground-muted">
                                            <Clock className="w-4 h-4" />
                                            {formatDate(lead.created_at)}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[lead.status]}`}>
                                            {statusLabels[lead.status]}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
