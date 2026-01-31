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
                                            className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 hover:bg-green-500 hover:text-white transition-all duration-300 transform hover:scale-110"
                                            title="WhatsApp"
                                        >
                                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                                            </svg>
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
