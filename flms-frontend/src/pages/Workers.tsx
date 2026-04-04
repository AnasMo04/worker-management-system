import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search, Filter, Eye, Edit, ChevronLeft, ChevronRight, Plus, UserPlus, Check, ChevronsUpDown, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentUpload, type UploadedDoc } from "@/components/DocumentUpload";
import api from "../api/axiosConfig";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Worker {
  id: number;
  Full_Name: string;
  Passport_Number: string;
  Nationality: string;
  Job_Title: string;
  Current_Status: "active" | "suspended" | "expired" | "runaway";
  NFC_UID: string;
  Sponsor?: {
    Sponsor_Name: string;
  };
  Sponsor_ID?: number;
  Birth_Date?: string;
  National_ID?: string;
  Passport_Copy?: string;
  Health_Cert_Copy?: string;
  Residency_Copy?: string;
  Personal_Photo_Copy?: string;
}

interface Sponsor {
  id: number;
  Sponsor_Name: string;
}

const nationalities = ["الكل", "بنغلاديش", "غانا", "الهند", "نيجيريا", "الفلبين", "مصر", "تونس"];
const nationalityOptions = ["بنغلاديش", "غانا", "الهند", "نيجيريا", "الفلبين", "مصر", "تونس", "باكستان", "سوريا", "السودان"];
const statuses = ["الكل", "نشط", "موقوف", "منتهي", "هارب"];
const jobOptions = ["عامل بناء", "سائق", "كهربائي", "نجار", "لحّام", "محاسب", "طباخ", "حارس أمن", "سباك", "فني تكييف"];

const emptyForm = { Full_Name: "", Passport_Number: "", Nationality: "", Job_Title: "", Sponsor_ID: "", National_ID: "", Birth_Date: "" };

interface WorkerDocs {
  passportPhoto: UploadedDoc | null;
  healthCert: UploadedDoc | null;
  residencyPhoto: UploadedDoc | null;
  personalPhoto: UploadedDoc | null;
}
const emptyDocs: WorkerDocs = { passportPhoto: null, healthCert: null, residencyPhoto: null, personalPhoto: null };

export default function Workers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [nationalityFilter, setNationalityFilter] = useState("الكل");
  const [addOpen, setAddOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [docs, setDocs] = useState<WorkerDocs>(emptyDocs);
  const [sponsorOpen, setSponsorOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkers();
    fetchSponsors();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/workers");
      setWorkers(response.data);
    } catch (error) {
      console.error("Error fetching workers:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحميل بيانات العمال.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSponsors = async () => {
    try {
      const response = await api.get("/api/sponsors");
      setSponsors(response.data);
    } catch (error) {
      console.error("Error fetching sponsors:", error);
    }
  };

  const statusMap: Record<string, string> = { "نشط": "active", "موقوف": "suspended", "منتهي": "expired", "هارب": "runaway" };

  const filtered = workers.filter((w) => {
    const matchSearch = w.Full_Name?.toLowerCase().includes(search.toLowerCase()) || w.Passport_Number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "الكل" || w.Current_Status === statusMap[statusFilter];
    const matchNat = nationalityFilter === "الكل" || w.Nationality === nationalityFilter;
    return matchSearch && matchStatus && matchNat;
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.Full_Name.trim() || form.Full_Name.trim().length < 3) e.Full_Name = "الاسم مطلوب (3 أحرف على الأقل)";
    if (!form.Passport_Number.trim() || form.Passport_Number.trim().length < 6) e.Passport_Number = "رقم الجواز مطلوب (6 أحرف على الأقل)";

    const isDuplicatePassport = workers.some((w) => w.Passport_Number === form.Passport_Number.trim() && w.id !== selectedWorkerId);
    if (isDuplicatePassport) e.Passport_Number = "رقم الجواز مسجّل مسبقاً";

    if (!form.Nationality) e.Nationality = "الجنسية مطلوبة";
    if (!form.Job_Title) e.Job_Title = "المهنة مطلوبة";
    if (!form.Sponsor_ID) e.Sponsor_ID = "الكفيل مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddOrUpdate = async () => {
    if (!validate()) return;
    try {
      const payload = {
        Full_Name: form.Full_Name.trim(),
        Passport_Number: form.Passport_Number.trim(),
        Nationality: form.Nationality,
        Job_Title: form.Job_Title,
        Sponsor_ID: parseInt(form.Sponsor_ID),
        National_ID: form.National_ID,
        Birth_Date: form.Birth_Date || null,
        Current_Status: editMode ? undefined : "active",
        Passport_Copy: docs.passportPhoto?.url || null,
        Health_Cert_Copy: docs.healthCert?.url || null,
        Residency_Copy: docs.residencyPhoto?.url || null,
        Personal_Photo_Copy: docs.personalPhoto?.url || null,
      };

      if (editMode && selectedWorkerId) {
        await api.put(`/api/workers/${selectedWorkerId}`, payload);
        toast({ title: "تم التحديث", description: `تم تحديث بيانات العامل ${payload.Full_Name} بنجاح.` });
      } else {
        await api.post("/api/workers", { ...payload, Current_Status: "active" });
        toast({ title: "تمت الإضافة", description: `تم تسجيل العامل ${payload.Full_Name} بنجاح.` });
      }

      setAddOpen(false);
      handleClose();
      fetchWorkers();
    } catch (error) {
      console.error("Error saving worker:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في حفظ بيانات العامل.",
      });
    }
  };

  const handleEditClick = (worker: Worker) => {
    setEditMode(true);
    setSelectedWorkerId(worker.id);
    setForm({
      Full_Name: worker.Full_Name,
      Passport_Number: worker.Passport_Number,
      Nationality: worker.Nationality,
      Job_Title: worker.Job_Title,
      Sponsor_ID: worker.Sponsor_ID?.toString() || "",
      National_ID: worker.National_ID || "",
      Birth_Date: worker.Birth_Date || "",
    });
    setDocs({
      passportPhoto: worker.Passport_Copy ? { name: "مستند مرفق", url: worker.Passport_Copy, type: "application/pdf", label: "صورة جواز السفر" } : null,
      healthCert: worker.Health_Cert_Copy ? { name: "مستند مرفق", url: worker.Health_Cert_Copy, type: "application/pdf", label: "الشهادة الصحية" } : null,
      residencyPhoto: worker.Residency_Copy ? { name: "مستند مرفق", url: worker.Residency_Copy, type: "application/pdf", label: "صورة الإقامة" } : null,
      personalPhoto: worker.Personal_Photo_Copy ? { name: "مستند مرفق", url: worker.Personal_Photo_Copy, type: "image/jpeg", label: "صورة شخصية" } : null,
    });
    setAddOpen(true);
  };

  const handleClose = () => {
    setAddOpen(false);
    setEditMode(false);
    setSelectedWorkerId(null);
    setForm(emptyForm);
    setDocs(emptyDocs);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">العمال</h2>
          <p className="text-muted-foreground text-sm">إدارة بيانات العمالة الأجنبية</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة عامل
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو رقم الجواز..."
            className="h-9 bg-muted rounded-lg pr-9 pl-3 text-sm outline-none focus:ring-2 focus:ring-ring w-64 placeholder:text-muted-foreground"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 bg-muted rounded-lg px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={nationalityFilter} onChange={(e) => setNationalityFilter(e.target.value)} className="h-9 bg-muted rounded-lg px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
          {nationalities.map((n) => <option key={n}>{n}</option>)}
        </select>
        <span className="text-xs text-muted-foreground mr-auto">{filtered.length} نتيجة</span>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                <th className="text-right p-3 font-medium">الاسم الكامل</th>
                <th className="text-right p-3 font-medium">رقم الجواز</th>
                <th className="text-right p-3 font-medium">الجنسية</th>
                <th className="text-right p-3 font-medium">المهنة</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">NFC UID</th>
                <th className="text-right p-3 font-medium">الكفيل</th>
                <th className="text-right p-3 font-medium">المستندات</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-3 text-center">جاري التحميل...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-3 text-center">لا توجد بيانات</td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <tr key={w.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{w.Full_Name}</td>
                    <td className="p-3 font-mono text-xs">{w.Passport_Number}</td>
                    <td className="p-3">{w.Nationality}</td>
                    <td className="p-3">{w.Job_Title}</td>
                    <td className="p-3"><StatusBadge variant={w.Current_Status} /></td>
                    <td className="p-3 font-mono text-xs">{w.NFC_UID || "—"}</td>
                    <td className="p-3 text-xs">{w.Sponsor?.Sponsor_Name || "—"}</td>
                    <td className="p-3 text-center">
                      {(w.Passport_Copy || w.Health_Cert_Copy || w.Residency_Copy || w.Personal_Photo_Copy) && (
                        <FileCheck className="w-4 h-4 text-success inline-block" title="مستندات مرفقة" />
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleEditClick(w)} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>عرض 1-{filtered.length} من {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-md bg-muted flex items-center justify-center hover:text-foreground transition-colors"><ChevronRight className="w-4 h-4" /></button>
            <button className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">1</button>
            <button className="w-8 h-8 rounded-md bg-muted flex items-center justify-center hover:text-foreground transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Add/Edit Worker Dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) handleClose(); else setAddOpen(true); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              {editMode ? "تعديل بيانات العامل" : "إضافة عامل جديد"}
            </DialogTitle>
            <DialogDescription>{editMode ? "قم بتعديل بيانات العامل في النظام." : "أدخل بيانات العامل لتسجيله في النظام."}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label>الاسم الكامل <span className="text-destructive">*</span></Label>
              <Input value={form.Full_Name} onChange={(e) => setForm({ ...form, Full_Name: e.target.value })} placeholder="مثال: محمد أحمد علي" maxLength={100} />
              {errors.Full_Name && <p className="text-xs text-destructive">{errors.Full_Name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Passport */}
              <div className="space-y-1.5">
                <Label>رقم الجواز <span className="text-destructive">*</span></Label>
                <Input value={form.Passport_Number} onChange={(e) => setForm({ ...form, Passport_Number: e.target.value })} placeholder="LY12345678" maxLength={20} className="font-mono" />
                {errors.Passport_Number && <p className="text-xs text-destructive">{errors.Passport_Number}</p>}
              </div>
              {/* Nationality */}
              <div className="space-y-1.5">
                <Label>الجنسية <span className="text-destructive">*</span></Label>
                <Select value={form.Nationality} onValueChange={(v) => setForm({ ...form, Nationality: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر الجنسية" /></SelectTrigger>
                  <SelectContent>
                    {nationalityOptions.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.Nationality && <p className="text-xs text-destructive">{errors.Nationality}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Job */}
              <div className="space-y-1.5">
                <Label>المهنة <span className="text-destructive">*</span></Label>
                <Select value={form.Job_Title} onValueChange={(v) => setForm({ ...form, Job_Title: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر المهنة" /></SelectTrigger>
                  <SelectContent>
                    {jobOptions.map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.Job_Title && <p className="text-xs text-destructive">{errors.Job_Title}</p>}
              </div>
              {/* Sponsor */}
              <div className="space-y-1.5">
                <Label>الكفيل <span className="text-destructive">*</span></Label>
                <Popover open={sponsorOpen} onOpenChange={setSponsorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={sponsorOpen}
                      className="w-full justify-between bg-background font-normal text-sm"
                    >
                      {form.Sponsor_ID
                        ? sponsors.find((s) => s.id.toString() === form.Sponsor_ID)?.Sponsor_Name
                        : "اختر الكفيل..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="بحث عن كفيل..." />
                      <CommandList>
                        <CommandEmpty>لا يوجد كفيل بهذا الاسم.</CommandEmpty>
                        <CommandGroup>
                          {sponsors.map((s) => (
                            <CommandItem
                              key={s.id}
                              value={s.Sponsor_Name}
                              onSelect={() => {
                                setForm({ ...form, Sponsor_ID: s.id.toString() });
                                setSponsorOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  form.Sponsor_ID === s.id.toString() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {s.Sponsor_Name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.Sponsor_ID && <p className="text-xs text-destructive">{errors.Sponsor_ID}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* National ID (using this for Phone position or adding it) */}
              <div className="space-y-1.5">
                <Label>الرقم الوطني</Label>
                <Input value={form.National_ID} onChange={(e) => setForm({ ...form, National_ID: e.target.value })} placeholder="123456789012" maxLength={15} />
              </div>
              {/* Birth Date */}
              <div className="space-y-1.5">
                <Label>تاريخ الميلاد</Label>
                <Input type="date" value={form.Birth_Date} onChange={(e) => setForm({ ...form, Birth_Date: e.target.value })} />
              </div>
            </div>

            {/* Document Uploads */}
            <div className="border-t border-border pt-4 mt-2">
              <p className="text-sm font-semibold mb-3">المستندات المطلوبة</p>
              <div className="grid grid-cols-2 gap-3">
                <DocumentUpload
                  label="صورة جواز السفر"
                  required
                  value={docs.passportPhoto}
                  onChange={(d) => setDocs({ ...docs, passportPhoto: d })}
                />
                <DocumentUpload
                  label="الشهادة الصحية"
                  required
                  value={docs.healthCert}
                  onChange={(d) => setDocs({ ...docs, healthCert: d })}
                />
                <DocumentUpload
                  label="صورة الإقامة"
                  value={docs.residencyPhoto}
                  onChange={(d) => setDocs({ ...docs, residencyPhoto: d })}
                />
                <DocumentUpload
                  label="صورة شخصية"
                  value={docs.personalPhoto}
                  onChange={(d) => setDocs({ ...docs, personalPhoto: d })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleAddOrUpdate} className="gap-2">
              {editMode ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editMode ? "تحديث البيانات" : "تسجيل العامل"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
