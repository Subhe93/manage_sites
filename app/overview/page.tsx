'use client';

import { useState } from 'react';
import { useOverview } from '@/hooks/use-overview';
import { useSavedFilters } from '@/hooks/use-saved-filters';
import { OverviewTable } from '@/components/overview/overview-table';
import { OverviewFiltersComponent } from '@/components/overview/overview-filters';
import { SavedFiltersDropdown } from '@/components/overview/saved-filters-dropdown';
import { Card } from '@/components/ui/card';

// Define the available columns
export const AVAILABLE_COLUMNS = [
  { id: 'domainName', label: 'Domain', defaultVisible: true },
  { id: 'clientName', label: 'Client', defaultVisible: true },
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'cloudflareAccount', label: 'Cloudflare', defaultVisible: true },
  { id: 'websites', label: 'Websites Info', defaultVisible: true },
  { id: 'websiteUrls', label: 'Website URLs', defaultVisible: false },
  { id: 'websiteCreds', label: 'Website Logins', defaultVisible: false },
  { id: 'websiteDb', label: 'Databases', defaultVisible: false },
  { id: 'subdomains', label: 'Subdomains Full Info', defaultVisible: false },
  { id: 'serverDetails', label: 'Servers', defaultVisible: false },
  { id: 'googleAnalytics', label: 'Google Analytics', defaultVisible: false },
  { id: 'googleSearchConsole', label: 'GSC', defaultVisible: false },
  { id: 'googleAds', label: 'Google Ads', defaultVisible: false },
  { id: 'tagManager', label: 'Tag Manager', defaultVisible: false },
];

export default function OverviewPage() {
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
    customFilters: [],
  });

  const [visibleColumns, setVisibleColumns] = useState(
    AVAILABLE_COLUMNS.filter(c => c.defaultVisible).map(c => c.id)
  );

  const { data, loading, pagination, refetch } = useOverview(filters);
  const { filters: savedFiltersList, saveFilter, deleteFilter } = useSavedFilters(1, 'overview'); // Using dummy ID 1 for now

  const handleApplyFilter = (customFilters: any[]) => {
    setFilters(prev => ({ ...prev, customFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
  };

  const handleApplySavedFilter = (savedFilter: any) => {
    if (savedFilter.filters) {
      setFilters(prev => ({ ...prev, customFilters: savedFilter.filters, page: 1 }));
    }
    if (savedFilter.columns) {
      setVisibleColumns(savedFilter.columns);
    }
  };

  const handleSaveCurrentFilter = async (name: string, isDefault: boolean) => {
    await saveFilter(name, filters.customFilters, visibleColumns, isDefault);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Master Overview</h1>
          <p className="text-gray-500 mt-1">Unified view of domains, websites, and integrations</p>
        </div>
        <div className="flex items-center gap-3">
          <SavedFiltersDropdown 
            savedFilters={savedFiltersList} 
            onApply={handleApplySavedFilter} 
            onSave={handleSaveCurrentFilter} 
            onDelete={deleteFilter} 
          />
        </div>
      </div>

      <Card className="p-4">
        <OverviewFiltersComponent 
          onApply={handleApplyFilter} 
          availableColumns={AVAILABLE_COLUMNS} 
          visibleColumns={visibleColumns} 
          onColumnToggle={(cols: string[]) => setVisibleColumns(cols)} 
          currentFilters={filters.customFilters}
        />
      </Card>

      <OverviewTable 
        data={data} 
        loading={loading} 
        visibleColumns={visibleColumns} 
        pagination={pagination} 
        onPageChange={handlePageChange} 
        onSortChange={handleSortChange} 
        currentSort={{ by: filters.sortBy, order: filters.sortOrder }} 
      />
    </div>
  );
}
