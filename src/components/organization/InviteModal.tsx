'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OrganizationRole } from '@/lib/types';
import { Mail, MessageCircle, Copy, Check, Loader2, Send, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { m, AnimatePresence } from 'framer-motion';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    organizationId: string;
    onSuccess: () => void;
}

const roles: { value: OrganizationRole; label: string; description: string }[] = [
    { value: 'admin', label: 'Administrador', description: 'Acesso total a todas as configurações e dados.' },
    { value: 'vendedor', label: 'Vendedor', description: 'Pode gerenciar leads e veículos, mas sem acesso a configurações.' },
    { value: 'rh', label: 'RH', description: 'Gerencia membros e contratações.' },
    { value: 'contabilidade', label: 'Contabilidade', description: 'Acesso a relatórios financeiros e vendas.' },
    { value: 'member', label: 'Membro', description: 'Acesso básico de visualização.' },
];

export function OrganizationInviteModal({ isOpen, onClose, organizationId, onSuccess }: InviteModalProps) {
    const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>('email');
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<OrganizationRole>('member');
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Reset state on close
    const handleClose = () => {
        setEmail('');
        setRole('member');
        setGeneratedLink(null);
        setLoading(false);
        onClose();
    };

    const handleInvite = async () => {
        if (!email) return;

        setLoading(true);
        try {
            const res = await fetch('/api/organizations/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role, organization_id: organizationId }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            if (activeTab === 'email') {
                alert(`Convite enviado para ${email}!`);
                onSuccess();
                handleClose();
            } else {
                setGeneratedLink(data.inviteLink);
            }

        } catch (error: any) {
            alert(error.message || 'Erro ao enviar convite');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleWhatsAppShare = () => {
        if (generatedLink) {
            const text = `Olá! Você foi convidado para participar da nossa equipe no VendorCarro como ${roles.find(r => r.value === role)?.label}. Acesse o link para aceitar: ${generatedLink}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            onSuccess();
            handleClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal Content */}
                        <m.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-[#0F1115] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 pb-4 border-b border-gray-800 flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        Convidar Membro
                                        <span className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 text-xs font-medium border border-primary-500/20">
                                            Novo
                                        </span>
                                    </h2>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Adicione novos membros à sua equipe.
                                    </p>
                                </div>
                                <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex px-6 border-b border-gray-800 bg-gray-900/30">
                                <button
                                    onClick={() => setActiveTab('email')}
                                    className={cn(
                                        "flex-1 py-3 text-sm font-medium transition-all relative",
                                        activeTab === 'email' ? "text-white" : "text-gray-500 hover:text-gray-300"
                                    )}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <Mail className="w-4 h-4" /> Email
                                    </span>
                                    {activeTab === 'email' && <m.div layoutId="modal-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />}
                                </button>
                                <button
                                    onClick={() => setActiveTab('whatsapp')}
                                    className={cn(
                                        "flex-1 py-3 text-sm font-medium transition-all relative",
                                        activeTab === 'whatsapp' ? "text-white" : "text-gray-500 hover:text-gray-300"
                                    )}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <MessageCircle className="w-4 h-4" /> WhatsApp
                                    </span>
                                    {activeTab === 'whatsapp' && <m.div layoutId="modal-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#25D366]" />}
                                </button>
                            </div>

                            <div className="p-6 space-y-5">
                                {!generatedLink ? (
                                    <div className="space-y-5">
                                        {/* Role Selector (Custom) */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Cargo / Função</label>
                                            <div className="relative">
                                                <select
                                                    value={role}
                                                    onChange={(e) => setRole(e.target.value as OrganizationRole)}
                                                    className="w-full h-10 pl-3 pr-10 bg-gray-900/50 border border-gray-700 rounded-lg text-white appearance-none focus:outline-none focus:border-primary-500 transition-colors"
                                                >
                                                    {roles.map((r) => (
                                                        <option key={r.value} value={r.value}>
                                                            {r.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                            </div>
                                            <p className="text-xs text-gray-500">{roles.find(r => r.value === role)?.description}</p>
                                        </div>

                                        {/* Email Input */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">
                                                {activeTab === 'email' ? 'Email do Membro' : 'Email para Registro'}
                                            </label>
                                            <Input
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="colaborador@exemplo.com"
                                                className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-600 focus:border-primary-500"
                                            />
                                            {activeTab === 'whatsapp' && (
                                                <p className="text-xs text-gray-500">
                                                    Necessário registrar o email para criar o convite no sistema antes de compartilhar.
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            onClick={handleInvite}
                                            disabled={!email || loading}
                                            className={cn(
                                                "w-full h-10 font-semibold text-white transition-all transform active:scale-95",
                                                activeTab === 'whatsapp'
                                                    ? "bg-[#25D366] hover:bg-[#128C7E] shadow-lg shadow-[#25D366]/20"
                                                    : "bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/20"
                                            )}
                                        >
                                            {loading ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            ) : activeTab === 'whatsapp' ? (
                                                <>Gerar Link WhatsApp <MessageCircle className="w-4 h-4 ml-2" /></>
                                            ) : (
                                                <>Enviar Convite <Send className="w-4 h-4 ml-2" /></>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    // Link Generated State
                                    <m.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-6 text-center"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center mx-auto mb-2 ring-4 ring-[#25D366]/5">
                                            <Check className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Convite Criado!</h3>
                                            <p className="text-sm text-gray-400">O link de convite foi gerado com sucesso.</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Input
                                                readOnly
                                                value={generatedLink}
                                                className="bg-gray-900 text-gray-400 border-gray-800 text-sm font-mono"
                                            />
                                            <Button size="icon" variant="outline" onClick={handleCopyLink} className="border-gray-700 hover:bg-gray-800">
                                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            </Button>
                                        </div>

                                        <Button
                                            onClick={handleWhatsAppShare}
                                            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold h-10 shadow-lg shadow-[#25D366]/20"
                                        >
                                            <MessageCircle className="w-4 h-4 mr-2" /> Compartilhar no WhatsApp
                                        </Button>

                                        <button onClick={() => setGeneratedLink(null)} className="text-xs text-gray-500 hover:text-white underline pb-2">
                                            Voltar
                                        </button>
                                    </m.div>
                                )}
                            </div>
                        </m.div>
                    </m.div>
                </>
            )}
        </AnimatePresence>
    );
}
