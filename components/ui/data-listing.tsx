"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

interface Filter {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
}

interface DataListingProps<T = Record<string, unknown>> {
  data: T[];
  title: string;
  searchPlaceholder?: string;
  searchKeys?: string[];
  filters?: Filter[];
  isLoading?: boolean;
  onItemAction?: (action: string, item: T) => void;
  renderListItem: (item: T, index: number) => ReactNode;
  renderGridItem: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  emptySubMessage?: string;
  enableViewToggle?: boolean;
  defaultViewMode?: 'list' | 'grid';
  enableSearch?: boolean;
  enableFilters?: boolean;
  className?: string;
  hideViewToggleOnMobile?: boolean;
  minGridColumns?: number;
}

export default function DataListing<T = Record<string, unknown>>({
  data,
  title,
  searchPlaceholder = "Buscar...",
  searchKeys = [],
  filters = [],
  isLoading = false,
  renderListItem,
  renderGridItem,
  emptyMessage = "No hay datos disponibles",
  emptySubMessage,
  enableViewToggle = true,
  defaultViewMode = 'list',
  enableSearch = true,
  enableFilters = false,
  className = "",
  hideViewToggleOnMobile = false,
  minGridColumns = 2,
}: DataListingProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(defaultViewMode);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [shouldHideToggle, setShouldHideToggle] = useState(false);

  // Initialize filter values
  useEffect(() => {
    const initialValues: Record<string, string> = {};
    filters.forEach(filter => {
      initialValues[filter.key] = filter.defaultValue || filter.options[0]?.value || "";
    });
    setFilterValues(initialValues);
  }, [filters]);

  // Check if grid view should be hidden on mobile
  useEffect(() => {
    if (!hideViewToggleOnMobile) return;

    const checkViewport = () => {
      const width = window.innerWidth;
      const shouldHide = width < 768 && width / 200 < minGridColumns;
      setShouldHideToggle(shouldHide);
      
      if (shouldHide && viewMode === 'grid') {
        setViewMode('list');
      }
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, [hideViewToggleOnMobile, minGridColumns, viewMode]);

  const filteredData = data.filter(item => {
    // Search filter
    if (searchTerm && enableSearch) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchKeys.some(key => {
        const value = getNestedValue(item as Record<string, unknown>, key);
        return value?.toString().toLowerCase().includes(searchLower);
      });
      if (!matchesSearch) return false;
    }

    // Custom filters
    if (enableFilters && filters.length > 0) {
      for (const filter of filters) {
        const filterValue = filterValues[filter.key];
        if (filterValue && filterValue !== "all") {
          const itemValue = getNestedValue(item as Record<string, unknown>, filter.key);
          if (itemValue !== filterValue) return false;
        }
      }
    }

    return true;
  });

  const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
    return path.split('.').reduce((current: unknown, key: string) => {
      return current && typeof current === 'object' && current !== null 
        ? (current as Record<string, unknown>)[key] 
        : undefined;
    }, obj);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [filterKey]: value }));
  };

  if (isLoading) {
    return (
      <div className={className}>
        <Card className="brutal-card">
          <div className="p-6 border-b-4 border-black">
            <div className="h-6 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Search and Filters */}
      {(enableSearch || enableFilters) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-4 mb-4">
            {enableFilters && (
              <Button
                className={`brutal-button ${showFilters ? 'bg-black text-white' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FunnelIcon className="w-5 h-5 mr-2" />
                Filtros
              </Button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && enableFilters && (
              <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="mb-6"
              >
                <Card className="brutal-card p-6">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                      {enableSearch && (
                        <div className="relative flex-1 max-w-md">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          <Input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border-2 border-black font-medium focus:outline-none focus:ring-0 focus:border-gray-600 text-sm sm:text-base"
                          />
                        </div>
                      )}

                      {filters.map((filter) => (
                        <Select
                          key={filter.key}
                          value={filterValues[filter.key] || ""}
                          onValueChange={(value) => handleFilterChange(filter.key, value)}
                        >
                          <SelectTrigger className="w-full sm:w-48 h-10 sm:h-12 text-sm sm:text-base">
                            <SelectValue placeholder={filter.label} />
                          </SelectTrigger>
                          <SelectContent>
                            {filter.options.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Data List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="brutal-card">
          <div className="p-6 border-b-4 border-black">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-wide">
                {title} ({filteredData.length})
              </h2>
              {enableViewToggle && !shouldHideToggle && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`p-2 border-2 transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-black hover:border-black'
                    }`}
                  >
                    <ListBulletIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`p-2 border-2 transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-black hover:border-black'
                    }`}
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="p-6">
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 font-medium text-lg mb-2">
                  {emptyMessage}
                </p>
                {emptySubMessage && (
                  <p className="text-gray-400 text-sm">
                    {emptySubMessage}
                  </p>
                )}
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-4">
                {filteredData.map((item, index) => (
                  <div key={index}>
                    {renderListItem(item, index)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredData.map((item, index) => (
                  <div key={index}>
                    {renderGridItem(item, index)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}