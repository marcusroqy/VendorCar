'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Car,
    Users,
    DollarSign,
    Settings,
    LogOut,
    Plus,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/vehicles', label: 'Veículos', icon: Car },
    { href: '/leads', label: 'Leads', icon: Users },
    { href: '/sales', label: 'Vendas', icon: DollarSign },
    { href: '/settings', label: 'Configurações', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        const supabase = createClient();
        if (supabase) {
            await supabase.auth.signOut();
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-1 gap-y-5 border-r border-border bg-card px-4 py-6">
                    {/* Logo */}
                    <div className="flex items-center gap-2 px-2">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                            <Car className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg">VendorCarro</span>
                    </div>

                    {/* Quick Action */}
                    <Link href="/vehicles/new" className="w-full">
                        <Button fullWidth leftIcon={<Plus className="w-5 h-5" />}>
                            Novo Veículo
                        </Button>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex flex-1 flex-col gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch={true}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                                        isActive
                                            ? 'bg-primary-500/10 text-primary-400'
                                            : 'text-foreground-muted hover:text-foreground hover:bg-gray-800/50'
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sign Out */}
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-gray-800/50 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-card/80 backdrop-blur-xl">
                <div className="flex items-center justify-between h-full px-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                            <Car className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold">VendorCarro</span>
                    </div>

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-lg hover:bg-gray-800/50"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Mobile Menu */}
            <div
                className={cn(
                    'lg:hidden fixed top-16 right-0 bottom-0 z-40 w-64 bg-card border-l border-border transition-transform duration-200',
                    isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <div className="flex flex-col h-full p-4 gap-4">
                    <Link href="/vehicles/new" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button fullWidth leftIcon={<Plus className="w-5 h-5" />}>
                            Novo Veículo
                        </Button>
                    </Link>

                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch={true}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                                        isActive
                                            ? 'bg-primary-500/10 text-primary-400'
                                            : 'text-foreground-muted hover:text-foreground hover:bg-gray-800/50'
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <button
                        onClick={handleSignOut}
                        className="mt-auto flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground-muted hover:text-foreground hover:bg-gray-800/50 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Sair
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border bg-card/80 backdrop-blur-xl">
                <div className="flex items-center justify-around h-full">
                    {navItems.slice(0, 4).map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch={true}
                                className={cn(
                                    'flex flex-col items-center gap-1 px-4 py-2',
                                    isActive ? 'text-primary-400' : 'text-foreground-muted'
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-xs">{item.label.slice(0, 6)}</span>
                            </Link>
                        );
                    })}

                    <Link
                        href="/vehicles/new"
                        className="flex flex-col items-center gap-1 px-4 py-2 text-primary-400"
                    >
                        <div className="w-10 h-10 -mt-4 rounded-full bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="lg:pl-64 pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
                <div className="p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
