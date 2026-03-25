'use client';

import { useState } from 'react';
import { Server, Cpu } from 'lucide-react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockProviders } from '@/lib/mock-data';

export default function NewServerPage() {
  const [serverName, setServerName] = useState('');
  const [providerId, setProviderId] = useState('');
  const [serverType, setServerType] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [location, setLocation] = useState('');
  const [operatingSystem, setOperatingSystem] = useState('');
  const [controlPanel, setControlPanel] = useState('');
  const [status, setStatus] = useState('');
  const [cpuCores, setCpuCores] = useState('');
  const [ramGb, setRamGb] = useState('');
  const [storageGb, setStorageGb] = useState('');
  const [bandwidthGb, setBandwidthGb] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      server_name: serverName,
      provider_id: providerId ? Number(providerId) : null,
      server_type: serverType,
      ip_address: ipAddress,
      location,
      operating_system: operatingSystem,
      control_panel: controlPanel,
      status,
      cpu_cores: cpuCores ? Number(cpuCores) : null,
      ram_gb: ramGb ? Number(ramGb) : null,
      storage_gb: storageGb ? Number(storageGb) : null,
      bandwidth_gb: bandwidthGb ? Number(bandwidthGb) : null,
    });
  };

  return (
    <FormLayout
      title="Add New Server"
      description="Register a new server"
      backHref="/servers"
      backLabel="Back to Servers"
      onSubmit={onSubmit}
    >
      <FormSection title="Server Details" icon={<Server className="h-4 w-4 text-primary" />}>
        <FormFieldWrapper label="Server Name" required>
          <Input value={serverName} onChange={(e) => setServerName(e.target.value)} required />
        </FormFieldWrapper>
        <FormFieldWrapper label="Provider">
          <Select value={providerId} onValueChange={setProviderId}>
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {mockProviders.map((provider) => (
                <SelectItem key={provider.id} value={String(provider.id)}>
                  {provider.provider_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Server Type">
          <Select value={serverType} onValueChange={setServerType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shared">Shared</SelectItem>
              <SelectItem value="vps">VPS</SelectItem>
              <SelectItem value="dedicated">Dedicated</SelectItem>
              <SelectItem value="cloud">Cloud</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="IP Address">
          <Input value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} />
        </FormFieldWrapper>
        <FormFieldWrapper label="Location">
          <Input value={location} onChange={(e) => setLocation(e.target.value)} />
        </FormFieldWrapper>
        <FormFieldWrapper label="Operating System">
          <Input value={operatingSystem} onChange={(e) => setOperatingSystem(e.target.value)} />
        </FormFieldWrapper>
        <FormFieldWrapper label="Control Panel">
          <Select value={controlPanel} onValueChange={setControlPanel}>
            <SelectTrigger>
              <SelectValue placeholder="Select panel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpanel">cPanel</SelectItem>
              <SelectItem value="plesk">Plesk</SelectItem>
              <SelectItem value="directadmin">DirectAdmin</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
        <FormFieldWrapper label="Status">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>
      </FormSection>

      <FormSection title="Resources" icon={<Cpu className="h-4 w-4 text-primary" />}>
        <FormFieldWrapper label="CPU Cores">
          <Input type="number" value={cpuCores} onChange={(e) => setCpuCores(e.target.value)} />
        </FormFieldWrapper>
        <FormFieldWrapper label="RAM (GB)">
          <Input type="number" value={ramGb} onChange={(e) => setRamGb(e.target.value)} />
        </FormFieldWrapper>
        <FormFieldWrapper label="Storage (GB)">
          <Input type="number" value={storageGb} onChange={(e) => setStorageGb(e.target.value)} />
        </FormFieldWrapper>
        <FormFieldWrapper label="Bandwidth (GB)">
          <Input type="number" value={bandwidthGb} onChange={(e) => setBandwidthGb(e.target.value)} />
        </FormFieldWrapper>
      </FormSection>
    </FormLayout>
  );
}
