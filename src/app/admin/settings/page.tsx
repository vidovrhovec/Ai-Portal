'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Settings,
  Database,
  Mail,
  Shield,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface SystemSettings {
  selfRegistration: boolean;
  emailVerification: boolean;
  databaseType: 'sqlite' | 'postgresql' | 'mysql';
  databaseUrl: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  jwtSecret: string;
  sessionTimeout: number;
}

// Default settings - sensitive values loaded from environment variables
const defaultSettings: SystemSettings = {
  selfRegistration: process.env.NEXT_PUBLIC_SELF_REGISTRATION === 'true',
  emailVerification: process.env.NEXT_PUBLIC_EMAIL_VERIFICATION === 'true',
  databaseType: (process.env.DATABASE_TYPE as SystemSettings['databaseType']) || 'sqlite',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  smtpUser: process.env.SMTP_USER || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  jwtSecret: process.env.JWT_SECRET || '',
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '24') // hours
};

export function AdminSettingsSection() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Partial<SystemSettings>>({});

  const handleSettingChange = (key: keyof SystemSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setPendingChanges(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      // TODO: Replace with real API call to save settings
      console.log('Saving settings:', pendingChanges);

      setPendingChanges({});
      setIsConfirmDialogOpen(false);

      alert('Nastavitve so bile uspešno shranjene.');
    } catch {
      alert('Napaka pri shranjevanju nastavitev.');
    }
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
    setPendingChanges({});
    alert('Nastavitve so bile ponastavljene na privzete vrednosti.');
  };

  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Sistemske nastavitve</h1>
          <p className="text-muted-foreground">Konfigurirajte sistem in njegove storitve</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Ponastavi
          </Button>
          <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!hasChanges}>
                <Save className="h-4 w-4 mr-2" />
                Shrani spremembe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Potrdite spremembe</DialogTitle>
                <DialogDescription>
                  Ali ste prepričani, da želite shraniti te spremembe? Nekatere spremembe lahko zahtevajo ponovni zagon sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Opozorilo
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Spremembe baze podatkov ali SMTP nastavitev lahko zahtevajo ponovni zagon aplikacije.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
                  Prekliči
                </Button>
                <Button onClick={handleSaveSettings}>
                  Potrdi in shrani
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* User Registration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Registracija uporabnikov
          </CardTitle>
          <CardDescription>
            Nadzirajte kako se uporabniki registrirajo v sistem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Samoregistracija</Label>
              <p className="text-sm text-muted-foreground">
                Dovoli uporabnikom, da se registrirajo brez povabila
              </p>
            </div>
            <Switch
              checked={settings.selfRegistration}
              onCheckedChange={(checked) => handleSettingChange('selfRegistration', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email verifikacija</Label>
              <p className="text-sm text-muted-foreground">
                Zahtevaj verifikacijo email naslova ob registraciji
              </p>
            </div>
            <Switch
              checked={settings.emailVerification}
              onCheckedChange={(checked) => handleSettingChange('emailVerification', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Database Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Baza podatkov
          </CardTitle>
          <CardDescription>
            Konfigurirajte povezavo z bazo podatkov
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="db-type">Tip baze podatkov</Label>
              <Select
                value={settings.databaseType}
                onValueChange={(value: SystemSettings['databaseType']) => handleSettingChange('databaseType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="db-url">Connection URL</Label>
              <Input
                id="db-url"
                value={settings.databaseUrl}
                onChange={(e) => handleSettingChange('databaseUrl', e.target.value)}
                placeholder="Vnesite connection URL"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email nastavitve (SMTP)
          </CardTitle>
          <CardDescription>
            Konfigurirajte SMTP strežnik za pošiljanje emailov
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input
                id="smtp-host"
                value={settings.smtpHost}
                onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input
                id="smtp-port"
                type="number"
                value={settings.smtpPort}
                onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
                placeholder="587"
              />
            </div>
            <div>
              <Label htmlFor="smtp-user">SMTP Username</Label>
              <Input
                id="smtp-user"
                value={settings.smtpUser}
                onChange={(e) => handleSettingChange('smtpUser', e.target.value)}
                placeholder="your-email@gmail.com"
              />
            </div>
            <div>
              <Label htmlFor="smtp-password">SMTP Password</Label>
              <Input
                id="smtp-password"
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
                placeholder="Geslo aplikacije"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Varnostne nastavitve
          </CardTitle>
          <CardDescription>
            Konfigurirajte varnostne parametre sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jwt-secret">JWT Secret</Label>
              <Input
                id="jwt-secret"
                type="password"
                value={settings.jwtSecret}
                onChange={(e) => handleSettingChange('jwtSecret', e.target.value)}
                placeholder="Vnesite JWT secret"
              />
            </div>
            <div>
              <Label htmlFor="session-timeout">Session Timeout (ure)</Label>
              <Input
                id="session-timeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                placeholder="24"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Indicator */}
      {hasChanges && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <Settings className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Neshranjene spremembe
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Imate {Object.keys(pendingChanges).length} neshranjenih sprememb. Kliknite &quot;Shrani spremembe&quot; za potrditev.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSettingsSection;