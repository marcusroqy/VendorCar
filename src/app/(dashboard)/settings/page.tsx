'use client';

import { useState } from 'react';
import { User, CreditCard, LogOut } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignOut = async () => {
        setIsLoading(true);
        const supabase = createClient();
        if (supabase) {
            await supabase.auth.signOut();
            router.push('/');
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold">Configurações</h1>
                <p className="text-foreground-muted">Gerencie sua conta e preferências</p>
            </div>

            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Perfil
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        label="Nome"
                        placeholder="Seu nome"
                        disabled
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="seu@email.com"
                        disabled
                    />
                    <Input
                        label="WhatsApp"
                        placeholder="(11) 99999-9999"
                        disabled
                    />
                    <p className="text-sm text-foreground-muted">
                        Edição de perfil disponível em breve.
                    </p>
                </CardContent>
            </Card>

            {/* Subscription Section */}
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
                            <p className="font-medium">Plano Gratuito</p>
                            <p className="text-sm text-foreground-muted">Até 3 veículos</p>
                        </div>
                        <Button variant="outline" disabled>
                            Fazer upgrade
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Logout */}
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
    );
}
