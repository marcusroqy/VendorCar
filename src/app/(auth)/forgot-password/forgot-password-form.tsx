'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

export function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const supabase = createClient();
            if (!supabase) {
                setError('Erro de configuração');
                setIsLoading(false);
                return;
            }

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?redirectTo=/update-password`,
            });

            if (error) {
                setError(error.message);
            } else {
                setIsSuccess(true);
            }
        } catch {
            setError('Erro ao enviar email. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <Card variant="glass" className="animate-fade-in-up">
                <CardContent className="pt-8 pb-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success-500/10 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-success-500" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Email enviado!</h2>
                    <p className="text-foreground-muted mb-6">
                        Verifique sua caixa de entrada (e spam) para redefinir sua senha.
                    </p>
                    <Link href="/login">
                        <Button variant="outline" fullWidth>
                            Voltar para o Login
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card variant="glass" className="animate-fade-in-up">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
                <CardDescription>
                    Digite seu email para receber um link de redefinição
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="email"
                        label="Email cadastrado"
                        placeholder="nome@empresa.com"
                        leftIcon={<Mail className="w-5 h-5" />}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    {error && (
                        <p className="text-sm text-error-500">{error}</p>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        isLoading={isLoading}
                        disabled={!email || isLoading}
                    >
                        Enviar Link de Recuperação
                    </Button>

                    <div className="text-center pt-2">
                        <Link href="/login" className="text-sm text-foreground-muted hover:text-foreground inline-flex items-center gap-1 transition-colors">
                            <ArrowLeft className="w-3 h-3" /> Voltar para o Login
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
