'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Car, Save, Upload, X, ImageIcon, FileText, Hash,
    DollarSign, Calendar, Gauge, Palette, Fuel, Settings2, Tag, Loader2
} from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

interface VehicleDocument {
    name: string;
    type: string;
    url: string;
    uploaded_at: string;
}

const fuelOptions = [
    { value: 'flex', label: 'Flex' },
    { value: 'gasoline', label: 'Gasolina' },
    { value: 'ethanol', label: 'Etanol' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'electric', label: 'Elétrico' },
    { value: 'hybrid', label: 'Híbrido' },
];

const transmissionOptions = [
    { value: 'automatic', label: 'Automático' },
    { value: 'manual', label: 'Manual' },
    { value: 'cvt', label: 'CVT' },
];

const statusOptions = [
    { value: 'available', label: 'Disponível', color: 'bg-green-500' },
    { value: 'reserved', label: 'Reservado', color: 'bg-yellow-500' },
    { value: 'sold', label: 'Vendido', color: 'bg-blue-500' },
    { value: 'maintenance', label: 'Em Manutenção', color: 'bg-gray-500' },
];

const documentTypeOptions = [
    { value: 'crlv', label: 'CRLV' },
    { value: 'crv', label: 'CRV' },
    { value: 'nota_fiscal', label: 'Nota Fiscal' },
    { value: 'laudo_vistoria', label: 'Laudo de Vistoria' },
    { value: 'contrato_compra', label: 'Contrato de Compra' },
    { value: 'other', label: 'Outro' },
];

export default function NewVehiclePage() {
    const router = useRouter();
    const imageInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);

    // Basic info
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [price, setPrice] = useState('');
    const [mileage, setMileage] = useState('');
    const [color, setColor] = useState('');
    const [fuel, setFuel] = useState('flex');
    const [transmission, setTransmission] = useState('automatic');
    const [status, setStatus] = useState('available');
    const [description, setDescription] = useState('');

    // Additional vehicle info
    const [plate, setPlate] = useState('');
    const [renavam, setRenavam] = useState('');
    const [chassis, setChassis] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');

    // Media
    const [images, setImages] = useState<string[]>([]);
    const [documents, setDocuments] = useState<VehicleDocument[]>([]);
    const [newDocType, setNewDocType] = useState('crlv');

    // Formatters
    const formatPrice = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        return new Intl.NumberFormat('pt-BR').format(Number(numbers));
    };

    const formatPlate = (value: string) => {
        const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`;
    };

    // Image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploadingImage(true);
        const file = files[0];

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setImages(prev => [...prev, event.target!.result as string]);
            }
            setUploadingImage(false);
        };
        reader.readAsDataURL(file);

        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // Document upload
    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploadingDoc(true);
        const file = files[0];

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const newDoc: VehicleDocument = {
                    name: file.name,
                    type: newDocType,
                    url: event.target.result as string,
                    uploaded_at: new Date().toISOString(),
                };
                setDocuments(prev => [...prev, newDoc]);
            }
            setUploadingDoc(false);
        };
        reader.readAsDataURL(file);

        if (documentInputRef.current) documentInputRef.current.value = '';
    };

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    // Calculate profit margin
    const getProfit = () => {
        const sellPrice = Number(price.replace(/\D/g, ''));
        const buyPrice = Number(purchasePrice.replace(/\D/g, ''));
        if (sellPrice && buyPrice) {
            const profit = sellPrice - buyPrice;
            const margin = ((profit / buyPrice) * 100).toFixed(1);
            return { profit, margin };
        }
        return null;
    };

    const profitInfo = getProfit();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const supabase = createClient();
            if (!supabase) {
                setError('Erro de conexão');
                setSaving(false);
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('Você precisa estar logado');
                setSaving(false);
                return;
            }

            const priceNumber = Number(price.replace(/\D/g, ''));
            const mileageNumber = mileage ? Number(mileage) : null;
            const purchasePriceNumber = purchasePrice ? Number(purchasePrice.replace(/\D/g, '')) : null;

            const vehicleData: Record<string, unknown> = {
                user_id: user.id,
                brand,
                model,
                year: Number(year),
                price: priceNumber,
                mileage: mileageNumber,
                color: color || null,
                fuel,
                transmission,
                status,
                description: description || null,
                images: images.length > 0 ? images : null,
            };

            // Add optional fields
            if (plate) vehicleData.plate = plate;
            if (renavam) vehicleData.renavam = renavam;
            if (chassis) vehicleData.chassis = chassis;
            if (purchasePriceNumber) vehicleData.purchase_price = purchasePriceNumber;
            if (purchaseDate) vehicleData.purchase_date = purchaseDate;
            if (documents.length > 0) vehicleData.documents = documents;

            const { error: insertError } = await supabase
                .from('vehicles')
                .insert(vehicleData);

            if (insertError) {
                // Fallback: try without new fields if schema doesn't have them yet
                if (insertError.message.includes('column') || insertError.message.includes('schema')) {
                    const { error: fallbackError } = await supabase
                        .from('vehicles')
                        .insert({
                            user_id: user.id,
                            brand,
                            model,
                            year: Number(year),
                            price: priceNumber,
                            mileage: mileageNumber,
                            color: color || null,
                            fuel,
                            transmission,
                            status,
                            description: description || null,
                            images: images.length > 0 ? images : null,
                        });

                    if (fallbackError) {
                        setError(`Erro ao cadastrar: ${fallbackError.message}`);
                        return;
                    }
                } else {
                    setError(`Erro ao cadastrar: ${insertError.message}`);
                    return;
                }
            }

            router.push('/vehicles');
        } catch (err) {
            setError('Erro ao cadastrar veículo');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/vehicles">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white">
                        <Car className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Novo Veículo</h1>
                        <p className="text-foreground-muted">Cadastrar veículo no estoque</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Left Side */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Vehicle Info */}
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Car className="w-5 h-5" />
                                    Informações do Veículo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Marca"
                                        leftIcon={<Tag className="w-5 h-5" />}
                                        placeholder="Ex: Toyota"
                                        value={brand}
                                        onChange={(e) => setBrand(e.target.value)}
                                        required
                                    />
                                    <Input
                                        label="Modelo"
                                        leftIcon={<Car className="w-5 h-5" />}
                                        placeholder="Ex: Corolla XEi"
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="Ano"
                                        type="number"
                                        leftIcon={<Calendar className="w-5 h-5" />}
                                        placeholder="Ex: 2024"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        min="1900"
                                        max={new Date().getFullYear() + 1}
                                        required
                                    />
                                    <Input
                                        label="Quilometragem"
                                        type="number"
                                        leftIcon={<Gauge className="w-5 h-5" />}
                                        placeholder="Ex: 45000"
                                        value={mileage}
                                        onChange={(e) => setMileage(e.target.value)}
                                        min="0"
                                    />
                                    <Input
                                        label="Cor"
                                        leftIcon={<Palette className="w-5 h-5" />}
                                        placeholder="Ex: Prata"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                            <Fuel className="w-4 h-4" />
                                            Combustível
                                        </label>
                                        <select
                                            value={fuel}
                                            onChange={(e) => setFuel(e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                        >
                                            {fuelOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                            <Settings2 className="w-4 h-4" />
                                            Câmbio
                                        </label>
                                        <select
                                            value={transmission}
                                            onChange={(e) => setTransmission(e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                        >
                                            {transmissionOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Identification */}
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Hash className="w-5 h-5" />
                                    Identificação
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="Placa"
                                        leftIcon={<Hash className="w-5 h-5" />}
                                        placeholder="ABC-1234"
                                        value={plate}
                                        onChange={(e) => setPlate(formatPlate(e.target.value))}
                                        maxLength={8}
                                    />
                                    <Input
                                        label="Renavam"
                                        leftIcon={<FileText className="w-5 h-5" />}
                                        placeholder="00000000000"
                                        value={renavam}
                                        onChange={(e) => setRenavam(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                    />
                                    <Input
                                        label="Chassi"
                                        leftIcon={<Hash className="w-5 h-5" />}
                                        placeholder="9BWZZZ377VT004251"
                                        value={chassis}
                                        onChange={(e) => setChassis(e.target.value.toUpperCase().slice(0, 17))}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Purchase Info */}
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Informações de Compra
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Preço de Compra (R$)"
                                        leftIcon={<DollarSign className="w-5 h-5" />}
                                        placeholder="Ex: 80.000"
                                        value={purchasePrice}
                                        onChange={(e) => setPurchasePrice(formatPrice(e.target.value))}
                                    />
                                    <Input
                                        label="Data da Compra"
                                        type="date"
                                        leftIcon={<Calendar className="w-5 h-5" />}
                                        value={purchaseDate}
                                        onChange={(e) => setPurchaseDate(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Images */}
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5" />
                                    Fotos do Veículo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {images.length > 0 && (
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                        {images.map((img, index) => (
                                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                                                <img src={img} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 w-6 h-6 bg-error-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div
                                    onClick={() => imageInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-primary-500/50 transition-colors cursor-pointer"
                                >
                                    {uploadingImage ? (
                                        <Loader2 className="w-10 h-10 mx-auto mb-4 text-primary-400 animate-spin" />
                                    ) : (
                                        <Upload className="w-10 h-10 mx-auto mb-4 text-foreground-muted" />
                                    )}
                                    <p className="text-foreground-muted mb-2">
                                        {uploadingImage ? 'Enviando...' : 'Arraste e solte as imagens aqui'}
                                    </p>
                                    <p className="text-sm text-foreground-subtle mb-4">ou clique para selecionar</p>
                                    <Button type="button" variant="outline" size="sm" disabled={uploadingImage}>
                                        Selecionar Imagens
                                    </Button>
                                </div>
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <p className="text-xs text-foreground-subtle text-center">
                                    Formatos aceitos: JPG, PNG, WebP. Máximo 10 imagens.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Documents */}
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Documentos
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {documents.length > 0 && (
                                    <div className="space-y-2">
                                        {documents.map((doc, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-5 h-5 text-primary-400" />
                                                    <div>
                                                        <p className="font-medium text-sm">{doc.name}</p>
                                                        <p className="text-xs text-foreground-muted">
                                                            {documentTypeOptions.find(t => t.value === doc.type)?.label}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => removeDocument(index)} className="text-error-400 hover:text-error-300">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <select
                                        value={newDocType}
                                        onChange={(e) => setNewDocType(e.target.value)}
                                        className="h-11 px-4 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    >
                                        {documentTypeOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        leftIcon={uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        onClick={() => documentInputRef.current?.click()}
                                        disabled={uploadingDoc}
                                    >
                                        {uploadingDoc ? 'Enviando...' : 'Adicionar Documento'}
                                    </Button>
                                </div>
                                <input
                                    ref={documentInputRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={handleDocumentUpload}
                                    className="hidden"
                                />
                                <p className="text-xs text-foreground-subtle">
                                    Aceita PDF, JPG, PNG. Adicione CRLV, CRV, notas fiscais, etc.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Description */}
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Descrição
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Descreva o veículo, opcionais, estado de conservação, histórico de manutenção..."
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-4">
                        {/* Pricing Card */}
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <DollarSign className="w-4 h-4" />
                                    Precificação
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    label="Preço de Venda (R$)"
                                    leftIcon={<DollarSign className="w-5 h-5" />}
                                    placeholder="Ex: 100.000"
                                    value={price}
                                    onChange={(e) => setPrice(formatPrice(e.target.value))}
                                    required
                                />

                                {profitInfo && (
                                    <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                        <p className="text-sm text-foreground-muted mb-2">Lucro Estimado</p>
                                        <p className={`text-2xl font-bold ${profitInfo.profit >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                                            R$ {profitInfo.profit.toLocaleString('pt-BR')}
                                        </p>
                                        <p className={`text-sm ${profitInfo.profit >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                                            Margem: {profitInfo.margin}%
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Status Card */}
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Tag className="w-4 h-4" />
                                    Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {statusOptions.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setStatus(option.value)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${status === option.value
                                                    ? 'bg-primary-500/20 border border-primary-500'
                                                    : 'bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/50'
                                                }`}
                                        >
                                            <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                                            <span className="font-medium">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions Card */}
                        <Card variant="glass">
                            <CardContent className="p-4 space-y-3">
                                <Button
                                    type="submit"
                                    fullWidth
                                    leftIcon={<Save className="w-5 h-5" />}
                                    isLoading={saving}
                                >
                                    Cadastrar Veículo
                                </Button>
                                <Link href="/vehicles" className="block">
                                    <Button type="button" variant="ghost" fullWidth>
                                        Cancelar
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 rounded-xl bg-error-500/10 border border-error-500/20 text-error-400 flex items-center gap-3 mt-6">
                        <X className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
            </form>
        </div>
    );
}
