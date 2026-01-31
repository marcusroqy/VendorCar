'use client';

import React, { forwardRef } from 'react';

interface BotProtectionProps extends React.InputHTMLAttributes<HTMLInputElement> {
    register?: any; // For react-hook-form integration if needed
}

export const BotProtection = forwardRef<HTMLInputElement, BotProtectionProps>(
    ({ register, ...props }, ref) => {
        return (
            <div
                style={{
                    opacity: 0,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: 0,
                    width: 0,
                    zIndex: -1,
                }}
                aria-hidden="true"
            >
                <label htmlFor="company_role">Função na empresa</label>
                <input
                    id="company_role"
                    autoComplete="off"
                    tabIndex={-1}
                    {...props}
                    ref={ref}
                />
            </div>
        );
    }
);

BotProtection.displayName = 'BotProtection';
