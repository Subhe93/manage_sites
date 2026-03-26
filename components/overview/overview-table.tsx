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
import { ArrowUp, ArrowDown, ArrowUpDown, Loader2, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PasswordDisplay } from '@/components/ui/password-display';

interface OverviewTableProps {
  data: any[];
  loading: boolean;
  visibleColumns: string[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  currentSort: { by: string; order: 'asc' | 'desc' };
}

export function OverviewTable({
  data,
  loading,
  visibleColumns,
  pagination,
  onPageChange,
  onSortChange,
  currentSort,
}: OverviewTableProps) {

  const handleSort = (column: string) => {
    const newOrder = currentSort.by === column && currentSort.order === 'asc' ? 'desc' : 'asc';
    onSortChange(column, newOrder);
  };

  const SortableHeader = ({ columnId, label }: { columnId: string; label: string }) => {
    const isSorted = currentSort.by === columnId;
    return (
      <TableHead
        className="cursor-pointer select-none hover:bg-muted/50 whitespace-nowrap"
        onClick={() => handleSort(columnId)}
      >
        <div className="flex items-center gap-2">
          {label}
          {isSorted ? (
            currentSort.order === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 opacity-30" />
          )}
        </div>
      </TableHead>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              {visibleColumns.includes('domainName') && <SortableHeader columnId="domainName" label="Domain" />}
              {visibleColumns.includes('clientName') && <SortableHeader columnId="clientName" label="Client" />}
              {visibleColumns.includes('status') && <SortableHeader columnId="status" label="Domain Status" />}
              {visibleColumns.includes('cloudflareAccount') && <SortableHeader columnId="cloudflareAccount" label="Cloudflare" />}
              {visibleColumns.includes('websites') && <TableHead className="min-w-[150px]">Websites Basic</TableHead>}
              {visibleColumns.includes('websiteUrls') && <TableHead className="min-w-[200px]">Website URLs</TableHead>}
              {visibleColumns.includes('websiteCreds') && <TableHead className="min-w-[250px]">Website Logins</TableHead>}
              {visibleColumns.includes('websiteDb') && <TableHead className="min-w-[180px]">Databases</TableHead>}
              {visibleColumns.includes('subdomains') && <TableHead className="min-w-[300px]">Subdomains</TableHead>}
              {visibleColumns.includes('serverDetails') && <TableHead className="min-w-[200px]">Servers Info</TableHead>}
              {visibleColumns.includes('googleAnalytics') && <TableHead className="whitespace-nowrap">Google Analytics</TableHead>}
              {visibleColumns.includes('googleSearchConsole') && <TableHead className="whitespace-nowrap">Search Console</TableHead>}
              {visibleColumns.includes('googleAds') && <TableHead className="whitespace-nowrap">Google Ads</TableHead>}
              {visibleColumns.includes('tagManager') && <TableHead className="whitespace-nowrap">Tag Manager</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="text-center py-12 text-muted-foreground">
                  No records found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              data.map((domain) => {
                const websites = domain.website ? [domain.website] : [];
                return (
                  <TableRow key={domain.id} className="hover:bg-muted/40 transition-colors">
                    {visibleColumns.includes('domainName') && (
                      <TableCell className="font-medium align-top">
                        {domain.domainName}
                      </TableCell>
                    )}
                    {visibleColumns.includes('clientName') && (
                      <TableCell className="align-top text-sm">
                        {domain.client?.clientName || '-'}
                      </TableCell>
                    )}
                    {visibleColumns.includes('status') && (
                      <TableCell className="align-top">
                        <Badge variant="outline" className="text-[11px] capitalize">{domain.status}</Badge>
                      </TableCell>
                    )}
                    {visibleColumns.includes('cloudflareAccount') && (
                      <TableCell className="align-top text-sm">
                        {domain.cloudflareAccount?.accountName || '-'}
                      </TableCell>
                    )}
                    {visibleColumns.includes('websites') && (
                      <TableCell className="align-top">
                        {websites.length > 0 ? (
                          <div className="space-y-3">
                            {websites.map((w: any, idx: number) => (
                              <div key={w.id} className={`text-sm ${idx !== websites.length - 1 ? 'border-b pb-2' : ''}`}>
                                <div className="font-semibold text-primary">{w.websiteName}</div>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="secondary" className="text-[10px]">{w.websiteType}</Badge>
                                  <Badge variant="outline" className="text-[10px]">{w.environment}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : '-'}
                      </TableCell>
                    )}
                    {visibleColumns.includes('websiteUrls') && (
                      <TableCell className="align-top">
                        {websites.length > 0 ? (
                          <div className="space-y-3">
                            {websites.map((w: any, idx: number) => (
                              <div key={w.id} className={`text-sm ${idx !== websites.length - 1 ? 'border-b pb-2' : ''}`}>
                                <div className="font-medium mb-1 text-muted-foreground text-xs uppercase">{w.websiteName}</div>
                                <div className="space-y-1">
                                  {w.websiteUrl ? (
                                    <a href={w.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 break-all">
                                      {w.websiteUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                                    </a>
                                  ) : <span className="text-muted-foreground text-xs">No Site URL</span>}
                                  
                                  {w.adminUrl && (
                                    <a href={w.adminUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline flex items-center gap-1 break-all mt-1">
                                      {w.adminUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : '-'}
                      </TableCell>
                    )}
                    {visibleColumns.includes('websiteCreds') && (
                      <TableCell className="align-top">
                        {websites.length > 0 ? (
                          <div className="space-y-3">
                            {websites.map((w: any, idx: number) => (
                              <div key={w.id} className={`text-sm ${idx !== websites.length - 1 ? 'border-b pb-2' : ''}`}>
                                <div className="font-medium mb-1 text-muted-foreground text-xs uppercase">{w.websiteName}</div>
                                {w.credentials && w.credentials.length > 0 ? (
                                  w.credentials.map((c: any, i: number) => (
                                    <div key={i} className="space-y-1 mt-1">
                                      <div className="flex flex-col gap-1"><span className="text-muted-foreground text-xs">Username/Email:</span> <span className="font-medium break-all">{c.username || '-'}</span></div>
                                      <div className="flex flex-col gap-1 mt-1"><span className="text-muted-foreground text-xs">Password:</span> <PasswordDisplay value={c.passwordEncrypted} /></div>
                                    </div>
                                  ))
                                ) : <span className="text-muted-foreground text-xs italic">No credentials</span>}
                              </div>
                            ))}
                          </div>
                        ) : '-'}
                      </TableCell>
                    )}
                    {visibleColumns.includes('websiteDb') && (
                      <TableCell className="align-top">
                        {websites.length > 0 ? (
                          <div className="space-y-3">
                            {websites.map((w: any, idx: number) => (
                              <div key={w.id} className={`text-sm ${idx !== websites.length - 1 ? 'border-b pb-2' : ''}`}>
                                <div className="font-medium mb-1 text-muted-foreground text-xs uppercase">{w.websiteName}</div>
                                <div className="space-y-1">
                                  <div><span className="text-muted-foreground text-xs">Name:</span> <span className="font-medium">{w.databaseName || '-'}</span></div>
                                  <div><span className="text-muted-foreground text-xs">Type:</span> <span className="font-medium uppercase">{w.databaseType || '-'}</span></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : '-'}
                      </TableCell>
                    )}
                    {visibleColumns.includes('subdomains') && (
                      <TableCell className="align-top">
                        {websites.length > 0 ? (
                          <div className="space-y-4">
                            {websites.map((w: any, idx: number) => (
                              <div key={w.id} className={`${idx !== websites.length - 1 ? 'border-b pb-3' : ''}`}>
                                <div className="font-medium mb-2 text-muted-foreground text-xs uppercase">{w.websiteName} Subdomains:</div>
                                {w.subdomains && w.subdomains.length > 0 ? (
                                  <div className="space-y-3">
                                    {w.subdomains.map((sub: any) => (
                                      <div key={sub.id} className="bg-muted/30 p-2 rounded border text-sm">
                                        <div className="font-semibold text-primary mb-1">{sub.subdomainName}</div>
                                        <div className="space-y-2">
                                          {sub.fullUrl && (
                                            <a href={sub.fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 break-all text-xs">
                                              {sub.fullUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                                            </a>
                                          )}
                                          {(sub.adminUsername || sub.adminPassword) && (
                                            <div className="grid grid-cols-1 gap-1 pt-1 border-t border-border/50">
                                              <div className="flex flex-col"><span className="text-muted-foreground text-[10px] uppercase">User:</span> <span className="break-all">{sub.adminUsername || '-'}</span></div>
                                              <div className="flex flex-col"><span className="text-muted-foreground text-[10px] uppercase">Pass:</span> <PasswordDisplay value={sub.adminPassword} /></div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : <span className="text-muted-foreground text-xs italic">No subdomains</span>}
                              </div>
                            ))}
                          </div>
                        ) : '-'}
                      </TableCell>
                    )}
                    {visibleColumns.includes('serverDetails') && (
                      <TableCell className="align-top">
                        {websites.length > 0 ? (
                          <div className="space-y-3">
                            {websites.map((w: any, idx: number) => {
                              const server = w.server || w.serverAccount?.server;
                              return server ? (
                                <div key={w.id} className={`text-sm ${idx !== websites.length - 1 ? 'border-b pb-2' : ''}`}>
                                  <div className="font-medium mb-1 text-muted-foreground text-xs uppercase">{w.websiteName}</div>
                                  <div><span className="text-muted-foreground text-xs">Server:</span> <span className="font-medium">{server.serverName}</span></div>
                                  <div><span className="text-muted-foreground text-xs">IP:</span> <span className="font-mono text-xs">{server.ipAddress || '-'}</span></div>
                                  {w.serverAccount?.username && (
                                    <div><span className="text-muted-foreground text-xs">User:</span> <span>{w.serverAccount.username}</span></div>
                                  )}
                                </div>
                              ) : (
                                <div key={w.id} className={`text-sm text-muted-foreground italic ${idx !== websites.length - 1 ? 'border-b pb-2' : ''}`}>
                                  {w.websiteName}: No server
                                </div>
                              );
                            })}
                          </div>
                        ) : '-'}
                      </TableCell>
                    )}
                    {visibleColumns.includes('googleAnalytics') && (
                      <TableCell className="align-top text-sm">
                        {websites.length > 0 ? (
                          <div className="space-y-1">
                            {websites.map((w: any) => w.googleAnalyticsAccount ? (
                              <div key={w.id}>{w.googleAnalyticsAccount.accountName}</div>
                            ) : null)}
                          </div>
                        ) : '-'}
                      </TableCell>
                    )}
                    {visibleColumns.includes('googleSearchConsole') && (
                      <TableCell className="align-top text-sm">
                        {websites.length > 0 ? (
                          <div className="space-y-1">
                            {websites.map((w: any) => w.googleSearchConsoleAccount ? (
                              <div key={w.id}>{w.googleSearchConsoleAccount.accountName}</div>
                            ) : null)}
                          </div>
                        ) : '-'}
                      </TableCell>
                    )}
                    {visibleColumns.includes('googleAds') && (
                      <TableCell className="align-top text-sm">
                        {websites.length > 0 ? (
                          <div className="space-y-1">
                            {websites.map((w: any) => w.googleAdsAccount ? (
                              <div key={w.id}>{w.googleAdsAccount.accountName}</div>
                            ) : null)}
                          </div>
                        ) : '-'}
                      </TableCell>
                    )}
                    {visibleColumns.includes('tagManager') && (
                      <TableCell className="align-top text-sm">
                        {websites.length > 0 ? (
                          <div className="space-y-1">
                            {websites.map((w: any) => w.googleTagManagerAccount ? (
                              <div key={w.id}>{w.googleTagManagerAccount.accountName}</div>
                            ) : null)}
                          </div>
                        ) : '-'}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} records
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
