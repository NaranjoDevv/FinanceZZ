// components/brutal/index.tsx
"use client";

import React, { memo, forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// ============================================
// BRUTAL BUTTON - Optimizado con memo
// ============================================

interface BrutalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    fullWidth?: boolean;
}

export const BrutalButton = memo(forwardRef<HTMLButtonElement, BrutalButtonProps>(
    ({
        variant = 'secondary',
        size = 'md',
        loading = false,
        fullWidth = false,
        disabled = false,
        className,
        children,
        ...props
    }, ref) => {

        const baseStyles = 'font-black uppercase tracking-wider border-4 border-black transition-all duration-200 active:translate-x-1 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed';

        const sizeStyles = {
            sm: 'px-3 py-2 text-xs min-h-[44px]',
            md: 'px-6 py-3 text-sm min-h-[48px]',
            lg: 'px-8 py-4 text-base min-h-[56px]'
        };

        const variantStyles = {
            primary: 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
            secondary: 'bg-white text-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
            danger: 'bg-red-500 text-white hover:bg-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
            success: 'bg-green-500 text-white hover:bg-green-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
        };

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={cn(
                    baseStyles,
                    sizeStyles[size],
                    variantStyles[variant],
                    fullWidth && 'w-full',
                    className
                )}
                {...props}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>CARGANDO...</span>
                    </span>
                ) : children}
            </button>
        );
    }
));

BrutalButton.displayName = 'BrutalButton';

// ============================================
// BRUTAL CARD - Contenedor optimizado
// ============================================

interface BrutalCardProps extends HTMLAttributes<HTMLDivElement> {
    padding?: 'sm' | 'md' | 'lg';
    shadow?: boolean;
    border?: boolean;
}

export const BrutalCard = memo(forwardRef<HTMLDivElement, BrutalCardProps>(
    ({ padding = 'md', shadow = true, border = true, className, children, ...props }, ref) => {

        const paddingStyles = {
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8'
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'bg-white',
                    border && 'border-4 border-black',
                    shadow && 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
                    paddingStyles[padding],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
));

BrutalCard.displayName = 'BrutalCard';

// ============================================
// BRUTAL INPUT - Campo de entrada optimizado
// ============================================

interface BrutalInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const BrutalInput = memo(forwardRef<HTMLInputElement, BrutalInputProps>(
    ({ label, error, icon, className, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-xs font-black uppercase tracking-wider text-black mb-2">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full px-4 py-3 min-h-[44px] text-base',
                            'font-bold uppercase tracking-wide',
                            'border-4 border-black',
                            'bg-white text-black',
                            'placeholder:text-gray-500 placeholder:uppercase',
                            'focus:outline-none focus:border-black',
                            'disabled:bg-gray-100 disabled:cursor-not-allowed',
                            error && 'border-red-500',
                            icon && 'pl-10',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-2 text-xs font-bold uppercase text-red-500">
                        {error}
                    </p>
                )}
            </div>
        );
    }
));

BrutalInput.displayName = 'BrutalInput';

// ============================================
// BRUTAL MODAL - Modal optimizado
// ============================================

interface BrutalModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
}

export const BrutalModal = memo(({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true
}: BrutalModalProps) => {

    if (!isOpen) return null;

    const sizeStyles = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className={cn(
                    'w-full bg-white border-4 border-black',
                    'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
                    'max-h-[90vh] overflow-y-auto',
                    sizeStyles[size]
                )}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b-4 border-black">
                        <h2 className="text-2xl font-black uppercase tracking-wider">
                            {title}
                        </h2>
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="text-2xl font-black hover:bg-black hover:text-white px-3 py-1 transition-colors duration-200"
                            >
                                ×
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
});

BrutalModal.displayName = 'BrutalModal';

// ============================================
// RESPONSIVE CONTAINER - Layout wrapper
// ============================================

interface ResponsiveContainerProps extends HTMLAttributes<HTMLDivElement> {
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    padding?: boolean;
}

export const ResponsiveContainer = memo(forwardRef<HTMLDivElement, ResponsiveContainerProps>(
    ({ maxWidth = '2xl', padding = true, className, children, ...props }, ref) => {

        const maxWidthStyles = {
            sm: 'max-w-sm',
            md: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-xl',
            '2xl': 'max-w-2xl',
            'full': 'max-w-full'
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'mx-auto w-full',
                    maxWidthStyles[maxWidth],
                    padding && 'px-4 sm:px-6 lg:px-8',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
));

ResponsiveContainer.displayName = 'ResponsiveContainer';

// ============================================
// STACK - Flexbox wrapper optimizado
// ============================================

interface StackProps extends HTMLAttributes<HTMLDivElement> {
    direction?: 'row' | 'column';
    spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    responsive?: boolean;
}

export const Stack = memo(forwardRef<HTMLDivElement, StackProps>(
    ({
        direction = 'column',
        spacing = 'md',
        align = 'stretch',
        justify = 'start',
        responsive = false,
        className,
        children,
        ...props
    }, ref) => {

        const spacingStyles = {
            xs: 'gap-1',
            sm: 'gap-2',
            md: 'gap-4',
            lg: 'gap-6',
            xl: 'gap-8'
        };

        const alignStyles = {
            start: 'items-start',
            center: 'items-center',
            end: 'items-end',
            stretch: 'items-stretch'
        };

        const justifyStyles = {
            start: 'justify-start',
            center: 'justify-center',
            end: 'justify-end',
            between: 'justify-between',
            around: 'justify-around'
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'flex',
                    responsive ? 'flex-col sm:flex-row' : direction === 'row' ? 'flex-row' : 'flex-col',
                    spacingStyles[spacing],
                    alignStyles[align],
                    justifyStyles[justify],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
));

Stack.displayName = 'Stack';

// ============================================
// BRUTAL SKELETON - Loading state
// ============================================

interface BrutalSkeletonProps {
    lines?: number;
    className?: string;
}

export const BrutalSkeleton = memo(({ lines = 3, className }: BrutalSkeletonProps) => {
    return (
        <div className={cn('space-y-3', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-gray-200 border-2 border-black animate-pulse"
                    style={{ width: `${100 - (i * 15)}%` }}
                />
            ))}
        </div>
    );
});

BrutalSkeleton.displayName = 'BrutalSkeleton';

// ============================================
// BRUTAL BADGE - Etiqueta informativa
// ============================================

interface BrutalBadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'danger' | 'warning';
}

export const BrutalBadge = memo(forwardRef<HTMLSpanElement, BrutalBadgeProps>(
    ({ variant = 'default', className, children, ...props }, ref) => {

        const variantStyles = {
            default: 'bg-gray-200 text-black border-black',
            success: 'bg-green-500 text-white border-black',
            danger: 'bg-red-500 text-white border-black',
            warning: 'bg-yellow-400 text-black border-black'
        };

        return (
            <span
                ref={ref}
                className={cn(
                    'inline-block px-3 py-1',
                    'text-xs font-black uppercase tracking-wider',
                    'border-2',
                    variantStyles[variant],
                    className
                )}
                {...props}
            >
                {children}
            </span>
        );
    }
));

BrutalBadge.displayName = 'BrutalBadge';