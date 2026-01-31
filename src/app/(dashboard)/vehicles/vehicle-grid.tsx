'use client';

import Link from 'next/link';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Calendar, Gauge, Fuel, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { Vehicle } from '@/lib/types';
import { VehicleShareButton } from './vehicle-share-button';
import { getVehicleThumbnail } from '@/lib/supabase-image';

interface VehicleGridProps {
    vehicles: Vehicle[];
}

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

const fuelLabels: Record<string, string> = {
    flex: 'Flex',
    gasoline: 'Gasolina',
    ethanol: 'Etanol',
    diesel: 'Diesel',
    electric: 'Elétrico',
    hybrid: 'Híbrido',
};

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

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export function VehicleGrid({ vehicles }: VehicleGridProps) {
    return (
        <m.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
            {vehicles.map((vehicle) => (
                <m.div key={vehicle.id} variants={itemVariants}>
                    <Link href={`/vehicles/${vehicle.id}`}>
                        <Card variant="glass" className="hover:border-primary-500/30 transition-all cursor-pointer h-full group">
                            <CardContent className="p-0">
                                {/* Image or placeholder */}
                                <div className="h-40 bg-gradient-to-br from-gray-800 to-gray-900 rounded-t-xl flex items-center justify-center overflow-hidden relative">
                                    {vehicle.images && vehicle.images.length > 0 ? (() => {
                                        const imgUrl = vehicle.images[0];
                                        // Safety check: if it's already a data URI, use it directly. 
                                        // Otherwise use the optimizer.
                                        const isDataUri = imgUrl.startsWith('data:') || imgUrl.includes(';base64,');
                                        const finalSrc = isDataUri ? imgUrl : getVehicleThumbnail(imgUrl);

                                        return (
                                            <Image
                                                src={finalSrc}
                                                alt={`${vehicle.brand} ${vehicle.model}`}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                priority={false}
                                            />
                                        );
                                    })() : (
                                        <Car className="w-16 h-16 text-gray-700" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className="font-semibold text-foreground">{vehicle.brand} {vehicle.model}</h3>
                                            <p className="text-lg font-bold text-primary-400">{formatPrice(vehicle.price)}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[vehicle.status]}`}>
                                                {statusLabels[vehicle.status]}
                                            </span>
                                            <VehicleShareButton vehicle={vehicle} className="cursor-pointer hover:bg-white/10" />
                                        </div>
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
                </m.div>
            ))}
        </m.div>
    );
}
