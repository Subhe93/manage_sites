'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, PlayCircle, Activity } from 'lucide-react';
import { ApiClient } from '@/lib/api/client';
import { toast } from 'sonner';

interface UptimeSettings {
  id: number;
  isEnabled: boolean;
  checkIntervalMinutes: number;
  enableNotifications: boolean;
  notifyOnDown: boolean;
  notifyOnRecovery: boolean;
  notifyOnDegraded: boolean;
  notificationEmails: string | null;
  consecutiveFailsBeforeAlert: number;
  timeoutSeconds: number;
  maxConcurrentChecks: number;
}

interface SchedulerStatus {
  running: boolean;
  interval: number | null;
}

export default function UptimeMonitorSettingsPage() {
  const [settings, setSettings] = useState<UptimeSettings | null>(null);
  const [status, setStatus] = useState<SchedulerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningCheck, setRunningCheck] = useState(false);

  useEffect(() => {
    loadSettings();
    loadStatus();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.get<UptimeSettings>('/settings/uptime-monitor');
      if (response.data) {
        setSettings(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const response = await ApiClient.post<SchedulerStatus>('/settings/uptime-monitor', {
        action: 'get_status',
      });
      if (response.data) {
        setStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await ApiClient.put('/settings/uptime-monitor', settings);
      toast.success('Settings saved successfully');
      await loadStatus();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRunManualCheck = async () => {
    try {
      setRunningCheck(true);
      await ApiClient.post('/settings/uptime-monitor', {
        action: 'run_manual_check',
      });
      toast.success('Manual check started');
    } catch (error: any) {
      toast.error(error.message || 'Failed to start manual check');
    } finally {
      setRunningCheck(false);
    }
  };

  const updateSetting = <K extends keyof UptimeSettings>(key: K, value: UptimeSettings[K]) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Uptime Monitor Settings</h1>
        <p className="text-muted-foreground">Configure automatic uptime monitoring and notifications</p>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant={status?.running ? 'default' : 'secondary'} className="gap-1.5">
          <Activity className="h-3 w-3" />
          {status?.running ? `Running (${status.interval}m)` : 'Stopped'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Enable or disable automatic uptime monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isEnabled">Enable Automatic Monitoring</Label>
              <p className="text-sm text-muted-foreground">
                Run uptime checks automatically in the background
              </p>
            </div>
            <Switch
              id="isEnabled"
              checked={settings.isEnabled}
              onCheckedChange={(checked) => updateSetting('isEnabled', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checkInterval">Check Interval</Label>
            <Select
              value={settings.checkIntervalMinutes.toString()}
              onValueChange={(value) => updateSetting('checkIntervalMinutes', parseInt(value))}
            >
              <SelectTrigger id="checkInterval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Every 1 minute</SelectItem>
                <SelectItem value="5">Every 5 minutes</SelectItem>
                <SelectItem value="10">Every 10 minutes</SelectItem>
                <SelectItem value="15">Every 15 minutes</SelectItem>
                <SelectItem value="30">Every 30 minutes</SelectItem>
                <SelectItem value="60">Every 1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                min="5"
                max="60"
                value={settings.timeoutSeconds}
                onChange={(e) => updateSetting('timeoutSeconds', parseInt(e.target.value) || 10)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="concurrency">Max Concurrent Checks</Label>
              <Input
                id="concurrency"
                type="number"
                min="1"
                max="20"
                value={settings.maxConcurrentChecks}
                onChange={(e) => updateSetting('maxConcurrentChecks', parseInt(e.target.value) || 5)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure when and how to receive alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enableNotifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send notifications when issues are detected
              </p>
            </div>
            <Switch
              id="enableNotifications"
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
            />
          </div>

          {settings.enableNotifications && (
            <>
              <div className="space-y-4 pl-6 border-l-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyOnDown">Notify when website is down</Label>
                  <Switch
                    id="notifyOnDown"
                    checked={settings.notifyOnDown}
                    onCheckedChange={(checked) => updateSetting('notifyOnDown', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyOnRecovery">Notify when website recovers</Label>
                  <Switch
                    id="notifyOnRecovery"
                    checked={settings.notifyOnRecovery}
                    onCheckedChange={(checked) => updateSetting('notifyOnRecovery', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyOnDegraded">Notify when website is degraded</Label>
                  <Switch
                    id="notifyOnDegraded"
                    checked={settings.notifyOnDegraded}
                    onCheckedChange={(checked) => updateSetting('notifyOnDegraded', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consecutiveFails">Consecutive Fails Before Alert</Label>
                <Input
                  id="consecutiveFails"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.consecutiveFailsBeforeAlert}
                  onChange={(e) =>
                    updateSetting('consecutiveFailsBeforeAlert', parseInt(e.target.value) || 2)
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Number of consecutive failures before sending an alert
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emails">Notification Emails (optional)</Label>
                <Input
                  id="emails"
                  type="text"
                  placeholder="email1@example.com, email2@example.com"
                  value={settings.notificationEmails || ''}
                  onChange={(e) => updateSetting('notificationEmails', e.target.value || null)}
                />
                <p className="text-sm text-muted-foreground">
                  Comma-separated list of emails (feature coming soon)
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleRunManualCheck}
          disabled={runningCheck}
          className="gap-2"
        >
          {runningCheck ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              Run Manual Check
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
