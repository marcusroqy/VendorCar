'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    DollarSign,
    User,
    Car,
    Calendar,
    CreditCard,
    Percent,
    Save,
    X,
    Search,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { Lead, Vehicle } from '@/lib/types';

interface SaleFormData {
    leadId: string;
    leadName: string;
    vehicleId: string;
    vehicleName: string;
    salePrice: string;
    discount: string;
    paymentMethod: string;
    downPayment: string;
    installments: string;
    saleDate: string;
    notes: string;
}

const initialFormData: SaleFormData = {
    leadId: '',
    leadName: '',
    vehicleId: '',
    vehicleName: '',
    salePrice: '',
    discount: '',
    paymentMethod: 'cash',
    downPayment: '',
    installments: '',
    saleDate: new Date().toISOString().split('T')[0],
    notes: '',
};

const paymentMethods = [
    { value: 'cash', label: 'À Vista', icon: '💵' },
    { value: 'financing', label: 'Financiamento', icon: '🏦' },
    { value: 'consortium', label: 'Consórcio', icon: '📋' },
    { value: 'trade', label: 'Troca', icon: '🔄' },
    { value: 'trade_plus_cash', label: 'Troca + Dinheiro', icon: '🔄💵' },
];

export default function NewSalePage() {
    const router = useRouter();
    const leadSearchRef = useRef<HTMLDivElement>(null);
    const vehicleSearchRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<SaleFormData>(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showLeadSearch, setShowLeadSearch] = useState(false);
    const [showVehicleSearch, setShowVehicleSearch] = useState(false);
    const [leadSearch, setLeadSearch] = useState('');
    const [vehicleSearch, setVehicleSearch] = useState('');

    // Real data from Supabase
    const [leads, setLeads] = useState<Lead[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (leadSearchRef.current && !leadSearchRef.current.contains(event.target as Node)) {
                setShowLeadSearch(false);
            }
            if (vehicleSearchRef.current && !vehicleSearchRef.current.contains(event.target as Node)) {
                setShowVehicleSearch(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch leads and vehicles on mount
    useEffect(() => {
        async function fetchData() {
            const supabase = createClient();
            if (!supabase) {
                setLoadingData(false);
                return;
            }

            try {
                const [leadsResult, vehiclesResult] = await Promise.all([
                    supabase.from('leads').select('*').order('created_at', { ascending: false }),
                    supabase.from('vehicles').select('*').eq('status', 'available').order('created_at', { ascending: false })
                ]);

                if (leadsResult.data) setLeads(leadsResult.data as Lead[]);
                if (vehiclesResult.data) setVehicles(vehiclesResult.data as Vehicle[]);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoadingData(false);
            }
        }

        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const formatPrice = (value: string | number) => {
        const numbers = String(value).replace(/\D/g, '');
        const formatted = new Intl.NumberFormat('pt-BR').format(Number(numbers));
        return formatted;
    };

    const handlePriceChange = (field: 'salePrice' | 'discount' | 'downPayment') => (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPrice(e.target.value);
        setFormData(prev => ({ ...prev, [field]: formatted }));
    };

    const selectLead = (lead: Lead) => {
        setFormData(prev => ({ ...prev, leadId: lead.id, leadName: lead.name }));
        setShowLeadSearch(false);
        setLeadSearch('');
    };

    const selectVehicle = (vehicle: Vehicle) => {
        setFormData(prev => ({
            ...prev,
            vehicleId: vehicle.id,
            vehicleName: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
            salePrice: formatPrice(vehicle.price)
        }));
        setShowVehicleSearch(false);
        setVehicleSearch('');
    };

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
        lead.phone.includes(leadSearch)
    );

    const filteredVehicles = vehicles.filter(vehicle =>
        `${vehicle.brand} ${vehicle.model}`.toLowerCase().includes(vehicleSearch.toLowerCase())
    );

    const calculateFinalPrice = () => {
        const price = Number(formData.salePrice.replace(/\D/g, ''));
        const discount = Number(formData.discount.replace(/\D/g, '')) || 0;
        return formatPrice(String(price - discount));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!formData.leadId || !formData.vehicleId) {
            setError('Selecione um lead e um veículo para continuar.');
            setIsLoading(false);
            return;
        }

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
                setError('Você precisa estar logado para registrar vendas.');
                setIsLoading(false);
                return;
            }

            const salePrice = Number(formData.salePrice.replace(/\D/g, ''));
            const discount = Number(formData.discount.replace(/\D/g, '')) || 0;
            const downPayment = formData.downPayment ? Number(formData.downPayment.replace(/\D/g, '')) : null;
            const installments = formData.installments ? Number(formData.installments) : null;

            // Insert sale
            const { error: insertError } = await supabase
                .from('sales')
                .insert({
                    user_id: user.id,
                    lead_id: formData.leadId,
                    vehicle_id: formData.vehicleId,
                    sale_price: salePrice,
                    discount: discount,
                    payment_method: formData.paymentMethod,
                    down_payment: downPayment,
                    installments: installments,
                    sale_date: formData.saleDate,
                    notes: formData.notes || null,
                });

            if (insertError) {
                console.error('Insert error:', insertError);
                setError(`Erro ao registrar: ${insertError.message}`);
                return;
            }

            // Update vehicle status to sold
            await supabase
                .from('vehicles')
                .update({ status: 'sold' })
                .eq('id', formData.vehicleId);

            // Update lead status to closed
            await supabase
                .from('leads')
                .update({ status: 'closed' })
                .eq('id', formData.leadId);

            // Redirect to sales list
            router.push('/sales');
        } catch (err) {
            setError('Erro ao registrar venda. Tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const showPaymentDetails = formData.paymentMethod === 'financing' || formData.paymentMethod === 'consortium';

    if (loadingData) {
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
                <Link href="/sales">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Nova Venda</h1>
                    <p className="text-foreground-muted">Registre uma nova venda de veículo</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Lead Selection */}
                <Card variant="glass" className={`overflow-visible relative ${showLeadSearch ? 'z-20' : 'z-10'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Comprador
                        </CardTitle>
                        <CardDescription>
                            Selecione o lead que está realizando a compra
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative" ref={leadSearchRef}>
                            {formData.leadId ? (
                                <div className="flex items-center justify-between p-4 rounded-xl bg-success-500/10 border border-success-500/20">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-success-500" />
                                        <div>
                                            <p className="font-medium">{formData.leadName}</p>
                                            <p className="text-sm text-foreground-muted">Lead selecionado</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setFormData(prev => ({ ...prev, leadId: '', leadName: '' }))}
                                    >
                                        Alterar
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <Input
                                        placeholder={leads.length === 0 ? 'Nenhum lead cadastrado' : 'Buscar lead por nome ou telefone...'}
                                        value={leadSearch}
                                        onChange={(e) => setLeadSearch(e.target.value)}
                                        onFocus={() => setShowLeadSearch(true)}
                                        leftIcon={<Search className="w-5 h-5" />}
                                        disabled={leads.length === 0}
                                    />

                                    {showLeadSearch && leads.length > 0 && filteredLeads.length > 0 && (
                                        <div className="absolute z-[100] top-full left-0 right-0 mt-2 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl">
                                            <div className="max-h-60 overflow-y-auto">
                                                {filteredLeads.map(lead => (
                                                    <div
                                                        key={lead.id}
                                                        onClick={() => selectLead(lead)}
                                                        className="p-4 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0"
                                                    >
                                                        <p className="font-medium">{lead.name}</p>
                                                        <p className="text-sm text-foreground-muted">{lead.phone} {lead.vehicle_interest && `• Interesse: ${lead.vehicle_interest}`}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Vehicle Selection */}
                <Card variant="glass" className={`overflow-visible relative ${showVehicleSearch ? 'z-20' : 'z-10'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="w-5 h-5" />
                            Veículo
                        </CardTitle>
                        <CardDescription>
                            Selecione o veículo que está sendo vendido
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative" ref={vehicleSearchRef}>
                            {formData.vehicleId ? (
                                <div className="flex items-center justify-between p-4 rounded-xl bg-success-500/10 border border-success-500/20">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-success-500" />
                                        <div>
                                            <p className="font-medium">{formData.vehicleName}</p>
                                            <p className="text-sm text-foreground-muted">Veículo selecionado</p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setFormData(prev => ({ ...prev, vehicleId: '', vehicleName: '', salePrice: '' }))}
                                    >
                                        Alterar
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <Input
                                        placeholder={vehicles.length === 0 ? 'Nenhum veículo disponível' : 'Buscar veículo...'}
                                        value={vehicleSearch}
                                        onChange={(e) => setVehicleSearch(e.target.value)}
                                        onFocus={() => setShowVehicleSearch(true)}
                                        leftIcon={<Search className="w-5 h-5" />}
                                        disabled={vehicles.length === 0}
                                    />

                                    {showVehicleSearch && vehicles.length > 0 && filteredVehicles.length > 0 && (
                                        <div className="absolute z-[100] top-full left-0 right-0 mt-2 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl">
                                            <div className="max-h-60 overflow-y-auto">
                                                {filteredVehicles.map(vehicle => (
                                                    <div
                                                        key={vehicle.id}
                                                        onClick={() => selectVehicle(vehicle)}
                                                        className="p-4 hover:bg-gray-800 cursor-pointer border-b border-gray-800 last:border-0"
                                                    >
                                                        <p className="font-medium">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
                                                        <p className="text-sm text-success-400">R$ {formatPrice(vehicle.price)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Details */}
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            Detalhes Financeiros
                        </CardTitle>
                        <CardDescription>
                            Configure os valores e forma de pagamento
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Payment Method Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Forma de Pagamento</label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                {paymentMethods.map(method => (
                                    <button
                                        key={method.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.value }))}
                                        className={`p-3 rounded-xl border text-center transition-all ${formData.paymentMethod === method.value
                                            ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                                            : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                                            }`}
                                    >
                                        <span className="text-xl block mb-1">{method.icon}</span>
                                        <span className="text-xs">{method.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Prices */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Valor de Venda (R$)"
                                name="salePrice"
                                placeholder="Ex: 150.000"
                                leftIcon={<DollarSign className="w-5 h-5" />}
                                value={formData.salePrice}
                                onChange={handlePriceChange('salePrice')}
                                required
                            />
                            <Input
                                label="Desconto (R$)"
                                name="discount"
                                placeholder="Ex: 5.000"
                                leftIcon={<Percent className="w-5 h-5" />}
                                value={formData.discount}
                                onChange={handlePriceChange('discount')}
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Valor Final</label>
                                <div className="h-11 px-4 rounded-xl bg-success-500/10 border border-success-500/30 flex items-center">
                                    <span className="text-success-400 font-semibold">R$ {calculateFinalPrice()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Financing/Consortium Details */}
                        {showPaymentDetails && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-800/30 border border-gray-700">
                                <Input
                                    label="Entrada (R$)"
                                    name="downPayment"
                                    placeholder="Ex: 30.000"
                                    leftIcon={<DollarSign className="w-5 h-5" />}
                                    value={formData.downPayment}
                                    onChange={handlePriceChange('downPayment')}
                                />
                                <Input
                                    label="Parcelas"
                                    name="installments"
                                    type="number"
                                    placeholder="Ex: 48"
                                    leftIcon={<CreditCard className="w-5 h-5" />}
                                    value={formData.installments}
                                    onChange={handleChange}
                                    min="1"
                                    max="84"
                                />
                            </div>
                        )}

                        {/* Date */}
                        <Input
                            label="Data da Venda"
                            name="saleDate"
                            type="date"
                            leftIcon={<Calendar className="w-5 h-5" />}
                            value={formData.saleDate}
                            onChange={handleChange}
                            required
                        />

                        {/* Notes */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Observações</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Notas sobre a negociação, condições especiais, documentação..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                            />
                        </div>
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
                    <Link href="/sales">
                        <Button type="button" variant="ghost" fullWidth className="sm:w-auto">
                            Cancelar
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        leftIcon={<Save className="w-5 h-5" />}
                        isLoading={isLoading}
                        disabled={isLoading || !formData.leadId || !formData.vehicleId}
                    >
                        Registrar Venda
                    </Button>
                </div>
            </form>
        </div>
    );
}
