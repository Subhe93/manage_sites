'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Pencil, Settings, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface SystemSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string | null;
  is_public: boolean;
}

function getSettingTypeBadgeClass(type: string): string {
  switch (type) {
    case 'string': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'number': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'boolean': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'json': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
    default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  }
}

// ─── Inline Editable Setting Card ─────────────────────────────────────────────
function SettingCard({
  setting,
  onEdit,
}: {
  setting: SystemSetting;
  onEdit: (s: SystemSetting) => void;
}) {
  return (
    <Card className="border-dashed group relative">
      <CardContent className="pt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-mono font-medium">{setting.setting_key}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getSettingTypeBadgeClass(setting.setting_type)}>
              {setting.setting_type}
            </Badge>
            <Badge
              variant="outline"
              className={
                setting.is_public
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
              }
            >
              {setting.is_public ? 'Public' : 'Private'}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onEdit(setting)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="text-lg font-semibold">
          {setting.setting_type === 'boolean' ? (
            <Badge
              variant="outline"
              className={
                setting.setting_value === 'true'
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
              }
            >
              {setting.setting_value}
            </Badge>
          ) : (
            <span className="break-all">{setting.setting_value}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{setting.description}</p>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SystemSetting | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings/system');
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEdit = (setting: SystemSetting) => {
    setEditing(setting);
    setEditValue(setting.setting_value);
  };

  const handleSave = async () => {
    if (!editing) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/settings/system/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settingValue: editValue }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Setting updated');
        setEditing(null);
        fetchSettings();
      } else {
        toast.error(data.error?.message || 'Failed to update');
      }
    } catch {
      toast.error('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-7 w-7" />
          General Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage system-wide configuration settings</p>
      </div>

      {editing && (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Editing: {editing.setting_key}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Value</Label>
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>Click the edit icon on any setting to modify its value.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : settings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No settings found</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {settings.map((setting) => (
                <SettingCard key={setting.id} setting={setting} onEdit={handleEdit} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
