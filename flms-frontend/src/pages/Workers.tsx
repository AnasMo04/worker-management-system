import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Filter, Edit, Plus, UserPlus, Check, ChevronsUpDown, FileCheck, Users, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentUpload, type UploadedDoc } from "@/components/DocumentUpload";
import api from "../api/axiosConfig";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useSearch } from "../context/SearchContext";

interface Individual {
  id: number;
  Full_Name: string;
  Passport_Number: string; // Document Number
  Nationality: string;
  Residence_Address?: string; // عنوان السكن
  Current_Status: string;
  NFC_UID: string;
  Category: string;
  Document_Type: string;
  Health_Cert_Expiry?: string;
  Freelance: boolean;
  Family_ID?: string;
  Relationship?: string;
  Gender?: string;
  Sponsor_ID?: number;
  Sponsor?: { Sponsor_Name: string };
  Passport_Copy?: string;
  Health_Cert_Copy?: string;
  Residency_Copy?: string;
  Personal_Photo_Copy?: string;
  is_archived?: boolean;
}

interface Sponsor {
  id: number;
  Sponsor_Name: string;
}

const categories = [
  { id: "worker", label: "عامل", icon: "🛠️" },
  { id: "student", label: "طالب", icon: "🎓" },
  { id: "dependent", label: "مرافق / تابع", icon: "👨‍👩‍👧‍👦" }
];

const docTypes = ["جواز سفر", "بطاقة قنصلية", "إفادة سفارة"];
const relationships = ["زوج/زوجة", "ابن/ابنة", "أب/أم", "أخرى"];
const nationalityOptions = ["بنغلاديش", "غانا", "الهند", "نيجيريا", "الفلبين", "مصر", "تونس", "باكستان", "سوريا", "السودان"];
const statusOptions = [
  { value: "نشط", variant: "active" },
  { value: "موقوف", variant: "suspended" },
  { value: "مرحّل", variant: "deported" },
  { value: "متوفى", variant: "deceased" },
  { value: "خارج البلاد", variant: "left" }
];
const statuses = ["الكل", ...statusOptions.map(o => o.value)];

const emptyForm = {
  Full_Name: "", Passport_Number: "", Nationality: "", Residence_Address: "", Sponsor_ID: "",
  National_ID: "", Birth_Date: "", Category: "worker", Document_Type: "جواز سفر",
  Health_Cert_Expiry: "", Freelance: false, Family_ID: "", Relationship: "",
  Gender: "ذكر", Current_Status: "نشط"
};

interface IndividualDocs {
  passportPhoto: UploadedDoc | null;
  healthCert: UploadedDoc | null;
  residencyPhoto: UploadedDoc | null;
  personalPhoto: UploadedDoc | null;
}
const emptyDocs: IndividualDocs = { passportPhoto: null, healthCert: null, residencyPhoto: null, personalPhoto: null };

export default function Workers() {
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [addOpen, setAddOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [docs, setDocs] = useState<IndividualDocs>(emptyDocs);
  const [isSaving, setIsSaving] = useState(false);
  const [sponsorOpen, setSponsorOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [showArchived]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [indRes, sponRes] = await Promise.all([
        api.get(`/api/workers?includeArchived=${showArchived}`),
        api.get("/api/sponsors")
      ]);
      setIndividuals(indRes.data);
      setSponsors(sponRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل في تحميل البيانات." });
    } finally {
      setLoading(false);
    }
  };

  const filtered = individuals.filter((i) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = i.Full_Name?.toLowerCase().includes(q) || i.Passport_Number?.toLowerCase().includes(q) || i.Family_ID?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "الكل" || i.Current_Status === statusFilter;
    return matchSearch && matchStatus;
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.Full_Name.trim()) e.Full_Name = "الاسم مطلوب";
    if (!form.Passport_Number.trim()) e.Passport_Number = "رقم الوثيقة مطلوب";
    if (!form.Freelance && !form.Sponsor_ID && form.Category !== "dependent") e.Sponsor_ID = "الجهة المستضيفة مطلوبة";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setIsSaving(true);
      const payload = {
        ...form,
        Sponsor_ID: (form.Freelance || form.Category === "dependent" || !form.Sponsor_ID) ? null : parseInt(form.Sponsor_ID),
        Passport_Copy: docs.passportPhoto?.url || null,
        Health_Cert_Copy: docs.healthCert?.url || null,
        Residency_Copy: docs.residencyPhoto?.url || null,
        Personal_Photo_Copy: docs.personalPhoto?.url || null,
      };

      if (editMode && selectedId) {
        await api.put(`/api/workers/${selectedId}`, payload);
        toast({ title: "تم التحديث", description: `تم تحديث بيانات ${payload.Full_Name} بنجاح.` });
      } else {
        await api.post("/api/workers", payload);
        toast({ title: "تمت الإضافة", description: `تم تسجيل ${payload.Full_Name} بنجاح.` });
      }

      handleClose();
      fetchData();
    } catch (error: any) {
      console.error("Error saving individual:", error);
      const msg = error.response?.data?.message || "فشل في حفظ البيانات.";
      toast({ variant: "destructive", title: "خطأ", description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (ind: Individual) => {
    setEditMode(true);
    setSelectedId(ind.id);
    setForm({
      Full_Name: ind.Full_Name,
      Passport_Number: ind.Passport_Number,
      Nationality: ind.Nationality,
      Residence_Address: ind.Residence_Address || "",
      Sponsor_ID: ind.Sponsor_ID?.toString() || "",
      National_ID: ind.National_ID || "",
      Birth_Date: ind.Birth_Date || "",
      Category: ind.Category || "worker",
      Document_Type: ind.Document_Type || "جواز سفر",
      Health_Cert_Expiry: ind.Health_Cert_Expiry || "",
      Freelance: ind.Freelance || false,
      Family_ID: ind.Family_ID || "",
      Relationship: ind.Relationship || "",
      Gender: ind.Gender || "ذكر",
      Current_Status: ind.Current_Status || "نشط",
    });
    setDocs({
      passportPhoto: ind.Passport_Copy ? { name: "مستند مرفق", url: ind.Passport_Copy, type: "application/pdf", label: "صورة الوثيقة" } : null,
      healthCert: ind.Health_Cert_Copy ? { name: "مستند مرفق", url: ind.Health_Cert_Copy, type: "application/pdf", label: "الشهادة الصحية" } : null,
      residencyPhoto: ind.Residency_Copy ? { name: "مستند مرفق", url: ind.Residency_Copy, type: "application/pdf", label: "صورة الإقامة" } : null,
      personalPhoto: ind.Personal_Photo_Copy ? { name: "صورة مرفقة", url: ind.Personal_Photo_Copy, type: "image/jpeg", label: "صورة شخصية" } : null,
    });
    setAddOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من أرشفة هذا الفرد؟ لن يتم حذفه نهائياً من المنظومة.")) return;
    try {
      await api.delete(`/api/workers/${id}`);
      toast({ title: "تمت الأرشفة", description: "تم نقل الفرد إلى الأرشيف بنجاح." });
      fetchData();
    } catch (error) {
      console.error("Error deleting individual:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حذف البيانات." });
    }
  };

  const handleClose = () => {
    setAddOpen(false);
    setEditMode(false);
    setSelectedId(null);
    setForm(emptyForm);
    setDocs(emptyDocs);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الأجانب</h2>
          <p className="text-muted-foreground text-sm">إدارة بيانات العمال، الطلاب، والعائلات</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة فرد
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center gap-2 mr-2">
          <Switch checked={showArchived} onCheckedChange={setShowArchived} id="archived-toggle" />
          <Label htmlFor="archived-toggle" className="text-xs cursor-pointer">عرض الأرشيف</Label>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم، رقم الوثيقة، أو رقم العائلة..."
            className="h-9 bg-muted rounded-lg pr-9 pl-3 text-sm outline-none focus:ring-2 focus:ring-ring w-80 placeholder:text-muted-foreground"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 bg-muted rounded-lg px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="text-xs text-muted-foreground mr-auto">{filtered.length} نتيجة</span>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                <th className="text-right p-3 font-medium">الاسم الكامل</th>
                <th className="text-right p-3 font-medium">الفئة</th>
                <th className="text-right p-3 font-medium">رقم الوثيقة</th>
                <th className="text-right p-3 font-medium">الجنسية</th>
                <th className="text-right p-3 font-medium">جهة الاستضافة / العمل</th>
                <th className="text-right p-3 font-medium">رقم العائلة</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium text-center">المستندات</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="p-3 text-center">جاري التحميل...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="p-3 text-center">لا توجد بيانات</td></tr>
              ) : (
                filtered.map((w) => (
                  <tr key={w.id} className={cn("border-b border-border last:border-0 hover:bg-muted/30 transition-colors", w.is_archived && "opacity-60 grayscale-[0.5] bg-muted/20")}>
                    <td className="p-3 font-medium">{w.Full_Name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                        {categories.find(c => c.id === w.Category)?.label || w.Category}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">{w.Passport_Number}</td>
                    <td className="p-3">{w.Nationality}</td>
                    <td className="p-3 text-xs">
                      {w.Freelance ? "يعمل لحسابه" : (w.Sponsor?.Sponsor_Name || "—")}
                      <br/>
                      <span className="text-[10px] text-muted-foreground">{w.Residence_Address}</span>
                    </td>
                    <td className="p-3 font-mono text-xs text-blue-500 font-bold">{w.Family_ID || "—"}</td>
                    <td className="p-3">
                      <StatusBadge
                        variant={statusOptions.find(o => o.value === w.Current_Status)?.variant as any || "default"}
                        label={w.Current_Status}
                      />
                    </td>
                    <td className="p-3 text-center">
                      {(w.Passport_Copy || w.Health_Cert_Copy || w.Residency_Copy || w.Personal_Photo_Copy) && (
                        <div title="مستندات مرفقة" className="inline-block cursor-help">
                          <FileCheck className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEditClick(w)} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {!w.is_archived && (
                          <button
                            onClick={() => handleDelete(w.id)}
                            title="نقل للأرشيف"
                            className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) handleClose(); else setAddOpen(true); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              {editMode ? "تعديل بيانات الفرد" : "إضافة فرد جديد للمنظومة"}
            </DialogTitle>
            <DialogDescription>أدخل البيانات الشخصية، فئة التواجد، ومعلومات الاستضافة.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-2">
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setForm({ ...form, Category: cat.id })}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1",
                    form.Category === cat.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  )}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs font-bold">{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>الاسم الكامل <span className="text-destructive">*</span></Label>
                  <Input value={form.Full_Name} onChange={(e) => setForm({ ...form, Full_Name: e.target.value })} placeholder="الاسم الرباعي كما في الوثيقة" />
                  {errors.Full_Name && <p className="text-xs text-destructive">{errors.Full_Name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>الجنس</Label>
                  <Select value={form.Gender} onValueChange={(v) => setForm({ ...form, Gender: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر الجنس" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ذكر">ذكر</SelectItem>
                      <SelectItem value="أنثى">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>الجنسية</Label>
                  <Select value={form.Nationality} onValueChange={(v) => setForm({ ...form, Nationality: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر الجنسية" /></SelectTrigger>
                    <SelectContent>
                      {nationalityOptions.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>نوع الوثيقة</Label>
                  <Select value={form.Document_Type} onValueChange={(v) => setForm({ ...form, Document_Type: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                    <SelectContent>
                      {docTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>رقم الوثيقة <span className="text-destructive">*</span></Label>
                  <Input value={form.Passport_Number} onChange={(e) => setForm({ ...form, Passport_Number: e.target.value })} placeholder="رقم الجواز / الوثيقة" className="font-mono" />
                  {errors.Passport_Number && <p className="text-xs text-destructive">{errors.Passport_Number}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>الحالة</Label>
                  <Select value={form.Current_Status} onValueChange={(v) => setForm({ ...form, Current_Status: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر الحالة" /></SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.value}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>عنوان السكن</Label>
                  <Input value={form.Residence_Address} onChange={(e) => setForm({ ...form, Residence_Address: e.target.value })} placeholder="أدخل عنوان السكن الحالي" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>تاريخ انتهاء الشهادة الصحية</Label>
                  <Input type="date" value={form.Health_Cert_Expiry} onChange={(e) => setForm({ ...form, Health_Cert_Expiry: e.target.value })} />
                </div>
              </div>

              {(form.Category === "worker" || form.Category === "student") && (
                <>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                    <div className="space-y-0.5">
                      <Label>يعمل لحسابه (Freelance)</Label>
                      <p className="text-[10px] text-muted-foreground">تفعيل هذا الخيار يجعل الجهة المستضيفة اختيارية</p>
                    </div>
                    <Switch checked={form.Freelance} onCheckedChange={(v) => setForm({ ...form, Freelance: v })} />
                  </div>
                </>
              )}

              {!form.Freelance && (form.Category === "worker" || form.Category === "student") && (
                <div className="space-y-1.5">
                  <Label>الجهة المستضيفة <span className="text-destructive">*</span></Label>
                  <Popover open={sponsorOpen} onOpenChange={setSponsorOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                        {form.Sponsor_ID ? sponsors.find((s) => s.id.toString() === form.Sponsor_ID)?.Sponsor_Name : "اختر الجهة المستضيفة..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="بحث عن جهة..." />
                        <CommandList>
                          <CommandEmpty>لا توجد جهة بهذا الاسم.</CommandEmpty>
                          <CommandGroup>
                            {sponsors.map((s) => (
                              <CommandItem key={s.id} value={s.Sponsor_Name} onSelect={() => { setForm({ ...form, Sponsor_ID: s.id.toString() }); setSponsorOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", form.Sponsor_ID === s.id.toString() ? "opacity-100" : "opacity-0")} />
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
              )}

              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <Users className="w-4 h-4" />
                  الربط العائلي (اختياري)
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>رقم العائلة (Family ID)</Label>
                    <Input value={form.Family_ID} onChange={(e) => setForm({ ...form, Family_ID: e.target.value })} placeholder="لربط أفراد العائلة معاً" className="font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>صلة القرابة</Label>
                    <Select value={form.Relationship} onValueChange={(v) => setForm({ ...form, Relationship: v })}>
                      <SelectTrigger><SelectValue placeholder="اختر الصلة" /></SelectTrigger>
                      <SelectContent>
                        {relationships.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold mb-3">المستندات المطلوبة</p>
              <div className="grid grid-cols-2 gap-3">
                <DocumentUpload label="صورة الوثيقة" value={docs.passportPhoto} onChange={(d) => setDocs({ ...docs, passportPhoto: d })} />
                <DocumentUpload label="الشهادة الصحية" value={docs.healthCert} onChange={(d) => setDocs({ ...docs, healthCert: d })} />
                <DocumentUpload label="صورة الإقامة" value={docs.residencyPhoto} onChange={(d) => setDocs({ ...docs, residencyPhoto: d })} />
                <DocumentUpload label="صورة شخصية" value={docs.personalPhoto} onChange={(d) => setDocs({ ...docs, personalPhoto: d })} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>إلغاء</Button>
            <Button onClick={handleSubmit} className="gap-2" disabled={isSaving}>
              {isSaving ? "جاري الحفظ..." : (
                <>
                  {editMode ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editMode ? "تحديث البيانات" : "تسجيل الفرد"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
