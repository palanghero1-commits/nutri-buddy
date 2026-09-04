import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit, MapPin, Plus, Trash2, UserCog } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { tinampaanAreas, type Child } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BhwAccount = {
  id: number | string;
  name: string;
  email: string;
  designation: string;
  assignedArea: string;
  contactNumber?: string;
};

type BhwForm = {
  name: string;
  email: string;
  password: string;
  designation: string;
  assignedArea: string;
  contactNumber: string;
};

type NutritionResponse = {
  children: Child[];
};

const emptyForm: BhwForm = {
  name: "",
  email: "",
  password: "",
  designation: "Barangay Health Worker",
  assignedArea: tinampaanAreas[0].area,
  contactNumber: "",
};

export default function BhwManagement() {
  const [bhws, setBhws] = useState<BhwAccount[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBhw, setEditingBhw] = useState<BhwAccount | null>(null);
  const [form, setForm] = useState<BhwForm>(emptyForm);
  const { toast } = useToast();

  const childrenByArea = useMemo(() => {
    return children.reduce<Record<string, number>>((counts, child) => {
      const area = child.assignedArea || "Not assigned";
      counts[area] = (counts[area] ?? 0) + 1;
      return counts;
    }, {});
  }, [children]);

  const loadBhws = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiRequest<{ bhws: BhwAccount[] }>("/api/bhws");
      const nutrition = await apiRequest<NutritionResponse>("/api/nutrition");
      setBhws(result.bhws);
      setChildren(nutrition.children);
    } catch (error) {
      toast({
        title: "Unable to load BHW list",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadBhws();
  }, [loadBhws]);

  const openAddDialog = () => {
    setEditingBhw(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (bhw: BhwAccount) => {
    setEditingBhw(bhw);
    setForm({
      name: bhw.name,
      email: bhw.email,
      password: "",
      designation: bhw.designation || "Barangay Health Worker",
      assignedArea: bhw.assignedArea || tinampaanAreas[0].area,
      contactNumber: bhw.contactNumber || "",
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    if (isSaving) return;
    setEditingBhw(null);
    setForm(emptyForm);
    setIsDialogOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      if (editingBhw) {
        const result = await apiRequest<{ bhw: BhwAccount }>(`/api/bhws/${encodeURIComponent(editingBhw.email)}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
        setBhws((current) => current.map((bhw) => (bhw.email === editingBhw.email ? result.bhw : bhw)));
        toast({ title: "BHW updated", description: "The account designation and assigned area have been saved." });
      } else {
        const result = await apiRequest<{ bhw: BhwAccount }>("/api/bhws", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setBhws((current) => [...current, result.bhw].sort((a, b) => a.assignedArea.localeCompare(b.assignedArea)));
        toast({ title: "BHW added", description: "The admin-generated BHW account is ready." });
      }
      closeDialog();
    } catch (error) {
      toast({
        title: editingBhw ? "Update failed" : "Create failed",
        description: error instanceof Error ? error.message : "Please check the details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (bhw: BhwAccount) => {
    const confirmed = window.confirm(`Delete ${bhw.name}'s BHW account?`);
    if (!confirmed) return;

    try {
      await apiRequest<{ success: boolean }>(`/api/bhws/${encodeURIComponent(bhw.email)}`, {
        method: "DELETE",
      });
      setBhws((current) => current.filter((item) => item.email !== bhw.email));
      toast({ title: "BHW deleted", description: "The account was removed from the BHW list." });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="section-enter flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">BHW Management</h1>
          <p className="mt-1 text-muted-foreground">Generate Barangay Health Worker accounts, designations, and assigned Tinampa-an areas.</p>
        </div>
        <Button type="button" onClick={openAddDialog}>
          <Plus className="h-4 w-4" /> Add BHW
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {tinampaanAreas.map((assignment) => (
          <div key={assignment.area} className="stat-card section-enter">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage">
                <MapPin className="h-5 w-5 text-foreground/70" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{assignment.area}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {childrenByArea[assignment.area] ?? 0} child profile record
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card section-enter">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">BHW</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Designation</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Assigned Area</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contact</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading BHW accounts...</td>
                </tr>
              ) : bhws.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No BHW accounts yet.</td>
                </tr>
              ) : (
                bhws.map((bhw) => (
                  <tr key={bhw.email} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-peach">
                          <UserCog className="h-4 w-4 text-foreground/70" />
                        </div>
                        <span className="font-medium text-foreground">{bhw.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{bhw.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{bhw.designation || "Barangay Health Worker"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{bhw.assignedArea || "Not assigned"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{bhw.contactNumber || "Not recorded"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(bhw)}>
                          <Edit className="h-4 w-4" /> Edit
                        </Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(bhw)}>
                          <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : closeDialog())}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBhw ? "Edit BHW" : "Add BHW"}</DialogTitle>
            <DialogDescription>
              Admin creates the BHW login account, designation, and assigned area.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bhw-name">Name</Label>
                <Input id="bhw-name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bhw-email">Email</Label>
                <Input id="bhw-email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bhw-designation">Designation</Label>
              <Input id="bhw-designation" value={form.designation} onChange={(event) => setForm((current) => ({ ...current, designation: event.target.value }))} required />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bhw-password">{editingBhw ? "New Password" : "Password"}</Label>
                <Input
                  id="bhw-password"
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder={editingBhw ? "Leave blank to keep current" : "Enter password"}
                  required={!editingBhw}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bhw-contact">Contact Number</Label>
                <Input id="bhw-contact" value={form.contactNumber} onChange={(event) => setForm((current) => ({ ...current, contactNumber: event.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bhw-area">Assigned Area</Label>
              <select
                id="bhw-area"
                value={form.assignedArea}
                onChange={(event) => setForm((current) => ({ ...current, assignedArea: event.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {tinampaanAreas.map((assignment) => (
                  <option key={assignment.area} value={assignment.area}>
                    {assignment.area}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save BHW"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
