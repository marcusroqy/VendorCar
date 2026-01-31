import Link from 'next/link';
import { Plus, Car } from 'lucide-react';
import { Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { Vehicle } from '@/lib/types';
import { Pagination } from '@/components/Pagination';
import { VehicleGrid } from './vehicle-grid';

interface VehiclesPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Force dynamic rendering to ensure fresh data (admin panel requirement)
export const dynamic = 'force-dynamic';
export const revalidate = 0;


export default async function VehiclesPage({ searchParams }: VehiclesPageProps) {
    const supabase = await createClient();
    const params = await searchParams;
    const page = Number(params.page) || 1;
    const limit = 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let vehicles: Vehicle[] = [];
    let totalCount = 0;

    if (supabase) {
        // Get total count
        const { count } = await supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true });

        totalCount = count || 0;

        // Get paginated data
        const { data } = await supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false })
            .range(from, to);

        vehicles = (data as Vehicle[]) || [];
    }

    const hasVehicles = vehicles.length > 0;
    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Veículos</h1>
                    <p className="text-foreground-muted">
                        {totalCount > 0
                            ? `${totalCount} veículo${totalCount > 1 ? 's' : ''} no estoque`
                            : 'Gerencie seu estoque de veículos'
                        }
                    </p>
                </div>
                <Link href="/vehicles/new">
                    <Button leftIcon={<Plus className="w-5 h-5" />}>
                        Novo Veículo
                    </Button>
                </Link>
            </div>

            {!hasVehicles && page === 1 ? (
                /* Empty State */
                <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary-500/10 flex items-center justify-center">
                        <Car className="w-10 h-10 text-primary-400" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Nenhum veículo cadastrado</h2>
                    <p className="text-foreground-muted mb-6 max-w-sm mx-auto">
                        Adicione seu primeiro veículo para começar a gerar links compartilháveis e receber leads.
                    </p>
                    <Link href="/vehicles/new">
                        <Button size="lg">
                            <Plus className="w-5 h-5" />
                            Adicionar meu primeiro veículo
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    {/* Vehicle Grid (Client Component with Animations) */}
                    <VehicleGrid vehicles={vehicles} />

                    {/* Pagination Controls */}
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        baseUrl="/vehicles"
                    />
                </>
            )}
        </div>
    );
}
