'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Server, Cpu } from 'lucide-react';
import { FormLayout, FormSection, FormFieldWrapper } from '@/components/forms/form-layout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockServers, mockProviders } from '@/lib/mock-data';

export default function EditServerPage() {
  const params = useParams();
  const id = Number(params.id);
  const server = mockServers.find((s) => s.id === id);

  const [serverName, setServerName] = useState(server?.server_name ?? '');
  const [providerId, setProviderId] = useState(server?.provider_id ? String(server.provider_id) : '');
  const [serverType, setServerType] = useState(server?.server_type ?? '');
  const [ipAddress, setIpAddress] = useState(server?.ip_address ?? '');
  const [location, setLocation] = useState(server?.location ?? '');
  const [operatingSystem, setOperatingSystem] = useState(server?.operating_system ?? '');
  const [controlPanel, setControlPanel] = useState(server?.control_panel ?? '');
  const [status, setStatus] = useState(server?.status ?? '');
  const [cpuCores, setCpuCores] = useState(server?.cpu_cores ? String(server.cpu_cores) : '');
  const [ramGb, setRamGb] = useState(server?.ram_gb ? String(server.ram_gb) : '');
  const [storageGb, setStorageGb] = useState(server?.storage_gb ? String(server.storage_gb) : '');
  const [bandwidthGb, setBandwidthGb] = useState(server?.bandwidth_gb ? String(server.bandwidth_gb) : '');

  if (!server) {
    return <div className="p-6 text-center text-muted-foreground">Not Found</div>;
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      id,
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
      title="Edit Server"
      description={`Editing ${server.server_name}`}
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
