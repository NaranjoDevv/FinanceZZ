'use client';

import React, { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { BrutalButton, BrutalBadge, BrutalCheckbox } from './index';

// ============================================
// BRUTAL TABLE - Tabla optimizada con estética brutalista
// ============================================

interface BrutalTableColumn<T = any> {
    key: string;
    title: string;
    dataIndex?: keyof T;
    render?: (value: any, record: T, index: number) => ReactNode;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

interface BrutalTableProps<T = any> {
    columns: BrutalTableColumn<T>[];
    data: T[];
    loading?: boolean;
    selectable?: boolean;
    selectedRows?: string[];
    onSelectRow?: (id: string, selected: boolean) => void;
    onSelectAll?: (selected: boolean) => void;
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    sortKey?: string;
    sortDirection?: 'asc' | 'desc';
    emptyText?: string;
    className?: string;
    rowKey?: keyof T | ((record: T) => string);
    onRowClick?: (record: T, index: number) => void;
}

export const BrutalTable = memo(<T extends Record<string, any>>(
    {
        columns,
        data,
        loading = false,
        selectable = false,
        selectedRows = [],
        onSelectRow,
        onSelectAll,
        onSort,
        sortKey,
        sortDirection,
        emptyText = 'NO HAY DATOS',
        className,
        rowKey = 'id',
        onRowClick
    }: BrutalTableProps<T>
) => {
    const getRowKey = (record: T): string => {
        if (typeof rowKey === 'function') {
            return rowKey(record);
        }
        return String(record[rowKey]);
    };

    const handleSort = (key: string) => {
        if (!onSort) return;
        
        const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
        onSort(key, newDirection);
    };

    const isAllSelected = data.length > 0 && selectedRows.length === data.length;
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

    if (loading) {
        return (
            <div className={cn('border-4 border-black bg-white', className)}>
                <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-bold uppercase tracking-wide text-black">
                            CARGANDO DATOS...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('border-4 border-black bg-white overflow-hidden', className)}>
            {/* Header */}
            <div className="bg-black text-white">
                <div className="flex">
                    {selectable && (
                        <div className="w-12 flex items-center justify-center py-4 border-r-4 border-white">
                            <BrutalCheckbox
                                checked={isAllSelected}
                                onChange={(e) => onSelectAll?.(e.target.checked)}
                                className="w-4 h-4 border-2 border-white bg-black checked:bg-white checked:border-white"
                            />
                        </div>
                    )}
                    {columns.map((column) => (
                        <div
                            key={column.key}
                            className={cn(
                                'flex items-center py-4 px-4 border-r-4 border-white last:border-r-0',
                                column.width || 'flex-1',
                                column.align === 'center' && 'justify-center',
                                column.align === 'right' && 'justify-end',
                                column.sortable && 'cursor-pointer hover:bg-gray-800'
                            )}
                            onClick={() => column.sortable && handleSort(column.key)}
                        >
                            <span className="text-sm font-black uppercase tracking-wider">
                                {column.title}
                            </span>
                            {column.sortable && (
                                <span className="ml-2 text-xs">
                                    {sortKey === column.key ? (
                                        sortDirection === 'asc' ? '▲' : '▼'
                                    ) : (
                                        '▲▼'
                                    )}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div className="bg-white">
                {data.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                        <p className="text-lg font-bold uppercase tracking-wide text-gray-500">
                            {emptyText}
                        </p>
                    </div>
                ) : (
                    data.map((record, index) => {
                        const key = getRowKey(record);
                        const isSelected = selectedRows.includes(key);
                        
                        return (
                            <div
                                key={key}
                                className={cn(
                                    'flex border-b-2 border-gray-200 last:border-b-0',
                                    'hover:bg-gray-50 transition-colors',
                                    isSelected && 'bg-yellow-100',
                                    onRowClick && 'cursor-pointer'
                                )}
                                onClick={() => onRowClick?.(record, index)}
                            >
                                {selectable && (
                                    <div className="w-12 flex items-center justify-center py-4 border-r-2 border-gray-200">
                                        <BrutalCheckbox
                                            checked={isSelected}
                                            onChange={(e) => onSelectRow?.(key, e.target.checked)}
                                            className="w-4 h-4"
                                        />
                                    </div>
                                )}
                                {columns.map((column) => (
                                    <div
                                        key={column.key}
                                        className={cn(
                                            'flex items-center py-4 px-4 border-r-2 border-gray-200 last:border-r-0',
                                            column.width || 'flex-1',
                                            column.align === 'center' && 'justify-center',
                                            column.align === 'right' && 'justify-end'
                                        )}
                                    >
                                        {column.render ? (
                                            column.render(
                                                column.dataIndex ? record[column.dataIndex] : record,
                                                record,
                                                index
                                            )
                                        ) : (
                                            <span className="text-sm font-bold text-black">
                                                {column.dataIndex ? String(record[column.dataIndex] || '') : ''}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
});

BrutalTable.displayName = 'BrutalTable';

// ============================================
// BRUTAL TABLE ACTIONS - Acciones de tabla
// ============================================

interface BrutalTableActionsProps {
    children: ReactNode;
    className?: string;
}

export const BrutalTableActions = memo(({ children, className }: BrutalTableActionsProps) => {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            {children}
        </div>
    );
});

BrutalTableActions.displayName = 'BrutalTableActions';

// ============================================
// BRUTAL TABLE STATUS - Estado de tabla
// ============================================

interface BrutalTableStatusProps {
    total: number;
    selected?: number;
    loading?: boolean;
    className?: string;
}

export const BrutalTableStatus = memo(({ 
    total, 
    selected = 0, 
    loading = false, 
    className 
}: BrutalTableStatusProps) => {
    return (
        <div className={cn('flex items-center gap-4 text-sm font-bold uppercase', className)}>
            <span className="text-black">
                TOTAL: {total}
            </span>
            {selected > 0 && (
                <BrutalBadge variant="warning">
                    {selected} SELECCIONADOS
                </BrutalBadge>
            )}
            {loading && (
                <span className="text-gray-500">
                    CARGANDO...
                </span>
            )}
        </div>
    );
});

BrutalTableStatus.displayName = 'BrutalTableStatus';