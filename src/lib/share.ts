import { Vehicle } from './types';

// Helper to format currency
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
    }).format(price);
};

// Helper to format mileage
const formatMileage = (mileage?: number) => {
    if (!mileage) return 'N/A';
    return new Intl.NumberFormat('pt-BR').format(mileage) + ' km';
};

const fuelLabels: Record<string, string> = {
    flex: 'Flex',
    gasoline: 'Gasolina',
    ethanol: 'Etanol',
    diesel: 'Diesel',
    electric: 'Elétrico',
    hybrid: 'Híbrido',
};

const transmissionLabels: Record<string, string> = {
    automatic: 'Automático',
    manual: 'Manual',
    cvt: 'Automático (CVT)',
};

// Helper to get emoji for brand
const getBrandEmoji = (brand: string) => {
    const b = brand.toLowerCase();
    if (b.includes('ferrari') || b.includes('porsche')) return '🏎️';
    if (b.includes('bmw') || b.includes('mercedes')) return '🔥';
    if (b.includes('toyota') || b.includes('honda')) return '🚙';
    return '🚘';
};

/**
 * Generates a professional WhatsApp text for a vehicle
 */
export function generateVehicleShareText(vehicle: Vehicle): string {
    const title = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
    const price = formatPrice(vehicle.price);
    const mileage = formatMileage(vehicle.mileage);
    const fuel = fuelLabels[vehicle.fuel] || vehicle.fuel;
    const transmission = transmissionLabels[vehicle.transmission] || vehicle.transmission;
    const brandEmoji = getBrandEmoji(vehicle.brand);
    // Get first 3 images for links
    const imageLinks = vehicle.images?.slice(0, 3).map((img, i) => `📸 Foto ${i + 1}: ${img}`).join('\n') || '';

    return `
🚀 *OFERTA IMPERDÍVEL ${brandEmoji}*
───────────────────────
*${title}*

💰 *${price}*

🚧 *Ficha Técnica:*
━━━━━━━━━━━━━━━━━━━━
📅 *Ano:* ${vehicle.year}
⛽ *Combustível:* ${fuel}
⚙️ *Câmbio:* ${transmission}
🛣️ *Km:* ${mileage}
🎨 *Cor:* ${vehicle.color || 'Não informada'}
${vehicle.plate ? `🔢 *Placa:* ...${vehicle.plate.slice(-1)}` : ''}

📋 *Detalhes:*
${vehicle.description ? `_${vehicle.description.slice(0, 100)}${vehicle.description.length > 100 ? '...' : ''}_` : '_Veículo de procedência!_'}

━━━━━━━━━━━━━━━━━━━━
👀 *Veja as fotos:*
${imageLinks}

🔗 *Link completo:*
${typeof window !== 'undefined' ? window.location.origin : ''}/vehicles/${vehicle.id}

📞 *Chama no whats e vamos negociar!*
`.trim();
}

/**
 * shareVehicle
 * Tries to use the native Web Share API with MULTIPLE images.
 * If not supported, opens WhatsApp directly.
 */
export async function shareVehicle(vehicle: Vehicle) {
    const text = generateVehicleShareText(vehicle);
    const url = `${window.location.origin}/vehicles/${vehicle.id}`;

    // Define helper variables for reuse in fallback logic
    const price = formatPrice(vehicle.price);
    const mileage = formatMileage(vehicle.mileage);
    const fuel = fuelLabels[vehicle.fuel] || vehicle.fuel;
    const transmission = transmissionLabels[vehicle.transmission] || vehicle.transmission;

    // Try Native Share (Mobile)
    if (navigator.share) {
        try {
            const shareData: ShareData = {
                title: `${vehicle.brand} ${vehicle.model}`,
                text: text,
                url: url,
            };

            // Try to attach UP TO 4 images if available
            if (vehicle.images && vehicle.images.length > 0) {
                try {
                    // Limit to first 4 images to avoid memory/performance issues
                    const imagesToShare = vehicle.images.slice(0, 4);
                    const files: File[] = [];

                    for (let i = 0; i < imagesToShare.length; i++) {
                        const imgUrl = imagesToShare[i];
                        const response = await fetch(imgUrl);
                        const blob = await response.blob();
                        const file = new File([blob], `foto_${i + 1}.jpg`, { type: 'image/jpeg' });
                        files.push(file);
                    }

                    if (navigator.canShare && navigator.canShare({ files })) {
                        shareData.files = files;
                    }
                } catch (e) {
                    console.warn('Error fetching images for share:', e);
                }
            }

            await navigator.share(shareData);
            return;
        } catch (error) {
            console.warn('Error sharing:', error);
        }
    }

    // Fallback to WhatsApp
    // Logic to ensure we maximize info within the ~2000 char URL limit

    // 1. Text with Images Links (Priority: Low)
    let finalUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    // 2. If too long, try removing Image Links but KEEP Description + Specs
    if (finalUrl.length > 2000) {
        const textWithoutImages = `
🚀 *OFERTA IMPERDÍVEL ${getBrandEmoji(vehicle.brand)}*
───────────────────────
*${vehicle.brand} ${vehicle.model} ${vehicle.year}*

💰 *${formatPrice(vehicle.price)}*

🚧 *Ficha Técnica:*
━━━━━━━━━━━━━━━━━━━━
📅 *Ano:* ${vehicle.year}
⛽ *Combustível:* ${fuel}
⚙️ *Câmbio:* ${transmission}
🛣️ *Km:* ${mileage}
🎨 *Cor:* ${vehicle.color || 'Não informada'}
${vehicle.plate ? `🔢 *Placa:* ...${vehicle.plate.slice(-1)}` : ''}

📋 *Detalhes:*
${vehicle.description ? `_${vehicle.description.slice(0, 150)}${vehicle.description.length > 150 ? '...' : ''}_` : '_Veículo de procedência!_'}

━━━━━━━━━━━━━━━━━━━━
🔗 *Link completo e Fotos:*
${url}

📞 *Entre em contato para negociar!*
`.trim();
        finalUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textWithoutImages)}`;
    }

    // 3. If STILL too long (unlikely), trim description further
    if (finalUrl.length > 2000) {
        const minimalText = `
🚀 *OFERTA IMPERDÍVEL ${getBrandEmoji(vehicle.brand)}*
───────────────────────
*${vehicle.brand} ${vehicle.model} ${vehicle.year}*

💰 *${formatPrice(vehicle.price)}*

🚧 *Ficha Técnica:*
📅 *Ano:* ${vehicle.year} | 🛣️ *Km:* ${mileage}
⛽ *Combust:* ${fuel} | ⚙️ *Câmbio:* ${transmission}

🔗 *Veja fotos e detalhes:*
${url}
`.trim();
        finalUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(minimalText)}`;
    }

    window.open(finalUrl, '_blank');
}
