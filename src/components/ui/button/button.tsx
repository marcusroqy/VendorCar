'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants, type ButtonVariants } from './button.variants';

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
    /** Show loading spinner */
    isLoading?: boolean;
    /** Icon before text */
    leftIcon?: ReactNode;
    /** Icon after text */
    rightIcon?: ReactNode;
    /** Content */
    children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            fullWidth,
            isLoading = false,
            leftIcon,
            rightIcon,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={cn(buttonVariants({ variant, size, fullWidth }), className)}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    leftIcon
                )}
                {children}
                {!isLoading && rightIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
