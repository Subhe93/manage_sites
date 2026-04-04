'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, ArrowUpDown, ExternalLink, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PasswordDisplay } from '@/components/ui/password-display';
import React, { useState, useRef, useCallback } from 'react';
import {
  ColumnFilterPopover,
  type ActiveFilter,
  type ColumnFilterConfig,
} from './column-filter-popover';

// Column filter configurations
export const COLUMN_FILTER_CONFIGS: Record<string, ColumnFilterConfig> = {
  domainName: { type: 'text' },
  clientName: { type: 'text' },
  status: {
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'expired', label: 'Expired' },
      { value: 'pending', label: 'Pending' },
      { value: 'suspended', label: 'Suspended' },
      { value: 'transferred', label: 'Transferred' },
    ],
  },
  cloudflareAccount: { type: 'multiSelect', optionsKey: 'cloudflareAccount' },
  websiteName: { type: 'text' },
  websiteType: {
    type: 'select',
    options: [
      { value: 'wordpress', label: 'WordPress' },
      { value: 'custom', label: 'Custom' },
      { value: 'static', label: 'Static' },
      { value: 'ecommerce', label: 'E-Commerce' },
      { value: 'laravel', label: 'Laravel' },
      { value: 'nextjs', label: 'Next.js' },
      { value: 'other', label: 'Other' },
    ],
  },
  websiteEnvironment: {
    type: 'select',
    options: [
      { value: 'production', label: 'Production' },
      { value: 'staging', label: 'Staging' },
      { value: 'development', label: 'Development' },
    ],
  },
  websiteUrls: { type: 'text' },
  websiteAdminUrl: { type: 'text' },
  websiteUsername: { type: 'text' },
  websiteDbName: { type: 'text' },
  websiteDbType: {
    type: 'select',
    options: [
      { value: 'mysql', label: 'MySQL' },
      { value: 'postgresql', label: 'PostgreSQL' },
      { value: 'mongodb', label: 'MongoDB' },
      { value: 'sqlite', label: 'SQLite' },
      { value: 'other', label: 'Other' },
    ],
  },
  serverName: { type: 'multiSelect', optionsKey: 'serverName' },
  serverIp: { type: 'multiSelect', optionsKey: 'serverIp' },
  serverProvider: { type: 'multiSelect', optionsKey: 'serverProvider' },
  serverType: {
    type: 'multiSelect',
    optionsKey: 'serverType',
    options: [
      { value: 'shared', label: 'Shared' },
      { value: 'vps', label: 'VPS' },
      { value: 'dedicated', label: 'Dedicated' },
      { value: 'cloud', label: 'Cloud' },
    ],
  },
  googleAnalytics: { type: 'multiSelect', optionsKey: 'googleAnalytics' },
  googleSearchConsole: { type: 'multiSelect', optionsKey: 'googleSearchConsole' },
  googleAds: { type: 'multiSelect', optionsKey: 'googleAds' },
  tagManager: { type: 'multiSelect', optionsKey: 'tagManager' },
  hasWebsite: { type: 'boolean' },
  subdomains: { type: 'text' },
  websitePassword: { type: 'text' },
};

interface OverviewTableNewProps {
  data: any[];
  loading: boolean;
  visibleColumns: string[];
  availableColumns: { id: string; label: string }[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  currentSort: { by: string; order: 'asc' | 'desc' };
  columnFilters: Record<string, ActiveFilter>;
  onColumnFilterChange: (field: string, filter: ActiveFilter | null) => void;
  columnOrder: string[];
  onColumnOrderChange: (newOrder: string[]) => void;
  pageSize: number | 'all';
  onPageSizeChange: (size: number | 'all') => void;
  filterOptions: Record<string, string[]>;
}

export function OverviewTableNew({
  data,
  loading,
  visibleColumns,
  availableColumns,
  pagination,
  onPageChange,
  onSortChange,
  currentSort,
  columnFilters,
  onColumnFilterChange,
  columnOrder,
  onColumnOrderChange,
  pageSize,
  onPageSizeChange,
  filterOptions,
}: OverviewTableNewProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [draggedCol, setDraggedCol] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSort = (column: string) => {
    const newOrder = currentSort.by === column && currentSort.order === 'asc' ? 'desc' : 'asc';
    onSortChange(column, newOrder);
  };

  // Drag & drop column reorder
  const handleDragStart = (e: React.DragEvent, colId: string) => {
    setDraggedCol(colId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', colId);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (colId !== draggedCol) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetCol: string) => {
    e.preventDefault();
    if (draggedCol && draggedCol !== targetCol) {
      const newOrder = [...columnOrder];
      const fromIdx = newOrder.indexOf(draggedCol);
      const toIdx = newOrder.indexOf(targetCol);
      if (fromIdx !== -1 && toIdx !== -1) {
        newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, draggedCol);
        onColumnOrderChange(newOrder);
      }
    }
    setDraggedCol(null);
    setDragOverCol(null);
  };

  const handleDragEnd = () => {
    setDraggedCol(null);
    setDragOverCol(null);
  };

  // Get ordered visible columns (include any visible columns not yet in order array)
  const orderedColumns = [
    ...columnOrder.filter((c) => visibleColumns.includes(c)),
    ...visibleColumns.filter((c) => !columnOrder.includes(c)),
  ];

  const getColumnLabel = (colId: string): string => {
    return availableColumns.find((c) => c.id === colId)?.label || colId;
  };

  const FilterableHeader = ({ columnId }: { columnId: string }) => {
    const label = getColumnLabel(columnId);
    const isSorted = currentSort.by === columnId;
    const filterConfig = COLUMN_FILTER_CONFIGS[columnId] || { type: 'text' as const };
    const isDragOver = dragOverCol === columnId;

    return (
      <TableHead
        className={`whitespace-nowrap select-none transition-all ${
          isDragOver ? 'bg-primary/10 border-l-2 border-primary' : ''
        } ${draggedCol === columnId ? 'opacity-50' : ''}`}
        draggable
        onDragStart={(e) => handleDragStart(e, columnId)}
        onDragOver={(e) => handleDragOver(e, columnId)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, columnId)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-center gap-1">
          <GripVertical className="h-3 w-3 text-muted-foreground/30 cursor-grab shrink-0" />
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            onClick={() => handleSort(columnId)}
          >
            <span className="text-xs font-semibold">{label}</span>
            {isSorted ? (
              currentSort.order === 'asc' ? (
                <ArrowUp className="h-3 w-3 text-primary" />
              ) : (
                <ArrowDown className="h-3 w-3 text-primary" />
              )
            ) : (
              <ArrowUpDown className="h-3 w-3 opacity-20" />
            )}
          </button>
          <ColumnFilterPopover
            columnId={columnId}
            columnLabel={label}
            filterConfig={filterConfig}
            activeFilter={columnFilters[columnId]}
            onApply={(filter) => onColumnFilterChange(columnId, filter)}
            dynamicOptions={filterConfig.optionsKey ? filterOptions[filterConfig.optionsKey] : undefined}
          />
        </div>
      </TableHead>
    );
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              {orderedColumns.map((colId) => (
                <FilterableHeader key={colId} columnId={colId} />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={orderedColumns.length} className="text-center py-16 text-muted-foreground">
                  <div className="space-y-2">
                    <p className="text-lg font-medium">No records found</p>
                    <p className="text-sm">Try adjusting your filters or search criteria</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((domain) => {
                const websites = domain.website ? [domain.website] : [];
                return (
                  <React.Fragment key={domain.id}>
                    <TableRow
                      className={`hover:bg-muted/40 transition-colors ${
                        expandedRows.has(domain.id) ? 'bg-muted/10' : ''
                      }`}
                    >
                      {orderedColumns.map((colId) => (
                        <CellRenderer
                          key={colId}
                          columnId={colId}
                          domain={domain}
                          websites={websites}
                          expanded={expandedRows.has(domain.id)}
                          onToggleExpand={() => toggleRow(domain.id)}
                          availableColumns={availableColumns}
                        />
                      ))}
                    </TableRow>
                    {expandedRows.has(domain.id) &&
                      websites.some((w: any) => w.subdomains?.length > 0) && (
                        <TableRow className="bg-muted/5 border-t-0 hover:bg-muted/5">
                          <TableCell colSpan={orderedColumns.length} className="p-0">
                            <SubdomainExpansion websites={websites} />
                          </TableCell>
                        </TableRow>
                      )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <PaginationBar
        pagination={pagination}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}

// Cell Renderer
function CellRenderer({
  columnId,
  domain,
  websites,
  expanded,
  onToggleExpand,
  availableColumns,
}: {
  columnId: string;
  domain: any;
  websites: any[];
  expanded: boolean;
  onToggleExpand: () => void;
  availableColumns: { id: string; label: string }[];
}) {
  switch (columnId) {
    case 'domainName':
      return (
        <TableCell className="font-medium align-top">
          <div className="flex items-center gap-1.5">
            {websites.some((w: any) => w.subdomains?.length > 0) ? (
              <button
                onClick={onToggleExpand}
                className="h-5 w-5 p-0 rounded hover:bg-muted flex items-center justify-center shrink-0"
              >
                {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            ) : (
              <div className="w-5" />
            )}
            <span className="text-sm">{domain.domainName}</span>
          </div>
        </TableCell>
      );
    case 'clientName':
      return <TableCell className="align-top text-sm">{domain.client?.clientName || '-'}</TableCell>;
    case 'status':
      return (
        <TableCell className="align-top">
          <StatusBadge status={domain.status} />
        </TableCell>
      );
    case 'cloudflareAccount':
      return <TableCell className="align-top text-sm">{domain.cloudflareAccount?.accountName || '-'}</TableCell>;
    case 'websiteName':
      return <WebsiteTextCell websites={websites} field="websiteName" />;
    case 'websiteType':
      return (
        <TableCell className="align-top">
          {websites.length > 0 ? (
            <div className="space-y-2">
              {websites.map((w: any) => (
                <div key={w.id}>
                  <Badge variant="secondary" className="text-[10px] uppercase">{w.websiteType}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">-</span>
          )}
        </TableCell>
      );
    case 'websiteEnvironment':
      return (
        <TableCell className="align-top">
          {websites.length > 0 ? (
            <div className="space-y-2">
              {websites.map((w: any) => (
                <div key={w.id}>
                  <Badge variant="outline" className="text-[10px] capitalize">{w.environment}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">-</span>
          )}
        </TableCell>
      );
    case 'websiteUrls':
      return (
        <TableCell className="align-top">
          {websites.length > 0 ? (
            <div className="space-y-2">
              {websites.map((w: any) => (
                <div key={w.id} className="text-sm space-y-0.5">
                  {w.websiteUrl ? (
                    <a href={w.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 break-all text-xs">
                      {w.websiteUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : <span className="text-muted-foreground text-xs">-</span>}
                </div>
              ))}
            </div>
          ) : <span className="text-muted-foreground text-xs">-</span>}
        </TableCell>
      );
    case 'websiteAdminUrl':
      return (
        <TableCell className="align-top">
          {websites.length > 0 ? (
            <div className="space-y-2">
              {websites.map((w: any) => (
                <div key={w.id} className="text-sm">
                  {w.adminUrl ? (
                    <a href={w.adminUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline flex items-center gap-1 break-all text-xs">
                      {w.adminUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : <span className="text-muted-foreground text-xs">-</span>}
                </div>
              ))}
            </div>
          ) : <span className="text-muted-foreground text-xs">-</span>}
        </TableCell>
      );
    case 'websiteUsername':
      return (
        <TableCell className="align-top">
          {websites.length > 0 ? (
            <div className="space-y-2">
              {websites.map((w: any) => (
                <div key={w.id} className="text-sm">
                  {w.credentials?.length > 0 ? (
                    w.credentials.map((c: any, i: number) => (
                      <div key={i} className="font-medium break-all text-xs">{c.username || '-'}</div>
                    ))
                  ) : <span className="text-muted-foreground text-xs italic">-</span>}
                </div>
              ))}
            </div>
          ) : <span className="text-muted-foreground text-xs">-</span>}
        </TableCell>
      );
    case 'websitePassword':
      return (
        <TableCell className="align-top">
          {websites.length > 0 ? (
            <div className="space-y-2">
              {websites.map((w: any) => (
                <div key={w.id} className="text-sm">
                  {w.credentials?.length > 0 ? (
                    w.credentials.map((c: any, i: number) => (
                      <div key={i}><PasswordDisplay value={c.passwordEncrypted} /></div>
                    ))
                  ) : <span className="text-muted-foreground text-xs italic">-</span>}
                </div>
              ))}
            </div>
          ) : <span className="text-muted-foreground text-xs">-</span>}
        </TableCell>
      );
    case 'websiteDbName':
      return <WebsiteTextCell websites={websites} field="databaseName" />;
    case 'websiteDbType':
      return (
        <TableCell className="align-top">
          {websites.length > 0 ? (
            <div className="space-y-2">
              {websites.map((w: any) => (
                <div key={w.id} className="uppercase text-muted-foreground text-xs">{w.databaseType || '-'}</div>
              ))}
            </div>
          ) : <span className="text-muted-foreground text-xs">-</span>}
        </TableCell>
      );
    case 'subdomains':
      return (
        <TableCell className="align-top">
          {websites.length > 0 ? (
            <div className="space-y-2">
              {websites.map((w: any) => (
                <div key={w.id}>
                  {w.subdomains?.length > 0 ? (
                    <Badge variant="secondary" className="text-[10px]">{w.subdomains.length} subdomain(s)</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </div>
              ))}
            </div>
          ) : <span className="text-muted-foreground text-xs">-</span>}
        </TableCell>
      );
    case 'serverName':
      return <ServerFieldCell websites={websites} field="serverName" />;
    case 'serverIp':
      return <ServerFieldCell websites={websites} field="ipAddress" mono />;
    case 'serverProvider':
      return (
        <TableCell className="align-top text-sm">
          {websites.length > 0 ? (
            <div className="space-y-2">
              {websites.map((w: any) => {
                const server = w.server || w.serverAccount?.server;
                return <div key={w.id} className="text-xs">{server?.provider?.providerName || '-'}</div>;
              })}
            </div>
          ) : <span className="text-muted-foreground text-xs">-</span>}
        </TableCell>
      );
    case 'serverType':
      return (
        <TableCell className="align-top">
          {websites.length > 0 ? (
            <div className="space-y-2">
              {websites.map((w: any) => {
                const server = w.server || w.serverAccount?.server;
                const type = server?.serverType;
                return (
                  <div key={w.id}>
                    {type ? (
                      <Badge variant="outline" className="text-[10px] uppercase">{type}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : <span className="text-muted-foreground text-xs">-</span>}
        </TableCell>
      );
    case 'googleAnalytics':
      return <GoogleServiceCell websites={websites} field="googleAnalyticsAccount" />;
    case 'googleSearchConsole':
      return <GoogleServiceCell websites={websites} field="googleSearchConsoleAccount" />;
    case 'googleAds':
      return <GoogleServiceCell websites={websites} field="googleAdsAccount" />;
    case 'tagManager':
      return <GoogleServiceCell websites={websites} field="googleTagManagerAccount" />;
    default:
      // Custom fields
      if (columnId.startsWith('cf_')) {
        const fieldName = columnId.substring(3);
        return (
          <TableCell className="align-top text-sm">
            {websites.length > 0 ? (
              <div className="space-y-2">
                {websites.map((w: any) => {
                  const cfv = w.customFieldValues?.find((v: any) => v.fieldDefinition?.fieldName === fieldName);
                  return <div key={w.id} className="text-xs">{cfv?.fieldValue || '-'}</div>;
                })}
              </div>
            ) : <span className="text-muted-foreground text-xs">-</span>}
          </TableCell>
        );
      }
      return <TableCell className="align-top text-xs text-muted-foreground">-</TableCell>;
  }
}

// Helper components
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    expired: 'bg-red-100 text-red-700 border-red-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    suspended: 'bg-slate-100 text-slate-700 border-slate-200',
    transferred: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  return (
    <Badge variant="outline" className={`text-[11px] capitalize ${colors[status] || ''}`}>
      {status}
    </Badge>
  );
}

function WebsiteTextCell({ websites, field }: { websites: any[]; field: string }) {
  return (
    <TableCell className="align-top">
      {websites.length > 0 ? (
        <div className="space-y-2">
          {websites.map((w: any) => (
            <div key={w.id} className="text-sm font-medium">{w[field] || '-'}</div>
          ))}
        </div>
      ) : <span className="text-muted-foreground text-xs">-</span>}
    </TableCell>
  );
}

function ServerFieldCell({ websites, field, mono }: { websites: any[]; field: string; mono?: boolean }) {
  return (
    <TableCell className="align-top">
      {websites.length > 0 ? (
        <div className="space-y-2">
          {websites.map((w: any) => {
            const server = w.server || w.serverAccount?.server;
            return (
              <div key={w.id} className={`text-xs ${mono ? 'font-mono' : ''}`}>
                {server?.[field] || '-'}
              </div>
            );
          })}
        </div>
      ) : <span className="text-muted-foreground text-xs">-</span>}
    </TableCell>
  );
}

function GoogleServiceCell({ websites, field }: { websites: any[]; field: string }) {
  return (
    <TableCell className="align-top text-sm">
      {websites.length > 0 ? (
        <div className="space-y-1">
          {websites.map((w: any) =>
            w[field] ? (
              <div key={w.id} className="text-xs">{w[field].accountName}</div>
            ) : (
              <div key={w.id} className="text-muted-foreground text-xs">-</div>
            )
          )}
        </div>
      ) : <span className="text-muted-foreground text-xs">-</span>}
    </TableCell>
  );
}

function PaginationBar({
  pagination,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  pageSize: number | 'all';
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number | 'all') => void;
}) {
  const isShowAll = pageSize === 'all';
  const { page, total, totalPages } = pagination;

  // Generate visible page numbers
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [];
    if (page <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t pt-4">
      {/* Left: Info & page size */}
      <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground">
          {isShowAll ? (
            <>
              Showing all <span className="font-semibold text-foreground">{total}</span> records
            </>
          ) : (
            <>
              Showing{' '}
              <span className="font-semibold text-foreground">
                {total === 0 ? 0 : (page - 1) * pagination.pageSize + 1}
              </span>
              {' '}-{' '}
              <span className="font-semibold text-foreground">
                {Math.min(page * pagination.pageSize, total)}
              </span>
              {' '}of{' '}
              <span className="font-semibold text-foreground">{total}</span>
            </>
          )}
        </p>
        <div className="flex items-center gap-2 border-l pl-4">
          <span className="text-xs text-muted-foreground">Rows per page</span>
          <select
            className="h-8 rounded-md border bg-background px-2 text-sm font-medium cursor-pointer hover:bg-accent transition-colors"
            value={pageSize}
            onChange={(e) => {
              const val = e.target.value;
              onPageSizeChange(val === 'all' ? 'all' : Number(val));
            }}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Right: Page navigation */}
      {!isShowAll && totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            title="First page"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            title="Previous page"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Button>

          {getPageNumbers().map((p, i) =>
            p === '...' ? (
              <span key={`dots-${i}`} className="px-1 text-muted-foreground text-sm">...</span>
            ) : (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                className={`h-8 w-8 p-0 text-sm font-medium ${p === page ? '' : 'text-muted-foreground'}`}
                onClick={() => onPageChange(p as number)}
              >
                {p}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            title="Next page"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(totalPages)}
            disabled={page === totalPages}
            title="Last page"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}

function SubdomainExpansion({ websites }: { websites: any[] }) {
  return (
    <div className="px-14 py-4 bg-muted/10 border-b border-muted">
      <h4 className="text-sm font-semibold mb-3">Subdomains Overview</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {websites.map((w: any) =>
          w.subdomains?.map((sub: any) => (
            <div key={sub.id} className="bg-background p-3 rounded-md border text-sm shadow-sm space-y-2">
              <div className="flex justify-between items-start">
                <div className="font-semibold text-primary text-xs">{sub.subdomainName}</div>
                {sub.websiteType && (
                  <Badge variant="outline" className="text-[10px] uppercase">{sub.websiteType}</Badge>
                )}
              </div>
              <div className="space-y-1 pt-2 border-t text-xs">
                {sub.fullUrl && (
                  <a href={sub.fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 break-all">
                    {sub.fullUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                )}
                {sub.adminUrl && (
                  <a href={sub.adminUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline flex items-center gap-1 break-all">
                    {sub.adminUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                )}
                {(sub.adminUsername || sub.adminPassword) && (
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t">
                    <div>
                      <span className="text-muted-foreground">User:</span>{' '}
                      <span className="font-medium">{sub.adminUsername || '-'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pass:</span>{' '}
                      <PasswordDisplay value={sub.adminPassword} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
