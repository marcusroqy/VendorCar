'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Car, Save, Upload, X, ImageIcon } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

interface VehicleFormData {
    brand: string;
    model: string;
    year: string;
    price: string;
    mileage: string;
    color: string;
    fuel: string;
    transmission: string;
    description: string;
    images: string[];
}

const initialFormData: VehicleFormData = {
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    color: '',
    fuel: 'flex',
    transmission: 'automatic',
    description: '',
    images: [],
};

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

export default function NewVehiclePage() {
    const router = useRouter();
    const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const supabase = createClient();

            if (!supabase) {
                setError('Erro de conexão com o banco de dados.');
                setIsLoading(false);
                return;
            }

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError('Você precisa estar logado para cadastrar veículos.');
                setIsLoading(false);
                return;
            }

            // Parse price (remove formatting)
            const priceNumber = Number(formData.price.replace(/\D/g, ''));
            const mileageNumber = formData.mileage ? Number(formData.mileage) : null;

            // Insert vehicle
            const { error: insertError } = await supabase
                .from('vehicles')
                .insert({
                    user_id: user.id,
                    brand: formData.brand,
                    model: formData.model,
                    year: Number(formData.year),
                    price: priceNumber,
                    mileage: mileageNumber,
                    color: formData.color || null,
                    fuel: formData.fuel,
                    transmission: formData.transmission,
                    description: formData.description || null,
                    images: formData.images.length > 0 ? formData.images : null,
                    status: 'available',
                });

            if (insertError) {
                console.error('Insert error:', insertError);
                setError(`Erro ao cadastrar: ${insertError.message}`);
                return;
            }

            // Redirect to vehicles list
            router.push('/vehicles');
        } catch (err) {
            setError('Erro ao cadastrar veículo. Tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        const formatted = new Intl.NumberFormat('pt-BR').format(Number(numbers));
        return formatted;
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPrice(e.target.value);
        setFormData(prev => ({ ...prev, price: formatted }));
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/vehicles">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Novo Veículo</h1>
                    <p className="text-foreground-muted">Cadastre um novo veículo no seu estoque</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="w-5 h-5" />
                            Informações do Veículo
                        </CardTitle>
                        <CardDescription>
                            Preencha as informações básicas do veículo
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Marca"
                                name="brand"
                                placeholder="Ex: Toyota"
                                value={formData.brand}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Modelo"
                                name="model"
                                placeholder="Ex: Corolla XEi"
                                value={formData.model}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Ano"
                                name="year"
                                type="number"
                                placeholder="Ex: 2024"
                                value={formData.year}
                                onChange={handleChange}
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                required
                            />
                            <Input
                                label="Preço (R$)"
                                name="price"
                                placeholder="Ex: 150.000"
                                value={formData.price}
                                onChange={handlePriceChange}
                                required
                            />
                            <Input
                                label="Quilometragem"
                                name="mileage"
                                type="number"
                                placeholder="Ex: 45000"
                                value={formData.mileage}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Cor"
                                name="color"
                                placeholder="Ex: Prata"
                                value={formData.color}
                                onChange={handleChange}
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Combustível
                                </label>
                                <select
                                    name="fuel"
                                    value={formData.fuel}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                >
                                    {fuelOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Câmbio
                                </label>
                                <select
                                    name="transmission"
                                    value={formData.transmission}
                                    onChange={handleChange}
                                    className="w-full h-11 px-4 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                >
                                    {transmissionOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                Descrição
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Descreva o veículo, opcionais, estado de conservação..."
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
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
                        <CardDescription>
                            Adicione fotos para atrair mais compradores
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-primary-500/50 transition-colors cursor-pointer">
                            <Upload className="w-10 h-10 mx-auto mb-4 text-foreground-muted" />
                            <p className="text-foreground-muted mb-2">
                                Arraste e solte as imagens aqui
                            </p>
                            <p className="text-sm text-foreground-subtle mb-4">
                                ou clique para selecionar
                            </p>
                            <Button type="button" variant="outline" size="sm">
                                Selecionar Imagens
                            </Button>
                        </div>
                        <p className="text-xs text-foreground-subtle mt-2 text-center">
                            Formatos aceitos: JPG, PNG, WebP. Máximo 10 imagens.
                        </p>
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
                    <Link href="/vehicles">
                        <Button type="button" variant="ghost" fullWidth className="sm:w-auto">
                            Cancelar
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        leftIcon={<Save className="w-5 h-5" />}
                        isLoading={isLoading}
                        disabled={isLoading}
                    >
                        Cadastrar Veículo
                    </Button>
                </div>
            </form>
        </div>
    );
}
