"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { domAnimation, LazyMotion, m } from "framer-motion";
import { Check, ChevronRight, Rocket, Star, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function OnboardingPage() {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const { width, height } = useWindowSize(); // For confetti

    const [supabase] = useState(() => createClient()); // Initialize once

    // Fetch user name on mount
    useEffect(() => {
        const getUser = async () => {
            if (!supabase) return;

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Try from metadata or email
                const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "Vendedor";
                setUserName(name);
            }
        };
        getUser();
    }, [supabase]);

    const handleFinish = async () => {
        setLoading(true);
        if (!supabase) {
            setLoading(false);
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Update profile flag (use upsert to handle missing rows)
            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    id: user.id,
                    onboarding_completed: true,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (error) {
                console.error("Erro ao finalizar onboarding:", error);
                alert(`Erro ao salvar dados: ${error.message}`);
                setLoading(false);
                return;
            }
        }

        // Celebrate + Redirect
        // Force hard reload to ensure middleware re-evaluates
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1500);
    };

    const handleSetPassword = async () => {
        if (password.length < 6) {
            alert("A senha deve ter pelo menos 6 caracteres");
            return;
        }
        setLoading(true);

        try {
            // Import dynamically or assume it's imported at top (I will add import via another tool or assume user adds it? No, I must add it.)
            // Since I can't add import easily in one chunk efficiently without full file read, 
            // I will assume I need to add import. 
            // Wait, I can use the trick: const { updatePasswordAction } = await import('./actions');

            const { updatePasswordAction } = await import('./actions');
            const result = await updatePasswordAction(password);

            if (result.error) {
                console.error(result.error);
                alert(`Erro: ${result.error}`);
                setLoading(false);
                return;
            }

            setLoading(false);
            setStep(2); // Go to Features

        } catch (err) {
            console.error("Unexpected error:", err);
            alert("Erro inesperado. Tente novamente.");
            setLoading(false);
        }
    };

    const steps = [
        // STEP 0: WELCOME
        {
            icon: <Rocket className="w-12 h-12 text-primary-400" />,
            title: `Bem-vindo, ${userName}!`,
            description: "Você acaba de desbloquear o sistema mais poderoso para gestão de veículos.",
            content: (
                <div className="flex flex-col gap-4 text-center mt-4">
                    <p className="text-foreground-muted">
                        Estamos preparando seu ambiente exclusivo.<br />
                        Para garantir sua segurança, defina uma senha de acesso.
                    </p>
                </div>
            ),
            action: () => setStep(1),
            btnText: "Configurar Acesso"
        },
        // STEP 1: PASSWORD (NEW)
        {
            icon: <ShieldCheck className="w-12 h-12 text-blue-400" />,
            title: "Crie sua Senha Mestra",
            description: "Defina a senha que você usará para entrar no painel.",
            content: (
                <div className="mt-6 w-full max-w-xs mx-auto">
                    <input
                        type="password"
                        placeholder="Sua melhor senha"
                        className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white text-center focus:border-primary-500 focus:outline-none transition-colors"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-2">Mínimo de 6 caracteres</p>
                </div>
            ),
            action: handleSetPassword,
            btnText: "Salvar e Continuar"
        },
        // STEP 2: FEATURES (Cards)
        {
            icon: <Zap className="w-12 h-12 text-yellow-400" />,
            title: "Poder em suas mãos",
            description: "Veja o que o VendorCarro faz por você:",
            content: (
                <div className="grid grid-cols-1 gap-3 mt-6 text-left">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20"><Star className="w-5 h-5 text-blue-400" /></div>
                        <div>
                            <h3 className="font-semibold text-white">Estoque Inteligente</h3>
                            <p className="text-xs text-gray-400">Gerencie fotos, preços e status em segundos.</p>
                        </div>
                    </div>
                    {/* ... (rest of features) ... */}
                </div>
            ),
            action: () => setStep(3),
            btnText: "Próximo"
        },
        // STEP 3: READY
        {
            icon: <Check className="w-16 h-16 text-success-400" />,
            title: "Tudo Pronto!",
            description: "Sua loja virtual já está configurada.",
            content: (
                <div className="text-center mt-4">
                    <p className="text-gray-400">
                        Clique abaixo para acessar seu Dashboard e cadastrar seu primeiro carro.
                    </p>
                </div>
            ),
            action: handleFinish,
            btnText: "Acessar Dashboard",
            isFinal: true
        }
    ];

    return (
        <LazyMotion features={domAnimation}>
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0a] text-white">

                {/* Background FX */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                {/* Confetti */}
                {loading && <Confetti width={width} height={height} numberOfPieces={200} recycle={false} />}

                {/* Main Card */}
                <m.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-lg p-8 relative z-10"
                >
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-primary-500/10 min-h-[500px] flex flex-col justify-between">

                        {/* Header Content */}
                        <div className="text-center">
                            <m.div
                                key={step}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col items-center"
                            >
                                <div className="mb-6 p-4 rounded-full bg-white/5 border border-white/10 shadow-inner">
                                    {steps[step].icon}
                                </div>
                                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-3">
                                    {steps[step].title}
                                </h1>
                                <p className="text-lg text-gray-400 leading-relaxed max-w-xs mx-auto">
                                    {steps[step].description}
                                </p>
                                {steps[step].content}
                            </m.div>
                        </div>

                        {/* Footer Controls */}
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <Button
                                onClick={steps[step].action}
                                disabled={loading}
                                size="lg"
                                className={`w-full h-14 text-lg font-semibold shadow-lg transition-all ${steps[step].isFinal
                                    ? 'bg-gradient-to-r from-success-500 to-emerald-600 hover:shadow-success-500/25'
                                    : 'bg-white text-black hover:bg-gray-100 hover:scale-[1.02]'
                                    }`}
                            >
                                {loading ? "Iniciando..." : steps[step].btnText}
                                {!loading && !steps[step].isFinal && <ChevronRight className="ml-2 w-5 h-5" />}
                            </Button>

                            {/* Step Indicators */}
                            <div className="flex justify-center gap-2 mt-6">
                                {steps.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-white' : 'w-2 bg-white/20'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </m.div>
            </div>
        </LazyMotion>
    );
}
