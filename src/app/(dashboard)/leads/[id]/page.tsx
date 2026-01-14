'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, User, Phone, Mail, Car, Save, Trash2, X, Loader2, MessageSquare,
    MapPin, FileText, Calendar, Hash, Upload, CreditCard, Briefcase, Star, Clock,
    ExternalLink, Tag, TrendingUp
} from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { Lead, LeadDocument, LeadAddress } from '@/lib/types';

const sourceOptions = [
    { value: 'manual', label: 'Cadastro Manual' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'phone', label: 'Telefone' },
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Indicação' },
    { value: 'other', label: 'Outro' },
];

const statusOptions = [
    { value: 'new', label: 'Novo', color: 'bg-blue-500' },
    { value: 'contacted', label: 'Contactado', color: 'bg-yellow-500' },
    { value: 'interested', label: 'Interessado', color: 'bg-green-500' },
    { value: 'negotiating', label: 'Em Negociação', color: 'bg-purple-500' },
    { value: 'closed', label: 'Fechado', color: 'bg-success-500' },
    { value: 'lost', label: 'Perdido', color: 'bg-error-500' },
];

const documentTypeOptions = [
    { value: 'cpf', label: 'CPF' },
    { value: 'rg', label: 'RG' },
    { value: 'comprovante_residencia', label: 'Comprovante de Residência' },
    { value: 'comprovante_renda', label: 'Comprovante de Renda' },
    { value: 'cnh', label: 'CNH' },
    { value: 'contrato', label: 'Contrato' },
    { value: 'other', label: 'Outro' },
];

const brazilStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function LeadDetailPage() {
    const router = useRouter();
    const params = useParams();
    const leadId = params.id as string;
    const documentInputRef = useRef<HTMLInputElement>(null);

    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [vehicleInterest, setVehicleInterest] = useState('');
    const [source, setSource] = useState('manual');
    const [status, setStatus] = useState('new');
    const [message, setMessage] = useState('');

    // New personal data fields
    const [cpf, setCpf] = useState('');
    const [rg, setRg] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [profession, setProfession] = useState('');

    // Address fields
    const [zipCode, setZipCode] = useState('');
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [complement, setComplement] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');

    // Activity fields
    const [nextFollowup, setNextFollowup] = useState('');
    const [score, setScore] = useState(50);
    const [documents, setDocuments] = useState<LeadDocument[]>([]);
    const [newDocType, setNewDocType] = useState('cpf');

    useEffect(() => {
        async function fetchLead() {
            const supabase = createClient();
            if (!supabase) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('id', leadId)
                .single();

            if (error || !data) {
                setError('Lead não encontrado');
                setLoading(false);
                return;
            }

            const l = data as Lead;
            setLead(l);
            setName(l.name);
            setEmail(l.email || '');
            setPhone(l.phone);
            setVehicleInterest(l.vehicle_interest || '');
            setSource(l.source);
            setStatus(l.status);
            setMessage(l.message || '');
            setCpf(l.cpf || '');
            setRg(l.rg || '');
            setBirthDate(l.birth_date || '');
            setProfession(l.profession || '');
            if (l.address) {
                setZipCode(l.address.zip_code || '');
                setStreet(l.address.street || '');
                setNumber(l.address.number || '');
                setComplement(l.address.complement || '');
                setNeighborhood(l.address.neighborhood || '');
                setCity(l.address.city || '');
                setState(l.address.state || '');
            }
            setNextFollowup(l.next_followup || '');
            setScore(l.score || 50);
            setDocuments(l.documents || []);
            setLoading(false);
        }

        fetchLead();
    }, [leadId]);

    // Format helpers
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 2) return numbers;
        if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    };

    const formatCpf = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
        if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
        return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    };

    const formatCep = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 5) return numbers;
        return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    };

    const handleCepChange = async (value: string) => {
        const formatted = formatCep(value);
        setZipCode(formatted);

        const numbers = value.replace(/\D/g, '');
        if (numbers.length === 8) {
            setLoadingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${numbers}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setStreet(data.logradouro || '');
                    setNeighborhood(data.bairro || '');
                    setCity(data.localidade || '');
                    setState(data.uf || '');
                }
            } catch (err) {
                console.error('Error fetching CEP:', err);
            } finally {
                setLoadingCep(false);
            }
        }
    };

    const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploadingDoc(true);
        const file = files[0];

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                const newDoc: LeadDocument = {
                    name: file.name,
                    type: newDocType as LeadDocument['type'],
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

            const address: LeadAddress | null = zipCode ? {
                street,
                number,
                complement: complement || undefined,
                neighborhood,
                city,
                state,
                zip_code: zipCode,
            } : null;

            const baseData: Record<string, unknown> = {
                name,
                email: email || null,
                phone,
                vehicle_interest: vehicleInterest || null,
                source,
                status,
                message: message || null,
                updated_at: new Date().toISOString(),
            };

            // Add new fields if they have values
            if (cpf) baseData.cpf = cpf;
            if (rg) baseData.rg = rg;
            if (birthDate) baseData.birth_date = birthDate;
            if (profession) baseData.profession = profession;
            if (address) baseData.address = address;
            if (documents.length > 0) baseData.documents = documents;
            if (nextFollowup) baseData.next_followup = nextFollowup;
            baseData.score = score;

            const { error: updateError } = await supabase
                .from('leads')
                .update(baseData)
                .eq('id', leadId);

            if (updateError) {
                // If schema error, try without new fields
                if (updateError.message.includes('schema')) {
                    const { error: fallbackError } = await supabase
                        .from('leads')
                        .update({
                            name,
                            email: email || null,
                            phone,
                            vehicle_interest: vehicleInterest || null,
                            source,
                            status,
                            message: message || null,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', leadId);

                    if (fallbackError) {
                        setError(`Erro ao salvar: ${fallbackError.message}`);
                        return;
                    }
                } else {
                    setError(`Erro ao salvar: ${updateError.message}`);
                    return;
                }
            }

            router.push('/leads');
        } catch (err) {
            setError('Erro ao salvar alterações');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

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
                .from('leads')
                .delete()
                .eq('id', leadId);

            if (deleteError) {
                setError(`Erro ao excluir: ${deleteError.message}`);
                setDeleting(false);
                return;
            }

            router.push('/leads');
        } catch (err) {
            setError('Erro ao excluir lead');
            console.error(err);
            setDeleting(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const getStatusColor = (s: string) => {
        return statusOptions.find(opt => opt.value === s)?.color || 'bg-gray-500';
    };

    const getScoreColor = (s: number) => {
        if (s >= 80) return 'text-success-400';
        if (s >= 50) return 'text-yellow-400';
        return 'text-error-400';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="text-center py-16">
                <User className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h2 className="text-xl font-semibold mb-2">Lead não encontrado</h2>
                <Link href="/leads">
                    <Button variant="secondary">Voltar para leads</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/leads">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-lg font-semibold">
                            {name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold">{name}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(status)}`}>
                                    {statusOptions.find(s => s.value === status)?.label}
                                </span>
                            </div>
                            <p className="text-foreground-muted">Editar informações do lead</p>
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="text-error-400 hover:bg-error-500/10"
                    onClick={() => setShowDeleteConfirm(true)}
                >
                    <Trash2 className="w-5 h-5" />
                </Button>
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <Card variant="glass" className="border-error-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-error-400">Confirmar exclusão?</p>
                                <p className="text-sm text-foreground-muted">Esta ação não pode ser desfeita.</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                                    Cancelar
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
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
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Side */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Data */}
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Dados Pessoais
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                label="Nome completo"
                                leftIcon={<User className="w-5 h-5" />}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="CPF"
                                    leftIcon={<CreditCard className="w-5 h-5" />}
                                    placeholder="000.000.000-00"
                                    value={cpf}
                                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                                />
                                <Input
                                    label="RG"
                                    leftIcon={<Hash className="w-5 h-5" />}
                                    placeholder="00.000.000-0"
                                    value={rg}
                                    onChange={(e) => setRg(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Data de Nascimento"
                                    type="date"
                                    leftIcon={<Calendar className="w-5 h-5" />}
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                />
                                <Input
                                    label="Profissão"
                                    leftIcon={<Briefcase className="w-5 h-5" />}
                                    placeholder="Ex: Empresário"
                                    value={profession}
                                    onChange={(e) => setProfession(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact */}
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Phone className="w-5 h-5" />
                                Contato
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Telefone"
                                    type="tel"
                                    leftIcon={<Phone className="w-5 h-5" />}
                                    value={phone}
                                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                                    required
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    leftIcon={<Mail className="w-5 h-5" />}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Address */}
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Endereço
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="CEP"
                                    placeholder="00000-000"
                                    leftIcon={loadingCep ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                                    value={zipCode}
                                    onChange={(e) => handleCepChange(e.target.value)}
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        label="Rua"
                                        placeholder="Nome da rua"
                                        value={street}
                                        onChange={(e) => setStreet(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Input
                                    label="Número"
                                    placeholder="000"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                />
                                <Input
                                    label="Complemento"
                                    placeholder="Apto, Bloco..."
                                    value={complement}
                                    onChange={(e) => setComplement(e.target.value)}
                                />
                                <Input
                                    label="Bairro"
                                    placeholder="Bairro"
                                    value={neighborhood}
                                    onChange={(e) => setNeighborhood(e.target.value)}
                                />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Estado</label>
                                    <select
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    >
                                        <option value="">UF</option>
                                        {brazilStates.map(uf => (<option key={uf} value={uf}>{uf}</option>))}
                                    </select>
                                </div>
                            </div>
                            <Input
                                label="Cidade"
                                placeholder="Cidade"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    {/* Interest & Notes */}
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Car className="w-5 h-5" />
                                Interesse & Observações
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                label="Veículo de Interesse"
                                leftIcon={<Car className="w-5 h-5" />}
                                value={vehicleInterest}
                                onChange={(e) => setVehicleInterest(e.target.value)}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Origem</label>
                                    <select
                                        value={source}
                                        onChange={(e) => setSource(e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    >
                                        {sourceOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    >
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Observações</label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-4 top-3 w-5 h-5 text-foreground-muted" />
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Notas sobre o cliente..."
                                        rows={4}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground placeholder:text-foreground-subtle focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                    />
                                </div>
                            </div>
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
                                            <div className="flex items-center gap-2">
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                                <button type="button" onClick={() => removeDocument(index)} className="text-error-400 hover:text-error-300">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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
                                Aceita PDF, JPG, PNG. Adicione CPF, RG, comprovantes, etc.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-4">
                    {/* Score Card */}
                    <Card variant="glass">
                        <CardContent className="p-6">
                            <div className="text-center mb-4">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Star className="w-5 h-5 text-yellow-400" />
                                    <span className="text-sm font-medium text-foreground-muted">Lead Score</span>
                                </div>
                                <p className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</p>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={score}
                                onChange={(e) => setScore(Number(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                            />
                            <div className="flex justify-between text-xs text-foreground-muted mt-1">
                                <span>Frio</span>
                                <span>Quente</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Card */}
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Clock className="w-4 h-4" />
                                Atividade
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Próximo Follow-up</label>
                                <Input
                                    type="date"
                                    value={nextFollowup}
                                    onChange={(e) => setNextFollowup(e.target.value)}
                                />
                            </div>
                            <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                <p className="text-xs text-foreground-muted mb-1">Cadastrado em</p>
                                <p className="font-medium text-sm">{formatDate(lead.created_at)}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/50">
                                <p className="text-xs text-foreground-muted mb-1">Última atualização</p>
                                <p className="font-medium text-sm">{formatDate(lead.updated_at)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="w-4 h-4" />
                                Ações Rápidas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {phone && (
                                <a
                                    href={`https://wa.me/55${phone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors"
                                >
                                    <span className="text-xl">💬</span>
                                    <span className="font-medium text-green-400">WhatsApp</span>
                                </a>
                            )}
                            {phone && (
                                <a
                                    href={`tel:${phone.replace(/\D/g, '')}`}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
                                >
                                    <Phone className="w-5 h-5 text-blue-400" />
                                    <span className="font-medium text-blue-400">Ligar</span>
                                </a>
                            )}
                            <Link href={`/sales/new?leadId=${leadId}`}>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-500/10 border border-primary-500/30 hover:bg-primary-500/20 transition-colors cursor-pointer">
                                    <TrendingUp className="w-5 h-5 text-primary-400" />
                                    <span className="font-medium text-primary-400">Nova Venda</span>
                                </div>
                            </Link>
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Link href="/leads">
                    <Button type="button" variant="ghost" fullWidth className="sm:w-auto">
                        Cancelar
                    </Button>
                </Link>
                <Button
                    leftIcon={<Save className="w-5 h-5" />}
                    isLoading={saving}
                    onClick={handleSave}
                >
                    Salvar Alterações
                </Button>
            </div>
        </div>
    );
}
