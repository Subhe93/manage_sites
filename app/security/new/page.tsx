'use client';

import { useState } from 'react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldAlert, FileText, Users } from 'lucide-react';
import { mockUsers } from '@/lib/mock-data';

export default function NewSecurityIncidentPage() {
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [detectedAt, setDetectedAt] = useState('');
  const [resolvedAt, setResolvedAt] = useState('');
  const [description, setDescription] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      entity_type: entityType,
      entity_id: entityId ? Number(entityId) : null,
      incident_type: incidentType,
      severity,
      status,
      detected_at: detectedAt,
      resolved_at: resolvedAt,
      description,
      actions_taken: actionsTaken,
      reported_by: reportedBy ? Number(reportedBy) : null,
      assigned_to: assignedTo ? Number(assignedTo) : null,
    });
  };

  return (
    <FormLayout
      title="Report New Security Incident"
      description="Log a new security incident"
      backHref="/security"
      backLabel="Back to Security Incidents"
      onSubmit={onSubmit}
    >
      <FormSection title="Incident Details" icon={<ShieldAlert className="h-4 w-4" />}>
        <FormFieldWrapper label="Entity Type" required>
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger>
              <SelectValue placeholder="Select entity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">website</SelectItem>
              <SelectItem value="server">server</SelectItem>
              <SelectItem value="domain">domain</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Entity ID" required>
          <Input type="number" value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder="Enter entity ID" />
        </FormFieldWrapper>
        <FormFieldWrapper label="Incident Type" required>
          <Select value={incidentType} onValueChange={setIncidentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select incident type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="malware">malware</SelectItem>
              <SelectItem value="hack">hack</SelectItem>
              <SelectItem value="ddos">ddos</SelectItem>
              <SelectItem value="data_breach">data_breach</SelectItem>
              <SelectItem value="unauthorized_access">unauthorized_access</SelectItem>
              <SelectItem value="other">other</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Severity" required>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">low</SelectItem>
              <SelectItem value="medium">medium</SelectItem>
              <SelectItem value="high">high</SelectItem>
              <SelectItem value="critical">critical</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Status" required>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">open</SelectItem>
              <SelectItem value="investigating">investigating</SelectItem>
              <SelectItem value="resolved">resolved</SelectItem>
              <SelectItem value="closed">closed</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Detected At">
          <Input type="datetime-local" value={detectedAt} onChange={(e) => setDetectedAt(e.target.value)} />
        </FormFieldWrapper>
        <FormFieldWrapper label="Resolved At">
          <Input type="datetime-local" value={resolvedAt} onChange={(e) => setResolvedAt(e.target.value)} />
        </FormFieldWrapper>
      </FormSection>
      <FormSection title="Description" icon={<FileText className="h-4 w-4" />}>
        <FormFieldWrapper label="Description" fullWidth>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the incident..." />
        </FormFieldWrapper>
        <FormFieldWrapper label="Actions Taken" fullWidth>
          <Textarea value={actionsTaken} onChange={(e) => setActionsTaken(e.target.value)} placeholder="Describe actions taken..." />
        </FormFieldWrapper>
      </FormSection>
      <FormSection title="Assignment" icon={<Users className="h-4 w-4" />}>
        <FormFieldWrapper label="Reported By">
          <Select value={reportedBy} onValueChange={setReportedBy}>
            <SelectTrigger>
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {mockUsers.map((u) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {u.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Assigned To">
          <Select value={assignedTo} onValueChange={setAssignedTo}>
            <SelectTrigger>
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {mockUsers.map((u) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {u.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
      </FormSection>
    </FormLayout>
  );
}
