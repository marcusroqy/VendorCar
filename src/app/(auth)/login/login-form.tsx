'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Car, Mail, CheckCircle, ShieldCheck, BarChart3, Lock, Fingerprint } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { m } from 'framer-motion';

// Google Icon Component
function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

// Visual Widget Component (Left Side)
function FeatureWidget({
    icon: Icon,
    label,
    value,
    delay = 0,
    className
}: {
    icon: any;
    label: string;
    value: string;
    delay?: number;
    className?: string;
}) {
    return (
        <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6 }}
            className={`absolute p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl ${className}`}
        >
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary-500/20 text-primary-200">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-white/80">{label}</span>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        </m.div>
    );
}

type LoginMethod = 'magic_link' | 'password';

export function LoginForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const redirectTo = searchParams.get('redirectTo') || '/dashboard';

    const [loginMethod, setLoginMethod] = useState<LoginMethod>('password'); // Default to password as users just created one
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        setError('');

        try {
            const supabase = createClient();
            if (!supabase) {
                setError('Supabase não configurado');
                setIsGoogleLoading(false);
                return;
            }
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
                },
            });
            if (error) {
                setError(error.message);
                setIsGoogleLoading(false);
            }
        } catch {
            setError('Erro ao conectar com Google');
            setIsGoogleLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const supabase = createClient();
        if (!supabase) {
            setError('Supabase não configurado');
            setIsLoading(false);
            return;
        }

        try {
            if (loginMethod === 'magic_link') {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
                    },
                });
                if (error) {
                    setError(error.message);
                } else {
                    setIsSent(true);
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    setError('Email ou senha incorretos.');
                } else {
                    // Success - Redirect handled by middleware/auth state usually, but let's push just in case
                    router.push(redirectTo);
                }
            }
        } catch {
            setError('Erro inesperado. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-fade-in-up">
                    <div className="bg-card/50 backdrop-blur-xl border border-border p-8 rounded-2xl text-center shadow-2xl">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success-500/10 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-success-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Verifique seu email</h2>
                        <p className="text-foreground-muted mb-6">
                            Enviamos um link de acesso para<br />
                            <span className="text-foreground font-medium">{email}</span>
                        </p>
                        <p className="text-sm text-foreground-subtle">
                            Não recebeu? Verifique a pasta de spam ou{' '}
                            <button
                                onClick={() => setIsSent(false)}
                                className="text-primary-400 hover:underline font-medium"
                            >
                                tente novamente
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex overflow-hidden bg-background">
            {/* LEFT SIDE: Visual Showcase (Hidden on Mobile) */}
            <div className="hidden lg:flex w-[55%] relative flex-col justify-between p-12 bg-[#050510] overflow-hidden">
                {/* Background ambient effects */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-900/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-900/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />

                {/* Content */}
                <div className="relative z-10">
                    <m.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm">
                            <span className="flex h-2 w-2 rounded-full bg-success-500"></span>
                            <span className="text-xs font-medium text-white/80 tracking-wide uppercase">System Operational</span>
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                            Gestão automotiva <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                                inteligente e premium.
                            </span>
                        </h1>
                        <p className="text-lg text-gray-400 max-w-md leading-relaxed">
                            Controle total do seu estoque, vendas e clientes em uma única plataforma projetada para performance.
                        </p>
                    </m.div>
                </div>

                {/* Floating Widgets Visualization */}
                <div className="relative z-10 flex-1 grid place-items-center">
                    <div className="relative w-full max-w-lg aspect-square">
                        {/* Center Abstract */}
                        <m.div
                            animate={{
                                rotate: 360,
                            }}
                            transition={{
                                duration: 60,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="absolute inset-0 rounded-full border border-white/5 border-dashed"
                        />

                        {/* Widgets */}
                        <FeatureWidget
                            icon={Car}
                            label="Veículos em Estoque"
                            value="128"
                            className="top-1/4 left-0 w-48"
                            delay={0.2}
                        />
                        <FeatureWidget
                            icon={BarChart3}
                            label="Vendas Mensais"
                            value="R$ 450k"
                            className="top-1/3 right-0 w-52"
                            delay={0.4}
                        />
                        <FeatureWidget
                            icon={ShieldCheck}
                            label="Segurança"
                            value="Blindada"
                            className="bottom-1/4 left-10 w-44"
                            delay={0.6}
                        />

                        {/* Central Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
                    </div>
                </div>

                <div className="relative z-10 flex justify-between items-end text-xs text-gray-500 font-mono">
                    <div>
                        <p>© 2024 VendorCarro Inc.</p>
                        <p>v2.4.0 (Stable)</p>
                    </div>
                    <div>
                        <p>Secure Connection</p>
                        <p>256-bit Encryption</p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Authentication Form */}
            <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-8 bg-background relative">
                <div className="absolute top-8 right-8">
                    <Link href="/" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
                        Voltar ao site
                    </Link>
                </div>

                <div className="w-full max-w-sm space-y-10">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20">
                            <Car className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Bem-vindo de volta</h2>
                        <p className="text-foreground-muted">Entre com sua conta para continuar</p>
                    </div>

                    <div className="space-y-6">
                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            className="bg-background-elevated hover:bg-background-muted h-12 border-border"
                            leftIcon={<GoogleIcon className="w-5 h-5" />}
                            onClick={handleGoogleLogin}
                            isLoading={isGoogleLoading}
                            disabled={isGoogleLoading}
                        >
                            Continuar com Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-4 text-foreground-muted tracking-widest">ou entrar com</span>
                            </div>
                        </div>

                        {/* Login Method Toggle */}
                        <div className="flex p-1 bg-background-elevated rounded-lg border border-border">
                            <button
                                type="button"
                                onClick={() => setLoginMethod('password')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'password'
                                        ? 'bg-background shadow-sm text-foreground'
                                        : 'text-foreground-muted hover:text-foreground'
                                    }`}
                            >
                                <Lock className="w-4 h-4" />
                                Senha
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginMethod('magic_link')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === 'magic_link'
                                        ? 'bg-background shadow-sm text-foreground'
                                        : 'text-foreground-muted hover:text-foreground'
                                    }`}
                            >
                                <Fingerprint className="w-4 h-4" />
                                Magic Link
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                type="email"
                                label="Email Corporativo"
                                placeholder="nome@empresa.com"
                                leftIcon={<Mail className="w-5 h-5 text-gray-500" />}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                error={error && loginMethod === 'magic_link' ? error : ''}
                                required
                                className="h-12 bg-background-elevated border-border focus:border-primary-500 transition-all font-medium"
                            />

                            {loginMethod === 'password' && (
                                <m.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <Input
                                        type="password"
                                        label="Sua Senha"
                                        placeholder="••••••••"
                                        leftIcon={<Lock className="w-5 h-5 text-gray-500" />}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        error={error && loginMethod === 'password' ? error : ''}
                                        required
                                        className="h-12 bg-background-elevated border-border focus:border-primary-500 transition-all font-medium"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <Link href="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">
                                            Esqueceu a senha?
                                        </Link>
                                    </div>
                                </m.div>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="primary"
                                className="h-12 font-semibold shadow-lg shadow-primary-500/20 mt-2"
                                isLoading={isLoading}
                                disabled={!email || (loginMethod === 'password' && !password) || isLoading}
                            >
                                {loginMethod === 'password' ? 'Entrar' : 'Enviar Link de Acesso'}
                            </Button>
                        </form>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-foreground-muted">Não tem uma conta? </span>
                        <Link href="/register" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                            Criar agora
                        </Link>
                    </div>

                    <div className="pt-8 border-t border-border text-center">
                        <p className="text-xs text-foreground-subtle">
                            Protegido por reCAPTCHA e sujeito à Política de Privacidade e Termos de Serviço do Google.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
