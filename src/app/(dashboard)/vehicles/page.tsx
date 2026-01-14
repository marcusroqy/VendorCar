import { Plus, Car, Calendar, Gauge, Fuel } from 'lucide-react';
import Link from 'next/link';
import { Button, Card, CardContent } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { Vehicle } from '@/lib/types';

function formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
    }).format(price);
}

function formatMileage(mileage: number): string {
    return new Intl.NumberFormat('pt-BR').format(mileage) + ' km';
}

const fuelLabels: Record<string, string> = {
    flex: 'Flex',
    gasoline: 'Gasolina',
    ethanol: 'Etanol',
    diesel: 'Diesel',
    electric: 'Elétrico',
    hybrid: 'Híbrido',
};

const statusColors: Record<string, string> = {
    available: 'bg-success-500/20 text-success-400',
    reserved: 'bg-warning-500/20 text-warning-400',
    sold: 'bg-gray-500/20 text-gray-400',
};

const statusLabels: Record<string, string> = {
    available: 'Disponível',
    reserved: 'Reservado',
    sold: 'Vendido',
};

export default async function VehiclesPage() {
    const supabase = await createClient();
    let vehicles: Vehicle[] = [];

    if (supabase) {
        const { data } = await supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false });

        vehicles = (data as Vehicle[]) || [];
    }

    const hasVehicles = vehicles.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Veículos</h1>
                    <p className="text-foreground-muted">
                        {hasVehicles
                            ? `${vehicles.length} veículo${vehicles.length > 1 ? 's' : ''} no estoque`
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

            {!hasVehicles ? (
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
                /* Vehicle Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map((vehicle) => (
                        <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
                            <Card variant="glass" className="hover:border-primary-500/30 transition-all cursor-pointer h-full">
                                <CardContent className="p-0">
                                    {/* Image or placeholder */}
                                    <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-xl flex items-center justify-center overflow-hidden">
                                        {vehicle.images && vehicle.images.length > 0 ? (
                                            <img
                                                src={vehicle.images[0]}
                                                alt={`${vehicle.brand} ${vehicle.model}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Car className="w-16 h-16 text-gray-700" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-semibold">{vehicle.brand} {vehicle.model}</h3>
                                                <p className="text-lg font-bold text-primary-400">{formatPrice(vehicle.price)}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[vehicle.status]}`}>
                                                {statusLabels[vehicle.status]}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-foreground-muted">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {vehicle.year}
                                            </span>
                                            {vehicle.mileage && (
                                                <span className="flex items-center gap-1">
                                                    <Gauge className="w-4 h-4" />
                                                    {formatMileage(vehicle.mileage)}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Fuel className="w-4 h-4" />
                                                {fuelLabels[vehicle.fuel] || vehicle.fuel}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
