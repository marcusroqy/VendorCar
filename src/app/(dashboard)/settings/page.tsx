'use client';

import { useState, useEffect } from 'react';
import { User, CreditCard, LogOut, Users, Mail, Crown, Shield, UserCheck, Copy, X, Loader2, Trash2, Save, Check } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Organization, OrganizationMember, OrganizationInvite, OrganizationRole } from '@/lib/types';

type TabType = 'profile' | 'team' | 'subscription';

const roleLabels: Record<OrganizationRole, { label: string; icon: typeof Crown }> = {
    owner: { label: 'Dono', icon: Crown },
    admin: { label: 'Admin', icon: Shield },
    member: { label: 'Membro', icon: UserCheck },
};

const planLabels: Record<string, { name: string; members: number }> = {
    free: { name: 'Gratuito', members: 3 },
    pro: { name: 'Pro', members: 10 },
    business: { name: 'Business', members: 999 },
};

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [isLoading, setIsLoading] = useState(false);

    // Organization state
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [invites, setInvites] = useState<OrganizationInvite[]>([]);
    const [myRole, setMyRole] = useState<OrganizationRole>('member');
    const [loadingOrg, setLoadingOrg] = useState(true);

    // Invite state
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
    const [inviting, setInviting] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState('');
    const [inviteLink, setInviteLink] = useState('');

    // Profile state
    const [profileName, setProfileName] = useState('');
    const [profilePhone, setProfilePhone] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Fetch user profile
    useEffect(() => {
        async function fetchProfile() {
            const supabase = createClient();
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || '');

                // Fetch profile from user_profiles table
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setProfileName(profile.name || '');
                    setProfilePhone(profile.phone || '');
                }
            }
            setLoadingProfile(false);
        }
        fetchProfile();
    }, []);

    // Fetch organization data
    useEffect(() => {
        async function fetchOrg() {
            try {
                const res = await fetch('/api/organizations');
                if (res.ok) {
                    const data = await res.json();
                    setOrganization(data.organization);
                    setMembers(data.members || []);
                    setInvites(data.invites || []);
                    setMyRole(data.role);
                }
            } catch (err) {
                console.error('Error fetching organization:', err);
            } finally {
                setLoadingOrg(false);
            }
        }
        fetchOrg();
    }, []);

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        setProfileSaved(false);

        const supabase = createClient();
        if (!supabase) {
            setSavingProfile(false);
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setSavingProfile(false);
            return;
        }

        const { error } = await supabase
            .from('user_profiles')
            .upsert({
                id: user.id,
                name: profileName,
                phone: profilePhone,
                updated_at: new Date().toISOString(),
            });

        if (!error) {
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 2000);
        }
        setSavingProfile(false);
    };

    const handleSignOut = async () => {
        setIsLoading(true);
        const supabase = createClient();
        if (supabase) {
            await supabase.auth.signOut();
            router.push('/');
        }
        setIsLoading(false);
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviting(true);
        setInviteError('');
        setInviteSuccess('');
        setInviteLink('');

        try {
            const res = await fetch('/api/organizations/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            });

            const data = await res.json();

            if (!res.ok) {
                setInviteError(data.error || 'Erro ao enviar convite');
            } else {
                setInviteSuccess(data.message);
                setInviteLink(data.inviteLink);
                setInviteEmail('');
                // Refresh invites
                const orgRes = await fetch('/api/organizations');
                if (orgRes.ok) {
                    const orgData = await orgRes.json();
                    setInvites(orgData.invites || []);
                }
            }
        } catch {
            setInviteError('Erro ao enviar convite');
        } finally {
            setInviting(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Tem certeza que deseja remover este membro?')) return;

        try {
            const res = await fetch(`/api/organizations/members?id=${memberId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setMembers(prev => prev.filter(m => m.id !== memberId));
            }
        } catch (err) {
            console.error('Error removing member:', err);
        }
    };

    const handleCancelInvite = async (inviteId: string) => {
        try {
            const res = await fetch(`/api/organizations/invite?id=${inviteId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setInvites(prev => prev.filter(i => i.id !== inviteId));
            }
        } catch (err) {
            console.error('Error canceling invite:', err);
        }
    };

    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink);
    };

    const canManageMembers = myRole === 'owner' || myRole === 'admin';
    const canChangeRoles = myRole === 'owner';

    const tabs = [
        { id: 'profile' as const, label: 'Perfil', icon: User },
        { id: 'team' as const, label: 'Equipe', icon: Users },
        { id: 'subscription' as const, label: 'Assinatura', icon: CreditCard },
    ];

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold">Configurações</h1>
                <p className="text-foreground-muted">Gerencie sua conta, equipe e preferências</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-800 pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                            ? 'bg-primary-500/20 text-primary-400'
                            : 'text-foreground-muted hover:text-foreground hover:bg-gray-800/50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Perfil
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {loadingProfile ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                                </div>
                            ) : (
                                <>
                                    <Input
                                        label="Nome"
                                        placeholder="Seu nome"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                    />
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={userEmail}
                                        disabled
                                        className="opacity-60"
                                    />
                                    <p className="text-xs text-foreground-muted -mt-2">
                                        O email não pode ser alterado
                                    </p>
                                    <Input
                                        label="WhatsApp"
                                        placeholder="(11) 99999-9999"
                                        value={profilePhone}
                                        onChange={(e) => setProfilePhone(e.target.value)}
                                    />
                                    <Button
                                        onClick={handleSaveProfile}
                                        isLoading={savingProfile}
                                        leftIcon={profileSaved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                                        variant={profileSaved ? "secondary" : "primary"}
                                    >
                                        {profileSaved ? 'Salvo!' : 'Salvar Alterações'}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card variant="elevated">
                        <CardContent className="py-4">
                            <Button
                                variant="danger"
                                fullWidth
                                leftIcon={<LogOut className="w-5 h-5" />}
                                onClick={handleSignOut}
                                isLoading={isLoading}
                            >
                                Sair da conta
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
                <div className="space-y-4">
                    {loadingOrg ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                        </div>
                    ) : organization ? (
                        <>
                            {/* Organization Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        {organization.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-foreground-muted">
                                            {members.length} de {organization.max_members} membros
                                        </span>
                                        <span className="px-2 py-1 rounded-full bg-primary-500/10 text-primary-400 text-xs font-medium">
                                            Plano {planLabels[organization.plan]?.name || 'Free'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Team Members */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Membros</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {members.map(member => {
                                        const RoleIcon = roleLabels[member.role]?.icon || UserCheck;
                                        return (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 border border-gray-700/50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium">
                                                        {member.user?.email?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{member.user?.email || 'Usuário'}</p>
                                                        <div className="flex items-center gap-1 text-sm text-foreground-muted">
                                                            <RoleIcon className="w-3 h-3" />
                                                            {roleLabels[member.role]?.label}
                                                        </div>
                                                    </div>
                                                </div>
                                                {canManageMembers && member.role !== 'owner' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-error-400 hover:bg-error-500/10"
                                                        onClick={() => handleRemoveMember(member.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* Pending Invites */}
                            {invites.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Convites Pendentes</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {invites.map(invite => (
                                            <div
                                                key={invite.id}
                                                className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Mail className="w-5 h-5 text-yellow-500" />
                                                    <div>
                                                        <p className="font-medium">{invite.email}</p>
                                                        <p className="text-sm text-foreground-muted">
                                                            {roleLabels[invite.role]?.label} • Expira em{' '}
                                                            {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCancelInvite(invite.id)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Invite Form */}
                            {canManageMembers && members.length + invites.length < organization.max_members && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Mail className="w-5 h-5" />
                                            Convidar Membro
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleInvite} className="space-y-4">
                                            <div className="flex gap-3">
                                                <div className="flex-1">
                                                    <Input
                                                        type="email"
                                                        placeholder="email@exemplo.com"
                                                        value={inviteEmail}
                                                        onChange={(e) => setInviteEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                {canChangeRoles && (
                                                    <select
                                                        value={inviteRole}
                                                        onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                                                        className="h-11 px-3 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground"
                                                    >
                                                        <option value="member">Membro</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                )}
                                                <Button type="submit" isLoading={inviting}>
                                                    Convidar
                                                </Button>
                                            </div>

                                            {inviteError && (
                                                <p className="text-sm text-error-400">{inviteError}</p>
                                            )}

                                            {inviteSuccess && (
                                                <div className="p-3 rounded-xl bg-success-500/10 border border-success-500/20">
                                                    <p className="text-sm text-success-400 mb-2">{inviteSuccess}</p>
                                                    {inviteLink && (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={inviteLink}
                                                                readOnly
                                                                className="flex-1 px-3 py-2 rounded-lg bg-gray-800/50 text-sm text-foreground-muted"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={copyInviteLink}
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </form>
                                    </CardContent>
                                </Card>
                            )}

                            {members.length + invites.length >= organization.max_members && (
                                <Card variant="elevated">
                                    <CardContent className="py-4 text-center">
                                        <p className="text-foreground-muted mb-3">
                                            Limite de {organization.max_members} membros atingido
                                        </p>
                                        <Button variant="outline">
                                            Fazer upgrade para mais membros
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    ) : (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <Users className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                                <p className="text-foreground-muted">
                                    Nenhuma organização encontrada
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Assinatura
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                            <div>
                                <p className="font-medium">
                                    Plano {organization ? planLabels[organization.plan]?.name : 'Gratuito'}
                                </p>
                                <p className="text-sm text-foreground-muted">
                                    Até {organization?.max_members || 3} membros
                                </p>
                            </div>
                            <Button variant="outline" disabled>
                                Fazer upgrade
                            </Button>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { plan: 'free', price: 'R$ 0', features: ['3 membros', 'Veículos ilimitados', 'Leads ilimitados'] },
                                { plan: 'pro', price: 'R$ 49/mês', features: ['10 membros', 'Relatórios avançados', 'Integração WhatsApp'] },
                                { plan: 'business', price: 'R$ 99/mês', features: ['Membros ilimitados', 'Múltiplas lojas', 'API access'] },
                            ].map(tier => (
                                <div
                                    key={tier.plan}
                                    className={`p-4 rounded-xl border ${organization?.plan === tier.plan
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : 'border-gray-700'
                                        }`}
                                >
                                    <p className="font-semibold capitalize">{tier.plan}</p>
                                    <p className="text-xl font-bold mt-1">{tier.price}</p>
                                    <ul className="mt-3 space-y-1 text-sm text-foreground-muted">
                                        {tier.features.map(f => (
                                            <li key={f}>✓ {f}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
