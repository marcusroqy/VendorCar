'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Car, Mail, User, Phone, ArrowLeft, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { BotProtection } from '@/components/auth/BotProtection';
import { formatPhone } from '@/lib/utils/format';

// --- Validation Schema ---
const registerSchema = z.object({
    name: z.string().min(2, 'Nome muito curto (mínimo 2 letras)'),
    email: z.string().email('Digite um email válido'),
    phone: z.string().min(14, 'Telefone inválido').refine((val) => {
        // Remove masked chars and check length (10 or 11 digits)
        const digits = val.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 11;
    }, 'Número de telefone incompleto'),
    company_role: z.string().max(0, 'Bot detected'), // Honeypot trap
});

type RegisterFormData = z.infer<typeof registerSchema>;

// --- Google Icon ---
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
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            company_role: '' // Honeypot start empty
        }
    });

    // Real-time phone masking
    const currentPhone = watch('phone');

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const formatted = formatPhone(rawValue);
        setValue('phone', formatted, { shouldValidate: true });
    };

    const onSubmit = async (data: RegisterFormData) => {
        setGeneralError('');

        // Honeypot check (redundant with Zod but explicitly safe)
        if (data.company_role) {
            console.warn('Bot detected via honeypot');
            return;
        }

        try {
            const supabase = createClient();
            if (!supabase) throw new Error('Serviço indisponível');

            // Sign up with magic link
            const { error: authError } = await supabase.auth.signInWithOtp({
                email: data.email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent('/update-password')}`,
                    data: {
                        full_name: data.name,
                        phone: data.phone,
                    }
                },
            });

            if (authError) {
                // Safely extract error message
                let errorMsg = authError.message;
                if (!errorMsg || errorMsg === '{}') {
                    errorMsg = typeof authError === 'object' ? JSON.stringify(authError) : String(authError);
                    if (errorMsg === '{}') errorMsg = "Erro desconhecido. Verifique se o email é válido.";
                }

                // Specific Resend/Supabase hints
                if (errorMsg.includes("rate limit")) errorMsg = "Muitas tentativas. Aguarde um pouco.";
                if (errorMsg.includes("Signups not allowed")) errorMsg = "Cadastros desativados temporariamente.";

                setGeneralError(errorMsg);
                console.error("Registration Error:", authError);
            } else {
                setStep('sent');
            }
        } catch (err: any) {
            console.error("Unexpected Error:", err);
            setGeneralError(err.message || 'Erro ao criar conta. Tente novamente.');
        }
    };

    const handleGoogleSignup = async () => {
        setIsGoogleLoading(true);
        setGeneralError('');

        try {
            const supabase = createClient();
            if (!supabase) throw new Error('Serviço indisponível');

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?type=signup`,
                },
            });

            if (error) throw error;
        } catch (err: any) {
            setGeneralError(err.message || 'Erro ao conectar com Google');
            setIsGoogleLoading(false);
        }
    };

    if (step === 'sent') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md animate-fade-in-up">
                    <div className="text-center mb-6">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center glow-primary">
                                <Car className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">VendorCarro</span>
                        </Link>
                    </div>

                    <Card variant="glass" className="border-primary-500/20 shadow-2xl shadow-primary-500/10">
                        <CardContent className="pt-8 pb-8 text-center space-y-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-success-500/20 blur-xl rounded-full transform scale-150 opacity-50"></div>
                                <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-success-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-success-500/20">
                                    <CheckCircle className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-success-400 to-emerald-400">
                                    Verifique seu email
                                </h2>
                                <p className="text-foreground-muted text-lg">
                                    Enviamos um link mágico para<br />
                                    <span className="text-foreground font-semibold bg-white/5 py-1 px-3 rounded-lg mt-1 inline-block">
                                        {watch('email')}
                                    </span>
                                </p>
                            </div>

                            <p className="text-sm text-foreground-subtle max-w-xs mx-auto">
                                Clique no link para ativar sua conta segura e acessar o painel administrativo.
                            </p>

                            <Button
                                variant="outline"
                                onClick={() => setStep('form')}
                                className="mt-4"
                            >
                                Voltar / Corrigir email
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-secondary-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md space-y-8 animate-fade-in-up relative z-10">
                {/* Logo */}
                <div className="text-center space-y-2">
                    <Link href="/" className="inline-flex items-center gap-3 mb-2 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
                            <Car className="w-7 h-7 text-white" />
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-white">VendorCarro</span>
                    </Link>
                </div>

                <Card variant="glass" className="border-white/10 shadow-2xl backdrop-blur-md">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Criar conta profissional
                        </CardTitle>
                        <CardDescription className="text-base text-gray-400">
                            Segurança de nível empresarial para sua loja
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Google Button */}
                        <Button
                            type="button"
                            variant="secondary"
                            fullWidth
                            leftIcon={isGoogleLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <GoogleIcon className="w-5 h-5" />}
                            onClick={handleGoogleSignup}
                            isLoading={isGoogleLoading}
                            disabled={isGoogleLoading || isSubmitting}
                            className="h-12 bg-white text-gray-900 hover:bg-gray-100 border-0 font-medium transition-transform active:scale-[0.98]"
                        >
                            {isGoogleLoading ? 'Conectando...' : 'Cadastrar com Google'}
                        </Button>

                        {/* Divider */}
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0a0a0a] px-3 text-gray-500 font-medium">ou via email</span>
                            </div>
                        </div>

                        {/* Register Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Honeypot Field */}
                            <BotProtection {...register('company_role')} />

                            <div className="space-y-1">
                                <Input
                                    {...register('name')}
                                    label="Seu nome completo"
                                    placeholder="Ex: João Silva"
                                    leftIcon={<User className="w-5 h-5" />}
                                    error={errors.name?.message}
                                    className="bg-gray-900/50 border-gray-800 focus:border-primary-500/50 h-11"
                                />
                            </div>

                            <div className="space-y-1">
                                <Input
                                    {...register('email')}
                                    type="email"
                                    label="Email corporativo"
                                    placeholder="seu@loja.com"
                                    leftIcon={<Mail className="w-5 h-5" />}
                                    error={errors.email?.message}
                                    className="bg-gray-900/50 border-gray-800 focus:border-primary-500/50 h-11"
                                />
                            </div>

                            <div className="space-y-1">
                                <Input
                                    {...register('phone')}
                                    onChange={handlePhoneChange}
                                    label="WhatsApp / Celular"
                                    placeholder="(11) 99999-9999"
                                    leftIcon={<Phone className="w-5 h-5" />}
                                    error={errors.phone?.message}
                                    maxLength={15} // (11) 99999-9999
                                    className="bg-gray-900/50 border-gray-800 focus:border-primary-500/50 h-11"
                                />
                                <p className="text-xs text-gray-500 ml-1">Usaremos para notificações de leads (opcional)</p>
                            </div>

                            {generalError && (
                                <div className="p-3 rounded-lg bg-error-500/10 border border-error-500/20 text-error-400 text-sm flex items-center gap-2 animate-shake">
                                    <div className="w-1.5 h-1.5 rounded-full bg-error-400" />
                                    {generalError}
                                </div>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="primary"
                                isLoading={isSubmitting}
                                disabled={isSubmitting || isGoogleLoading}
                                className="h-12 text-base font-semibold shadow-lg shadow-primary-500/25 transition-all hover:shadow-primary-500/40"
                                leftIcon={!isSubmitting && <ShieldCheck className="w-5 h-5 opacity-70" />}
                            >
                                {isSubmitting ? 'Verificando dados...' : 'Criar Conta Segura'}
                            </Button>

                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                <ShieldCheck className="w-3 h-3 text-green-500" />
                                <span>Seus dados protegidos com criptografia de ponta a ponta</span>
                            </div>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 border-t border-white/5 pt-6 bg-white/5">
                        <p className="text-sm text-gray-400 text-center">
                            Já possui cadastro?{' '}
                            <Link href="/login" className="text-primary-400 font-medium hover:text-primary-300 transition-colors">
                                Fazer Login
                            </Link>
                        </p>

                        <p className="text-[10px] text-gray-600 text-center max-w-[280px] mx-auto leading-relaxed">
                            Ao se cadastrar, você concorda com nossos{' '}
                            <Link href="#" className="underline hover:text-gray-400">Termos de Uso</Link>
                            {' '}e confirma que leu nossa{' '}
                            <Link href="#" className="underline hover:text-gray-400">Política de Privacidade</Link>.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
