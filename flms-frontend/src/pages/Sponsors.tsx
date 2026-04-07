import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building2, Edit, FileCheck, User, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentUpload, type UploadedDoc } from "@/components/DocumentUpload";
import api from "../api/axiosConfig";
import { useSearch } from "@/context/SearchContext";

interface HostingEntity {
  id: number;
  Sponsor_Name: string; // Used as Entity Name
  Commercial_Reg_No: string;
  workersCount: number;
  status: string;
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
}

interface EntityDocs {
  commercialRegister: UploadedDoc | null;
  taxCert: UploadedDoc | null;
  licenseCopy: UploadedDoc | null;
  authLetter: UploadedDoc | null;
  ownerPhoto: UploadedDoc | null;
  identityCopy: UploadedDoc | null;
}

const emptyDocs: EntityDocs = { commercialRegister: null, taxCert: null, licenseCopy: null, authLetter: null, ownerPhoto: null, identityCopy: null };
const emptyForm = { name: "", license: "", phone: "", email: "", address: "", ownerName: "", ownerNationalID: "", ownerPhone: "", ownerEmail: "" };

export default function Sponsors() {
  const [entities, setEntities] = useState<HostingEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [docs, setDocs] = useState<EntityDocs>(emptyDocs);
  const [entityType, setEntityType] = useState<string>("business");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { searchQuery } = useSearch();

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/sponsors");
      const mapped = response.data.map((s: any) => ({
        ...s,
        status: "نشط",
      }));
      setEntities(mapped);
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
      const payload = {
        Sponsor_Name: form.name.trim(),
        Commercial_Reg_No: form.license.trim(),
        Phone: form.phone.trim(),
        Email: form.email.trim(),
        Address: form.address.trim(),
        Commercial_Reg_Copy: docs.commercialRegister?.url || null,
        Tax_Cert_Copy: docs.taxCert?.url || null,
        License_Copy: docs.licenseCopy?.url || null,
        Auth_Letter_Copy: docs.authLetter?.url || null,
        Owner_Name: form.ownerName.trim(),
        Owner_National_ID: form.ownerNationalID.trim(),
        Owner_Phone: form.ownerPhone.trim(),
        Owner_Email: form.ownerEmail.trim(),
        Owner_Photo: docs.ownerPhoto?.url || null,
        Identity_Copy: docs.identityCopy?.url || null,
      };

      if (editMode && selectedId) {
        await api.put(`/api/sponsors/${selectedId}`, payload);
        toast({ title: "تم التحديث", description: `تم تحديث بيانات الجهة ${payload.Sponsor_Name} بنجاح.` });
      } else {
        await api.post("/api/sponsors", payload);
        toast({ title: "تمت الإضافة", description: `تم تسجيل الجهة ${payload.Sponsor_Name} بنجاح.` });
      }

      handleClose();
      fetchEntities();
    } catch (error) {
      console.error("Error saving entity:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حفظ البيانات." });
    }
  };

  const handleEditClick = (entity: HostingEntity) => {
    setEditMode(true);
    setSelectedId(entity.id);
    setForm({
      name: entity.Sponsor_Name,
      license: entity.Commercial_Reg_No || "",
      phone: entity.Phone,
      email: entity.Email || "",
      address: entity.Address || "",
      ownerName: entity.Owner_Name || "",
      ownerNationalID: entity.Owner_National_ID || "",
      ownerPhone: entity.Owner_Phone || "",
      ownerEmail: entity.Owner_Email || "",
    });
    setDocs({
      commercialRegister: entity.Commercial_Reg_Copy ? { name: "مستند مرفق", url: entity.Commercial_Reg_Copy, type: "application/pdf", label: "صورة القيد/السجل" } : null,
      taxCert: entity.Tax_Cert_Copy ? { name: "مستند مرفق", url: entity.Tax_Cert_Copy, type: "application/pdf", label: "الشهادة الضريبية" } : null,
      licenseCopy: entity.License_Copy ? { name: "مستند مرفق", url: entity.License_Copy, type: "application/pdf", label: "نسخة الترخيص" } : null,
      authLetter: entity.Auth_Letter_Copy ? { name: "مستند مرفق", url: entity.Auth_Letter_Copy, type: "application/pdf", label: "خطاب التفويض" } : null,
      ownerPhoto: entity.Owner_Photo ? { name: "صورة مرفقة", url: entity.Owner_Photo, type: "image/jpeg", label: "صورة المالك" } : null,
      identityCopy: entity.Identity_Copy ? { name: "مستند مرفق", url: entity.Identity_Copy, type: "application/pdf", label: "إثبات الهوية" } : null,
    });
    setEntityType(entity.Owner_Name ? "business" : "university");
    setAddOpen(true);
  };

  const handleClose = () => {
    setAddOpen(false);
    setEditMode(false);
    setSelectedId(null);
    setForm(emptyForm);
    setDocs(emptyDocs);
    setErrors({});
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الجهة؟")) return;
    try {
      await api.delete(`/api/sponsors/${id}`);
      toast({ title: "تم الحذف", description: "تم حذف بيانات الجهة بنجاح." });
      fetchEntities();
    } catch (error) {
      console.error("Error deleting entity:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حذف البيانات." });
    }
  };

  const filtered = entities.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      s.Sponsor_Name?.toLowerCase().includes(query) ||
      s.Commercial_Reg_No?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">الجهات المستضيفة</h2>
          <p className="text-muted-foreground text-sm">إدارة الشركات، الجامعات، وجهات الاستضافة الأخرى</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة جهة
        </Button>
      </div>
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                <th className="text-right p-3 font-medium">اسم الجهة</th>
                <th className="text-right p-3 font-medium">رقم القيد/السجل</th>
                <th className="text-right p-3 font-medium">عدد الأفراد</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">الهاتف</th>
                <th className="text-right p-3 font-medium text-center">المستندات</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-3 text-center">جاري التحميل...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-3 text-center">لا توجد بيانات</td></tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{s.Sponsor_Name}</td>
                    <td className="p-3 font-mono text-xs">{s.Commercial_Reg_No || "—"}</td>
                    <td className="p-3">{s.workersCount || 0}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${s.status === "نشط" ? "bg-success/15 text-success border-success/20" : "bg-warning/15 text-warning border-warning/20"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">{s.Phone}</td>
                    <td className="p-3 text-center">
                      {(s.Commercial_Reg_Copy || s.Tax_Cert_Copy || s.License_Copy || s.Owner_Photo) && (
                        <div title="مستندات مرفقة" className="inline-block cursor-help">
                          <FileCheck className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEditClick(s)} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
                  <Label>رقم القيد / السجل</Label>
                  <Input value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} placeholder="REG-2025-XXX" className="font-mono" />
                </div>
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
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} className="gap-2">
              {editMode ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editMode ? "تحديث البيانات" : "تسجيل الجهة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
