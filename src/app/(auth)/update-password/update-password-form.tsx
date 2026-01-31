'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';

export function UpdatePasswordForm() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            setIsLoading(false);
            return;
        }

        try {
            const supabase = createClient();

            if (!supabase) {
                setError('Erro de configuração');
                setIsLoading(false);
                return;
            }

            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                setError(error.message);
            } else {
                setIsSuccess(true);
                // Optional: Redirect after delay
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            }
        } catch {
            setError('Erro ao atualizar senha');
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
                    <h2 className="text-xl font-semibold mb-2">Senha definida com sucesso!</h2>
                    <p className="text-foreground-muted mb-6">
                        Sua conta está pronta. Redirecionando para o painel...
                    </p>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        fullWidth
                    >
                        Acessar Painel
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card variant="glass" className="animate-fade-in-up">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Definir Senha</CardTitle>
                <CardDescription>
                    Crie uma senha segura para acessar sua conta
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            label="Nova Senha"
                            placeholder="Mínimo 6 caracteres"
                            leftIcon={<Lock className="w-5 h-5" />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[34px] text-gray-500 hover:text-gray-300"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    <Input
                        type={showPassword ? 'text' : 'password'}
                        label="Confirmar Senha"
                        placeholder="Repita a senha"
                        leftIcon={<Lock className="w-5 h-5" />}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    {error && (
                        <p className="text-sm text-error-500">{error}</p>
                    )}

                    <ul className="text-xs text-foreground-muted space-y-1 list-disc list-inside pl-1">
                        <li>Mínimo de 6 caracteres</li>
                        <li>Recomendamos usar letras e números</li>
                    </ul>

                    <Button
                        type="submit"
                        fullWidth
                        isLoading={isLoading}
                        disabled={!password || !confirmPassword || isLoading}
                    >
                        Criar Senha e Acessar
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
