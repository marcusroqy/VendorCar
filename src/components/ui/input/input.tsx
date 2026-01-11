'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
    [
        'flex w-full',
        'bg-gray-800/50 backdrop-blur-sm',
        'border border-gray-700',
        'text-foreground placeholder:text-foreground-subtle',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Touch optimization
        'touch-manipulation',
    ],
    {
        variants: {
            size: {
                sm: 'h-9 px-3 text-sm rounded-lg',
                md: 'h-11 px-4 text-sm rounded-xl',
                lg: 'h-14 px-5 text-base rounded-xl',
            },
            hasError: {
                true: 'border-error-500 focus:ring-error-500/50 focus:border-error-500',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    }
);

export interface InputProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
    /** Input label */
    label?: string;
    /** Error message */
    error?: string;
    /** Helper text below input */
    helperText?: string;
    /** Icon on the left */
    leftIcon?: ReactNode;
    /** Icon on the right */
    rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type = 'text',
            size,
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            disabled,
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id || props.name;
        const hasError = Boolean(error);

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-foreground-muted"
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        type={type}
                        disabled={disabled}
                        className={cn(
                            inputVariants({ size, hasError }),
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            className
                        )}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {(error || helperText) && (
                    <p
                        className={cn(
                            'text-xs',
                            error ? 'text-error-500' : 'text-foreground-subtle'
                        )}
                    >
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export { Input, inputVariants };
