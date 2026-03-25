'use client';

import { useState } from 'react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Clock, FileText } from 'lucide-react';

export default function NewMaintenanceSchedulePage() {
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState('');
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState('');
  const [nextRunDate, setNextRunDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      entity_type: entityType,
      entity_id: entityId ? Number(entityId) : null,
      maintenance_type: maintenanceType,
      schedule_frequency: scheduleFrequency,
      schedule_time: scheduleTime,
      schedule_day_of_week: scheduleDayOfWeek ? Number(scheduleDayOfWeek) : null,
      schedule_day_of_month: scheduleDayOfMonth ? Number(scheduleDayOfMonth) : null,
      next_run_date: nextRunDate,
      is_active: isActive,
      notes,
    });
  };

  return (
    <FormLayout
      title="Add New Maintenance Schedule"
      description="Create a new maintenance schedule"
      backHref="/maintenance"
      backLabel="Back to Maintenance"
      onSubmit={onSubmit}
    >
      <FormSection title="Schedule Details" icon={<Wrench className="h-4 w-4" />}>
        <FormFieldWrapper label="Entity Type" required>
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger>
              <SelectValue placeholder="Select entity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="server">server</SelectItem>
              <SelectItem value="website">website</SelectItem>
              <SelectItem value="domain">domain</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Entity ID" required>
          <Input type="number" value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder="Enter entity ID" />
        </FormFieldWrapper>
        <FormFieldWrapper label="Maintenance Type" required>
          <Select value={maintenanceType} onValueChange={setMaintenanceType}>
            <SelectTrigger>
              <SelectValue placeholder="Select maintenance type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="update">update</SelectItem>
              <SelectItem value="backup">backup</SelectItem>
              <SelectItem value="security_scan">security_scan</SelectItem>
              <SelectItem value="performance_check">performance_check</SelectItem>
              <SelectItem value="other">other</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Schedule Frequency" required>
          <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">daily</SelectItem>
              <SelectItem value="weekly">weekly</SelectItem>
              <SelectItem value="monthly">monthly</SelectItem>
              <SelectItem value="quarterly">quarterly</SelectItem>
              <SelectItem value="yearly">yearly</SelectItem>
              <SelectItem value="custom">custom</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
      </FormSection>
      <FormSection title="Timing" icon={<Clock className="h-4 w-4" />}>
        <FormFieldWrapper label="Schedule Time">
          <Input value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} placeholder="02:00" />
        </FormFieldWrapper>
        <FormFieldWrapper label="Day of Week (1-7)">
          <Input type="number" value={scheduleDayOfWeek} onChange={(e) => setScheduleDayOfWeek(e.target.value)} min={1} max={7} placeholder="1-7" />
        </FormFieldWrapper>
        <FormFieldWrapper label="Day of Month (1-31)">
          <Input type="number" value={scheduleDayOfMonth} onChange={(e) => setScheduleDayOfMonth(e.target.value)} min={1} max={31} placeholder="1-31" />
        </FormFieldWrapper>
        <FormFieldWrapper label="Next Run Date">
          <Input type="date" value={nextRunDate} onChange={(e) => setNextRunDate(e.target.value)} />
        </FormFieldWrapper>
        <FormFieldWrapper label="Active">
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </FormFieldWrapper>
      </FormSection>
      <FormSection title="Notes" icon={<FileText className="h-4 w-4" />}>
        <FormFieldWrapper label="Notes" fullWidth>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." />
        </FormFieldWrapper>
      </FormSection>
    </FormLayout>
  );
}
