'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
    ExternalLink,
    Download
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { Vehicle, VehicleDocument } from '@/lib/types';

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

export default function VehicleDetailPage() {
    const router = useRouter();
    const params = useParams();
    const vehicleId = params.id as string;

    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        async function fetchVehicle() {
            const supabase = createClient();
            if (!supabase) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('id', vehicleId)
                .single();

            if (error || !data) {
                setError('Veículo não encontrado');
                setLoading(false);
                return;
            }

            setVehicle(data as Vehicle);
            setLoading(false);
        }

        fetchVehicle();
    }, [vehicleId]);

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

            router.push('/vehicles');
        } catch (err) {
            setError('Erro ao excluir veículo');
            console.error(err);
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="text-center py-16">
                <Car className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h2 className="text-xl font-semibold mb-2">Veículo não encontrado</h2>
                <Link href="/vehicles">
                    <Button variant="secondary">Voltar para veículos</Button>
                </Link>
            </div>
        );
    }

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
                        <Share2 className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Heart className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card variant="glass" className="max-w-md w-full border-error-500/30">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error-500/10 flex items-center justify-center">
                                    <Trash2 className="w-8 h-8 text-error-500" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Excluir veículo?</h3>
                                <p className="text-foreground-muted mb-6">
                                    Esta ação não pode ser desfeita. O veículo será removido permanentemente.
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        variant="ghost"
                                        fullWidth
                                        onClick={() => setShowDeleteConfirm(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        fullWidth
                                        className="bg-error-500 hover:bg-error-600"
                                        isLoading={deleting}
                                        onClick={handleDelete}
                                    >
                                        Excluir
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Side */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Image Gallery */}
                    <Card variant="glass" className="overflow-hidden">
                        <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            {hasImages ? (
                                <>
                                    <img
                                        src={images[currentImageIndex]}
                                        alt={`${vehicle.brand} ${vehicle.model}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {images.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                            >
                                                <ChevronLeft className="w-6 h-6" />
                                            </button>
                                            <button
                                                onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </button>
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                {images.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setCurrentImageIndex(idx)}
                                                        className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="text-center">
                                    <Car className="w-24 h-24 text-gray-600 mx-auto mb-2" />
                                    <p className="text-gray-500">Sem fotos</p>
                                </div>
                            )}

                            {/* Status Badge */}
                            <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${statusColors[vehicle.status]}`}>
                                {statusLabels[vehicle.status]}
                            </span>
                        </div>
                    </Card>

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

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <Link href={`/vehicles/${vehicleId}/edit`} className="block">
                                    <Button fullWidth leftIcon={<Edit className="w-5 h-5" />}>
                                        Editar Veículo
                                    </Button>
                                </Link>

                                <Button
                                    variant="ghost"
                                    fullWidth
                                    className="text-error-400 hover:bg-error-500/10"
                                    leftIcon={<Trash2 className="w-5 h-5" />}
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    Excluir Veículo
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
