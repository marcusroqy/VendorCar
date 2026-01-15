'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

interface InviteDetails {
    email: string;
    role: string;
    organization: {
        id: string;
        name: string;
    };
    expires_at: string;
}

export default function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [invite, setInvite] = useState<InviteDetails | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    useEffect(() => {
        async function checkAuthAndFetchInvite() {
            // Check if user is logged in
            const supabase = createClient();
            if (supabase) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setIsLoggedIn(true);
                    setCurrentUserEmail(user.email || '');
                }
            }

            // Fetch invite details
            try {
                const res = await fetch(`/api/organizations/accept?token=${token}`);
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || 'Convite inválido ou expirado');
                } else {
                    setInvite(data);
                }
            } catch {
                setError('Erro ao carregar convite');
            } finally {
                setLoading(false);
            }
        }

        checkAuthAndFetchInvite();
    }, [token]);

    const handleAccept = async () => {
        setAccepting(true);
        setError('');

        try {
            const res = await fetch('/api/organizations/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Erro ao aceitar convite');
            } else {
                setSuccess(data.message);
                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            }
        } catch {
            setError('Erro ao aceitar convite');
        } finally {
            setAccepting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (error && !invite) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card variant="glass" className="max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <XCircle className="w-16 h-16 mx-auto mb-4 text-error-500" />
                        <h2 className="text-xl font-bold mb-2">Convite Inválido</h2>
                        <p className="text-foreground-muted mb-6">{error}</p>
                        <Link href="/login">
                            <Button fullWidth>Voltar para Login</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card variant="glass" className="max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success-500" />
                        <h2 className="text-xl font-bold mb-2">Bem-vindo à equipe!</h2>
                        <p className="text-foreground-muted mb-2">{success}</p>
                        <p className="text-sm text-foreground-subtle">Redirecionando...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card variant="glass" className="max-w-md w-full">
                <CardContent className="p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Convite para Equipe</h1>
                        <p className="text-foreground-muted">
                            Você foi convidado para fazer parte de
                        </p>
                    </div>

                    {invite && (
                        <div className="mb-6">
                            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700 text-center">
                                <p className="text-2xl font-bold text-primary-400">
                                    {invite.organization.name}
                                </p>
                                <p className="text-sm text-foreground-muted mt-1">
                                    como <span className="font-medium capitalize">{invite.role}</span>
                                </p>
                            </div>

                            <div className="mt-4 text-center text-sm text-foreground-muted">
                                <p>Convite enviado para:</p>
                                <p className="font-medium text-foreground">{invite.email}</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-error-500/10 border border-error-500/20 text-error-400 text-sm">
                            {error}
                        </div>
                    )}

                    {isLoggedIn ? (
                        <div className="space-y-3">
                            {currentUserEmail.toLowerCase() === invite?.email.toLowerCase() ? (
                                <Button
                                    fullWidth
                                    onClick={handleAccept}
                                    isLoading={accepting}
                                    rightIcon={<ArrowRight className="w-5 h-5" />}
                                >
                                    Aceitar Convite
                                </Button>
                            ) : (
                                <div className="text-center">
                                    <p className="text-sm text-warning-400 mb-3">
                                        Você está logado como <strong>{currentUserEmail}</strong>,
                                        mas este convite foi enviado para <strong>{invite?.email}</strong>.
                                    </p>
                                    <p className="text-sm text-foreground-muted mb-4">
                                        Faça login com o email correto para aceitar o convite.
                                    </p>
                                    <Link href={`/login?redirectTo=/invite/${token}`}>
                                        <Button fullWidth variant="outline">
                                            Trocar de conta
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-foreground-muted text-center">
                                Faça login ou crie uma conta para aceitar o convite.
                            </p>
                            <Link href={`/login?redirectTo=/invite/${token}`}>
                                <Button fullWidth>
                                    Entrar para Aceitar
                                </Button>
                            </Link>
                            <Link href={`/register?redirectTo=/invite/${token}&email=${invite?.email}`}>
                                <Button fullWidth variant="outline">
                                    Criar Conta
                                </Button>
                            </Link>
                        </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-gray-800 text-center">
                        <Link href="/" className="text-sm text-foreground-muted hover:text-foreground">
                            Voltar para VendorCarro
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
