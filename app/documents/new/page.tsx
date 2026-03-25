'use client';

import { useState } from 'react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';

export default function NewDocumentPage() {
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [fileName, setFileName] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileSizeKb, setFileSizeKb] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
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
      title="New Document"
      description="Upload and catalog a new document"
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
