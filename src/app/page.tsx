import Link from 'next/link';
import { Car, ArrowRight, Sparkles, Users, Share2, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">VendorCarro</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">
                Começar grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Simples, rápido e profissional</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Venda mais veículos com{' '}
            <span className="text-gradient">gestão inteligente</span>
          </h1>

          <p className="text-lg md:text-xl text-foreground-muted mb-8 max-w-2xl mx-auto">
            Organize seu estoque, gerencie leads e compartilhe links profissionais dos seus veículos.
            Tudo em um só lugar, direto do celular.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Começar grátis
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Já tenho conta
              </Button>
            </Link>
          </div>

          <p className="text-sm text-foreground-subtle mt-4">
            Grátis para até 3 veículos • Sem cartão de crédito
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tudo que você precisa para vender mais
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-card border border-border group hover:border-primary-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
                <Car className="w-6 h-6 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gestão de Estoque</h3>
              <p className="text-foreground-muted">
                Cadastre veículos com fotos, status e preços. Acompanhe tudo em um dashboard simples.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-card border border-border group hover:border-primary-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-success-500/10 flex items-center justify-center mb-4 group-hover:bg-success-500/20 transition-colors">
                <Users className="w-6 h-6 text-success-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Controle de Leads</h3>
              <p className="text-foreground-muted">
                Registre interessados, acompanhe negociações e nunca perca um cliente potencial.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-card border border-border group hover:border-primary-500/30 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-secondary-500/10 flex items-center justify-center mb-4 group-hover:bg-secondary-500/20 transition-colors">
                <Share2 className="w-6 h-6 text-secondary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Links Compartilháveis</h3>
              <p className="text-foreground-muted">
                Cada veículo gera um link único para compartilhar no WhatsApp, redes sociais e anúncios.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile First */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-500 text-sm mb-6">
            <Smartphone className="w-4 h-4" />
            <span>Feito para o celular</span>
          </div>

          <h2 className="text-3xl font-bold mb-6">
            Use de qualquer lugar
          </h2>

          <p className="text-lg text-foreground-muted mb-8">
            VendorCarro funciona perfeitamente no seu celular. Cadastre veículos,
            responda leads e acompanhe vendas enquanto está na rua.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary-500/5 to-transparent">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-6">
            Pronto para vender mais?
          </h2>
          <p className="text-lg text-foreground-muted mb-8">
            Comece gratuitamente com até 3 veículos. Upgrade quando precisar de mais.
          </p>
          <Link href="/register">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Criar conta grátis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground-muted">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            <span>VendorCarro © 2026</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Termos</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
