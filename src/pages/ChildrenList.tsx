import { Edit, Plus, Search, Scale, Ruler, Activity, History } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNutriData } from "@/hooks/useNutriData";
import { useToast } from "@/hooks/use-toast";
import { formatChildAge, tinampaanAreas, type Child, type GuardianAddress, type GuardianType } from "@/lib/mockData";
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

const guardianTypes: GuardianType[] = ["Mother", "Father", "Aunt", "Uncle", "Grandmother", "Grandfather"];

type ChildForm = {
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: string;
  gender: "Male" | "Female";
  weight: string;
  height: string;
  guardianType: GuardianType;
  motherName: string;
  fatherName: string;
  guardianAddress: GuardianAddress;
  assignedArea: string;
  allergies: string;
};

const emptyAddress: GuardianAddress = {
  purok: "",
  hacienda: "",
  street: "",
  barangay: "Tinampa-an",
  cityMunicipality: "Cadiz City",
  province: "Negros Occidental",
};

function formatGuardianAddress(address: GuardianAddress) {
  return [
    address.purok,
    address.hacienda ? `Hda. ${address.hacienda}` : "",
    address.street,
    address.barangay ? `Barangay ${address.barangay}` : "",
    address.cityMunicipality,
    address.province,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

function createEmptyForm(assignedArea: string): ChildForm {
  return {
    firstName: "",
    middleName: "",
    lastName: "",
    birthDate: "",
    gender: "Female",
    weight: "",
    height: "",
    guardianType: "Mother",
    motherName: "",
    fatherName: "",
    guardianAddress: { ...emptyAddress },
    assignedArea,
    allergies: "",
  };
}

function createFormFromChild(child: Child): ChildForm {
  return {
    firstName: child.firstName || "",
    middleName: child.middleName || "",
    lastName: child.lastName || "",
    birthDate: child.birthDate || "",
    gender: child.gender,
    weight: String(child.weight || ""),
    height: String(child.height || ""),
    guardianType: child.guardianType || "Mother",
    motherName: child.motherName || child.parentName || "",
    fatherName: child.fatherName || "",
    guardianAddress: {
      ...emptyAddress,
      ...(child.guardianAddress || {}),
    },
    assignedArea: child.assignedArea || tinampaanAreas[0].area,
    allergies: child.allergies || "",
  };
}

export default function ChildrenList() {
  const { children, addChild, updateChild } = useNutriData();
  const { staffRole, staffUser } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const staffAssignedArea = staffRole === "bhw" && staffUser?.assignedArea ? staffUser.assignedArea : tinampaanAreas[0].area;
  const [form, setForm] = useState<ChildForm>(() => createEmptyForm(staffAssignedArea));
  const canManageRecords = staffRole === "admin" || staffRole === "bhw";
  const childProfileBasePath = staffRole === "bhw" ? "/bhw/children" : "/admin/children";
  const availableAreas = useMemo(
    () => (staffRole === "bhw" && staffUser?.assignedArea ? tinampaanAreas.filter((area) => area.area === staffUser.assignedArea) : tinampaanAreas),
    [staffRole, staffUser?.assignedArea],
  );

  const filtered = children.filter((child) => child.name.toLowerCase().includes(search.toLowerCase()));

  const openAddDialog = () => {
    setEditingChild(null);
    setForm(createEmptyForm(staffAssignedArea));
    setIsDialogOpen(true);
  };

  const openEditDialog = (child: Child) => {
    setEditingChild(child);
    setForm(createFormFromChild(child));
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    if (isSaving) return;
    setIsDialogOpen(false);
    setEditingChild(null);
    setForm(createEmptyForm(staffAssignedArea));
  };

  const updateAddressField = (field: keyof GuardianAddress, value: string) => {
    setForm((current) => ({
      ...current,
      guardianAddress: { ...current.guardianAddress, [field]: value },
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const guardianAddress = {
      ...form.guardianAddress,
      purok: form.guardianAddress.purok.trim(),
      hacienda: form.guardianAddress.hacienda.trim(),
      street: form.guardianAddress.street.trim(),
      barangay: form.guardianAddress.barangay.trim(),
      cityMunicipality: form.guardianAddress.cityMunicipality.trim(),
      province: form.guardianAddress.province.trim(),
    };
    const formattedAddress = formatGuardianAddress(guardianAddress);

    if (!form.firstName.trim() || !form.lastName.trim() || !form.birthDate || !form.weight || !form.height) {
      toast({ title: "Missing child details", description: "Complete the child name, birth date, weight, and height.", variant: "destructive" });
      return;
    }

    if (!form.motherName.trim() || !guardianAddress.purok || !guardianAddress.barangay || !guardianAddress.cityMunicipality || !guardianAddress.province) {
      toast({ title: "Missing guardian details", description: "Complete the guardian names and required address fields.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const input = {
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        birthDate: form.birthDate,
        gender: form.gender,
        weight: Number(form.weight),
        height: Number(form.height),
        parentName: form.motherName,
        guardianType: form.guardianType,
        motherName: form.motherName,
        fatherName: form.fatherName,
        address: formattedAddress,
        guardianAddress,
        assignedArea: staffRole === "bhw" ? staffAssignedArea : form.assignedArea,
        allergies: form.allergies,
      };

      if (editingChild) {
        await updateChild(editingChild.id, input);
        toast({ title: "Child record updated", description: "Guardian, child, and address details were saved." });
      } else {
        await addChild(input);
        toast({ title: "Child record added", description: "The profile is now available to the assigned BHW." });
      }
      closeDialog();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="section-enter flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Children Profiles</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor registered children by assigned area</p>
        </div>
        {canManageRecords && (
          <Button type="button" onClick={openAddDialog}>
            <Plus className="h-4 w-4" /> Add Child
          </Button>
        )}
      </div>

      <div className="relative mt-6 section-enter stagger-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search children..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filtered.map((child, index) => (
          <div key={child.id} className={`stat-card section-enter stagger-${(index % 5) + 1} group`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center text-sm font-bold text-sage-deep group-hover:scale-105 transition-transform">
                  {child.avatar}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">{child.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {child.ageDisplay || formatChildAge(child.birthDate) || `${child.age} years old`} - {child.gender}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button type="button" asChild variant="outline" size="sm">
                  <Link to={`${childProfileBasePath}/${child.id}`}><History className="h-4 w-4" /> History</Link>
                </Button>
                {canManageRecords && (
                  <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(child)}>
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center p-2 rounded-lg bg-muted">
                <Scale className="w-3.5 h-3.5 mx-auto text-muted-foreground" />
                <p className="text-sm font-semibold mt-1">{child.weight}</p>
                <p className="text-[10px] text-muted-foreground">kg</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <Ruler className="w-3.5 h-3.5 mx-auto text-muted-foreground" />
                <p className="text-sm font-semibold mt-1">{child.height}</p>
                <p className="text-[10px] text-muted-foreground">cm</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted">
                <Activity className="w-3.5 h-3.5 mx-auto text-muted-foreground" />
                <p className="text-sm font-semibold mt-1">{child.bmi}</p>
                <p className="text-[10px] text-muted-foreground">BMI</p>
              </div>
            </div>

            <p className="break-words text-xs text-muted-foreground">Allergies: {child.allergies?.trim() || "None recorded"}</p>

            <div className="mt-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                child.status === "Normal" ? "bg-sage text-sage-deep" :
                child.status === "Underweight" ? "bg-peach text-warning-foreground" :
                child.status === "Overweight" ? "bg-coral-light text-coral" :
                "bg-destructive/10 text-destructive"
              }`}>
                {child.status}
              </span>
            </div>

            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs font-semibold text-foreground">Guardian Information</p>
              <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                <p className="break-words">Mother: {child.motherName || child.parentName}</p>
                <p className="break-words">Father: {child.fatherName || "Not recorded"}</p>
                <p className="break-words">Guardian: {child.parentName}</p>
                <p className="break-words">Type of Guardian: {child.guardianType || "Not recorded"}</p>
                <p className="break-words">Address: {child.address || "Not recorded"}</p>
                <p className="break-words">Assigned Area: {child.assignedArea || "Not assigned"}</p>
                <p className="break-words">Assigned BHW: {child.assignedBhwName || "Not assigned"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : closeDialog())}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingChild ? "Edit Child Record" : "Add Child Record"}</DialogTitle>
            <DialogDescription>Save the child, guardian, and address information needed by the assigned BHW.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="first-name">Child's First Name</Label>
                <Input id="first-name" value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middle-name">Child's Middle Name</Label>
                <Input id="middle-name" value={form.middleName} onChange={(event) => setForm((current) => ({ ...current, middleName: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Child's Last Name</Label>
                <Input id="last-name" value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="birth-date">Birth Date</Label>
                <Input id="birth-date" type="date" value={form.birthDate} onChange={(event) => setForm((current) => ({ ...current, birthDate: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select id="gender" value={form.gender} onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value as "Male" | "Female" }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" min="0" step="0.1" value={form.weight} onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" type="number" min="0" step="0.1" value={form.height} onChange={(event) => setForm((current) => ({ ...current, height: event.target.value }))} required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="guardian-type">Guardian Type</Label>
                <select id="guardian-type" value={form.guardianType} onChange={(event) => setForm((current) => ({ ...current, guardianType: event.target.value as GuardianType }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {guardianTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mother-name">Mother / Guardian Name</Label>
                <Input id="mother-name" value={form.motherName} onChange={(event) => setForm((current) => ({ ...current, motherName: event.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="father-name">Father Name</Label>
                <Input id="father-name" value={form.fatherName} onChange={(event) => setForm((current) => ({ ...current, fatherName: event.target.value }))} placeholder="Not recorded" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="purok">Purok</Label>
                <Input id="purok" value={form.guardianAddress.purok} onChange={(event) => updateAddressField("purok", event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hacienda">Hacienda</Label>
                <Input id="hacienda" value={form.guardianAddress.hacienda} onChange={(event) => updateAddressField("hacienda", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input id="street" value={form.guardianAddress.street} onChange={(event) => updateAddressField("street", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barangay">Barangay</Label>
                <Input id="barangay" value={form.guardianAddress.barangay} onChange={(event) => updateAddressField("barangay", event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City / Municipality</Label>
                <Input id="city" value={form.guardianAddress.cityMunicipality} onChange={(event) => updateAddressField("cityMunicipality", event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input id="province" value={form.guardianAddress.province} onChange={(event) => updateAddressField("province", event.target.value)} required />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assigned-area">Assigned Area</Label>
                <select id="assigned-area" value={staffRole === "bhw" ? staffAssignedArea : form.assignedArea} disabled={staffRole === "bhw"} onChange={(event) => setForm((current) => ({ ...current, assignedArea: event.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-70">
                  {availableAreas.map((assignment) => <option key={assignment.area} value={assignment.area}>{assignment.area}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input id="allergies" value={form.allergies} onChange={(event) => setForm((current) => ({ ...current, allergies: event.target.value }))} placeholder="None recorded" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Record"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
