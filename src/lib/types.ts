// Database Types for VendorCarro

// ============================================
// ORGANIZATION TYPES (Multi-User Team Feature)
// ============================================

export type OrganizationPlan = 'free' | 'pro' | 'business';
export type OrganizationRole = 'owner' | 'admin' | 'member';

export interface Organization {
    id: string;
    name: string;
    slug: string;
    owner_id: string;
    max_members: number;
    plan: OrganizationPlan;
    created_at: string;
    updated_at: string;
}

export interface OrganizationMember {
    id: string;
    organization_id: string;
    user_id: string;
    role: OrganizationRole;
    invited_by?: string;
    joined_at: string;
    // Joined data
    user?: {
        id: string;
        email: string;
    };
}

export interface OrganizationInvite {
    id: string;
    organization_id: string;
    email: string;
    role: 'admin' | 'member';
    token: string;
    invited_by?: string;
    expires_at: string;
    created_at: string;
}

// ============================================
// VEHICLE TYPES
// ============================================

export interface Vehicle {
    id: string;
    user_id: string;
    organization_id?: string; // Multi-user support
    brand: string;
    model: string;
    year: number;
    price: number;
    mileage?: number;
    color?: string;
    fuel: 'flex' | 'gasoline' | 'ethanol' | 'diesel' | 'electric' | 'hybrid';
    transmission: 'automatic' | 'manual' | 'cvt';
    description?: string;
    images?: string[];
    status: 'available' | 'reserved' | 'sold';
    // Documentation fields
    plate?: string;
    renavam?: string;
    chassis?: string;
    purchase_price?: number;
    purchase_date?: string;
    documents?: VehicleDocument[];
    created_at: string;
    updated_at: string;
}

export interface VehicleDocument {
    name: string;
    type: 'crlv' | 'ipva' | 'multas' | 'laudo' | 'contrato' | 'other';
    url: string;
    uploaded_at: string;
}

// ============================================
// LEAD TYPES
// ============================================

export interface LeadDocument {
    name: string;
    type: 'cpf' | 'rg' | 'comprovante_residencia' | 'comprovante_renda' | 'cnh' | 'contrato' | 'other';
    url: string;
    uploaded_at: string;
}

export interface LeadAddress {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
}

export interface Lead {
    id: string;
    user_id: string;
    organization_id?: string; // Multi-user support
    name: string;
    email?: string;
    phone: string;
    vehicle_interest?: string;
    source: 'manual' | 'whatsapp' | 'phone' | 'website' | 'referral' | 'other';
    status: 'new' | 'contacted' | 'interested' | 'negotiating' | 'closed' | 'lost';
    message?: string;
    // Personal data
    cpf?: string;
    rg?: string;
    birth_date?: string;
    profession?: string;
    // Address
    address?: LeadAddress;
    // Documents
    documents?: LeadDocument[];
    // Activity & tracking
    last_contact?: string;
    next_followup?: string;
    score?: number;
    tags?: string[];
    created_at: string;
    updated_at: string;
}

// ============================================
// SALE TYPES
// ============================================

export interface Sale {
    id: string;
    user_id: string;
    organization_id?: string; // Multi-user support
    lead_id: string;
    vehicle_id: string;
    sale_price: number;
    discount?: number;
    payment_method: 'cash' | 'financing' | 'consortium' | 'trade' | 'trade_plus_cash';
    down_payment?: number;
    installments?: number;
    sale_date: string;
    notes?: string;
    created_at: string;
    // Joined data
    lead?: Lead;
    vehicle?: Vehicle;
}

// ============================================
// INSERT TYPES (without id and timestamps)
// ============================================

export type OrganizationInsert = Omit<Organization, 'id' | 'created_at' | 'updated_at'>;
export type VehicleInsert = Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>;
export type LeadInsert = Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
export type SaleInsert = Omit<Sale, 'id' | 'created_at' | 'lead' | 'vehicle'>;

