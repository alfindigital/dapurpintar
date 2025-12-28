import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookmarkPlus, 
  Trash2, 
  Calendar, 
  Utensils,
  FileDown,
  Pencil,
  Check,
  X
} from "lucide-react";
import { MealPlanTemplate, DAYS, MEAL_TIMES } from "@/types/mealPlan";
import { toast } from "sonner";

interface TemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: MealPlanTemplate[];
  onSaveTemplate: (name: string, description?: string) => MealPlanTemplate | null;
  onApplyTemplate: (templateId: string) => boolean;
  onDeleteTemplate: (templateId: string) => void;
  onRenameTemplate: (templateId: string, newName: string) => void;
  hasCurrentPlan: boolean;
}

export const TemplatesDialog = ({
  open,
  onOpenChange,
  templates,
  onSaveTemplate,
  onApplyTemplate,
  onDeleteTemplate,
  onRenameTemplate,
  hasCurrentPlan,
}: TemplatesDialogProps) => {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error("Masukkan nama template");
      return;
    }

    const result = onSaveTemplate(templateName.trim(), templateDesc.trim() || undefined);
    if (result) {
      toast.success(`Template "${result.name}" berhasil disimpan`);
      setTemplateName("");
      setTemplateDesc("");
      setShowSaveForm(false);
    } else {
      toast.error("Tidak ada resep untuk disimpan sebagai template");
    }
  };

  const handleApply = (template: MealPlanTemplate) => {
    const success = onApplyTemplate(template.id);
    if (success) {
      toast.success(`Template "${template.name}" berhasil diterapkan`);
      onOpenChange(false);
    } else {
      toast.error("Gagal menerapkan template");
    }
  };

  const handleDelete = (template: MealPlanTemplate) => {
    onDeleteTemplate(template.id);
    toast.success(`Template "${template.name}" dihapus`);
  };

  const handleStartEdit = (template: MealPlanTemplate) => {
    setEditingId(template.id);
    setEditingName(template.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      onRenameTemplate(editingId, editingName.trim());
      toast.success("Nama template diperbarui");
    }
    setEditingId(null);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const getTemplateStats = (template: MealPlanTemplate) => {
    const filledSlots = template.slots.filter(s => s.recipe);
    const mealCounts = MEAL_TIMES.map(mt => ({
      label: mt.label,
      count: filledSlots.filter(s => s.mealTime === mt.key).length,
    }));
    return { total: filledSlots.length, mealCounts };
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkPlus className="h-5 w-5" />
            Template Meal Plan
          </DialogTitle>
          <DialogDescription>
            Simpan dan gunakan ulang meal plan favorit
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Save current as template */}
          {hasCurrentPlan && (
            <div className="border-b pb-4">
              {!showSaveForm ? (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setShowSaveForm(true)}
                >
                  <BookmarkPlus className="h-4 w-4" />
                  Simpan Plan Saat Ini Sebagai Template
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Nama Template</Label>
                    <Input
                      id="template-name"
                      placeholder="contoh: Menu Hemat Minggu Ini"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-desc">Deskripsi (opsional)</Label>
                    <Textarea
                      id="template-desc"
                      placeholder="Catatan tentang template ini..."
                      value={templateDesc}
                      onChange={(e) => setTemplateDesc(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1">
                      Simpan
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowSaveForm(false);
                        setTemplateName("");
                        setTemplateDesc("");
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Template list */}
          <div>
            <h4 className="text-sm font-medium mb-2">Template Tersimpan</h4>
            {templates.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Belum ada template tersimpan</p>
              </div>
            ) : (
              <ScrollArea className="h-[280px]">
                <div className="space-y-2 pr-2">
                  {templates.map((template) => {
                    const stats = getTemplateStats(template);
                    const isEditing = editingId === template.id;

                    return (
                      <div
                        key={template.id}
                        className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-2 mb-2">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="h-8 text-sm"
                              autoFocus
                            />
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveEdit}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h5 className="font-medium text-sm">{template.name}</h5>
                              {template.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {template.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => handleStartEdit(template)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(template)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Utensils className="h-3 w-3" />
                            {stats.total} menu
                          </span>
                          <span>{formatDate(template.createdAt)}</span>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {stats.mealCounts
                            .filter(mc => mc.count > 0)
                            .map(mc => (
                              <span
                                key={mc.label}
                                className="text-xs px-1.5 py-0.5 rounded bg-muted"
                              >
                                {mc.label}: {mc.count}
                              </span>
                            ))}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full gap-1.5"
                          onClick={() => handleApply(template)}
                        >
                          <FileDown className="h-3.5 w-3.5" />
                          Terapkan Template
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};