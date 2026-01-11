'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Car, Mail, User, Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

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

export default function RegisterPage() {
    const [step, setStep] = useState<'form' | 'sent'>('form');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleSignup = async () => {
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
                    redirectTo: `${window.location.origin}/auth/callback?type=signup`,
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

        try {
            const supabase = createClient();

            if (!supabase) {
                setError('Supabase não configurado');
                setIsLoading(false);
                return;
            }

            // Sign up with magic link
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
                    data: {
                        name,
                        phone,
                    },
                },
            });

            if (error) {
                setError(error.message);
            } else {
                setStep('sent');
            }
        } catch {
            setError('Erro ao criar conta. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 'sent') {
        return (
            <div className="animate-fade-in-up">
                <div className="text-center mb-6">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                            <Car className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl">VendorCarro</span>
                    </Link>
                </div>

                <Card variant="glass">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success-500/10 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-success-500" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Verifique seu email</h2>
                        <p className="text-foreground-muted mb-6">
                            Enviamos um link de confirmação para<br />
                            <span className="text-foreground font-medium">{email}</span>
                        </p>
                        <p className="text-sm text-foreground-subtle">
                            Clique no link para ativar sua conta e começar a usar o VendorCarro.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Logo */}
            <div className="text-center">
                <Link href="/" className="inline-flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        <Car className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-xl">VendorCarro</span>
                </Link>
            </div>

            <Card variant="glass">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Criar conta grátis</CardTitle>
                    <CardDescription>
                        Comece a gerenciar seus veículos em minutos
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Google Signup Button */}
                    <Button
                        type="button"
                        variant="secondary"
                        fullWidth
                        leftIcon={<GoogleIcon className="w-5 h-5" />}
                        onClick={handleGoogleSignup}
                        isLoading={isGoogleLoading}
                        disabled={isGoogleLoading}
                    >
                        Cadastrar com Google
                    </Button>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-gray-900 px-2 text-foreground-muted">ou</span>
                        </div>
                    </div>

                    {/* Email Signup Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="text"
                            label="Seu nome"
                            placeholder="João Silva"
                            leftIcon={<User className="w-5 h-5" />}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <Input
                            type="email"
                            label="Email"
                            placeholder="seu@email.com"
                            leftIcon={<Mail className="w-5 h-5" />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            type="tel"
                            label="WhatsApp"
                            placeholder="(11) 99999-9999"
                            leftIcon={<Phone className="w-5 h-5" />}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            helperText="Usado para receber contatos de clientes"
                            required
                        />

                        {error && (
                            <p className="text-sm text-error-500">{error}</p>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="outline"
                            isLoading={isLoading}
                            disabled={!email || !name || !phone || isLoading}
                        >
                            Criar conta com email
                        </Button>
                    </form>

                    <p className="text-xs text-foreground-subtle text-center">
                        Ao criar sua conta, você concorda com nossos{' '}
                        <a href="#" className="text-primary-400 hover:underline">Termos de Uso</a>
                        {' '}e{' '}
                        <a href="#" className="text-primary-400 hover:underline">Política de Privacidade</a>
                    </p>
                </CardContent>

                <CardFooter className="justify-center">
                    <p className="text-sm text-foreground-muted">
                        Já tem conta?{' '}
                        <Link href="/login" className="text-primary-400 hover:underline">
                            Entrar
                        </Link>
                    </p>
                </CardFooter>
            </Card>

            <div className="text-center">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para o início
                </Link>
            </div>
        </div>
    );
}
