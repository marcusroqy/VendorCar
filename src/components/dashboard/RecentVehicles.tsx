'use client';

import Link from 'next/link';
import { Car, ArrowRight, Fuel, Calendar, Gauge } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, CardTitle } from '@/components/ui';
import { Vehicle } from '@/lib/types';
import { getVehicleThumbnail } from '@/lib/supabase-image';
import { m } from 'framer-motion';

interface RecentVehiclesProps {
    vehicles: Vehicle[];
}

export default function RecentVehicles({ vehicles }: RecentVehiclesProps) {
    const formatPrice = (value: number) => value.toLocaleString('pt-BR');

    return (
        <Card variant="glass" className="overflow-hidden border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary-500/20 to-transparent">
                        <Car className="w-5 h-5 text-primary-400" />
                    </div>
                    Veículos Recentes
                </CardTitle>
                <Link href="/vehicles">
                    <Button variant="ghost" size="sm" className="hover:bg-white/5" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        Ver todos
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                {vehicles.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {vehicles.map((vehicle, index) => (
                            <m.div
                                key={vehicle.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link href={`/vehicles/${vehicle.id}`}>
                                    <div className="group rounded-xl bg-white/5 border border-white/5 hover:border-primary-500/30 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-1">
                                        {/* Image Container */}
                                        <div className="aspect-[4/3] bg-gray-900 relative overflow-hidden">
                                            {vehicle.images && vehicle.images.length > 0 ? (() => {
                                                const imgUrl = vehicle.images[0];
                                                const isDataUri = imgUrl.startsWith('data:') || imgUrl.includes(';base64,');
                                                const finalSrc = isDataUri ? imgUrl : getVehicleThumbnail(imgUrl);
                                                return (
                                                    <img
                                                        src={finalSrc}
                                                        alt={`${vehicle.brand} ${vehicle.model}`}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                );
                                            })() : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                    <Car className="w-10 h-10 text-gray-600" />
                                                </div>
                                            )}

                                            {/* Price Tag Overlay */}
                                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg">
                                                <p className="text-sm font-bold text-white">
                                                    R$ {formatPrice(vehicle.price)}
                                                </p>
                                            </div>

                                            {/* Status Badge */}
                                            {vehicle.status === 'sold' && (
                                                <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-lg">
                                                    Vendido
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="p-3">
                                            <h3 className="font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
                                                {vehicle.brand} {vehicle.model}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-foreground-muted">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {vehicle.year}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                                <span className="flex items-center gap-1">
                                                    <Gauge className="w-3 h-3" /> {Math.round((vehicle.mileage || 0) / 1000)}k
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </m.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 flex flex-col items-center">
                        <div className="w-16 h-16 mb-4 rounded-full bg-primary-500/10 flex items-center justify-center animate-pulse">
                            <Car className="w-8 h-8 text-primary-400" />
                        </div>
                        <p className="text-foreground-muted mb-6">Seu estoque está vazio.</p>
                        <Link href="/vehicles/new">
                            <Button className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20">
                                Adicionar primeiro veículo
                            </Button>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
