'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { User, CreditCard, LogOut, Users, Mail, Crown, Shield, UserCheck, Copy, X, Loader2, Trash2, Save, Check, Plus, Clock, AlertCircle, Zap, Edit2, Car, Calculator, Briefcase, Camera, ChevronRight, Star, CheckCircle2, MapPin, Globe, Smartphone, UploadCloud } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Organization, OrganizationMember, OrganizationInvite, OrganizationRole } from '@/lib/types';
import { m, AnimatePresence } from 'framer-motion';

import { OrganizationInviteModal } from '@/components/organization/InviteModal';

// --- Constants & Types ---

type TabType = 'profile' | 'team' | 'subscription' | 'organization';

const roleLabels: Record<OrganizationRole, { label: string; icon: any; color: string; bg: string }> = {
    owner: { label: 'Dono', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    admin: { label: 'Admin', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    vendedor: { label: 'Vendedor', icon: Car, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    rh: { label: 'RH', icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    contabilidade: { label: 'Contabilidade', icon: Calculator, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    member: { label: 'Membro', icon: User, color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
};

const plans = [
    {
        id: 'free',
        name: 'Gratuito',
        price: 'R$ 0',
        period: '/mês',
        description: 'Ideal para quem está começando',
        features: ['Até 3 membros', 'Gestão básica de veículos', 'Leads ilimitados', 'Suporte por email'],
        highlight: false,
        color: 'from-gray-500 to-slate-500'
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 'R$ 49',
        period: '/mês',
        description: 'Para lojas em crescimento',
        features: ['Até 10 membros', 'Relatórios avançados', 'Integração WhatsApp', 'Gestão financeira', 'Suporte prioritário'],
        highlight: true,
        color: 'from-primary-500 to-secondary-500',
        disabled: true
    },
    {
        id: 'business',
        name: 'Business',
        price: 'R$ 99',
        period: '/mês',
        description: 'Poder total para grandes redes',
        features: ['Membros ilimitados', 'Múltiplas lojas', 'API Access', 'Gerente de conta dedicado', 'White-label'],
        highlight: false,
        color: 'from-amber-500 to-orange-600',
        disabled: true
    }
];

// --- Sub-components ---

function PaymentModal({ plan, onClose, onSuccess }: { plan: any; onClose: () => void; onSuccess: () => void }) {
    const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');

    useEffect(() => {
        if (step === 'processing') {
            const timer = setTimeout(() => {
                setStep('success');
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [step]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <m.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-[#0F1115] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden relative"
            >
                {/* Header Background */}
                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-br ${plan.color} opacity-10`} />

                <div className="relative p-6">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>

                    {step === 'details' && (
                        <>
                            <div className="mb-6 text-center">
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                                    <Zap className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold">Upgrade para {plan.name}</h3>
                                <p className="text-gray-400 mt-1">Desbloqueie todo o potencial</p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-white">Total a pagar</p>
                                        <p className="text-xs text-gray-400">Cobrado mensalmente</p>
                                    </div>
                                    <p className="text-xl font-bold text-white">{plan.price}</p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase">Cartão de Crédito</p>
                                    <div className="flex gap-2">
                                        <div className="flex-1 h-10 bg-gray-800/50 rounded-lg border border-gray-700 flex items-center px-3 gap-2">
                                            <CreditCard className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-300">•••• •••• •••• 4242</span>
                                        </div>
                                        <div className="w-20 h-10 bg-gray-800/50 rounded-lg border border-gray-700 flex items-center justify-center text-sm text-gray-300">
                                            12/28
                                        </div>
                                        <div className="w-16 h-10 bg-gray-800/50 rounded-lg border border-gray-700 flex items-center justify-center text-sm text-gray-300">
                                            CVV
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                fullWidth
                                size="lg"
                                onClick={() => setStep('processing')}
                                className={`bg-gradient-to-r ${plan.color} hover:opacity-90 border-0 shadow-lg`}
                            >
                                Confirmar Assinatura
                            </Button>
                        </>
                    )}

                    {step === 'processing' && (
                        <div className="py-12 text-center">
                            <div className="relative w-20 h-20 mx-auto mb-6">
                                <div className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-spin border-${plan.color.split(' ')[1].replace('to-', '')}`} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <CreditCard className="w-8 h-8 text-white/50" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Processando...</h3>
                            <p className="text-gray-400">Estamos confirmando seus dados de pagamento.</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-8 text-center animate-fade-in-up">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-success-500" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-white">Sucesso!</h3>
                            <p className="text-gray-400 mb-8">
                                Bem-vindo ao plano {plan.name}.<br />
                                Seus novos recursos já estão ativos.
                            </p>
                            <Button fullWidth onClick={onSuccess} variant="secondary">
                                Fechar e Atualizar
                            </Button>
                        </div>
                    )}
                </div>
            </m.div>
        </div>
    );
}

function CreateOrgModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (org: Organization) => void }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        website: '',
        address: '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const formatPhone = (value: string) => {
        // Remove non-digits
        const numbers = value.replace(/\D/g, '');

        // Limit to 11 digits
        const truncated = numbers.slice(0, 11);

        // Apply mask
        if (truncated.length <= 2) return truncated;
        if (truncated.length <= 7) return `(${truncated.slice(0, 2)}) ${truncated.slice(2)}`;
        if (truncated.length <= 11) return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 7)}-${truncated.slice(7)}`;

        return truncated;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setFormData({ ...formData, phone: formatted });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. Create Org
            const res = await fetch('/api/organizations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            let finalOrg = data.organization;

            // 2. Upload Logo if exists
            if (logoFile) {
                const supabase = createClient();
                const fileExt = logoFile.name.split('.').pop();
                const filePath = `organizations/${finalOrg.id}/logo.${fileExt}`;

                await supabase.storage.from('avatars').upload(filePath, logoFile, { upsert: true });
                const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

                // Update org with logo
                await fetch('/api/organizations', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ logo_url: publicUrl }),
                });
                finalOrg.logo_url = publicUrl;
            }

            onSuccess(finalOrg);
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Erro ao criar organização');
        } finally {
            setLoading(false);
        }
    };

    const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout>();

    const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, address: value });
        setShowSuggestions(true);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (value.length > 2) {
            searchTimeout.current = setTimeout(async () => {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${value}&countrycodes=br&limit=5&featuretype=city`);
                    const data = await response.json();
                    setCitySuggestions(data);
                } catch (error) {
                    console.error(error);
                }
            }, 500);
        } else {
            setCitySuggestions([]);
        }
    };

    const selectCity = (city: any) => {
        const name = city.display_name.split(',')[0]; // Simple extraction, OSM returns "City, State, Country"
        // Try to find state in display_name or address details if available, but for simplicity split by comma
        // Better: featuretype=city usually returns "City, State, Country"
        const parts = city.display_name.split(',');
        const cleanAddress = `${parts[0]}, ${parts[1]?.trim().split(' ')[0]}`; // City, StateCode (heuristic)

        // Actually Nominatim display_name is messy. Let's just use the full display name truncated
        // Or better, let's just keep the input value for now based on user selection
        // Let's use parts[0] + parts[1] (State)

        setFormData({ ...formData, address: city.display_name });
        setShowSuggestions(false);
    };

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocalização não é suportada pelo seu navegador.');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                // Switch to Nominatim for better details (Neighborhood/Sector)
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                const data = await response.json();

                if (data.address) {
                    const { suburb, neighbourhood, city, town, village, state, state_code } = data.address;

                    const bairro = suburb || neighbourhood;
                    const cidade = city || town || village;
                    const estado = state_code || state; // Try simplified state code first

                    let formattedAddress = '';

                    if (bairro && cidade) {
                        formattedAddress = `${bairro}, ${cidade} - ${estado}`;
                    } else if (cidade) {
                        formattedAddress = `${cidade} - ${estado}`;
                    } else {
                        // Fallback to display_name but try to keep it short
                        formattedAddress = data.display_name.split(',').slice(0, 3).join(',');
                    }

                    setFormData(prev => ({ ...prev, address: formattedAddress }));
                    setShowSuggestions(false);
                } else {
                    alert('Não foi possível identificar o endereço exato.');
                }
            } catch (error) {
                console.error('Erro ao buscar endereço:', error);
                alert('Erro ao buscar localização.');
            } finally {
                setLoading(false);
            }
        }, (error) => {
            console.error('Erro de geolocalização:', error);
            alert('Permissão de localização negada ou indisponível.');
            setLoading(false);
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
            <div className="w-full max-w-lg bg-[#0F1115] border border-gray-800 rounded-2xl p-0 shadow-2xl relative overflow-hidden flex flex-col">
                {/* Header with Steps */}
                <div className="p-6 border-b border-gray-800 bg-gray-900/50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white">Criar Nova Loja</h3>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    {/* Progress Bar */}
                    <div className="flex items-center gap-2">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary-500' : 'bg-gray-800'}`} />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto bg-gray-800 rounded-2xl border-2 border-dashed border-gray-700 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" onChange={handleLogoSelect} />
                                    {logoPreview ? (
                                        <img src={logoPreview} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-gray-500">
                                            <UploadCloud className="w-8 h-8" />
                                            <span className="text-xs">Logo</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Edit2 className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-2">Clique para adicionar o logo da sua loja</p>
                            </div>
                            <Input
                                label="Nome da Loja *"
                                placeholder="Ex: Vendor Carros Premium"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in-up">
                            <h4 className="font-medium text-gray-400">Informações de Contato</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Telefone / WhatsApp"
                                    placeholder="(11) 99999-9999"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    maxLength={15}
                                    leftIcon={<Smartphone className="w-4 h-4 text-gray-500" />}
                                />
                                <Input
                                    label="Email Comercial"
                                    placeholder="contato@loja.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    leftIcon={<Mail className="w-4 h-4 text-gray-500" />}
                                />
                            </div>
                            <Input
                                label="Website / Instagram"
                                placeholder="instagram.com/sualoja"
                                value={formData.website}
                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                leftIcon={<Globe className="w-4 h-4 text-gray-500" />}
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in-up min-h-[300px]">
                            <h4 className="font-medium text-gray-400">Localização</h4>
                            <div className="space-y-2 relative group">
                                <div className="relative">
                                    <Input
                                        label="Cidade e Estado"
                                        placeholder="Digite para buscar..."
                                        value={formData.address}
                                        onChange={handleCityChange}
                                        onFocus={() => { if (citySuggestions.length > 0) setShowSuggestions(true); }}
                                        // onBlur handled by overlay click or timeout
                                        leftIcon={<MapPin className="w-4 h-4 text-gray-500" />}
                                        className="peer"
                                    />
                                    {loading && formData.address.length > 2 && (
                                        <div className="absolute right-3 top-[38px] animate-spin">
                                            <Loader2 className="w-4 h-4 text-primary-500" />
                                        </div>
                                    )}
                                </div>

                                {/* Premium Autocomplete Dropdown */}
                                <AnimatePresence>
                                    {showSuggestions && citySuggestions.length > 0 && (
                                        <>
                                            {/* Backdrop to close on click outside */}
                                            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowSuggestions(false)} />

                                            <m.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-[#1A1D24] border border-gray-800 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto overflow-x-hidden backdrop-blur-xl"
                                            >
                                                <div className="p-1">
                                                    {citySuggestions.map((city, i) => {
                                                        // Smart parsing for nicer display
                                                        const parts = city.display_name.split(',').map((p: string) => p.trim());
                                                        const mainText = parts[0];
                                                        const secondaryText = parts.length > 1 ? parts.slice(1, 3).join(', ') : 'Brasil';

                                                        return (
                                                            <button
                                                                key={i}
                                                                className="w-full text-left px-3 py-3 rounded-lg hover:bg-white/5 flex items-center gap-3 transition-all group/item"
                                                                onClick={() => selectCity(city)}
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shrink-0 group-hover/item:bg-primary-500/20 group-hover/item:text-primary-400 transition-colors">
                                                                    <MapPin className="w-4 h-4 text-gray-500 group-hover/item:text-primary-400" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-200 truncate group-hover/item:text-white transition-colors">{mainText}</p>
                                                                    <p className="text-xs text-gray-500 truncate group-hover/item:text-gray-400 transition-colors">{secondaryText}</p>
                                                                </div>
                                                                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                    <ChevronRight className="w-4 h-4 text-gray-600" />
                                                                </div>
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </m.div>
                                        </>
                                    )}
                                </AnimatePresence>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-primary-400 hover:bg-primary-500/10 mt-2 justify-start px-0"
                                    onClick={handleUseLocation}
                                    isLoading={loading}
                                    leftIcon={<Zap className="w-4 h-4" />}
                                >
                                    Usar localização do GPS
                                </Button>
                            </div>

                            <div className="mt-8 bg-primary-900/10 border border-primary-500/20 p-4 rounded-xl flex gap-3 text-sm text-primary-200">
                                <Zap className="w-5 h-5 text-primary-400 shrink-0" />
                                <p>Quase lá! Ao concluir, você terá acesso total ao painel de gestão.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-between">
                    {step > 1 ? (
                        <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Voltar</Button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <Button
                            onClick={() => setStep(s => s + 1)}
                            disabled={!formData.name}
                            rightIcon={<ChevronRight className="w-4 h-4" />}
                        >
                            Próximo
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            isLoading={loading}
                            className="bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/20"
                        >
                            Criar Loja
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Organization Edit Form ---

function OrganizationEditForm({ organization, myRole }: { organization: Organization; myRole: OrganizationRole }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: organization.name || '',
        phone: organization.phone || '',
        email: organization.email || '',
        website: organization.website || '',
        address: organization.address || '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(organization.logo_url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        const truncated = numbers.slice(0, 11);
        if (truncated.length <= 2) return truncated;
        if (truncated.length <= 7) return `(${truncated.slice(0, 2)}) ${truncated.slice(2)}`;
        if (truncated.length <= 11) return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 7)}-${truncated.slice(7)}`;
        return truncated;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        setFormData({ ...formData, phone: formatted });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            let logoUrl = organization.logo_url;

            // 1. Upload Logo if changed
            if (logoFile) {
                const supabase = createClient();
                // Ensure supabase client is valid
                if (supabase) {
                    const fileExt = logoFile.name.split('.').pop();
                    const filePath = `organizations/${organization.id}/logo-${Date.now()}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, logoFile, { upsert: true });
                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
                    logoUrl = publicUrl;
                }
            }

            // 2. Update Org
            const res = await fetch('/api/organizations', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, logo_url: logoUrl }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            alert('Organização atualizada com sucesso!');
            window.location.reload();

        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Erro ao atualizar organização');
        } finally {
            setLoading(false);
        }
    };

    // Autocomplete Logic
    const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout>();

    const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, address: value });
        setShowSuggestions(true);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (value.length > 2) {
            searchTimeout.current = setTimeout(async () => {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${value}&countrycodes=br&limit=5&featuretype=city`);
                    const data = await response.json();
                    setCitySuggestions(data);
                } catch (error) {
                    console.error(error);
                }
            }, 500);
        } else {
            setCitySuggestions([]);
        }
    };

    const selectCity = (city: any) => {
        setFormData({ ...formData, address: city.display_name });
        setShowSuggestions(false);
    };

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocalização não suportada.');
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                const data = await response.json();
                if (data.display_name) {
                    setFormData(prev => ({ ...prev, address: data.display_name }));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        });
    };

    const canEdit = myRole === 'owner' || myRole === 'admin';

    return (
        <div className="grid lg:grid-cols-3 gap-8 animate-fade-in-up">
            {/* Left Column: Logo */}
            <div className="lg:col-span-1 space-y-6">
                <Card variant="glass" className="overflow-hidden border-gray-800 bg-gray-900/40">
                    <div className="h-24 bg-gradient-to-br from-primary-900/50 to-secondary-900/50" />
                    <div className="px-6 pb-6 -mt-12 flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={() => canEdit && fileInputRef.current?.click()}>
                            <div className="w-24 h-24 rounded-2xl bg-[#0F1115] p-1 shadow-2xl">
                                <div className="w-full h-full rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center relative">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-gray-500">
                                            <UploadCloud className="w-8 h-8" />
                                        </div>
                                    )}
                                    {canEdit && (
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Edit2 className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {canEdit && <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoSelect} />}
                        </div>
                        <h2 className="text-xl font-bold mt-4 text-white">{formData.name || 'Nova Loja'}</h2>
                        <p className="text-sm text-gray-400 mt-1">{organization.plan?.toUpperCase() || 'FREE'} PLAN</p>
                    </div>
                </Card>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-gray-800 bg-gray-900/30">
                    <CardHeader>
                        <CardTitle>Dados da Loja</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                label="Nome da Loja"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                disabled={!canEdit}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Telefone / WhatsApp"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    disabled={!canEdit}
                                    leftIcon={<Smartphone className="w-4 h-4" />}
                                />
                                <Input
                                    label="Email Comercial"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!canEdit}
                                    leftIcon={<Mail className="w-4 h-4" />}
                                />
                            </div>
                            <Input
                                label="Website / Instagram"
                                value={formData.website}
                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                disabled={!canEdit}
                                leftIcon={<Globe className="w-4 h-4" />}
                            />

                            {/* Address with Autocomplete */}
                            <div className="relative">
                                <Input
                                    label="Endereço"
                                    value={formData.address}
                                    onChange={handleCityChange}
                                    disabled={!canEdit}
                                    leftIcon={<MapPin className="w-4 h-4" />}
                                />
                                {canEdit && showSuggestions && citySuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1D24] border border-gray-800 rounded-xl shadow-2xl z-50 max-h-48 overflow-auto">
                                        {citySuggestions.map((city, i) => (
                                            <button key={i} className="w-full text-left px-3 py-2 hover:bg-white/5 text-sm" onClick={() => selectCity(city)}>
                                                {city.display_name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {canEdit && (
                                    <button onClick={handleUseLocation} className="text-xs text-primary-400 mt-1 flex items-center gap-1 hover:underline">
                                        <Zap className="w-3 h-3" /> Usar localização atual
                                    </button>
                                )}
                            </div>
                        </div>

                        {canEdit && (
                            <div className="pt-4 flex justify-end border-t border-gray-800">
                                <Button onClick={handleSubmit} isLoading={loading} className="bg-primary-500 hover:bg-primary-600">
                                    Salvar Alterações
                                </Button>
                            </div>
                        )}
                        {!canEdit && (
                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm">
                                Apenas donos e administradores podem editar estes dados.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// --- Main Content Component ---

function SettingsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // -- Tabs State --
    const [activeTab, setActiveTab] = useState<TabType>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('settings_tab') as TabType;
            if (saved && ['profile', 'team', 'subscription'].includes(saved)) return saved;
        }
        return 'profile';
    });

    useEffect(() => {
        const tabFromUrl = searchParams.get('tab') as TabType;
        if (tabFromUrl && ['profile', 'team', 'subscription'].includes(tabFromUrl)) {
            setActiveTab(tabFromUrl);
            localStorage.setItem('settings_tab', tabFromUrl);
        }
    }, [searchParams]);

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        localStorage.setItem('settings_tab', tab);
        window.history.replaceState(null, '', `/settings?tab=${tab}`);
    };

    // -- Data States --
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [invites, setInvites] = useState<OrganizationInvite[]>([]);
    const [myRole, setMyRole] = useState<OrganizationRole>('member');

    // Profile
    const [profile, setProfile] = useState<{ id: string, name: string, phone: string, email: string, avatar_url: string | null } | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Subscription Modal
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [showCreateOrg, setShowCreateOrg] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Fetch All Data
    useEffect(() => {
        async function load() {
            setLoading(true);
            const supabase = createClient();
            if (!supabase) {
                setLoading(false);
                return;
            }

            // 1. User & Profile
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: p } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
                setProfile({
                    id: user.id,
                    email: user.email || '',
                    name: p?.name || '',
                    phone: p?.phone || '',
                    avatar_url: p?.avatar_url || null
                });
            }

            // 2. Organization
            try {
                const res = await fetch('/api/organizations');
                if (res.ok) {
                    const data = await res.json();
                    setOrganization(data.organization);
                    setMembers(data.members || []);
                    setInvites(data.invites || []);
                    setMyRole(data.role);
                }
            } catch (e) {
                console.error("Failed to load org", e);
            }

            setLoading(false);
        }
        load();
    }, []);

    // -- Handlers --

    const handleSaveProfile = async () => {
        if (!profile) return;
        setSaving(true);
        const supabase = createClient();
        if (!supabase) {
            setSaving(false);
            return;
        }

        await supabase.from('user_profiles').upsert({
            id: profile.id,
            name: profile.name,
            phone: profile.phone,
            updated_at: new Date().toISOString()
        });

        // Improve UX with fake delay if too fast
        setTimeout(() => setSaving(false), 500);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile) return;
        setUploading(true);

        const supabase = createClient();
        if (!supabase) {
            setUploading(false);
            return;
        }
        const fileExt = file.name.split('.').pop();
        const filePath = `${profile.id}/${Date.now()}.${fileExt}`;

        await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

        await supabase.from('user_profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);

        setProfile({ ...profile, avatar_url: publicUrl });
        setUploading(false);
    };

    const handleSignOut = async () => {
        const supabase = createClient();
        if (supabase) await supabase.auth.signOut();
        router.push('/login');
    };

    const handleUpgradeSuccess = () => {
        if (organization && selectedPlan) {
            setOrganization({ ...organization, plan: selectedPlan.id });
        }
        setSelectedPlan(null);
    };

    // -- Render --

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Configurações</h1>
                <p className="text-gray-400 mt-2">Gerencie sua percepção de marca, equipe e plano.</p>
            </div>

            {/* Navigation Pills */}
            <div className="flex gap-2 p-1 bg-gray-900/50 backdrop-blur-md rounded-xl border border-gray-800 w-fit mb-8">
                {[
                    { id: 'profile', icon: User, label: 'Perfil' },
                    { id: 'organization', icon: Briefcase, label: 'Minha Loja' },
                    { id: 'team', icon: Users, label: 'Equipe' },
                    { id: 'subscription', icon: Crown, label: 'Assinatura' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id as TabType)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.id
                            ? 'bg-gray-800 text-white shadow-lg shadow-black/20 ring-1 ring-white/10'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary-400' : ''}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* --- PROFILE TAB --- */}
            {activeTab === 'profile' && profile && (
                // ... existing profile content ...
                <div className="grid lg:grid-cols-3 gap-8 animate-fade-in-up">
                    {/* Left Column: Avatar & Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card variant="glass" className="overflow-hidden border-gray-800 bg-gray-900/40">
                            <div className="h-24 bg-gradient-to-br from-primary-900/50 to-secondary-900/50" />
                            <div className="px-6 pb-6 -mt-12 flex flex-col items-center">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-24 h-24 rounded-2xl bg-[#0F1115] p-1 shadow-2xl">
                                        <div className="w-full h-full rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center relative">
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl font-bold text-gray-500">{profile.name?.[0]?.toUpperCase() || 'U'}</span>
                                            )}

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera className="w-6 h-6 text-white" />
                                            </div>
                                            {uploading && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                </div>

                                <h2 className="text-xl font-bold mt-4 text-white">{profile.name || 'Usuário sem nome'}</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${organization ? roleLabels[myRole].bg + ' ' + roleLabels[myRole].color : 'bg-gray-800 text-gray-400'}`}>
                                        {organization ? roleLabels[myRole].label : 'Visitante'}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-gray-800 bg-gray-900/30">
                            <CardHeader>
                                <CardTitle>Informações Pessoais</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <Input
                                        label="Nome Completo"
                                        value={profile.name}
                                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                                        className="bg-black/20 border-gray-800 focus:border-primary-500"
                                    />
                                    <Input
                                        label="WhatsApp"
                                        value={profile.phone}
                                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                        className="bg-black/20 border-gray-800 focus:border-primary-500"
                                    />
                                </div>
                                <Input
                                    label="Email Corporativo"
                                    value={profile.email}
                                    disabled
                                    className="bg-gray-800/50 border-gray-800 text-gray-500 cursor-not-allowed"
                                />

                                <div className="pt-4 flex items-center justify-between border-t border-gray-800">
                                    <Button variant="danger" onClick={handleSignOut} leftIcon={<LogOut className="w-4 h-4" />}>
                                        Sair da Conta
                                    </Button>
                                    <Button
                                        onClick={handleSaveProfile}
                                        isLoading={saving}
                                        className="bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20"
                                    >
                                        Salvar Alterações
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* --- ORGANIZATION TAB --- */}
            {activeTab === 'organization' && organization && (
                <OrganizationEditForm organization={organization} myRole={myRole} />
            )}

            {/* --- TEAM TAB --- */}
            {activeTab === 'team' && (
                <div className="animate-fade-in-up space-y-6">
                    {!organization ? (
                        <div className="text-center py-20 px-6 rounded-3xl border border-dashed border-gray-800 bg-gray-900/20">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
                                <Users className="w-10 h-10 text-gray-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Nenhuma organização encontrada</h2>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">Você não está vinculado a nenhuma equipe no momento. Crie sua própria loja para começar.</p>
                            <Button className="bg-white text-black hover:bg-gray-200" onClick={() => setShowCreateOrg(true)}>Criar Nova Organização</Button>
                        </div>
                    ) : (
                        <>
                            {/* Org Header */}
                            <div className="relative overflow-hidden rounded-3xl border border-gray-800 bg-gray-900/50 p-8">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-900/10 to-transparent pointer-events-none" />
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg border border-gray-700">
                                            {organization.logo_url ? <img src={organization.logo_url} className="w-full h-full object-cover rounded-2xl" /> : <Users className="w-8 h-8 text-gray-500" />}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{organization.name}</h2>
                                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                                                <span>{members.length} colaboradores</span>
                                                <span>•</span>
                                                <span className="capitalize text-primary-400">Plano {organization.plan}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Invite Action would go here */}
                                </div>
                            </div>

                            {/* Members List */}
                            <div className="grid gap-4">
                                <div className="flex items-center justify-between pb-2">
                                    <h3 className="text-lg font-semibold">Membros da Equipe</h3>
                                    <Button size="sm" variant="outline" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowInviteModal(true)}>Convidar</Button>
                                </div>
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-[#0F1115] hover:border-gray-700 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                                                {member.user?.avatar_url ? (
                                                    <img src={member.user.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-gray-500">{member.display_name?.[0] || 'U'}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{member.display_name || member.user?.name || 'Membro da Equipe'}</p>
                                                <p className="text-xs text-gray-500">Adicionado em {new Date(member.joined_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${roleLabels[member.role]?.bg} ${roleLabels[member.role]?.color}`}>
                                                {roleLabels[member.role]?.label}
                                            </span>
                                            {myRole === 'owner' && member.role !== 'owner' && (
                                                <button className="p-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* --- SUBSCRIPTION TAB --- */}
            {activeTab === 'subscription' && (
                <div className="animate-fade-in-up space-y-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Escolha o plano ideal</h2>
                        <p className="text-gray-400 text-lg">Escale sua operação com ferramentas poderosas desenhadas para o mercado automotivo.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan) => {
                            const isCurrent = organization?.plan === plan.id;
                            return (
                                <m.div
                                    key={plan.id}
                                    whileHover={{ y: -8 }}
                                    className={`relative rounded-3xl p-8 border ${plan.highlight ? 'border-primary-500/50 bg-primary-900/10' : 'border-gray-800 bg-[#0F1115]'} flex flex-col`}
                                >
                                    {plan.highlight && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-xs font-bold text-white shadow-lg">
                                            MAIS POPULAR
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1 mt-2">
                                            <span className="text-4xl font-bold text-white">{plan.price}</span>
                                            <span className="text-gray-500">{plan.period}</span>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-3">{plan.description}</p>
                                    </div>

                                    <div className="flex-1 space-y-4 mb-8">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${plan.highlight ? 'bg-primary-500/20 text-primary-400' : 'bg-gray-800 text-gray-500'}`}>
                                                    <Check className="w-3 h-3" />
                                                </div>
                                                <span className="text-sm text-gray-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {isCurrent ? (
                                        <Button fullWidth disabled variant="outline" className="border-primary-500/30 text-primary-400 bg-primary-500/10">
                                            Plano Atual
                                        </Button>
                                    ) : (
                                        <Button
                                            fullWidth
                                            variant={plan.highlight ? 'primary' : 'secondary'}
                                            disabled={plan.disabled}
                                            onClick={() => !plan.disabled && setSelectedPlan(plan)}
                                            className={plan.highlight ? 'shadow-lg shadow-primary-500/25' : ''}
                                        >
                                            {plan.disabled ? 'Em Breve' : 'Fazer Upgrade'}
                                        </Button>
                                    )}
                                </m.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            <AnimatePresence>
                {selectedPlan && (
                    <PaymentModal
                        plan={selectedPlan}
                        onClose={() => setSelectedPlan(null)}
                        onSuccess={handleUpgradeSuccess}
                    />
                )}

            </AnimatePresence>

            {/* Create Org Modal */}
            {showCreateOrg && (
                <CreateOrgModal
                    onClose={() => setShowCreateOrg(false)}
                    onSuccess={(newOrg) => {
                        setOrganization(newOrg);
                        setMyRole('owner');
                        setMembers([{  // Optimistic UI update for immediate feedback
                            id: 'temp',
                            user_id: profile?.id || '',
                            organization_id: newOrg.id,
                            role: 'owner',
                            joined_at: new Date().toISOString(),
                            user: { name: profile?.name || '', avatar_url: profile?.avatar_url || undefined }
                        }]);
                        setShowCreateOrg(false);
                    }}
                />
            )}

            {/* Invite Modal */}
            {organization && (
                <OrganizationInviteModal
                    isOpen={showInviteModal}
                    onClose={() => setShowInviteModal(false)}
                    organizationId={organization.id}
                    onSuccess={() => {
                        // Ideally refetch members or optimistically update, but simple reload or wait is fine for now
                        // For better UX, let's trigger a reload of invites/members in the future
                    }}
                />
            )}
        </div>
    );
}

// Wrapper
export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <SettingsContent />
        </Suspense>
    );
}
