'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { User, CreditCard, LogOut, Users, Mail, Crown, Shield, UserCheck, Copy, X, Loader2, Trash2, Save, Check, Plus, Clock, AlertCircle, Zap, Edit2, Car, Calculator, Briefcase, Camera } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Organization, OrganizationMember, OrganizationInvite, OrganizationRole } from '@/lib/types';

type TabType = 'profile' | 'team' | 'subscription';

const roleLabels: Record<OrganizationRole, { label: string; icon: typeof Crown; color: string }> = {
    owner: { label: 'Dono', icon: Crown, color: 'amber' },
    admin: { label: 'Administrador', icon: Shield, color: 'purple' },
    vendedor: { label: 'Vendedor', icon: Car, color: 'blue' },
    rh: { label: 'RH', icon: Briefcase, color: 'green' },
    contabilidade: { label: 'Contabilidade', icon: Calculator, color: 'cyan' },
    member: { label: 'Membro', icon: UserCheck, color: 'gray' },
};

const planLabels: Record<string, { name: string; members: number }> = {
    free: { name: 'Gratuito', members: 3 },
    pro: { name: 'Pro', members: 10 },
    business: { name: 'Business', members: 999 },
};

// Inner component that uses useSearchParams
function SettingsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>(() => {
        // Initialize from localStorage on client
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('settings_tab') as TabType;
            if (saved && ['profile', 'team', 'subscription'].includes(saved)) {
                return saved;
            }
        }
        return 'profile';
    });
    const [isLoading, setIsLoading] = useState(false);

    // Sync tab with URL on mount
    useEffect(() => {
        const tabFromUrl = searchParams.get('tab') as TabType;
        if (tabFromUrl && ['profile', 'team', 'subscription'].includes(tabFromUrl)) {
            setActiveTab(tabFromUrl);
            localStorage.setItem('settings_tab', tabFromUrl);
        }
    }, [searchParams]);

    // Update localStorage and URL when tab changes
    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        localStorage.setItem('settings_tab', tab);
        window.history.replaceState(null, '', `/settings?tab=${tab}`);
    };

    // Organization state
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [invites, setInvites] = useState<OrganizationInvite[]>([]);
    const [myRole, setMyRole] = useState<OrganizationRole>('member');
    const [loadingOrg, setLoadingOrg] = useState(true);

    // Invite state
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<OrganizationRole>('vendedor');
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

    // Member editing state
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [editingMemberName, setEditingMemberName] = useState('');
    const [savingMember, setSavingMember] = useState(false);

    // Avatar/Logo state
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Fetch user profile
    useEffect(() => {
        async function fetchProfile() {
            const supabase = createClient();
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || '');
                setUserId(user.id);

                // Fetch profile from user_profiles table
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setProfileName(profile.name || '');
                    setProfilePhone(profile.phone || '');
                    setAvatarUrl(profile.avatar_url || null);
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

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        setUploadingAvatar(true);
        const supabase = createClient();
        if (!supabase) {
            setUploadingAvatar(false);
            return;
        }

        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/${Date.now()}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            setUploadingAvatar(false);
            return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Update profile
        await supabase
            .from('user_profiles')
            .upsert({
                id: userId,
                avatar_url: publicUrl,
                updated_at: new Date().toISOString(),
            });

        setAvatarUrl(publicUrl);
        setUploadingAvatar(false);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !organization) return;

        setUploadingLogo(true);
        const supabase = createClient();
        if (!supabase) {
            setUploadingLogo(false);
            return;
        }

        const fileExt = file.name.split('.').pop();
        const filePath = `${organization.id}/${Date.now()}.${fileExt}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            console.error('Logo upload error:', uploadError);
            setUploadingLogo(false);
            return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('logos')
            .getPublicUrl(filePath);

        // Update organization
        await supabase
            .from('organizations')
            .update({ logo_url: publicUrl })
            .eq('id', organization.id);

        setLogoUrl(publicUrl);
        setOrganization({ ...organization, logo_url: publicUrl });
        setUploadingLogo(false);
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

    const handleEditMember = (member: OrganizationMember) => {
        setEditingMemberId(member.id);
        setEditingMemberName(member.display_name || member.user?.email?.split('@')[0] || '');
    };

    const handleSaveMemberName = async () => {
        if (!editingMemberId) return;
        setSavingMember(true);

        const supabase = createClient();
        if (!supabase) {
            setSavingMember(false);
            return;
        }

        const { error } = await supabase
            .from('organization_members')
            .update({ display_name: editingMemberName })
            .eq('id', editingMemberId);

        if (!error) {
            setMembers(prev => prev.map(m =>
                m.id === editingMemberId
                    ? { ...m, display_name: editingMemberName }
                    : m
            ));
            setEditingMemberId(null);
            setEditingMemberName('');
        }
        setSavingMember(false);
    };

    const handleCancelEdit = () => {
        setEditingMemberId(null);
        setEditingMemberName('');
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
                        onClick={() => handleTabChange(tab.id)}
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
                                    {/* Avatar Upload */}
                                    <div className="flex items-center gap-6 pb-4 border-b border-gray-700/50">
                                        <div className="relative group">
                                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center overflow-hidden shadow-lg">
                                                {avatarUrl ? (
                                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl font-bold text-white">
                                                        {profileName?.charAt(0)?.toUpperCase() || userEmail?.charAt(0)?.toUpperCase() || '?'}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => avatarInputRef.current?.click()}
                                                disabled={uploadingAvatar}
                                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                                            >
                                                {uploadingAvatar ? (
                                                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                                                ) : (
                                                    <Camera className="w-6 h-6 text-white" />
                                                )}
                                            </button>
                                            <input
                                                ref={avatarInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">Foto do Perfil</p>
                                            <p className="text-sm text-foreground-muted">Clique para alterar sua foto</p>
                                            <p className="text-xs text-foreground-muted mt-1">JPG, PNG ou GIF. Max 2MB</p>
                                        </div>
                                    </div>

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
                <div className="space-y-6">
                    {loadingOrg ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                        </div>
                    ) : organization ? (
                        <>
                            {/* Organization Header - Premium Design */}
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/80 via-gray-900/90 to-gray-800/80 border border-gray-700/50">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-secondary-500/10" />
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl" />

                                <div className="relative p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Logo Upload */}
                                            <div className="relative group cursor-pointer" onClick={() => canManageMembers && logoInputRef.current?.click()}>
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/25 overflow-hidden">
                                                    {organization.logo_url || logoUrl ? (
                                                        <img src={organization.logo_url || logoUrl || ''} alt="Logo" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Users className="w-7 h-7 text-white" />
                                                    )}
                                                </div>
                                                {canManageMembers && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                                        {uploadingLogo ? (
                                                            <Loader2 className="w-5 h-5 animate-spin text-white" />
                                                        ) : (
                                                            <Camera className="w-5 h-5 text-white" />
                                                        )}
                                                    </div>
                                                )}
                                                <input
                                                    ref={logoInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoUpload}
                                                    className="hidden"
                                                />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-foreground">{organization.name}</h2>
                                                <p className="text-sm text-foreground-muted">
                                                    {canManageMembers ? 'Clique na logo para alterar' : 'Gerencie sua equipe e permissões'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${organization.plan === 'business'
                                                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30'
                                                : organization.plan === 'pro'
                                                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border border-purple-500/30'
                                                    : 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                                                }`}>
                                                {planLabels[organization.plan]?.name || 'Free'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="mt-6 flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center">
                                                <Users className="w-4 h-4 text-primary-400" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold">{members.length}</p>
                                                <p className="text-xs text-foreground-muted">Membros</p>
                                            </div>
                                        </div>

                                        <div className="w-px h-10 bg-gray-700" />

                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center">
                                                <Mail className="w-4 h-4 text-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold">{invites.length}</p>
                                                <p className="text-xs text-foreground-muted">Pendentes</p>
                                            </div>
                                        </div>

                                        <div className="w-px h-10 bg-gray-700" />

                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-700/50 rounded-full h-2 w-24 overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${(members.length / organization.max_members) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-foreground-muted">
                                                {members.length}/{organization.max_members}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Team Members Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Users className="w-5 h-5 text-primary-400" />
                                        Membros da Equipe
                                    </h3>
                                </div>

                                <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-700/50">
                                                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-muted uppercase tracking-wider">Membro</th>
                                                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-muted uppercase tracking-wider">Função</th>
                                                <th className="text-left py-3 px-4 text-xs font-medium text-foreground-muted uppercase tracking-wider">Desde</th>
                                                <th className="text-right py-3 px-4 text-xs font-medium text-foreground-muted uppercase tracking-wider">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700/30">
                                            {members.map((member, index) => {
                                                const RoleIcon = roleLabels[member.role]?.icon || UserCheck;
                                                const colors = ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-orange-500 to-red-500', 'from-green-500 to-teal-500'];
                                                return (
                                                    <tr key={member.id} className="group hover:bg-gray-700/20 transition-colors">
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center text-white font-semibold shadow-lg`}>
                                                                    {(member.display_name || member.user?.email || '?').charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="flex-1">
                                                                    {editingMemberId === member.id ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="text"
                                                                                value={editingMemberName}
                                                                                onChange={(e) => setEditingMemberName(e.target.value)}
                                                                                className="px-2 py-1 bg-gray-800 border border-gray-600 rounded-lg text-sm text-foreground w-40 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                                                                                autoFocus
                                                                            />
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={handleSaveMemberName}
                                                                                isLoading={savingMember}
                                                                                className="text-success-400 hover:bg-success-500/10 p-1"
                                                                            >
                                                                                <Check className="w-4 h-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={handleCancelEdit}
                                                                                className="text-gray-400 hover:bg-gray-500/10 p-1"
                                                                            >
                                                                                <X className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="font-medium text-foreground">
                                                                                {member.display_name || member.user?.email?.split('@')[0] || 'Usuário'}
                                                                            </p>
                                                                            <button
                                                                                onClick={() => handleEditMember(member)}
                                                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-primary-400"
                                                                            >
                                                                                <Edit2 className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                    <p className="text-sm text-foreground-muted">{member.user?.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${roleLabels[member.role]?.color === 'amber'
                                                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                                : roleLabels[member.role]?.color === 'purple'
                                                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                                    : roleLabels[member.role]?.color === 'blue'
                                                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                                        : roleLabels[member.role]?.color === 'green'
                                                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                                            : roleLabels[member.role]?.color === 'cyan'
                                                                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                                                                : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                                }`}>
                                                                <RoleIcon className="w-3.5 h-3.5" />
                                                                {roleLabels[member.role]?.label}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="text-sm text-foreground-muted">
                                                                {new Date(member.joined_at).toLocaleDateString('pt-BR', {
                                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                                })}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            {canManageMembers && member.role !== 'owner' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-error-400 hover:bg-error-500/10"
                                                                    onClick={() => handleRemoveMember(member.id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pending Invites Section */}
                            {invites.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-yellow-400" />
                                        Convites Pendentes
                                        <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium">
                                            {invites.length}
                                        </span>
                                    </h3>

                                    <div className="space-y-2">
                                        {invites.map(invite => (
                                            <div
                                                key={invite.id}
                                                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-yellow-500/5 to-orange-500/5 border border-yellow-500/20 group hover:border-yellow-500/40 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                                                        <Mail className="w-5 h-5 text-yellow-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{invite.email}</p>
                                                        <div className="flex items-center gap-2 text-sm text-foreground-muted">
                                                            <span className="px-2 py-0.5 rounded bg-gray-700/50 text-xs">
                                                                {roleLabels[invite.role]?.label}
                                                            </span>
                                                            <span>•</span>
                                                            <span>Expira {new Date(invite.expires_at).toLocaleDateString('pt-BR')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleCancelInvite(invite.id)}
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span className="ml-1">Cancelar</span>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Invite Form - Modern Design */}
                            {canManageMembers && members.length + invites.length < organization.max_members && (
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500/5 via-gray-800/50 to-secondary-500/5 border border-primary-500/20">
                                    <div className="absolute top-0 left-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl" />
                                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary-500/10 rounded-full blur-2xl" />

                                    <div className="relative p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                                                <UserCheck className="w-5 h-5 text-primary-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">Convidar Novo Membro</h3>
                                                <p className="text-sm text-foreground-muted">Envie um convite por email para adicionar à equipe</p>
                                            </div>
                                        </div>

                                        <form onSubmit={handleInvite} className="space-y-4">
                                            <div className="flex gap-3">
                                                <div className="flex-1 relative">
                                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                                                    <input
                                                        type="email"
                                                        placeholder="email@exemplo.com"
                                                        value={inviteEmail}
                                                        onChange={(e) => setInviteEmail(e.target.value)}
                                                        required
                                                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-gray-800/50 border border-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-foreground placeholder-foreground-muted transition-all"
                                                    />
                                                </div>
                                                {canChangeRoles && (
                                                    <select
                                                        value={inviteRole}
                                                        onChange={(e) => setInviteRole(e.target.value as OrganizationRole)}
                                                        className="h-12 px-4 rounded-xl bg-gray-800/50 border border-gray-700 text-foreground cursor-pointer hover:border-gray-600 transition-colors min-w-[180px]"
                                                    >
                                                        <option value="vendedor">🚗 Vendedor</option>
                                                        <option value="admin">🛡️ Administrador</option>
                                                        <option value="rh">💼 RH</option>
                                                        <option value="contabilidade">📊 Contabilidade</option>
                                                        <option value="member">👤 Membro</option>
                                                    </select>
                                                )}
                                                <Button type="submit" isLoading={inviting} className="h-12 px-6">
                                                    <Plus className="w-5 h-5 mr-2" />
                                                    Convidar
                                                </Button>
                                            </div>

                                            {inviteError && (
                                                <div className="flex items-center gap-2 p-3 rounded-xl bg-error-500/10 border border-error-500/20">
                                                    <AlertCircle className="w-5 h-5 text-error-400" />
                                                    <p className="text-sm text-error-400">{inviteError}</p>
                                                </div>
                                            )}

                                            {inviteSuccess && (
                                                <div className="p-4 rounded-xl bg-success-500/10 border border-success-500/20 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Check className="w-5 h-5 text-success-400" />
                                                        <p className="text-sm font-medium text-success-400">{inviteSuccess}</p>
                                                    </div>
                                                    {inviteLink && (
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={inviteLink}
                                                                readOnly
                                                                className="flex-1 px-4 py-2 rounded-lg bg-gray-800/50 text-sm text-foreground-muted font-mono"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={copyInviteLink}
                                                                className="gap-2"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                                Copiar
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Upgrade CTA if limit reached */}
                            {members.length + invites.length >= organization.max_members && (
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                                <Zap className="w-6 h-6 text-amber-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">Limite de membros atingido</h3>
                                                <p className="text-sm text-foreground-muted">
                                                    Faça upgrade para adicionar mais membros à sua equipe
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleTabChange('subscription')}
                                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                                        >
                                            Ver Planos
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-800/50 flex items-center justify-center">
                                <Users className="w-8 h-8 text-foreground-muted" />
                            </div>
                            <p className="text-foreground-muted">Nenhuma organização encontrada</p>
                        </div>
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
        </div >
    );
}

// Wrapper with Suspense for useSearchParams
export default function SettingsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        }>
            <SettingsContent />
        </Suspense>
    );
}
