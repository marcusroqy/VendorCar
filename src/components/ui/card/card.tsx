'use client';

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva('rounded-2xl transition-all duration-200', {
    variants: {
        variant: {
            default: 'bg-card border border-border',
            glass: [
                'bg-gray-900/60 backdrop-blur-xl',
                'border border-white/10',
                'shadow-xl shadow-black/10',
            ],
            elevated: ['bg-card', 'border border-border', 'shadow-lg shadow-black/20'],
            interactive: [
                'bg-card',
                'border border-border',
                'shadow-md',
                'hover:shadow-lg hover:shadow-primary-500/5',
                'hover:border-primary-500/20',
                'hover:-translate-y-0.5',
                'cursor-pointer',
            ],
        },
        padding: {
            none: '',
            sm: 'p-3',
            md: 'p-4 md:p-5',
            lg: 'p-5 md:p-6',
        },
    },
    defaultVariants: {
        variant: 'default',
        padding: 'md',
    },
});

export interface CardProps
    extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> { }

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, padding, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardVariants({ variant, padding }), className)}
            {...props}
        />
    )
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex flex-col space-y-1.5', className)} {...props} />
    )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('font-semibold text-lg leading-tight tracking-tight', className)}
            {...props}
        />
    )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn('text-sm text-foreground-muted', className)} {...props} />
    )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('pt-0', className)} {...props} />
    )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex items-center pt-4', className)} {...props} />
    )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
