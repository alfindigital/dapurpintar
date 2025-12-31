import { User, MapPin, ChefHat, Clock, Wallet, Trash2, RotateCcw, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { HelpTooltip } from "./HelpTooltip";
import { AddFamilyMemberDialog } from "./AddFamilyMemberDialog";
import { UserProfile, FamilyMember } from "@/types/profile";
import { PROVINCES, CITIES } from "@/lib/profileConstants";
import { toast } from "sonner";

interface ProfileTabProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onAddFamilyMember: (member: Omit<FamilyMember, 'id' | 'kategoriUsia'>) => void;
  onRemoveFamilyMember: (id: string) => void;
  onResetProfile: () => void;
}

export function ProfileTab({
  profile,
  onUpdateProfile,
  onAddFamilyMember,
  onRemoveFamilyMember,
  onResetProfile,
}: ProfileTabProps) {
  const cities = profile.provinsi ? CITIES[profile.provinsi] || [] : [];

  const handleProvinsiChange = (value: string) => {
    onUpdateProfile({ provinsi: value, kota: '' });
  };

  const handleReset = () => {
    onResetProfile();
    toast.success("Profil direset ke default");
  };

  const getKategoriLabel = (kategori: FamilyMember['kategoriUsia']) => {
    const labels: Record<FamilyMember['kategoriUsia'], string> = {
      bayi: 'Bayi',
      balita: 'Balita',
      anak: 'Anak',
      remaja: 'Remaja',
      dewasa: 'Dewasa',
      lansia: 'Lansia',
    };
    return labels[kategori];
  };

  return (
    <ScrollArea className="h-[60vh] pr-4">
      <div className="space-y-6">
        {/* Data Pribadi */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Data Pribadi</h3>
            <HelpTooltip content="Data ini digunakan AI untuk mempersonalisasi resep" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nama</Label>
              <Input
                id="profile-name"
                placeholder="Nama Anda"
                value={profile.nama}
                onChange={(e) => onUpdateProfile({ nama: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-age">Usia</Label>
              <Input
                id="profile-age"
                type="number"
                min="0"
                max="120"
                placeholder="0"
                value={profile.usia || ''}
                onChange={(e) => onUpdateProfile({ usia: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <RadioGroup
              value={profile.status}
              onValueChange={(value) => onUpdateProfile({ status: value as UserProfile['status'] })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="status-single" />
                <Label htmlFor="status-single" className="cursor-pointer">Single</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="menikah" id="status-menikah" />
                <Label htmlFor="status-menikah" className="cursor-pointer">Menikah</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="berkeluarga" id="status-berkeluarga" />
                <Label htmlFor="status-berkeluarga" className="cursor-pointer">Berkeluarga</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <Separator />

        {/* Anggota Keluarga */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Anggota Keluarga</h3>
            <HelpTooltip content="Tambahkan anggota keluarga untuk porsi dan pertimbangan nutrisi" />
          </div>

          {profile.anggotaKeluarga.length > 0 && (
            <div className="space-y-2">
              {profile.anggotaKeluarga.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.nama}</span>
                      <Badge variant="secondary" className="text-xs">
                        {member.hubungan}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {member.usia} thn ({getKategoriLabel(member.kategoriUsia)})
                      </Badge>
                    </div>
                    {member.kondisiKhusus.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.kondisiKhusus.map((kondisi) => (
                          <Badge key={kondisi} variant="destructive" className="text-xs">
                            {kondisi}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveFamilyMember(member.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <AddFamilyMemberDialog onAdd={onAddFamilyMember} />
        </div>

        <Separator />

        {/* Lokasi */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Lokasi</h3>
            <HelpTooltip content="Untuk memprioritaskan masakan daerah Anda" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Provinsi</Label>
              <Select value={profile.provinsi} onValueChange={handleProvinsiChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih provinsi" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map((prov) => (
                    <SelectItem key={prov} value={prov}>
                      {prov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kota</Label>
              <Select
                value={profile.kota}
                onValueChange={(value) => onUpdateProfile({ kota: value })}
                disabled={!profile.provinsi}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kota" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Preferensi Memasak */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Preferensi Memasak</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Kemampuan Memasak</Label>
              <RadioGroup
                value={profile.kemampuanMasak}
                onValueChange={(value) => onUpdateProfile({ kemampuanMasak: value as UserProfile['kemampuanMasak'] })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pemula" id="skill-pemula" />
                  <Label htmlFor="skill-pemula" className="cursor-pointer">Pemula</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="menengah" id="skill-menengah" />
                  <Label htmlFor="skill-menengah" className="cursor-pointer">Menengah</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mahir" id="skill-mahir" />
                  <Label htmlFor="skill-mahir" className="cursor-pointer">Mahir</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label>Waktu Tersedia</Label>
                </div>
                <Select
                  value={profile.waktuMasakTersedia}
                  onValueChange={(value) => onUpdateProfile({ waktuMasakTersedia: value as UserProfile['waktuMasakTersedia'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="singkat">Singkat (&lt;30 menit)</SelectItem>
                    <SelectItem value="sedang">Sedang (30-60 menit)</SelectItem>
                    <SelectItem value="panjang">Panjang (&gt;60 menit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <Label>Budget Masak</Label>
                </div>
                <Select
                  value={profile.budgetMasak}
                  onValueChange={(value) => onUpdateProfile({ budgetMasak: value as UserProfile['budgetMasak'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hemat">Hemat</SelectItem>
                    <SelectItem value="sedang">Sedang</SelectItem>
                    <SelectItem value="bebas">Bebas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Target Nutrisi Harian */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Target Nutrisi Harian</h3>
            <HelpTooltip content="Target nutrisi untuk tracking harian Anda" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-kalori">Target Kalori (kkal)</Label>
              <Input
                id="target-kalori"
                type="number"
                min="1000"
                max="5000"
                placeholder="2000"
                value={profile.targetKalori || ''}
                onChange={(e) => onUpdateProfile({ targetKalori: parseInt(e.target.value, 10) || 2000 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-protein">Target Protein (g)</Label>
              <Input
                id="target-protein"
                type="number"
                min="20"
                max="200"
                placeholder="50"
                value={profile.targetProtein || ''}
                onChange={(e) => onUpdateProfile({ targetProtein: parseInt(e.target.value, 10) || 50 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-karbo">Target Karbohidrat (g)</Label>
              <Input
                id="target-karbo"
                type="number"
                min="100"
                max="500"
                placeholder="250"
                value={profile.targetKarbohidrat || ''}
                onChange={(e) => onUpdateProfile({ targetKarbohidrat: parseInt(e.target.value, 10) || 250 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-lemak">Target Lemak (g)</Label>
              <Input
                id="target-lemak"
                type="number"
                min="20"
                max="150"
                placeholder="65"
                value={profile.targetLemak || ''}
                onChange={(e) => onUpdateProfile({ targetLemak: parseInt(e.target.value, 10) || 65 })}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Catatan Tambahan */}
        <div className="space-y-2">
          <Label htmlFor="catatan">Catatan Tambahan</Label>
          <Textarea
            id="catatan"
            placeholder="Contoh: Tidak suka pedas, preferensi makanan sehat..."
            value={profile.catatanTambahan}
            onChange={(e) => onUpdateProfile({ catatanTambahan: e.target.value })}
            rows={3}
          />
        </div>

        {/* Reset Button */}
        <div className="pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Profil
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
