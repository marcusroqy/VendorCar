import { createClient } from '@/lib/supabase/client';
import imageCompression from 'browser-image-compression';

export async function uploadVehicleImage(file: File): Promise<string> {
    const supabase = createClient();
    if (!supabase) {
        throw new Error('Supabase client failed to initialize');
    }

    // 1. Compress Image
    const options = {
        maxSizeMB: 1, // Max 1MB
        maxWidthOrHeight: 1920, // Max 1920px (HD)
        useWebWorker: true,
        fileType: 'image/webp' // Convert to WebP for better compression
    };

    try {
        const compressedFile = await imageCompression(file, options);

        // 2. Generate Unique Filename
        const fileExt = 'webp';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // 3. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('vehicle-media')
            .upload(filePath, compressedFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            throw uploadError;
        }

        // 4. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('vehicle-media')
            .getPublicUrl(filePath);

        return publicUrl;

    } catch (error) {
        console.error('Error in uploadVehicleImage:', error);
        throw error;
    }
}
