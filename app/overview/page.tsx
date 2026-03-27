'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useOverview } from '@/hooks/use-overview';
import { useSavedFilters } from '@/hooks/use-saved-filters';
import { OverviewTableNew } from '@/components/overview/overview-table-new';
import { ActiveFiltersBar, type ActiveFilter } from '@/components/overview/column-filter-popover';
import { SavedFiltersDropdown } from '@/components/overview/saved-filters-dropdown';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ColumnManager } from '@/components/overview/column-manager';
import { Search, RefreshCcw, X } from 'lucide-react';

const STORAGE_KEY_COLUMNS = 'overview_visible_columns';
const STORAGE_KEY_COLUMN_ORDER = 'overview_column_order';

const AVAILABLE_COLUMNS = [
  { id: 'domainName', label: 'Domain', defaultVisible: true },
  { id: 'clientName', label: 'Client', defaultVisible: true },
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'cloudflareAccount', label: 'Cloudflare', defaultVisible: true },
  { id: 'websiteName', label: 'Website Name', defaultVisible: true },
  { id: 'websiteType', label: 'Website Type', defaultVisible: true },
  { id: 'websiteEnvironment', label: 'Environment', defaultVisible: true },
  { id: 'websiteUrls', label: 'Website URL', defaultVisible: false },
  { id: 'websiteAdminUrl', label: 'Admin URL', defaultVisible: false },
  { id: 'websiteUsername', label: 'Username', defaultVisible: false },
  { id: 'websitePassword', label: 'Password', defaultVisible: false },
  { id: 'websiteDbName', label: 'DB Name', defaultVisible: false },
  { id: 'websiteDbType', label: 'DB Type', defaultVisible: false },
  { id: 'subdomains', label: 'Subdomains', defaultVisible: false },
  { id: 'serverName', label: 'Server Name', defaultVisible: false },
  { id: 'serverIp', label: 'Server IP', defaultVisible: false },
  { id: 'serverProvider', label: 'Provider', defaultVisible: false },
  { id: 'serverType', label: 'Server Type', defaultVisible: false },
  { id: 'googleAnalytics', label: 'Google Analytics', defaultVisible: false },
  { id: 'googleSearchConsole', label: 'GSC', defaultVisible: false },
  { id: 'googleAds', label: 'Google Ads', defaultVisible: false },
  { id: 'tagManager', label: 'Tag Manager', defaultVisible: false },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export default function OverviewPage() {
  const defaultVisibleCols = AVAILABLE_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.id);
  const defaultColumnOrder = AVAILABLE_COLUMNS.map((c) => c.id);

  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultVisibleCols);
  const [columnOrder, setColumnOrder] = useState<string[]>(defaultColumnOrder);
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, ActiveFilter>>({});
  const [pageSize, setPageSize] = useState(20);
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({});

  // Load saved column state from localStorage on mount
  useEffect(() => {
    setVisibleColumns(loadFromStorage(STORAGE_KEY_COLUMNS, defaultVisibleCols));
    setColumnOrder(loadFromStorage(STORAGE_KEY_COLUMN_ORDER, defaultColumnOrder));
  }, []);

  // Fetch dynamic filter options from DB
  useEffect(() => {
    fetch('/api/overview/filter-options')
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          setFilterOptions(result.data);
        }
      })
      .catch((err) => console.error('Failed to fetch filter options', err));
  }, []);

  const [filters, setFilters] = useState<{
    page: number;
    pageSize: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    customFilters: any[];
    globalSearch: string;
  }>({
    page: 1,
    pageSize: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    customFilters: [],
    globalSearch: '',
  });

  // Convert column filters to customFilters array for API
  const activeFiltersArray = useMemo(() => {
    return Object.values(columnFilters);
  }, [columnFilters]);

  // Build final filters object (memoized to prevent infinite re-renders)
  const finalFilters = useMemo(
    () => ({
      ...filters,
      pageSize,
      customFilters: activeFiltersArray,
      globalSearch,
    }),
    [filters, pageSize, activeFiltersArray, globalSearch]
  );

  const { data, loading, pagination, availableCustomFields, refetch } = useOverview(finalFilters);
  const { filters: savedFiltersList, saveFilter, deleteFilter } = useSavedFilters(1, 'overview');

  const allColumns = useMemo(() => {
    const dynamicColumns = (availableCustomFields || []).map((cf: any) => ({
      id: `cf_${cf.fieldName}`,
      label: cf.fieldLabel,
      defaultVisible: false,
    }));
    return [...AVAILABLE_COLUMNS, ...dynamicColumns];
  }, [availableCustomFields]);

  // Column labels map
  const columnLabels = useMemo(() => {
    const map: Record<string, string> = {};
    allColumns.forEach((c) => (map[c.id] = c.label));
    return map;
  }, [allColumns]);

  // Handlers
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
  };

  const handleColumnFilterChange = useCallback((field: string, filter: ActiveFilter | null) => {
    setColumnFilters((prev) => {
      const next = { ...prev };
      if (filter) {
        next[field] = filter;
      } else {
        delete next[field];
      }
      return next;
    });
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleRemoveFilter = (field: string) => {
    handleColumnFilterChange(field, null);
  };

  const handleClearAllFilters = () => {
    setColumnFilters({});
    setGlobalSearch('');
    setFilters((prev) => ({ ...prev, page: 1, customFilters: [], globalSearch: '' }));
  };

  const handleColumnToggle = (colId: string) => {
    const next = visibleColumns.includes(colId)
      ? visibleColumns.filter((id) => id !== colId)
      : [...visibleColumns, colId];
    setVisibleColumns(next);
    saveToStorage(STORAGE_KEY_COLUMNS, next);
  };

  const handleColumnOrderChange = (newOrder: string[]) => {
    setColumnOrder(newOrder);
    saveToStorage(STORAGE_KEY_COLUMN_ORDER, newOrder);
  };

  const handleResetColumns = () => {
    setVisibleColumns(defaultVisibleCols);
    setColumnOrder(defaultColumnOrder);
    saveToStorage(STORAGE_KEY_COLUMNS, defaultVisibleCols);
    saveToStorage(STORAGE_KEY_COLUMN_ORDER, defaultColumnOrder);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setFilters((prev) => ({ ...prev, page: 1, pageSize: size }));
  };

  // Saved filters
  const handleApplySavedFilter = (savedFilter: any) => {
    if (savedFilter.filters) {
      // Convert saved filters array back to column filters map
      const newColumnFilters: Record<string, ActiveFilter> = {};
      savedFilter.filters.forEach((f: ActiveFilter) => {
        newColumnFilters[f.field] = f;
      });
      setColumnFilters(newColumnFilters);
    }
    if (savedFilter.columns) {
      setVisibleColumns(savedFilter.columns);
      saveToStorage(STORAGE_KEY_COLUMNS, savedFilter.columns);
    }
    if (savedFilter.columnOrder) {
      setColumnOrder(savedFilter.columnOrder);
      saveToStorage(STORAGE_KEY_COLUMN_ORDER, savedFilter.columnOrder);
    }
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleSaveCurrentFilter = async (name: string, isDefault: boolean) => {
    await saveFilter(
      name,
      Object.values(columnFilters),
      visibleColumns,
      isDefault
    );
  };

  const activeFilterCount = Object.keys(columnFilters).length + (globalSearch ? 1 : 0);

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Overview</h1>
          <p className="text-muted-foreground mt-1">
            Unified monitoring dashboard — filter, sort, and reorder columns freely
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SavedFiltersDropdown
            savedFilters={savedFiltersList}
            onApply={handleApplySavedFilter}
            onSave={handleSaveCurrentFilter}
            onDelete={deleteFilter}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Global Search */}
        <div className="relative flex-1 min-w-[250px] max-w-[400px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search across all fields..."
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
            className="pl-9 h-9"
          />
          {globalSearch && (
            <button
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setGlobalSearch('');
                setFilters((prev) => ({ ...prev, page: 1, globalSearch: '' }));
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Column Toggle & Reorder */}
        <ColumnManager
          allColumns={allColumns}
          visibleColumns={visibleColumns}
          columnOrder={columnOrder}
          onToggle={handleColumnToggle}
          onOrderChange={handleColumnOrderChange}
          onReset={handleResetColumns}
        />

        {/* Refresh */}
        <Button variant="outline" size="sm" className="h-9 gap-2" onClick={refetch} disabled={loading}>
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>

        {/* Active filter count */}
        {activeFilterCount > 0 && (
          <Badge variant="outline" className="h-9 px-3 gap-1.5 text-xs">
            {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
          </Badge>
        )}
      </div>

      {/* Active Filters Bar */}
      <ActiveFiltersBar
        filters={Object.values(columnFilters)}
        columnLabels={columnLabels}
        onRemove={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />

      {/* Table */}
      <OverviewTableNew
        data={data}
        loading={loading}
        visibleColumns={visibleColumns}
        availableColumns={allColumns}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        currentSort={{ by: filters.sortBy, order: filters.sortOrder }}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        columnOrder={columnOrder}
        onColumnOrderChange={handleColumnOrderChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        filterOptions={filterOptions}
      />
    </div>
  );
}
