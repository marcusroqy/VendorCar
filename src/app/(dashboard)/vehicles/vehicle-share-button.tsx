'use client';

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { Vehicle } from '@/lib/types';
import { shareVehicle } from '@/lib/share';

interface VehicleShareButtonProps {
    vehicle: Vehicle;
    className?: string;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export function VehicleShareButton({ vehicle, className, variant = 'ghost', size = 'sm' }: VehicleShareButtonProps) {
    return (
        <Button
            variant={variant}
            size={size}
            onClick={(e) => {
                e.preventDefault(); // Prevent link navigation if inside a Link
                e.stopPropagation();
                shareVehicle(vehicle);
            }}
            className={className}
            title="Compartilhar no WhatsApp"
        >
            <Share2 className="w-4 h-4" />
        </Button>
    );
}
