// Database Types for VendorCarro

export interface Vehicle {
    id: string;
    user_id: string;
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

export interface Sale {
    id: string;
    user_id: string;
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

// Insert types (without id and timestamps)
export type VehicleInsert = Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>;
export type LeadInsert = Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
export type SaleInsert = Omit<Sale, 'id' | 'created_at' | 'lead' | 'vehicle'>;
