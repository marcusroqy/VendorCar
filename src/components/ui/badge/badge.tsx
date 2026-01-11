import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center font-medium transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-gray-800 text-gray-300 border border-gray-700',
                primary: 'bg-primary-500/10 text-primary-400 border border-primary-500/20',
                secondary: 'bg-secondary-500/10 text-secondary-400 border border-secondary-500/20',
                success: 'bg-success-500/10 text-success-500 border border-success-500/20',
                warning: 'bg-warning-500/10 text-warning-500 border border-warning-500/20',
                error: 'bg-error-500/10 text-error-500 border border-error-500/20',
                info: 'bg-info-500/10 text-info-500 border border-info-500/20',
                outline: 'border border-gray-600 text-gray-300',
            },
            size: {
                sm: 'text-xs px-2 py-0.5 rounded-md',
                md: 'text-xs px-2.5 py-1 rounded-lg',
                lg: 'text-sm px-3 py-1 rounded-lg',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, size, ...props }: BadgeProps) {
    return (
        <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
