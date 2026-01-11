/**
 * Validate Brazilian vehicle plate (old and Mercosul format)
 */
export function isValidPlate(plate: string): boolean {
    if (!plate) return false;

    // Remove dashes and spaces, uppercase
    const cleaned = plate.replace(/[-\s]/g, '').toUpperCase();

    // Old format: ABC1234
    const oldFormat = /^[A-Z]{3}[0-9]{4}$/;

    // Mercosul format: ABC1D23
    const mercosulFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

    return oldFormat.test(cleaned) || mercosulFormat.test(cleaned);
}

/**
 * Validate Brazilian phone number
 */
export function isValidPhone(phone: string): boolean {
    if (!phone) return false;

    // Remove non-digits
    const digits = phone.replace(/\D/g, '');

    // Mobile: 11 digits (with 9 prefix) or landline: 10 digits
    return digits.length === 11 || digits.length === 10;
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
    if (!email) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate Brazilian CPF
 */
export function isValidCPF(cpf: string): boolean {
    if (!cpf) return false;

    // Remove non-digits
    const digits = cpf.replace(/\D/g, '');

    if (digits.length !== 11) return false;

    // Check for all same digits
    if (/^(\d)\1+$/.test(digits)) return false;

    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(digits[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(digits[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(digits[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(digits[10])) return false;

    return true;
}

/**
 * Validate vehicle year
 */
export function isValidYear(year: number): boolean {
    const currentYear = new Date().getFullYear();
    return year >= 1950 && year <= currentYear + 1;
}

/**
 * Validate price
 */
export function isValidPrice(price: number): boolean {
    return price > 0 && price < 100000000; // Max 100 million
}

/**
 * Validate mileage
 */
export function isValidMileage(km: number): boolean {
    return km >= 0 && km < 10000000; // Max 10 million km
}
