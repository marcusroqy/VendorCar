import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { VehicleDetails } from './vehicle-details';
import { Vehicle } from '@/lib/types';
import { createClient as createStaticClient } from '@supabase/supabase-js';

// Helper to format currency for metadata
function formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
    }).format(price);
}

function formatMileage(mileage: number): string {
    return new Intl.NumberFormat('pt-BR').format(mileage) + ' km';
}

export const revalidate = 300; // 5 minutes
export const dynamicParams = true; // Allow generating pages on demand


export async function generateStaticParams() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) return [];

    const supabase = createStaticClient(supabaseUrl, supabaseKey);

    const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(20);

    return (vehicles || []).map((vehicle) => ({
        id: vehicle.id,
    }));
}

// Generate Metadata for Social Sharing (Open Graph)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return {
            title: 'VendorCarro',
        };
    }

    const supabase = createStaticClient(supabaseUrl, supabaseKey);

    const { data: vehicle } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

    if (!vehicle) {
        return {
            title: 'Veículo não encontrado | VendorCarro',
        };
    }

    const title = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
    const description = `${formatPrice(vehicle.price)} - ${vehicle.transmission} - ${formatMileage(vehicle.mileage || 0)}`;
    const imageUrl = vehicle.images?.[0] || '/og-vehicle-placeholder.jpg'; // Fallback image

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
    };
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        notFound();
    }

    // Use static client for public data to avoid cookies() issues in ISR
    const supabase = createStaticClient(supabaseUrl, supabaseKey);

    // Fetch data on server
    const { data } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

    if (!data) {
        notFound();
    }

    const vehicle = data as Vehicle;

    return <VehicleDetails vehicle={vehicle} />;
}
