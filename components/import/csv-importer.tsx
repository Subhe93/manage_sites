'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, Loader2, ArrowRight, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface PreviewSite {
  rowIndex: number;
  websiteUrl: string;
  domain: string | null;
  adminUrl: string;
  username: string;
  websiteType: string;
  status: string;
  hosting: string;
  ipServer: string;
  cloudflare: string;
  online: string;
  notes: string;
}

interface PreviewSummary {
  providers: string[];
  servers: { ip: string; hosting: string; accountCount: number }[];
  cloudflareAccounts: string[];
  domainsCount: number;
  websiteTypes: Record<string, number>;
  statusCounts: Record<string, number>;
}

interface PreviewData {
  totalSites: number;
  sites: PreviewSite[];
  summary: PreviewSummary;
}

interface ImportResults {
  message: string;
  results: {
    providers: number;
    servers: number;
    serverAccounts: number;
    cloudflareAccounts: number;
    domains: number;
    websites: number;
    credentials: number;
    errors: { row: number; url: string; error: string }[];
    skipped: { row: number; url: string; reason: string }[];
  };
}

type Step = 'upload' | 'preview' | 'importing' | 'complete';

export function CSVImporter() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [importResult, setImportResult] = useState<ImportResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setFile(selected);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith('.csv')) {
      setFile(dropped);
    } else {
      toast.error('Please drop a CSV file');
    }
  }, []);

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'preview');

      const res = await fetch('/api/import/csv', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setPreview(data.data);
        setStep('preview');
        toast.success(`Parsed ${data.data.totalSites} sites successfully`);
      } else {
        toast.error(data.error?.message || 'Failed to parse CSV');
      }
    } catch (err) {
      toast.error('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setStep('importing');
    setImportProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'import');

      setImportProgress(30);
      const res = await fetch('/api/import/csv', { method: 'POST', body: formData });
      setImportProgress(80);
      const data = await res.json();
      setImportProgress(100);

      if (data.success) {
        setImportResult(data.data);
        setStep('complete');
        toast.success('Import completed successfully!');
      } else {
        toast.error(data.error?.message || 'Import failed');
        setStep('preview');
      }
    } catch (err) {
      toast.error('Import failed');
      setStep('preview');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setPreview(null);
    setImportResult(null);
    setImportProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[
          { key: 'upload', label: 'Upload CSV' },
          { key: 'preview', label: 'Preview & Validate' },
          { key: 'importing', label: 'Importing' },
          { key: 'complete', label: 'Complete' },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            {i > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              step === s.key
                ? 'bg-primary text-primary-foreground'
                : ['upload', 'preview', 'importing', 'complete'].indexOf(step) > ['upload', 'preview', 'importing', 'complete'].indexOf(s.key)
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}>
              {['upload', 'preview', 'importing', 'complete'].indexOf(step) > ['upload', 'preview', 'importing', 'complete'].indexOf(s.key) && (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <Card className="p-8">
          <div
            className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors hover:border-primary hover:bg-primary/5"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your mysites.csv file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supported format: CSV with columns (links, wordpress login, user, email, password, VI, WF, HD, ...)
            </p>
          </div>

          {file && (
            <div className="mt-6 flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button onClick={handlePreview} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Data
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Step 2: Preview */}
      {step === 'preview' && preview && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <SummaryCard label="Total Sites" value={preview.totalSites} />
            <SummaryCard label="Domains" value={preview.summary.domainsCount} />
            <SummaryCard label="Providers" value={preview.summary.providers.length} />
            <SummaryCard label="Servers" value={preview.summary.servers.length} />
            <SummaryCard label="Cloudflare" value={preview.summary.cloudflareAccounts.length} />
            <SummaryCard label="Active" value={preview.summary.statusCounts['active'] || 0} color="green" />
            <SummaryCard label="Suspended" value={preview.summary.statusCounts['suspended'] || 0} color="red" />
          </div>

          {/* Detailed Preview */}
          <Tabs defaultValue="sites" className="w-full">
            <TabsList>
              <TabsTrigger value="sites">Sites ({preview.totalSites})</TabsTrigger>
              <TabsTrigger value="providers">Providers ({preview.summary.providers.length})</TabsTrigger>
              <TabsTrigger value="servers">Servers ({preview.summary.servers.length})</TabsTrigger>
              <TabsTrigger value="cloudflare">Cloudflare ({preview.summary.cloudflareAccounts.length})</TabsTrigger>
              <TabsTrigger value="types">Website Types</TabsTrigger>
            </TabsList>

            <TabsContent value="sites">
              <Card>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Website URL</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Hosting</TableHead>
                        <TableHead>IP</TableHead>
                        <TableHead>Cloudflare</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.sites.map((site) => (
                        <TableRow key={`${site.rowIndex}-${site.websiteUrl}`}>
                          <TableCell className="text-muted-foreground text-xs">{site.rowIndex}</TableCell>
                          <TableCell className="max-w-[250px] truncate text-sm font-medium">{site.websiteUrl}</TableCell>
                          <TableCell className="text-sm">{site.domain || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{site.websiteType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={site.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                              {site.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{site.hosting || '-'}</TableCell>
                          <TableCell className="text-xs font-mono">{site.ipServer || '-'}</TableCell>
                          <TableCell className="text-xs">{site.cloudflare || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </Card>
            </TabsContent>

            <TabsContent value="providers">
              <Card className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {preview.summary.providers.map((p) => (
                    <div key={p} className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">{p.charAt(0)}</span>
                      </div>
                      <span className="font-medium">{p}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="servers">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Hosting Provider</TableHead>
                      <TableHead>Accounts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.summary.servers.map((s) => (
                      <TableRow key={s.ip}>
                        <TableCell className="font-mono">{s.ip}</TableCell>
                        <TableCell>{s.hosting}</TableCell>
                        <TableCell>{s.accountCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="cloudflare">
              <Card className="p-6">
                <div className="space-y-3">
                  {preview.summary.cloudflareAccounts.map((email) => (
                    <div key={email} className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                      <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <span className="text-orange-500 font-bold text-sm">CF</span>
                      </div>
                      <span className="font-medium">{email}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="types">
              <Card className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(preview.summary.websiteTypes).map(([type, count]) => (
                    <div key={type} className="text-center p-6 rounded-lg bg-muted/50">
                      <p className="text-3xl font-bold text-primary">{count}</p>
                      <p className="text-sm text-muted-foreground mt-1 capitalize">{type}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action buttons */}
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
            <Button onClick={handleImport} size="lg" className="px-8">
              <Upload className="h-4 w-4 mr-2" />
              Import {preview.totalSites} Sites
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Importing */}
      {step === 'importing' && (
        <Card className="p-12 text-center">
          <Loader2 className="h-16 w-16 text-primary mx-auto mb-6 animate-spin" />
          <h3 className="text-xl font-semibold mb-2">Importing Data...</h3>
          <p className="text-muted-foreground mb-6">
            Creating providers, servers, domains, websites, and credentials...
          </p>
          <div className="max-w-md mx-auto">
            <Progress value={importProgress} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">{importProgress}%</p>
          </div>
        </Card>
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && importResult && (
        <div className="space-y-6">
          <Card className="p-8 text-center border-green-500/20 bg-green-500/5">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Import Complete!</h3>
            <p className="text-muted-foreground">{importResult.message}</p>
          </Card>

          {/* Results Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <ResultCard label="Providers" value={importResult.results.providers} icon="new" />
            <ResultCard label="Servers" value={importResult.results.servers} icon="new" />
            <ResultCard label="Server Accounts" value={importResult.results.serverAccounts} icon="new" />
            <ResultCard label="Cloudflare" value={importResult.results.cloudflareAccounts} icon="new" />
            <ResultCard label="Domains" value={importResult.results.domains} icon="new" />
            <ResultCard label="Websites" value={importResult.results.websites} icon="new" />
            <ResultCard label="Credentials" value={importResult.results.credentials} icon="new" />
          </div>

          {/* Errors & Skipped */}
          {(importResult.results.errors.length > 0 || importResult.results.skipped.length > 0) && (
            <Tabs defaultValue={importResult.results.errors.length > 0 ? 'errors' : 'skipped'}>
              <TabsList>
                {importResult.results.errors.length > 0 && (
                  <TabsTrigger value="errors" className="text-destructive">
                    Errors ({importResult.results.errors.length})
                  </TabsTrigger>
                )}
                {importResult.results.skipped.length > 0 && (
                  <TabsTrigger value="skipped">
                    Skipped ({importResult.results.skipped.length})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="errors">
                <Card>
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResult.results.errors.map((err, i) => (
                          <TableRow key={i}>
                            <TableCell>{err.row}</TableCell>
                            <TableCell className="max-w-[300px] truncate">{err.url}</TableCell>
                            <TableCell className="text-destructive text-sm">{err.error}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </Card>
              </TabsContent>

              <TabsContent value="skipped">
                <Card>
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>URL</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResult.results.skipped.map((s, i) => (
                          <TableRow key={i}>
                            <TableCell>{s.row}</TableCell>
                            <TableCell className="max-w-[300px] truncate">{s.url}</TableCell>
                            <TableCell className="text-yellow-600 text-sm">{s.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Import Another File
          </Button>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Card className="p-4 text-center">
      <p className={`text-2xl font-bold ${color === 'green' ? 'text-green-500' : color === 'red' ? 'text-destructive' : 'text-primary'}`}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </Card>
  );
}

function ResultCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <Card className="p-4 text-center">
      <div className="flex items-center justify-center gap-1 mb-1">
        <span className="text-2xl font-bold text-primary">{value}</span>
        {value > 0 && <Badge variant="outline" className="text-[10px] px-1">new</Badge>}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}
