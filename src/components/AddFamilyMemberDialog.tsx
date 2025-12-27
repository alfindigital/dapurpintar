import { useState } from "react";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FAMILY_RELATIONS, HEALTH_CONDITIONS } from "@/lib/profileConstants";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FamilyMember } from "@/types/profile";

interface AddFamilyMemberDialogProps {
  onAdd: (member: Omit<FamilyMember, 'id' | 'kategoriUsia'>) => void;
}

export function AddFamilyMemberDialog({ onAdd }: AddFamilyMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [nama, setNama] = useState("");
  const [hubungan, setHubungan] = useState("");
  const [usia, setUsia] = useState("");
  const [kondisiKhusus, setKondisiKhusus] = useState<string[]>([]);

  const handleSubmit = () => {
    if (!nama.trim() || !hubungan || !usia) return;

    onAdd({
      nama: nama.trim(),
      hubungan,
      usia: parseInt(usia, 10),
      kondisiKhusus,
    });

    // Reset form
    setNama("");
    setHubungan("");
    setUsia("");
    setKondisiKhusus([]);
    setOpen(false);
  };

  const toggleCondition = (condition: string) => {
    setKondisiKhusus(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <UserPlus className="h-4 w-4 mr-2" />
          Tambah Anggota Keluarga
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Anggota Keluarga</DialogTitle>
          <DialogDescription>
            Tambahkan anggota keluarga untuk personalisasi resep
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="member-name">Nama</Label>
            <Input
              id="member-name"
              placeholder="Nama anggota keluarga"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hubungan</Label>
              <Select value={hubungan} onValueChange={setHubungan}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih" />
                </SelectTrigger>
                <SelectContent>
                  {FAMILY_RELATIONS.map((rel) => (
                    <SelectItem key={rel} value={rel}>
                      {rel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-age">Usia (tahun)</Label>
              <Input
                id="member-age"
                type="number"
                min="0"
                max="120"
                placeholder="0"
                value={usia}
                onChange={(e) => setUsia(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Kondisi Khusus (opsional)</Label>
            <ScrollArea className="h-32 rounded-md border p-3">
              <div className="grid grid-cols-2 gap-2">
                {HEALTH_CONDITIONS.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={`condition-${condition}`}
                      checked={kondisiKhusus.includes(condition)}
                      onCheckedChange={() => toggleCondition(condition)}
                    />
                    <label
                      htmlFor={`condition-${condition}`}
                      className="text-sm cursor-pointer"
                    >
                      {condition}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!nama.trim() || !hubungan || !usia}
          >
            Tambah
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
