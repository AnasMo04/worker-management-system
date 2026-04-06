import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Plus, Building2, Edit, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentUpload, type UploadedDoc } from "@/components/DocumentUpload";
import api from "../api/axiosConfig";
import { useSearch } from "@/context/SearchContext";

interface Sponsor {
  id: number;
  Sponsor_Name: string;
  Commercial_Reg_No: string;
  workersCount: number;
  status: string; // Map status as 'نشط' since it's not in the model
  Phone: string;
  Email?: string;
  Commercial_Reg_Copy?: string;
  Tax_Cert_Copy?: string;
  License_Copy?: string;
  Auth_Letter_Copy?: string;
}

interface SponsorDocs {
  commercialRegister: UploadedDoc | null;
  taxCert: UploadedDoc | null;
  licenseCopy: UploadedDoc | null;
  authLetter: UploadedDoc | null;
}

const emptyDocs: SponsorDocs = { commercialRegister: null, taxCert: null, licenseCopy: null, authLetter: null };
const emptyForm = { name: "", license: "", phone: "", email: "" };

export default function Sponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSponsorId, setSelectedSponsorId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [docs, setDocs] = useState<SponsorDocs>(emptyDocs);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { searchQuery } = useSearch();

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/sponsors");
      // Map API fields to match original UI expectations
      const mappedSponsors = response.data.map((s: any) => ({
        ...s,
        status: "نشط", // Placeholder as it's not in the schema but in UI
      }));
      setSponsors(mappedSponsors);
    } catch (error) {
      console.error("Error fetching sponsors:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحميل بيانات الكفلاء.",
      });
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 3) e.name = "اسم الكفيل مطلوب";
    if (!form.license.trim()) e.license = "رقم الترخيص مطلوب";
    if (!form.phone.trim()) e.phone = "رقم الهاتف مطلوب";
    // Document validation only for new sponsors or if you want to enforce it always
    if (!editMode && !docs.commercialRegister) e.commercialRegister = "صورة السجل التجاري مطلوبة";
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
        Commercial_Reg_Copy: docs.commercialRegister?.url || null,
        Tax_Cert_Copy: docs.taxCert?.url || null,
        License_Copy: docs.licenseCopy?.url || null,
        Auth_Letter_Copy: docs.authLetter?.url || null,
      };

      if (editMode && selectedSponsorId) {
        await api.put(`/api/sponsors/${selectedSponsorId}`, payload);
        toast({ title: "تم التحديث", description: `تم تحديث بيانات الكفيل ${payload.Sponsor_Name} بنجاح.` });
      } else {
        await api.post("/api/sponsors", payload);
        toast({ title: "تمت الإضافة", description: `تم تسجيل الكفيل ${payload.Sponsor_Name} بنجاح.` });
      }

      handleClose();
      fetchSponsors();
    } catch (error) {
      console.error("Error saving sponsor:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في حفظ بيانات الكفيل.",
      });
    }
  };

  const handleEditClick = (sponsor: Sponsor) => {
    setEditMode(true);
    setSelectedSponsorId(sponsor.id);
    setForm({
      name: sponsor.Sponsor_Name,
      license: sponsor.Commercial_Reg_No,
      phone: sponsor.Phone,
      email: sponsor.Email || "",
    });
    setDocs({
      commercialRegister: sponsor.Commercial_Reg_Copy ? { name: "مستند مرفق", url: sponsor.Commercial_Reg_Copy, type: "application/pdf", label: "صورة السجل التجاري" } : null,
      taxCert: sponsor.Tax_Cert_Copy ? { name: "مستند مرفق", url: sponsor.Tax_Cert_Copy, type: "application/pdf", label: "الشهادة الضريبية" } : null,
      licenseCopy: sponsor.License_Copy ? { name: "مستند مرفق", url: sponsor.License_Copy, type: "application/pdf", label: "نسخة الترخيص" } : null,
      authLetter: sponsor.Auth_Letter_Copy ? { name: "مستند مرفق", url: sponsor.Auth_Letter_Copy, type: "application/pdf", label: "خطاب التفويض" } : null,
    });
    setAddOpen(true);
  };

  const handleClose = () => {
    setAddOpen(false);
    setEditMode(false);
    setSelectedSponsorId(null);
    setForm(emptyForm);
    setDocs(emptyDocs);
    setErrors({});
  };

  const filtered = sponsors.filter((s) => {
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
          <h2 className="text-2xl font-bold">الكفلاء</h2>
          <p className="text-muted-foreground text-sm">إدارة بيانات الكفلاء وأصحاب العمل</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة كفيل
        </Button>
      </div>
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                <th className="text-right p-3 font-medium">اسم الكفيل</th>
                <th className="text-right p-3 font-medium">رقم الترخيص</th>
                <th className="text-right p-3 font-medium">عدد العمال</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">الهاتف</th>
                <th className="text-right p-3 font-medium">المستندات</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-3 text-center">جاري التحميل...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-3 text-center">لا توجد بيانات</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{s.Sponsor_Name}</td>
                    <td className="p-3 font-mono text-xs">{s.Commercial_Reg_No}</td>
                    <td className="p-3">{s.workersCount || 0}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${s.status === "نشط" ? "bg-success/15 text-success border-success/20" : "bg-warning/15 text-warning border-warning/20"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">{s.Phone}</td>
                    <td className="p-3">
                      {(s.Commercial_Reg_Copy || s.Tax_Cert_Copy || s.License_Copy || s.Auth_Letter_Copy) && (
                        <div title="مستندات مرفقة" className="inline-block">
                          <FileCheck className="w-4 h-4 text-success" />
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <button onClick={() => handleEditClick(s)} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sponsor Dialog */}
      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) handleClose(); else setAddOpen(true); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {editMode ? "تعديل بيانات الكفيل" : "إضافة كفيل جديد"}
            </DialogTitle>
            <DialogDescription>
              {editMode ? "قم بتعديل بيانات الكفيل في النظام." : "أدخل بيانات الكفيل والمستندات المطلوبة."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>اسم الكفيل / الشركة <span className="text-destructive">*</span></Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: شركة البناء الحديث" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>رقم الترخيص <span className="text-destructive">*</span></Label>
                <Input value={form.license} onChange={(e) => setForm({ ...form, license: e.target.value })} placeholder="BL-2025-XXX" className="font-mono" />
                {errors.license && <p className="text-xs text-destructive">{errors.license}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>رقم الهاتف <span className="text-destructive">*</span></Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="091-XXXXXXX" />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>البريد الإلكتروني</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@domain.com" />
            </div>

            {/* Document Uploads */}
            <div className="border-t border-border pt-4 mt-2">
              <p className="text-sm font-semibold mb-3">مستندات الشركة</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <DocumentUpload
                    label="صورة السجل التجاري"
                    required
                    value={docs.commercialRegister}
                    onChange={(d) => setDocs({ ...docs, commercialRegister: d })}
                  />
                  {errors.commercialRegister && <p className="text-xs text-destructive mt-1">{errors.commercialRegister}</p>}
                </div>
                <DocumentUpload
                  label="الشهادة الضريبية"
                  value={docs.taxCert}
                  onChange={(d) => setDocs({ ...docs, taxCert: d })}
                />
                <DocumentUpload
                  label="نسخة الترخيص"
                  value={docs.licenseCopy}
                  onChange={(d) => setDocs({ ...docs, licenseCopy: d })}
                />
                <DocumentUpload
                  label="خطاب التفويض"
                  value={docs.authLetter}
                  onChange={(d) => setDocs({ ...docs, authLetter: d })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>إلغاء</Button>
            <Button onClick={handleSubmit} className="gap-2">
              {editMode ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editMode ? "تحديث البيانات" : "تسجيل الكفيل"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
