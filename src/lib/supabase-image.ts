import { createClient } from '@/lib/supabase/client';

type ImageSize = 'thumbnail' | 'medium' | 'large' | 'original';

interface ImageOptions {
    width?: number;
    height?: number;
    quality?: number;
    size?: ImageSize;
    resize?: 'cover' | 'contain' | 'fill';
}

const PRESETS: Record<string, ImageOptions> = {
    thumbnail: { width: 400, height: 300, quality: 75, resize: 'cover' },
    medium: { width: 800, height: 600, quality: 80, resize: 'cover' },
    large: { width: 1200, height: 900, quality: 85, resize: 'cover' },
    original: { quality: 100 },
};

/**
 * Generates an optimized URL for an image stored in Supabase Storage.
 * Uses the Supabase Image Transformation API (Render).
 * 
 * @param path The path of the image in storage (e.g. "vehicles/123/image.jpg" or full URL)
 * @param options Optimization options (width, height, quality, size preset)
 */
export function getOptimizedImageUrl(
    path: string,
    options: ImageOptions = {}
): string {
    if (!path) return '';

    // If path is already a completely valid URL not from supabase, return it
    if (path.startsWith('http') && !path.includes('supabase.co')) {
        return path;
    }

    const pathStr = String(path).trim();

    // If path is a data URI (base64) or blob, return it as is
    if (pathStr.startsWith('data:') || pathStr.startsWith('blob:') || pathStr.includes(';base64,')) {
        return path; // Return original path to be safe
    }

    // Extract relative path if it's a full Supabase URL
    let relativePath = path;
    if (path.includes('/storage/v1/object/public/')) {
        relativePath = path.split('/storage/v1/object/public/')[1];
    } else if (path.includes('/storage/v1/render/image/public/')) {
        relativePath = path.split('/storage/v1/render/image/public/')[1];
        // Remove existing query params if any
        relativePath = relativePath.split('?')[0];
    }

    const { size = 'original' } = options;
    const preset = PRESETS[size] || PRESETS.original;

    const width = options.width || preset.width;
    const height = options.height || preset.height;
    const quality = options.quality || preset.quality;
    const resize = options.resize || preset.resize || 'cover';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
        console.warn('NEXT_PUBLIC_SUPABASE_URL is not defined');
        return path; // Fallback to original path/url if config missing
    }

    // Base URL for Supabase Image Transformation
    const baseUrl = `${supabaseUrl}/storage/v1/render/image/public`;

    // Construct parameters
    const params = new URLSearchParams();

    if (size !== 'original') {
        if (width) params.set('width', width.toString());
        if (height) params.set('height', height.toString());
        if (quality) params.set('quality', quality.toString());
        if (resize) params.set('resize', resize);
    }

    const queryString = params.toString();
    return `${baseUrl}/${relativePath}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Helper for list view thumbnails (400x300, q75)
 */
export const getVehicleThumbnail = (path: string) =>
    getOptimizedImageUrl(path, { size: 'thumbnail' });

/**
 * Helper for main vehicle images (800x600, q80)
 */
export const getVehicleImage = (path: string) =>
    getOptimizedImageUrl(path, { size: 'medium' });

/**
 * Helper for detailed view large images (1200x900, q85)
 */
export const getVehicleLargeImage = (path: string) =>
    getOptimizedImageUrl(path, { size: 'large' });
