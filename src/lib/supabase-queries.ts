import { createClient } from '@/lib/supabase/server';
import { Vehicle } from '@/lib/types';
import { PostgrestError } from '@supabase/supabase-js';

// ==========================================
// Types
// ==========================================

export type VehicleListItem = Pick<
    Vehicle,
    'id' | 'brand' | 'model' | 'year' | 'price' | 'created_at' | 'status' | 'mileage' | 'fuel'
> & {
    images: string[] | null;
};

export type PaginatedResponse<T> = {
    data: T[];
    count: number;
    error: PostgrestError | null;
};

export type SingleResponse<T> = {
    data: T | null;
    error: PostgrestError | null;
};

// ==========================================
// Queries
// ==========================================

/**
 * Fetch vehicles with pagination, selecting only necessary fields for listing.
 * Ordenação por created_at desc.
 * @param page Page number (1-based)
 * @param limit Items per page (default: 12)
 */
export async function getVehiclesPaginated(
    page: number,
    limit: number = 12
): Promise<PaginatedResponse<VehicleListItem>> {
    const supabase = await createClient();
    if (!supabase) return { data: [], count: 0, error: { message: 'Database client not available', hint: '', details: '', code: '500', name: 'PostgrestError' } };

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Query otimizada selecionando apenas campos da listagem
    const { data, error, count } = await supabase
        .from('vehicles')
        .select('id, brand, model, year, price, images, created_at, status, mileage, fuel', {
            count: 'exact',
        })
        .range(from, to)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching paginated vehicles:', error);
        return { data: [], count: 0, error };
    }

    return {
        data: (data as VehicleListItem[]) || [],
        count: count || 0,
        error: null,
    };
}

/**
 * Fetch all details of a specific vehicle by ID.
 * @param id Vehicle ID
 */
export async function getVehicleById(id: string): Promise<SingleResponse<Vehicle>> {
    const supabase = await createClient();
    if (!supabase) return { data: null, error: { message: 'Database client not available', hint: '', details: '', code: '500', name: 'PostgrestError' } };

    // Busca completa para a página de detalhes
    const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching vehicle ${id}:`, error);
        return { data: null, error };
    }

    return {
        data: data as Vehicle,
        error: null,
    };
}

/**
 * Fetch only images for a specific vehicle.
 * Useful for galleries or lightweight checks.
 * @param vehicleId Vehicle ID
 */
export async function getVehicleImages(vehicleId: string): Promise<SingleResponse<{ images: string[] }>> {
    const supabase = await createClient();
    if (!supabase) return { data: null, error: { message: 'Database client not available', hint: '', details: '', code: '500', name: 'PostgrestError' } };

    const { data, error } = await supabase
        .from('vehicles')
        .select('images')
        .eq('id', vehicleId)
        .single();

    if (error) {
        console.error(`Error fetching images for vehicle ${vehicleId}:`, error);
        return { data: null, error };
    }

    return {
        data: data as { images: string[] },
        error: null,
    };
}

/**
 * Search vehicles by brand or model with pagination.
 * @param query Search query string
 * @param page Page number (1-based)
 * @param limit Items per page (default: 12)
 */
export async function searchVehicles(
    query: string,
    page: number,
    limit: number = 12
): Promise<PaginatedResponse<VehicleListItem>> {
    const supabase = await createClient();
    if (!supabase) return { data: [], count: 0, error: { message: 'Database client not available', hint: '', details: '', code: '500', name: 'PostgrestError' } };

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Busca textual simples usando ILIKE ou textSearch se configurado
    // Aqui assumimos uma busca OR em brand e model
    const { data, error, count } = await supabase
        .from('vehicles')
        .select('id, brand, model, year, price, images, created_at, status, mileage, fuel', {
            count: 'exact',
        })
        .or(`brand.ilike.%${query}%,model.ilike.%${query}%`)
        .range(from, to)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error searching vehicles:', error);
        return { data: [], count: 0, error };
    }

    return {
        data: (data as VehicleListItem[]) || [],
        count: count || 0,
        error: null,
    };
}
