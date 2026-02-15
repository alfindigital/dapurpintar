import React from 'react';
import { Bell, BellOff, Volume2, VolumeX, Clock, TestTube } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useWaterReminder } from '@/hooks/useWaterReminder';

export const WaterReminderSettings: React.FC = () => {
  const {
    settings,
    updateSettings,
    toggleReminder,
    testNotification,
    permissionStatus,
    requestPermission,
    lastReminder,
    isSupported,
  } = useWaterReminder();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BellOff className="h-5 w-5" />
            Pengingat Tidak Tersedia
          </CardTitle>
          <CardDescription>
            Browser Anda tidak mendukung notifikasi.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const getNextReminderTime = () => {
    if (!settings.enabled || !lastReminder) return null;
    const next = new Date(lastReminder.getTime() + settings.intervalMinutes * 60 * 1000);
    return next.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="border-0 shadow-soft-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              {settings.enabled ? (
                <Bell className="h-5 w-5 text-primary" />
              ) : (
                <BellOff className="h-5 w-5 text-muted-foreground" />
              )}
              Pengingat Minum Air
            </CardTitle>
            <CardDescription className="mt-1">
              Dapatkan notifikasi untuk tetap terhidrasi
            </CardDescription>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={toggleReminder}
            aria-label="Toggle reminder"
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Permission Status */}
        {permissionStatus !== 'granted' && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="text-sm">
              <p className="font-medium">Izin Notifikasi Diperlukan</p>
              <p className="text-muted-foreground text-xs">
                Klik untuk mengaktifkan notifikasi
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={requestPermission}>
              Izinkan
            </Button>
          </div>
        )}

        {/* Reminder Status */}
        {settings.enabled && permissionStatus === 'granted' && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Clock className="h-3 w-3 mr-1" />
              Setiap {settings.intervalMinutes} menit
            </Badge>
            {getNextReminderTime() && (
              <Badge variant="outline">
                Berikutnya: {getNextReminderTime()}
              </Badge>
            )}
          </div>
        )}

        {/* Interval Setting */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Interval Pengingat</Label>
            <span className="text-sm text-muted-foreground">
              {settings.intervalMinutes} menit
            </span>
          </div>
          <Slider
            value={[settings.intervalMinutes]}
            onValueChange={(value) => updateSettings({ intervalMinutes: value[0] })}
            min={15}
            max={180}
            step={15}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>15 menit</span>
            <span>3 jam</span>
          </div>
        </div>

        {/* Active Hours */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Jam Aktif</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Mulai</Label>
              <Slider
                value={[settings.startHour]}
                onValueChange={(value) => updateSettings({ startHour: value[0] })}
                min={5}
                max={settings.endHour - 1}
                step={1}
                className="w-full"
              />
              <span className="text-sm font-medium">{formatTime(settings.startHour)}</span>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Selesai</Label>
              <Slider
                value={[settings.endHour]}
                onValueChange={(value) => updateSettings({ endHour: value[0] })}
                min={settings.startHour + 1}
                max={24}
                step={1}
                className="w-full"
              />
              <span className="text-sm font-medium">{formatTime(settings.endHour)}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Notifikasi hanya akan dikirim antara {formatTime(settings.startHour)} - {formatTime(settings.endHour)}
          </p>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.sound ? (
              <Volume2 className="h-4 w-4 text-primary" />
            ) : (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            )}
            <Label className="text-sm font-medium">Suara Notifikasi</Label>
          </div>
          <Switch
            checked={settings.sound}
            onCheckedChange={(checked) => updateSettings({ sound: checked })}
            aria-label="Toggle sound"
          />
        </div>

        {/* Test Button */}
        {permissionStatus === 'granted' && (
          <Button
            variant="outline"
            size="sm"
            onClick={testNotification}
            className="w-full"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Tes Notifikasi
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
