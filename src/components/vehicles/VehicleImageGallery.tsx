'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Car } from 'lucide-react';
import { Card } from '@/components/ui';

interface VehicleImageGalleryProps {
    images: string[];
    brand: string;
    model: string;
    status: 'available' | 'reserved' | 'sold';
    statusLabel: string;
    statusColor: string;
}

export default function VehicleImageGallery({
    images,
    brand,
    model,
    status,
    statusLabel,
    statusColor
}: VehicleImageGalleryProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const hasImages = images && images.length > 0;

    return (
        <Card variant="glass" className="overflow-hidden">
            <div className="relative aspect-[16/10] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                {hasImages ? (
                    <>
                        <Image
                            src={images[currentImageIndex]}
                            alt={`${brand} ${model}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
                            priority={true}
                            quality={85}
                        />
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="text-center">
                        <Car className="w-24 h-24 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500">Sem fotos</p>
                    </div>
                )}

                {/* Status Badge */}
                <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                    {statusLabel}
                </span>
            </div>
        </Card>
    );
}
