'use client';

import { LazyMotionProvider } from './LazyMotionProvider';
import { type ReactNode } from 'react';
import { QueryProvider } from './query-provider';

import { OrganizationProvider } from './organization-provider';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <QueryProvider>
            <OrganizationProvider>
                <LazyMotionProvider>
                    {children}
                </LazyMotionProvider>
            </OrganizationProvider>
        </QueryProvider>
    );
}
