import { formatDate, formatDateTime, formatNumber } from "../utils/formatDate";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building2, Edit, FileCheck, User, Trash2, FileDown, Download, Filter, Search, RotateCcw } from "lucide-react";
import Fuse from "fuse.js";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AMIRI_REGULAR, AMIRI_BOLD } from "../utils/pdfFonts";
import { useToast } from "@/hooks/use-toast";
import { DocumentUpload, type UploadedDoc } from "@/components/DocumentUpload";
import api from "../api/axiosConfig";
import { useSearch } from "@/context/SearchContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface HostingEntity {
  id: number;
  Sponsor_Name: string; // Used as Entity Name
  Commercial_Reg_No: string;
  workersCount: number;
  Phone: string;
  Email?: string;
  Address?: string;
  Commercial_Reg_Copy?: string;
  Tax_Cert_Copy?: string;
  License_Copy?: string;
  Auth_Letter_Copy?: string;
  Owner_Name?: string;
  Owner_National_ID?: string;
  Owner_Phone?: string;
  Owner_Email?: string;
  Owner_Photo?: string;
  Identity_Copy?: string;
  is_archived?: boolean;
}

interface EntityDocs {
  commercialRegister: UploadedDoc | null;
  taxCert: UploadedDoc | null;
  licenseCopy: UploadedDoc | null;
  authLetter: UploadedDoc | null;
  ownerPhoto: UploadedDoc | null;
  identityCopy: UploadedDoc | null;
}

const regions = ["طرابلس", "بنغازي", "مصراتة", "الزاوية", "سبها", "الخمس", "زليتن", "صبراتة", "غريان", "ترهونة"];

const emptyDocs: EntityDocs = { commercialRegister: null, taxCert: null, licenseCopy: null, authLetter: null, ownerPhoto: null, identityCopy: null };
const emptyForm = { name: "", license: "", phone: "", email: "", address: "", ownerName: "", ownerNationalID: "", ownerPhone: "", ownerEmail: "", region: "" };

export default function Sponsors() {
  const { hasPermission } = useAuth();
  const [entities, setEntities] = useState<HostingEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [regionFilter, setRegionFilter] = useState("all");
  const [workerRangeFilter, setWorkerRangeFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [docs, setDocs] = useState<EntityDocs>(emptyDocs);
  const [entityType, setEntityType] = useState<string>("business");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    fetchEntities();
  }, [showArchived]);

  const fetchEntities = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/sponsors?includeArchived=${showArchived}`);
      setEntities(response.data);
    } catch (error) {
      console.error("Error fetching entities:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل في تحميل بيانات الجهات المستضيفة." });
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "اسم الجهة مطلوب";
    if (!form.phone.trim()) e.phone = "رقم الهاتف مطلوب";
    if (entityType === "business" && !form.ownerName.trim()) e.ownerName = "اسم مالك النشاط مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setIsSaving(true);

      const formData = new FormData();
      formData.append("Sponsor_Name", form.name.trim());
      formData.append("Commercial_Reg_No", form.license.trim());
      formData.append("Phone", form.phone.trim());
      formData.append("Email", form.email.trim());
      formData.append("Address", form.address.trim());
      formData.append("Owner_Name", form.ownerName.trim());
      formData.append("Owner_National_ID", form.ownerNationalID.trim());
      formData.append("Owner_Phone", form.ownerPhone.trim());
      formData.append("Owner_Email", form.ownerEmail.trim());
      formData.append("Region", form.region);

      // Append files if they are new
      if (docs.commercialRegister?.file) formData.append("commercialReg", docs.commercialRegister.file);
      if (docs.taxCert?.file) formData.append("taxCert", docs.taxCert.file);
      if (docs.licenseCopy?.file) formData.append("license", docs.licenseCopy.file);
      if (docs.authLetter?.file) formData.append("authLetter", docs.authLetter.file);
      if (docs.ownerPhoto?.file) formData.append("ownerPhoto", docs.ownerPhoto.file);
      if (docs.identityCopy?.file) formData.append("identityCopy", docs.identityCopy.file);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editMode && selectedId) {
        await api.put(`/api/sponsors/${selectedId}`, formData, config);
        toast({ title: "تم التحديث", description: `تم تحديث بيانات الجهة ${form.name} بنجاح.` });
      } else {
        await api.post("/api/sponsors", formData, config);
        toast({ title: "تمت الإضافة", description: `تم تسجيل الجهة ${form.name} بنجاح.` });
      }

      handleClose();
      fetchEntities();
    } catch (error: any) {
      console.error("Error saving entity:", error);
      const msg = error.response?.data?.message || "فشل في حفظ البيانات.";
      toast({ variant: "destructive", title: "خطأ", description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (entity: HostingEntity) => {
    setEditMode(true);
    setSelectedId(entity?.id);
    setForm({
      name: entity?.Sponsor_Name || "",
      license: entity?.Commercial_Reg_No || "",
      phone: entity?.Phone || "",
      email: entity?.Email || "",
      address: entity?.Address || "",
      ownerName: entity?.Owner_Name || "",
      ownerNationalID: entity?.Owner_National_ID || "",
      ownerPhone: entity?.Owner_Phone || "",
      ownerEmail: entity?.Owner_Email || "",
      region: entity?.Region || "",
    });
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const getFullUrl = (p: string) => p?.startsWith('http') ? p : `${backendUrl}/${p}`;

    setDocs({
      commercialRegister: entity?.Commercial_Reg_Copy ? { name: "مستند مرفق", url: getFullUrl(entity.Commercial_Reg_Copy), type: "application/pdf", label: "صورة القيد/السجل" } : null,
      taxCert: entity?.Tax_Cert_Copy ? { name: "مستند مرفق", url: getFullUrl(entity.Tax_Cert_Copy), type: "application/pdf", label: "الشهادة الضريبية" } : null,
      licenseCopy: entity?.License_Copy ? { name: "مستند مرفق", url: getFullUrl(entity.License_Copy), type: "application/pdf", label: "نسخة الترخيص" } : null,
      authLetter: entity?.Auth_Letter_Copy ? { name: "مستند مرفق", url: getFullUrl(entity.Auth_Letter_Copy), type: "application/pdf", label: "خطاب التفويض" } : null,
      ownerPhoto: entity?.Owner_Photo ? { name: "صورة مرفقة", url: getFullUrl(entity.Owner_Photo), type: "image/jpeg", label: "صورة المالك" } : null,
      identityCopy: entity?.Identity_Copy ? { name: "مستند مرفق", url: getFullUrl(entity.Identity_Copy), type: "application/pdf", label: "إثبات الهوية" } : null,
    });
    setEntityType(entity?.Owner_Name ? "business" : "university");
    setAddOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من أرشفة هذه الجهة؟ لن يتم حذفها نهائياً من المنظومة.")) return;
    try {
      await api.delete(`/api/sponsors/${id}`);
      toast({ title: "تمت الأرشفة", description: "تم نقل الجهة إلى الأرشيف بنجاح." });
      fetchEntities();
    } catch (error: any) {
      console.error("Error archiving entity:", error);
      const msg = error.response?.data?.message || "فشل في أرشفة البيانات.";
      toast({ variant: "destructive", title: "خطأ", description: msg });
    }
  };

  const exportToExcel = () => {
    const dataToExport = filtered?.map(s => ({
      "اسم الجهة": s?.Sponsor_Name || "—",
      "المنطقة": s?.Region || "—",
      "رقم القيد/السجل": s?.Commercial_Reg_No || "—",
      "عدد الأفراد": s?.workersCount || 0,
      "الحالة": s?.is_archived ? "مؤرشف" : "نشط",
      "الهاتف": s?.Phone || "—",
      "تاريخ التسجيل": formatDate(s?.createdAt)
    })) || [];

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الجهات");
    XLSX.writeFile(wb, `Sponsors_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({ title: "نجاح", description: "تم تصدير ملف Excel بنجاح." });
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');

    // Add Amiri font for Arabic support
    doc.addFileToVFS("Amiri-Regular.ttf", AMIRI_REGULAR);
    doc.addFileToVFS("Amiri-Bold.ttf", AMIRI_BOLD);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    doc.addFont("Amiri-Bold.ttf", "Amiri", "bold");
    doc.setFont("Amiri");

    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text("نظام إدارة العمالة الأجانب", 277, 20, { align: 'right' });
    doc.setFontSize(12);
    doc.text("سجل الجهات المستضيفة (Sponsors Report)", 277, 28, { align: 'right' });
    doc.line(20, 32, 277, 32);

    const tableData = filtered?.map(s => [
      s?.Phone || "—",
      s?.is_archived ? "مؤرشف" : "نشط",
      s?.workersCount || 0,
      s?.Commercial_Reg_No || "—",
      s?.Region || "—",
      s?.Sponsor_Name || "—"
    ]) || [];

    (doc as any).autoTable({
      head: [["الهاتف", "الحالة", "العمال", "رقم القيد", "المنطقة", "اسم الجهة"]],
      body: tableData,
      startY: 40,
      styles: { font: "Amiri", halign: 'right' },
      headStyles: { font: "Amiri", fillColor: [41, 128, 185], textColor: 255 },
      theme: 'grid'
    });

    doc.save(`Sponsors_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: "نجاح", description: "تم إنشاء تقرير PDF بنجاح." });
  };

  const handleClose = () => {
    setAddOpen(false);
    setEditMode(false);
    setSelectedId(null);
    setForm(emptyForm);
    setDocs(emptyDocs);
    setErrors({});
  };

  const filtered = useMemo(() => {
    let result = entities;

    if (searchQuery.trim()) {
      const fuse = new Fuse(result, {
        keys: ["Sponsor_Name", "Commercial_Reg_No"],
        threshold: 0.3,
      });
      result = fuse.search(searchQuery).map(r => r.item);
    }

    return result.filter((s) => {
      const matchRegion = regionFilter === "all" || s?.Region === regionFilter;

      let matchRange = true;
      const count = s?.workersCount || 0;
      if (workerRangeFilter === "0-10") matchRange = count <= 10;
      else if (workerRangeFilter === "11-50") matchRange = count > 10 && count <= 50;
      else if (workerRangeFilter === "51-100") matchRange = count > 50 && count <= 100;
      else if (workerRangeFilter === "100+") matchRange = count > 100;

      return matchRegion && matchRange;
    });
  }, [entities, searchQuery, regionFilter, workerRangeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">الجهات المستضيفة</h2>
          <p className="text-muted-foreground text-sm">إدارة الشركات، الجامعات، وجهات الاستضافة الأخرى</p>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission?.('sponsors', 'view') && (
            <>
              <Button onClick={exportToExcel} variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                <FileDown className="h-4 w-4" />
                تصدير Excel
              </Button>
              <Button onClick={exportToPDF} variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                <Download className="h-4 w-4" />
                تقرير PDF
              </Button>
            </>
          )}
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
            <Switch checked={showArchived} onCheckedChange={setShowArchived} id="archived-toggle-spon" />
            <Label htmlFor="archived-toggle-spon" className="text-xs cursor-pointer font-medium">عرض الأرشيف</Label>
          </div>
          {hasPermission?.('sponsors', 'create') && (
            <Button onClick={() => setAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة جهة
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-5 space-y-5 shadow-sm">
        {/* Row 1: Search and Region */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-muted-foreground min-w-[120px]">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-bold">تصفية ذكية:</span>
          </div>
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="البحث عن اسم الشركة أو رقم السجل..." className="w-full h-11 bg-muted/40 border border-border rounded-xl pr-10 pl-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
          </div>
          <div className="flex items-center gap-3">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="h-11 w-44 rounded-xl bg-muted/40 border-border"><SelectValue placeholder="المنطقة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المناطق</SelectItem>
                {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={workerRangeFilter} onValueChange={setWorkerRangeFilter}>
              <SelectTrigger className="h-11 w-56 rounded-xl bg-muted/40 border-border"><SelectValue placeholder="عدد العمال" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">أي عدد من العمال</SelectItem>
                <SelectItem value="0-10">10 عمال أو أقل</SelectItem>
                <SelectItem value="11-50">من 11 إلى 50 عامل</SelectItem>
                <SelectItem value="51-100">من 51 إلى 100 عامل</SelectItem>
                <SelectItem value="100+">أكثر من 100 عامل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Status & Stats */}
        <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-border/30">
          <div className="flex items-center gap-3 mr-auto">
            <Button variant="ghost" size="sm" onClick={() => { setRegionFilter("all"); setWorkerRangeFilter("all"); setSearchQuery(""); }} className="text-xs h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5"><RotateCcw className="w-3 h-3 ml-2"/> مسح التصفية</Button>
            <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
              <span className="text-xs font-black text-primary">{filtered.length} جهة مطابقة</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                <th className="text-right p-3 font-medium">اسم الجهة</th>
                <th className="text-right p-3 font-medium">المنطقة</th>
                <th className="text-right p-3 font-medium">رقم القيد/السجل</th>
                <th className="text-right p-3 font-medium">تاريخ التسجيل</th>
                <th className="text-right p-3 font-medium">عدد الأفراد</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">الهاتف</th>
                <th className="text-right p-3 font-medium text-center">المستندات</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="p-3 text-center">
                  <div className="flex flex-col items-center justify-center py-10 animate-pulse">
                    <Building2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">جاري التحميل...</p>
                  </div>
                </td></tr>
              ) : !filtered || filtered?.length === 0 ? (
                <tr><td colSpan={9} className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="bg-muted rounded-full p-6 mb-4">
                      <Building2 className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold">لا توجد بيانات متاحة</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">
                      لم يتم العثور على أي جهات مستضيفة تطابق معايير البحث الحالية. جرب تغيير الفلاتر أو إضافة جهة جديدة.
                    </p>
                  </div>
                </td></tr>
              ) : (
                filtered?.map((s) => (
                  <tr key={s?.id} className={cn("border-b border-border last:border-0 hover:bg-muted/30 transition-colors", s?.is_archived && "opacity-60 grayscale-[0.5] bg-muted/20")}>
                    <td className="p-3 font-medium">{s?.Sponsor_Name || "—"}</td>
                    <td className="p-3 text-xs">{s?.Region || "—"}</td>
                    <td className="p-3 font-mono text-xs">{s?.Commercial_Reg_No || "—"}</td>
                    <td className="p-3 text-[10px] font-mono">{formatDateTime(s?.createdAt)}</td>
                    <td className="p-3">{formatNumber(s?.workersCount)}</td>
                    <td className="p-3">
                      <span className={cn(
                        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
                        s?.is_archived ? "bg-slate-500/10 text-slate-600 border-slate-200" : "bg-success/15 text-success border-success/20"
                      )}>
                        {s?.is_archived ? "مؤرشف" : "نشط"}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">{s?.Phone || "—"}</td>
                    <td className="p-3 text-center">
                      {(s?.Commercial_Reg_Copy || s?.Tax_Cert_Copy || s?.License_Copy || s?.Owner_Photo) && (
                        <div title="مستندات مرفقة" className="inline-block cursor-help">
                          <FileCheck className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        {hasPermission?.('sponsors', 'edit') && (
                          <button onClick={() => handleEditClick(s)} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {hasPermission?.('sponsors', 'delete') && !s?.is_archived && s?.id && (
                          <button onClick={() => handleDelete(s.id)} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors">
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
              <Building2 className="h-5 w-5 text-primary" />
              {editMode ? "تعديل بيانات الجهة" : "إضافة جهة مستضيفة جديدة"}
            </DialogTitle>
            <DialogDescription>أدخل بيانات الجهة المستضيفة والمستندات المطلوبة للنظام.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-2">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>نوع الجهة</Label>
                  <Select value={entityType} onValueChange={setEntityType}>
                    <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">نشاط تجاري / شركة</SelectItem>
                      <SelectItem value="university">جامعة / معهد</SelectItem>
                      <SelectItem value="other">جهة أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>اسم الجهة <span className="text-destructive">*</span></Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: شركة البناء / جامعة طرابلس" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>المنطقة</Label>
                  <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                    <SelectTrigger><SelectValue placeholder="اختر المنطقة" /></SelectTrigger>
                    <SelectContent>
                      {regions.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>رقم القيد / السجل</Label>
                  <Input value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} placeholder="REG-2025-XXX" className="font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>رقم الهاتف <span className="text-destructive">*</span></Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="091-XXXXXXX" />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>البريد الإلكتروني</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@entity.com" />
              </div>
            </div>

            {entityType === "business" && (
              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <User className="w-4 h-4" />
                  بيانات المالك / المفوض
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>اسم المالك <span className="text-destructive">*</span></Label>
                    <Input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="الاسم الرباعي للمالك" />
                    {errors.ownerName && <p className="text-xs text-destructive">{errors.ownerName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>الرقم الوطني للمالك</Label>
                    <Input value={form.ownerNationalID} onChange={(e) => setForm({ ...form, ownerNationalID: e.target.value })} placeholder="1199XXXXXXXX" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>هاتف المالك</Label>
                    <Input value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} placeholder="092-XXXXXXX" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>ايميل المالك</Label>
                    <Input type="email" value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} placeholder="owner@domain.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <DocumentUpload label="صورة المالك" value={docs.ownerPhoto} onChange={(d) => setDocs({ ...docs, ownerPhoto: d })} />
                  <DocumentUpload label="إثبات الهوية" value={docs.identityCopy} onChange={(d) => setDocs({ ...docs, identityCopy: d })} />
                </div>
              </div>
            )}

            <div className="border-t border-border pt-4">
              <p className="text-sm font-semibold mb-3">مستندات الجهة</p>
              <div className="grid grid-cols-2 gap-3">
                <DocumentUpload label="صورة القيد/السجل" value={docs.commercialRegister} onChange={(d) => setDocs({ ...docs, commercialRegister: d })} />
                <DocumentUpload label="الشهادة الضريبية" value={docs.taxCert} onChange={(d) => setDocs({ ...docs, taxCert: d })} />
                <DocumentUpload label="نسخة الترخيص" value={docs.licenseCopy} onChange={(d) => setDocs({ ...docs, licenseCopy: d })} />
                <DocumentUpload label="خطاب التفويض" value={docs.authLetter} onChange={(d) => setDocs({ ...docs, authLetter: d })} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>إلغاء</Button>
            <Button onClick={handleSubmit} className="gap-2" disabled={isSaving}>
              {isSaving ? "جاري الحفظ..." : (
                <>
                  {editMode ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editMode ? "تحديث البيانات" : "تسجيل الجهة"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
