'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Car, Save, X, Loader2, Calendar, Gauge, Upload, Image as ImageIcon, Trash2, FileText, Hash, DollarSign } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { Vehicle, VehicleDocument } from '@/lib/types';

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
    { value: 'available', label: 'Disponível' },
    { value: 'reserved', label: 'Reservado' },
    { value: 'sold', label: 'Vendido' },
];

const documentTypeOptions = [
    { value: 'crlv', label: 'CRLV' },
    { value: 'ipva', label: 'IPVA' },
    { value: 'multas', label: 'Multas' },
    { value: 'laudo', label: 'Laudo Cautelar' },
    { value: 'contrato', label: 'Contrato' },
    { value: 'other', label: 'Outro' },
];

export default function VehicleEditPage() {
    const router = useRouter();
    const params = useParams();
    const vehicleId = params.id as string;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [error, setError] = useState('');

    // Form fields
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [price, setPrice] = useState('');
    const [mileage, setMileage] = useState('');
    const [color, setColor] = useState('');
    const [fuel, setFuel] = useState('flex');
    const [transmission, setTransmission] = useState('automatic');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('available');
    const [images, setImages] = useState<string[]>([]);

    // New documentation fields
    const [plate, setPlate] = useState('');
    const [renavam, setRenavam] = useState('');
    const [chassis, setChassis] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [documents, setDocuments] = useState<VehicleDocument[]>([]);
    const [newDocType, setNewDocType] = useState('crlv');

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

            const v = data as Vehicle;
            setBrand(v.brand);
            setModel(v.model);
            setYear(String(v.year));
            setPrice(formatPrice(v.price));
            setMileage(v.mileage ? String(v.mileage) : '');
            setColor(v.color || '');
            setFuel(v.fuel);
            setTransmission(v.transmission);
            setDescription(v.description || '');
            setStatus(v.status);
            setImages(v.images || []);
            setPlate(v.plate || '');
            setRenavam(v.renavam || '');
            setChassis(v.chassis || '');
            setPurchasePrice(v.purchase_price ? formatPrice(v.purchase_price) : '');
            setPurchaseDate(v.purchase_date || '');
            setDocuments(v.documents || []);
            setLoading(false);
        }

        fetchVehicle();
    }, [vehicleId]);

    const formatPrice = (value: number | string) => {
        const numbers = String(value).replace(/\D/g, '');
        return new Intl.NumberFormat('pt-BR').format(Number(numbers));
    };

    const handlePriceChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(formatPrice(e.target.value));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);

        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) continue;

            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setImages(prev => [...prev, event.target?.result as string]);
                }
            };
            reader.readAsDataURL(file);
        }

        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploadingDoc(true);

        for (const file of Array.from(files)) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const newDoc: VehicleDocument = {
                        name: file.name,
                        type: newDocType as VehicleDocument['type'],
                        url: event.target.result as string,
                        uploaded_at: new Date().toISOString(),
                    };
                    setDocuments(prev => [...prev, newDoc]);
                }
            };
            reader.readAsDataURL(file);
        }

        setUploadingDoc(false);
        if (documentInputRef.current) documentInputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            const supabase = createClient();
            if (!supabase) {
                setError('Erro de conexão');
                setSaving(false);
                return;
            }

            // Base update data (fields that always exist)
            const baseData: Record<string, unknown> = {
                brand,
                model,
                year: Number(year),
                price: Number(price.replace(/\D/g, '')),
                mileage: mileage ? Number(mileage) : null,
                color: color || null,
                fuel,
                transmission,
                description: description || null,
                status,
                images: images.length > 0 ? images : null,
                updated_at: new Date().toISOString(),
            };

            // Try to save with all fields first
            let updateData = { ...baseData };

            // Add new fields if they have values
            if (plate) updateData.plate = plate;
            if (renavam) updateData.renavam = renavam;
            if (chassis) updateData.chassis = chassis;
            if (purchasePrice) updateData.purchase_price = Number(purchasePrice.replace(/\D/g, ''));
            if (purchaseDate) updateData.purchase_date = purchaseDate;
            if (documents.length > 0) updateData.documents = documents;

            let { error: updateError } = await supabase
                .from('vehicles')
                .update(updateData)
                .eq('id', vehicleId);

            // If error mentions schema/column, try without new fields
            if (updateError && updateError.message.includes('schema')) {
                console.log('Schema error, trying without new fields...');
                const { error: fallbackError } = await supabase
                    .from('vehicles')
                    .update(baseData)
                    .eq('id', vehicleId);

                if (fallbackError) {
                    setError(`Erro ao salvar: ${fallbackError.message}`);
                    return;
                }

                // Saved successfully but warn about new fields
                console.log('Saved without new fields. Run SQL migration to add columns.');
            } else if (updateError) {
                setError(`Erro ao salvar: ${updateError.message}`);
                return;
            }

            router.push(`/vehicles/${vehicleId}`);
        } catch (err) {
            setError('Erro ao salvar alterações');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={`/vehicles/${vehicleId}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Editar {brand} {model}</h1>
                    <p className="text-foreground-muted">Altere as informações do veículo</p>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-6">
                {/* Photos Section */}
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            Fotos do Veículo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-800">
                                        <img src={img} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-error-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        {index === 0 && (
                                            <span className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-primary-500 text-white text-xs">Capa</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-primary-500/50 transition-colors cursor-pointer"
                        >
                            {uploading ? <Loader2 className="w-8 h-8 mx-auto mb-2 text-primary-500 animate-spin" /> : <Upload className="w-8 h-8 mx-auto mb-2 text-foreground-muted" />}
                            <p className="text-foreground-muted text-sm">{uploading ? 'Enviando...' : 'Clique para adicionar fotos'}</p>
                        </div>
                        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </CardContent>
                </Card>

                {/* Vehicle Info */}
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="w-5 h-5" />
                            Informações do Veículo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Marca" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                            <Input label="Modelo" value={model} onChange={(e) => setModel(e.target.value)} required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input label="Ano" type="number" leftIcon={<Calendar className="w-5 h-5" />} value={year} onChange={(e) => setYear(e.target.value)} required />
                            <Input label="Preço de Venda (R$)" value={price} onChange={handlePriceChange(setPrice)} required />
                            <Input label="Quilometragem" type="number" leftIcon={<Gauge className="w-5 h-5" />} value={mileage} onChange={(e) => setMileage(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Input label="Cor" value={color} onChange={(e) => setColor(e.target.value)} />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Combustível</label>
                                <select value={fuel} onChange={(e) => setFuel(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                                    {fuelOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Câmbio</label>
                                <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                                    {transmissionOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Status</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                                    {statusOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Descrição</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o veículo, opcionais, estado..." rows={3} className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none" />
                        </div>
                    </CardContent>
                </Card>

                {/* Identification & Purchase Info */}
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Hash className="w-5 h-5" />
                            Identificação e Aquisição
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input label="Placa" placeholder="ABC-1234" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} />
                            <Input label="RENAVAM" placeholder="00000000000" value={renavam} onChange={(e) => setRenavam(e.target.value)} />
                            <Input label="Chassi" placeholder="9BWZZZ377VT004251" value={chassis} onChange={(e) => setChassis(e.target.value.toUpperCase())} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Preço de Compra (R$)" leftIcon={<DollarSign className="w-5 h-5" />} value={purchasePrice} onChange={handlePriceChange(setPurchasePrice)} placeholder="Valor pago na aquisição" />
                            <Input label="Data da Compra" type="date" leftIcon={<Calendar className="w-5 h-5" />} value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                {/* Documents Section */}
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
                                                <p className="text-xs text-foreground-muted">{documentTypeOptions.find(t => t.value === doc.type)?.label}</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => removeDocument(index)} className="text-error-400 hover:text-error-300">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <select value={newDocType} onChange={(e) => setNewDocType(e.target.value)} className="h-11 px-4 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                                {documentTypeOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                            </select>
                            <Button type="button" variant="secondary" leftIcon={uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} onClick={() => documentInputRef.current?.click()} disabled={uploadingDoc}>
                                {uploadingDoc ? 'Enviando...' : 'Adicionar Documento'}
                            </Button>
                        </div>
                        <input ref={documentInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleDocumentUpload} className="hidden" />
                        <p className="text-xs text-foreground-subtle">Aceita PDF, JPG, PNG. Adicione CRLV, comprovantes de IPVA, laudos, etc.</p>
                    </CardContent>
                </Card>

                {/* Error */}
                {error && (
                    <div className="p-4 rounded-xl bg-error-500/10 border border-error-500/20 text-error-400 flex items-center gap-3">
                        <X className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <Link href={`/vehicles/${vehicleId}`}>
                        <Button type="button" variant="ghost" fullWidth className="sm:w-auto">Cancelar</Button>
                    </Link>
                    <Button leftIcon={<Save className="w-5 h-5" />} isLoading={saving} onClick={handleSave}>
                        Salvar Alterações
                    </Button>
                </div>
            </div>
        </div>
    );
}
