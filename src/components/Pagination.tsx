'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
    const searchParams = useSearchParams();

    // Helper to preserve other search params (like filters) when changing page
    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        return `${baseUrl}?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <Link
                href={currentPage > 1 ? createPageUrl(currentPage - 1) : '#'}
                aria-disabled={currentPage <= 1}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
            >
                <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                    disabled={currentPage <= 1}
                >
                    Anterior
                </Button>
            </Link>

            <span className="text-sm text-foreground-muted px-2">
                Página {currentPage} de {totalPages}
            </span>

            <Link
                href={currentPage < totalPages ? createPageUrl(currentPage + 1) : '#'}
                aria-disabled={currentPage >= totalPages}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
            >
                <Button
                    variant="secondary"
                    size="sm"
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    disabled={currentPage >= totalPages}
                >
                    Próxima
                </Button>
            </Link>
        </div>
    );
}
