import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'VendorCarro - Gestão de Veículos',
    template: '%s | VendorCarro',
  },
  description:
    'Plataforma para vendedores de veículos gerenciarem estoque, leads e vendas de forma simples e profissional.',
  keywords: ['carros', 'motos', 'veículos', 'vendas', 'gestão', 'leads', 'estoque'],
  authors: [{ name: 'VendorCarro' }],
  creator: 'VendorCarro',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'VendorCarro',
    title: 'VendorCarro - Gestão de Veículos',
    description: 'Plataforma para vendedores de veículos',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#09090B',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
