/**
 * Format price in Brazilian Real (BRL)
 */
export function formatPrice(value: number | null | undefined): string {
    if (value === null || value === undefined) return '-';

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Format price with cents
 */
export function formatPriceWithCents(value: number | null | undefined): string {
    if (value === null || value === undefined) return '-';

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Format phone number to Brazilian format
 */
export function formatPhone(phone: string | null | undefined): string {
    if (!phone) return '-';

    // Remove non-digits
    const digits = phone.replace(/\D/g, '');

    // Mobile: (11) 99999-9999
    if (digits.length === 11) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }

    // Landline: (11) 3333-3333
    if (digits.length === 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return phone;
}

/**
 * Format WhatsApp number for wa.me link
 */
export function formatWhatsAppNumber(phone: string): string {
    // Remove non-digits
    const digits = phone.replace(/\D/g, '');

    // Add country code if not present
    if (digits.length === 11) {
        return `55${digits}`;
    }

    if (digits.length === 10) {
        return `55${digits.slice(0, 2)}9${digits.slice(2)}`;
    }

    return digits;
}

/**
 * Format mileage with km suffix
 */
export function formatMileage(km: number | null | undefined): string {
    if (km === null || km === undefined) return '-';

    return new Intl.NumberFormat('pt-BR').format(km) + ' km';
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(date: Date | string): string {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            if (diffMinutes < 1) return 'agora';
            return `há ${diffMinutes} min`;
        }
        return `há ${diffHours}h`;
    }

    if (diffDays === 1) return 'ontem';
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `há ${Math.floor(diffDays / 30)} meses`;

    return `há ${Math.floor(diffDays / 365)} anos`;
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

/**
 * Format date to short format
 */
export function formatDateShort(date: Date | string): string {
    return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
    });
}

/**
 * Format vehicle year (manufacture/model)
 */
export function formatVehicleYear(
    yearManufacture: number,
    yearModel: number
): string {
    if (yearManufacture === yearModel) {
        return String(yearManufacture);
    }
    return `${yearManufacture}/${yearModel}`;
}
