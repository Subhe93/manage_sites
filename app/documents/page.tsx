'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Search, Plus, MoveHorizontal as MoreHorizontal, Download, Eye, Trash2, FileSpreadsheet, FileCheck, FileArchive, ChartBar as FileBarChart, Files } from 'lucide-react';
import { mockDocuments, mockUsers } from '@/lib/mock-data';

function formatFileSize(sizeKb: number): string {
  if (sizeKb < 1024) {
    return `${sizeKb} KB`;
  }
  if (sizeKb < 1048576) {
    return `${(sizeKb / 1024).toFixed(1)} MB`;
  }
  return `${(sizeKb / 1048576).toFixed(2)} GB`;
}

function getDocTypeBadgeClass(docType: string): string {
  switch (docType) {
    case 'contract':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'invoice':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'receipt':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'certificate':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'backup':
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    case 'report':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    default:
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
}

function getUploaderName(uploadedBy: number | null): string {
  if (uploadedBy === null) return 'System';
  const user = mockUsers.find((u) => u.id === uploadedBy);
  return user ? user.full_name : 'System';
}

const documentTypes = ['all', 'contract', 'invoice', 'receipt', 'certificate', 'backup', 'report', 'other'] as const;

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = mockDocuments.filter((doc) => {
    const matchesSearch = doc.file_name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalDocuments = mockDocuments.length;
  const contracts = mockDocuments.filter((d) => d.document_type === 'contract').length;
  const invoices = mockDocuments.filter((d) => d.document_type === 'invoice').length;
  const receipts = mockDocuments.filter((d) => d.document_type === 'receipt').length;
  const certificates = mockDocuments.filter((d) => d.document_type === 'certificate').length;
  const backups = mockDocuments.filter((d) => d.document_type === 'backup').length;
  const reports = mockDocuments.filter((d) => d.document_type === 'report').length;
  const others = mockDocuments.filter((d) => d.document_type === 'other').length;

  return (
    <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">Manage and organize your uploaded documents</p>
          </div>
          <Button size="sm" className="h-9 gap-2">
            <Plus className="h-4 w-4" />
            Upload Document
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Files className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDocuments}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contracts</CardTitle>
              <FileText className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoices</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receipts</CardTitle>
              <FileCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{receipts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates</CardTitle>
              <FileCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certificates}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Backups</CardTitle>
              <FileArchive className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{backups}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports</CardTitle>
              <FileBarChart className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Other</CardTitle>
              <Files className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{others}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by file name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Tabs value={typeFilter} onValueChange={setTypeFilter}>
                <TabsList>
                  {documentTypes.map((t) => (
                    <TabsTrigger key={t} value={t} className="capitalize">
                      {t}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead>MIME Type</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.file_name}</TableCell>
                    <TableCell className="capitalize">{doc.entity_type}</TableCell>
                    <TableCell>{doc.entity_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getDocTypeBadgeClass(doc.document_type)}>
                        {doc.document_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.file_size_kb)}</TableCell>
                    <TableCell className="text-xs">{doc.mime_type}</TableCell>
                    <TableCell>{getUploaderName(doc.uploaded_by)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{doc.description}</TableCell>
                    <TableCell>{doc.created_at}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      No documents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  );
}
