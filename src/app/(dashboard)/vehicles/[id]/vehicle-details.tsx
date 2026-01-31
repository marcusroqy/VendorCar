'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Car,
    Calendar,
    Gauge,
    Fuel,
    Settings,
    Palette,
    Edit,
    Trash2,
    X,
    Loader2,
    Share2,
    Heart,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    FileText,
    CreditCard,
    Hash,
    ShoppingCart,
    TrendingUp,
    Clock,
    ExternalLink
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { Vehicle } from '@/lib/types';
import { shareVehicle } from '@/lib/share';
import dynamic from 'next/dynamic';

const VehicleImageGallery = dynamic(() => import('@/components/vehicles/VehicleImageGallery'), {
    loading: () => <div className="w-full h-full bg-gray-800 animate-pulse rounded-xl" />
});

const DeleteConfirmationModal = dynamic(() => import('@/components/modals/DeleteConfirmationModal'), {
    ssr: false
});

const fuelLabels: Record<string, string> = {
    flex: 'Flex',
    gasoline: 'Gasolina',
    ethanol: 'Etanol',
    diesel: 'Diesel',
    electric: 'Elétrico',
    hybrid: 'Híbrido',
};

const transmissionLabels: Record<string, string> = {
    automatic: 'Automático',
    manual: 'Manual',
    cvt: 'CVT',
};

const statusColors: Record<string, string> = {
    available: 'bg-success-500 text-white',
    reserved: 'bg-warning-500 text-white',
    sold: 'bg-gray-500 text-white',
};

const statusLabels: Record<string, string> = {
    available: 'Disponível',
    reserved: 'Reservado',
    sold: 'Vendido',
};

const documentTypeLabels: Record<string, string> = {
    crlv: 'CRLV',
    ipva: 'IPVA',
    multas: 'Multas',
    laudo: 'Laudo Cautelar',
    contrato: 'Contrato',
    other: 'Outro',
};

const documentTypeIcons: Record<string, string> = {
    crlv: '📄',
    ipva: '💰',
    multas: '⚠️',
    laudo: '🔍',
    contrato: '📝',
    other: '📎',
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

function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
}

interface VehicleDetailsProps {
    vehicle: Vehicle;
}

export function VehicleDetails({ vehicle }: VehicleDetailsProps) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    const [returning, setReturning] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const vehicleId = vehicle.id;

    const handleDelete = async () => {
        setDeleting(true);

        try {
            const supabase = createClient();
            if (!supabase) {
                setError('Erro de conexão');
                setDeleting(false);
                return;
            }

            const { error: deleteError } = await supabase
                .from('vehicles')
                .delete()
                .eq('id', vehicleId);

            if (deleteError) {
                setError(`Erro ao excluir: ${deleteError.message}`);
                setDeleting(false);
                return;
            }

            // Force cache refresh
            router.refresh();
            router.push('/vehicles');
        } catch (err) {
            setError('Erro ao excluir veículo');
            console.error(err);
            setDeleting(false);
        }
    };

    const handleReturnToStock = async () => {
        if (!confirm('Tem certeza? Isso irá cancelar a venda e retornar o veículo para o estoque.')) return;

        setReturning(true);

        try {
            const supabase = createClient();
            if (!supabase) {
                setError('Erro de conexão');
                setReturning(false);
                return;
            }

            // 1. Update vehicle status to available
            const { error: updateError } = await supabase
                .from('vehicles')
                .update({ status: 'available' })
                .eq('id', vehicleId);

            if (updateError) throw updateError;

            // 2. Delete the sale record associated with this vehicle
            const { error: deleteSaleError } = await supabase
                .from('sales')
                .delete()
                .eq('vehicle_id', vehicleId);

            if (deleteSaleError) {
                console.error('Error deleting sale:', deleteSaleError);
                // Non-blocking error for UI flow, but logged
            }

            // Force reload to ensure all states (including lists) are fresh
            router.refresh();
            window.location.reload();
        } catch (err) {
            console.error('Error returning to stock:', err);
            setError('Erro ao retornar ao estoque');
            setReturning(false);
        }
    };

    const images = vehicle.images?.length ? vehicle.images : [];
    const hasImages = images.length > 0;
    const documents = vehicle.documents || [];
    const hasDocuments = documents.length > 0;

    // Calculate profit margin if purchase price exists
    const profitMargin = vehicle.purchase_price
        ? ((vehicle.price - vehicle.purchase_price) / vehicle.purchase_price * 100).toFixed(1)
        : null;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
                <Link href="/vehicles">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="w-5 h-5" />
                        Voltar
                    </Button>
                </Link>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                        <Heart className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <DeleteConfirmationModal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDelete}
                    isDeleting={deleting}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Side */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Image Gallery */}
                    <VehicleImageGallery
                        images={images}
                        brand={vehicle.brand}
                        model={vehicle.model}
                        status={vehicle.status}
                        statusLabel={statusLabels[vehicle.status]}
                        statusColor={statusColors[vehicle.status]}
                    />

                    {/* Vehicle Specs */}
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Especificações
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                    <div className="flex items-center gap-2 text-foreground-muted mb-1">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs">Ano</span>
                                    </div>
                                    <p className="font-semibold">{vehicle.year}</p>
                                </div>

                                <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                    <div className="flex items-center gap-2 text-foreground-muted mb-1">
                                        <Gauge className="w-4 h-4" />
                                        <span className="text-xs">Quilometragem</span>
                                    </div>
                                    <p className="font-semibold">{vehicle.mileage ? formatMileage(vehicle.mileage) : '0 km'}</p>
                                </div>

                                <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                    <div className="flex items-center gap-2 text-foreground-muted mb-1">
                                        <Fuel className="w-4 h-4" />
                                        <span className="text-xs">Combustível</span>
                                    </div>
                                    <p className="font-semibold">{fuelLabels[vehicle.fuel]}</p>
                                </div>

                                <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                    <div className="flex items-center gap-2 text-foreground-muted mb-1">
                                        <Settings className="w-4 h-4" />
                                        <span className="text-xs">Câmbio</span>
                                    </div>
                                    <p className="font-semibold">{transmissionLabels[vehicle.transmission]}</p>
                                </div>

                                {vehicle.color && (
                                    <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                        <div className="flex items-center gap-2 text-foreground-muted mb-1">
                                            <Palette className="w-4 h-4" />
                                            <span className="text-xs">Cor</span>
                                        </div>
                                        <p className="font-semibold capitalize">{vehicle.color}</p>
                                    </div>
                                )}

                                {vehicle.plate && (
                                    <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                        <div className="flex items-center gap-2 text-foreground-muted mb-1">
                                            <CreditCard className="w-4 h-4" />
                                            <span className="text-xs">Placa</span>
                                        </div>
                                        <p className="font-semibold uppercase">{vehicle.plate}</p>
                                    </div>
                                )}
                            </div>

                            {vehicle.description && (
                                <div className="mt-4 p-4 rounded-xl bg-gray-800/20 border border-gray-700/30">
                                    <p className="text-sm text-foreground-muted mb-1">Descrição</p>
                                    <p className="text-foreground leading-relaxed">{vehicle.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Documentation Info */}
                    {(vehicle.renavam || vehicle.chassis) && (
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Hash className="w-5 h-5" />
                                    Identificação
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {vehicle.renavam && (
                                        <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                            <p className="text-sm text-foreground-muted mb-1">RENAVAM</p>
                                            <p className="font-mono text-lg">{vehicle.renavam}</p>
                                        </div>
                                    )}
                                    {vehicle.chassis && (
                                        <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                            <p className="text-sm text-foreground-muted mb-1">Chassi</p>
                                            <p className="font-mono text-lg uppercase">{vehicle.chassis}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Documents Section */}
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Documentos do Veículo
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {hasDocuments ? (
                                <div className="space-y-2">
                                    {documents.map((doc, index) => (
                                        <a
                                            key={index}
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:border-primary-500/30 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{documentTypeIcons[doc.type]}</span>
                                                <div>
                                                    <p className="font-medium">{doc.name}</p>
                                                    <p className="text-sm text-foreground-muted">
                                                        {documentTypeLabels[doc.type]} • Enviado em {formatDate(doc.uploaded_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-foreground-muted group-hover:text-primary-400 transition-colors">
                                                <ExternalLink className="w-4 h-4" />
                                                <span className="text-sm">Abrir</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                                    <p className="text-foreground-muted mb-2">Nenhum documento anexado</p>
                                    <p className="text-sm text-foreground-subtle">CRLV, IPVA, laudos e outros documentos podem ser adicionados na edição</p>
                                </div>
                            )}

                            <Link href={`/vehicles/${vehicleId}/edit`} className="block mt-4">
                                <Button variant="secondary" fullWidth size="sm">
                                    Gerenciar Documentos
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Right Side */}
                <div className="space-y-4">
                    {/* Price & Actions Card */}
                    <Card variant="glass">
                        <CardContent className="p-6">
                            <div className="mb-4">
                                <h1 className="text-2xl font-bold">{vehicle.brand} {vehicle.model}</h1>
                                <p className="text-foreground-muted">{vehicle.year} • {fuelLabels[vehicle.fuel]} • {transmissionLabels[vehicle.transmission]}</p>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-6 h-6 text-success-400" />
                                <span className="text-3xl font-bold text-success-400">{formatPrice(vehicle.price)}</span>
                            </div>

                            {/* Purchase Info & Profit */}
                            {vehicle.purchase_price && (
                                <div className="mb-4 p-3 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-foreground-muted">Custo de aquisição</span>
                                        <span className="font-medium">{formatPrice(vehicle.purchase_price)}</span>
                                    </div>
                                    {profitMargin && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-foreground-muted">Margem de lucro</span>
                                            <span className={`font-medium flex items-center gap-1 ${Number(profitMargin) >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                                                <TrendingUp className="w-4 h-4" />
                                                {profitMargin}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons - Refactored Layout */}
                            <div className="grid grid-cols-2 gap-3">
                                {vehicle.status === 'sold' ? (
                                    <Button
                                        className="col-span-2 bg-warning-500 hover:bg-warning-600 text-white"
                                        onClick={handleReturnToStock}
                                        fullWidth
                                        isLoading={returning}
                                        disabled={returning}
                                    >
                                        Devolver ao Estoque
                                    </Button>
                                ) : (
                                    <Button
                                        className="col-span-2"
                                        variant="primary"
                                        onClick={() => vehicle && shareVehicle(vehicle)}
                                        leftIcon={<Share2 className="w-4 h-4" />}
                                        fullWidth
                                    >
                                        Compartilhar
                                    </Button>
                                )}

                                <Link href={`/vehicles/${vehicleId}/edit`} className="contents">
                                    <Button variant="secondary" leftIcon={<Edit className="w-4 h-4" />} fullWidth>
                                        Editar
                                    </Button>
                                </Link>
                                <Button
                                    variant="danger"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    leftIcon={<Trash2 className="w-4 h-4" />}
                                    fullWidth
                                >
                                    Excluir
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card variant="glass">
                        <CardContent className="p-4">
                            <h3 className="text-sm font-medium text-foreground-muted mb-3">Ações Rápidas</h3>
                            <div className="space-y-2">
                                <Link href={`/sales/new?vehicleId=${vehicleId}`} className="block">
                                    <Button variant="secondary" fullWidth size="sm" leftIcon={<ShoppingCart className="w-4 h-4" />}>
                                        Registrar Venda
                                    </Button>
                                </Link>
                                <Button variant="ghost" fullWidth size="sm" leftIcon={<Share2 className="w-4 h-4" />}>
                                    Copiar Link
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Time in Stock */}
                    <Card variant="glass">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-primary-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-foreground-muted">Tempo em estoque</p>
                                    <p className="font-semibold">
                                        {Math.floor((Date.now() - new Date(vehicle.created_at).getTime()) / (1000 * 60 * 60 * 24))} dias
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-xl bg-error-500/10 border border-error-500/20 text-error-400 flex items-center gap-3">
                    <X className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}

