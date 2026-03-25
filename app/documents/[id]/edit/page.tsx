'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';
import { mockDocuments, mockUsers } from '@/lib/mock-data';

export default function EditDocumentPage() {
  const params = useParams();
  const id = Number(params.id);
  const document = mockDocuments.find((d) => d.id === id);

  const [entityType, setEntityType] = useState(document?.entity_type ?? '');
  const [entityId, setEntityId] = useState(document ? String(document.entity_id) : '');
  const [documentType, setDocumentType] = useState(document?.document_type ?? '');
  const [fileName, setFileName] = useState(document?.file_name ?? '');
  const [filePath, setFilePath] = useState(document?.file_path ?? '');
  const [fileSizeKb, setFileSizeKb] = useState(document ? String(document.file_size_kb) : '');
  const [mimeType, setMimeType] = useState(document?.mime_type ?? '');
  const [description, setDescription] = useState(document?.description ?? '');

  if (!document) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Not Found</h1>
        <p className="mt-2 text-muted-foreground">Document not found.</p>
        <Link href="/documents" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to Documents
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      id,
      entity_type: entityType,
      entity_id: entityId ? Number(entityId) : null,
      document_type: documentType,
      file_name: fileName,
      file_path: filePath,
      file_size_kb: fileSizeKb ? Number(fileSizeKb) : null,
      mime_type: mimeType,
      description,
    });
  };

  return (
    <FormLayout
      title="Edit Document"
      description="Update document details"
      backHref="/documents"
      backLabel="Back to Documents"
      onSubmit={handleSubmit}
    >
      <FormSection title="Document Details" icon={<FileText className="h-4 w-4" />}>
        <FormFieldWrapper label="Entity Type" required>
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger>
              <SelectValue placeholder="Select entity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="domain">Domain</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="server">Server</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Entity ID">
          <Input
            type="number"
            value={entityId}
            onChange={(e) => setEntityId(e.target.value)}
            placeholder="Entity ID"
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Document Type" required>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="certificate">Certificate</SelectItem>
              <SelectItem value="backup">Backup</SelectItem>
              <SelectItem value="report">Report</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="File Name" required>
          <Input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="document.pdf"
            required
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="File Path" required>
          <Input
            type="text"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="/documents/path/to/file"
            required
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="File Size (KB)">
          <Input
            type="number"
            value={fileSizeKb}
            onChange={(e) => setFileSizeKb(e.target.value)}
            placeholder="1024"
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="MIME Type">
          <Input
            type="text"
            value={mimeType}
            onChange={(e) => setMimeType(e.target.value)}
            placeholder="application/pdf"
          />
        </FormFieldWrapper>
        <FormFieldWrapper label="Description" fullWidth>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Document description"
            rows={3}
          />
        </FormFieldWrapper>
      </FormSection>
    </FormLayout>
  );
}
