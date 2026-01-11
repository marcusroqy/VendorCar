import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
    [
        // Base styles
        'inline-flex items-center justify-center gap-2',
        'font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        'active:scale-[0.98]',
        // Touch optimization
        'touch-manipulation select-none',
    ],
    {
        variants: {
            variant: {
                primary: [
                    'bg-gradient-to-r from-primary-500 to-primary-600',
                    'text-white',
                    'shadow-lg shadow-primary-500/25',
                    'hover:shadow-xl hover:shadow-primary-500/30',
                    'hover:brightness-110',
                    'focus-visible:ring-primary-500',
                ],
                secondary: [
                    'bg-gray-800/50 backdrop-blur-sm',
                    'border border-gray-700',
                    'text-gray-100',
                    'hover:bg-gray-800',
                    'hover:border-gray-600',
                    'focus-visible:ring-gray-500',
                ],
                ghost: [
                    'text-gray-300',
                    'hover:bg-gray-800/50',
                    'hover:text-gray-100',
                    'focus-visible:ring-gray-500/50',
                ],
                danger: [
                    'bg-error-500',
                    'text-white',
                    'shadow-lg shadow-error-500/25',
                    'hover:bg-error-600',
                    'focus-visible:ring-error-500',
                ],
                success: [
                    'bg-gradient-to-r from-success-500 to-success-600',
                    'text-white',
                    'shadow-lg shadow-success-500/25',
                    'hover:shadow-xl hover:shadow-success-500/30',
                    'focus-visible:ring-success-500',
                ],
                whatsapp: [
                    'bg-whatsapp',
                    'text-white',
                    'shadow-lg shadow-whatsapp/25',
                    'hover:brightness-110',
                    'hover:shadow-xl',
                    'focus-visible:ring-whatsapp',
                ],
                outline: [
                    'border-2 border-primary-500',
                    'text-primary-400',
                    'hover:bg-primary-500/10',
                    'focus-visible:ring-primary-500',
                ],
                link: [
                    'text-primary-400',
                    'underline-offset-4 hover:underline',
                    'focus-visible:ring-primary-500',
                ],
            },
            size: {
                sm: 'h-9 px-3 text-sm rounded-lg',
                md: 'h-11 px-5 text-sm rounded-xl',
                lg: 'h-14 px-8 text-base rounded-xl',
                icon: 'h-11 w-11 rounded-xl',
                'icon-sm': 'h-9 w-9 rounded-lg',
                'icon-lg': 'h-14 w-14 rounded-xl',
            },
            fullWidth: {
                true: 'w-full',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
