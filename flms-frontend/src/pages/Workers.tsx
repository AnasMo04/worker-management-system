import { formatDate, formatDateTime } from "../utils/formatDate";
import { useState, useEffect, useRef, useMemo } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Filter, Edit, Plus, UserPlus, Check, ChevronsUpDown, FileCheck, Users, Trash2, Wifi, FileDown, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentUpload, type UploadedDoc } from "@/components/DocumentUpload";
import { io } from "socket.io-client";
import Fuse from "fuse.js";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from "../api/axiosConfig";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useSearch } from "../context/SearchContext";
import { useAuth } from "../context/AuthContext";

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
  Gender: "ذكر", Current_Status: "نشط", NFC_UID: ""
};

interface IndividualDocs {
  passportPhoto: UploadedDoc | null;
  healthCert: UploadedDoc | null;
  residencyPhoto: UploadedDoc | null;
  personalPhoto: UploadedDoc | null;
}
const emptyDocs: IndividualDocs = { passportPhoto: null, healthCert: null, residencyPhoto: null, personalPhoto: null };

export default function Workers() {
  const { hasPermission } = useAuth();
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [sponsorFilter, setSponsorFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [nationalityFilter, setNationalityFilter] = useState("all");
  const [expiryMonthFilter, setExpiryMonthFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [freelanceFilter, setFreelanceFilter] = useState("all");
  const [docTypeFilter, setDocTypeFilter] = useState("all");
  const [relationshipFilter, setRelationshipFilter] = useState("all");
  const [expiryFrom, setExpiryFrom] = useState("");
  const [expiryTo, setExpiryTo] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [docs, setDocs] = useState<IndividualDocs>(emptyDocs);
  const [isSaving, setIsSaving] = useState(false);
  const [sponsorOpen, setSponsorOpen] = useState(false);
  const { toast } = useToast();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    fetchData();

    // Initialize Socket.io for NFC hardware support
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    socketRef.current = io(backendUrl);

    socketRef.current.on('nfc:card-tapped', (data: { uid: string }) => {
      console.log('NFC Card tapped (Workers):', data.uid);
      if (addOpen) {
        setForm(prev => ({ ...prev, NFC_UID: data.uid }));
        toast({
          title: "تم اكتشاف بطاقة",
          description: `الرقم التسلسلي: ${data.uid}`,
        });
      }
    });

    // Keyboard Emulator Listener
    let buffer = "";
    let lastTime = Date.now();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!addOpen) return;

      const now = Date.now();
      if (now - lastTime > 50) buffer = "";
      lastTime = now;

      if (e.key === "Enter") {
        if (buffer.length >= 4) { // Typical NFC UIDs are at least 4 bytes
          setForm(prev => ({ ...prev, NFC_UID: buffer }));
          toast({ title: "تمت القراءة (محاكي)", description: `UID: ${buffer}` });
          buffer = "";
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [showArchived, addOpen]);

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

  const filtered = useMemo(() => {
    let result = individuals;

    // 1. Fuzzy Search Logic
    if (searchQuery.trim()) {
      const fuse = new Fuse(result, {
        keys: ["Full_Name", "Passport_Number", "Family_ID"],
        threshold: 0.3,
      });
      result = fuse.search(searchQuery).map(r => r.item);
    }

    return result.filter((i) => {
      // 2. Status Logic
      let matchStatus = true;
      if (statusFilter === "نشط") {
        matchStatus = i.Current_Status === "نشط" && !i.is_archived;
      } else if (statusFilter === "مؤرشف") {
        matchStatus = i.is_archived === true;
      } else if (statusFilter === "منتهي") {
        const today = new Date().toISOString().split('T')[0];
        matchStatus = i.Health_Cert_Expiry ? i.Health_Cert_Expiry < today : false;
      } else if (statusFilter !== "الكل") {
        matchStatus = i.Current_Status === statusFilter;
      }

      // 3. Sponsor Logic
      const matchSponsor = sponsorFilter === "all" || i.Sponsor_ID?.toString() === sponsorFilter;

      // 4. Gender Logic
      const matchGender = genderFilter === "all" || i.Gender === genderFilter;

      // 5. Nationality Logic
      const matchNationality = nationalityFilter === "all" || i.Nationality === nationalityFilter;

      // 6. Expiry Month Logic
      let matchMonth = true;
      if (expiryMonthFilter !== "all" && i.Health_Cert_Expiry) {
        const expiryDate = new Date(i.Health_Cert_Expiry);
        matchMonth = (expiryDate.getMonth() + 1).toString() === expiryMonthFilter;
      } else if (expiryMonthFilter !== "all") {
        matchMonth = false;
      }

    // 7. Category Logic
    const matchCategory = categoryFilter === "all" || i.Category === categoryFilter;

    // 8. Freelance Logic
    const matchFreelance = freelanceFilter === "all" || (freelanceFilter === "yes" ? i.Freelance : !i.Freelance);

    // 9. Document Type Logic
    const matchDocType = docTypeFilter === "all" || i.Document_Type === docTypeFilter;

    // 10. Relationship Logic
    const matchRelationship = relationshipFilter === "all" || i.Relationship === relationshipFilter;

    // 11. Date Range Logic (Health Expiry)
    let matchExpiryRange = true;
    if (i.Health_Cert_Expiry) {
      if (expiryFrom && i.Health_Cert_Expiry < expiryFrom) matchExpiryRange = false;
      if (expiryTo && i.Health_Cert_Expiry > expiryTo) matchExpiryRange = false;
    } else if (expiryFrom || expiryTo) {
      matchExpiryRange = false;
    }

    // 10. Date Range Logic (CreatedAt)
    let matchCreatedRange = true;
    const createdAtDate = i.createdAt ? i.createdAt.split('T')[0] : "";
    if (createdAtDate) {
      if (createdFrom && createdAtDate < createdFrom) matchCreatedRange = false;
      if (createdTo && createdAtDate > createdTo) matchCreatedRange = false;
    } else if (createdFrom || createdTo) {
      matchCreatedRange = false;
    }

    return matchStatus && matchSponsor && matchGender && matchNationality && matchMonth && matchCategory && matchFreelance && matchDocType && matchRelationship && matchExpiryRange && matchCreatedRange;
    });
  }, [individuals, searchQuery, statusFilter, sponsorFilter, genderFilter, nationalityFilter, expiryMonthFilter, categoryFilter, freelanceFilter, docTypeFilter, relationshipFilter, expiryFrom, expiryTo, createdFrom, createdTo]);

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

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Override Sponsor_ID logic
      const sponsorId = (form.Freelance || form.Category === "dependent" || !form.Sponsor_ID) ? null : form.Sponsor_ID;
      if (sponsorId) formData.set("Sponsor_ID", sponsorId);
      else formData.delete("Sponsor_ID");

      // Append files if they are new (blob URLs indicate new selection)
      if (docs.passportPhoto?.file) formData.append("passportPhoto", docs.passportPhoto.file);
      if (docs.healthCert?.file) formData.append("healthCert", docs.healthCert.file);
      if (docs.residencyPhoto?.file) formData.append("residencyPhoto", docs.residencyPhoto.file);
      if (docs.personalPhoto?.file) formData.append("personalPhoto", docs.personalPhoto.file);

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editMode && selectedId) {
        await api.put(`/api/workers/${selectedId}`, formData, config);
        toast({ title: "تم التحديث", description: `تم تحديث بيانات ${form.Full_Name} بنجاح.` });
      } else {
        await api.post("/api/workers", formData, config);
        toast({ title: "تمت الإضافة", description: `تم تسجيل ${form.Full_Name} بنجاح.` });
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
      National_ID: "", // Standardized field mapping
      Birth_Date: "",
      Category: ind.Category || "worker",
      Document_Type: ind.Document_Type || "جواز سفر",
      Health_Cert_Expiry: ind.Health_Cert_Expiry || "",
      Freelance: ind.Freelance || false,
      Family_ID: ind.Family_ID || "",
      Relationship: ind.Relationship || "",
      Gender: ind.Gender || "ذكر",
      Current_Status: ind.Current_Status || "نشط",
      NFC_UID: ind.NFC_UID || "",
    });
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const getFullUrl = (p: string) => p.startsWith('http') ? p : `${backendUrl}/${p}`;

    setDocs({
      passportPhoto: ind.Passport_Copy ? { name: "مستند مرفق", url: getFullUrl(ind.Passport_Copy), type: "application/pdf", label: "صورة الوثيقة" } : null,
      healthCert: ind.Health_Cert_Copy ? { name: "مستند مرفق", url: getFullUrl(ind.Health_Cert_Copy), type: "application/pdf", label: "الشهادة الصحية" } : null,
      residencyPhoto: ind.Residency_Copy ? { name: "مستند مرفق", url: getFullUrl(ind.Residency_Copy), type: "application/pdf", label: "صورة الإقامة" } : null,
      personalPhoto: ind.Personal_Photo_Copy ? { name: "صورة مرفقة", url: getFullUrl(ind.Personal_Photo_Copy), type: "image/jpeg", label: "صورة شخصية" } : null,
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

  const exportToExcel = () => {
    const dataToExport = filtered.map(w => ({
      "الاسم الكامل": w.Full_Name,
      "رقم الوثيقة": w.Passport_Number,
      "الجنسية": w.Nationality,
      "الفئة": categories.find(c => c.id === w.Category)?.label || w.Category,
      "جهة الاستضافة": w.Freelance ? "يعمل لحسابه" : (w.Sponsor?.Sponsor_Name || "—"),
      "الحالة": w.Current_Status,
      "رقم العائلة": w.Family_ID || "—",
      "انتهاء الصحية": formatDate(w.Health_Cert_Expiry),
      "تاريخ التسجيل": formatDate(w.createdAt)
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "العمال");
    XLSX.writeFile(wb, `Workers_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast({ title: "نجاح", description: "تم تصدير ملف Excel بنجاح." });
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');

    // Branding
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text("AfaqAlghad", 148, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text("نظام إدارة العمالة الوافدة", 148, 28, { align: 'center' });
    doc.line(20, 32, 277, 32);

    const tableData = filtered.map(w => [
      w.Full_Name,
      w.Passport_Number,
      w.Nationality,
      w.Current_Status,
      w.Freelance ? "يعمل لحسابه" : (w.Sponsor?.Sponsor_Name || "—"),
      formatDate(w.Health_Cert_Expiry)
    ]);

    (doc as any).autoTable({
      head: [["الاسم الكامل", "رقم الوثيقة", "الجنسية", "الحالة", "جهة الاستضافة", "انتهاء الصحية"]],
      body: tableData,
      startY: 40,
      styles: { halign: 'right' },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      theme: 'grid'
    });

    doc.save(`Workers_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الأجانب</h2>
          <p className="text-muted-foreground text-sm">إدارة بيانات العمال، الطلاب، والعائلات</p>
        </div>
        <div className="flex items-center gap-2">
          {hasPermission('workers', 'view') && (
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
          {hasPermission('workers', 'create') && (
            <Button onClick={() => setAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة فرد
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">تصفية النتائج:</span>
        </div>

        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو رقم الوثيقة..."
            className="w-full h-10 bg-muted/50 border border-border rounded-xl pr-10 pl-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-48">
            <Select value={statusFilter} onValueChange={(v) => {
              setStatusFilter(v);
              if (v === "مؤرشف") setShowArchived(true);
            }}>
              <SelectTrigger className="h-10 rounded-xl bg-muted/50">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="الكل">كل الحالات</SelectItem>
                <SelectItem value="نشط">نشط</SelectItem>
                <SelectItem value="منتهي">منتهي الصلاحية</SelectItem>
                <SelectItem value="مؤرشف">المؤرشفين</SelectItem>
                {statusOptions.filter(o => o.value !== "نشط").map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <Select value={sponsorFilter} onValueChange={setSponsorFilter}>
              <SelectTrigger className="h-10 rounded-xl bg-muted/50">
                <SelectValue placeholder="جهة الاستضافة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الجهات</SelectItem>
                {sponsors.map(s => (
                  <SelectItem key={s.id} value={s.id.toString()}>{s.Sponsor_Name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-32">
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="h-10 rounded-xl bg-muted/50">
                <SelectValue placeholder="الجنس" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل (جنس)</SelectItem>
                <SelectItem value="ذكر">ذكر</SelectItem>
                <SelectItem value="أنثى">أنثى</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Select value={nationalityFilter} onValueChange={setNationalityFilter}>
              <SelectTrigger className="h-10 rounded-xl bg-muted/50">
                <SelectValue placeholder="الجنسية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الجنسيات</SelectItem>
                {nationalityOptions.map(n => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-44">
            <Select value={expiryMonthFilter} onValueChange={setExpiryMonthFilter}>
              <SelectTrigger className="h-10 rounded-xl bg-muted/50">
                <SelectValue placeholder="شهر انتهاء الصحية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الشهور</SelectItem>
                <SelectItem value="1">يناير (1)</SelectItem>
                <SelectItem value="2">فبراير (2)</SelectItem>
                <SelectItem value="3">مارس (3)</SelectItem>
                <SelectItem value="4">أبريل (4)</SelectItem>
                <SelectItem value="5">مايو (5)</SelectItem>
                <SelectItem value="6">يونيو (6)</SelectItem>
                <SelectItem value="7">يوليو (7)</SelectItem>
                <SelectItem value="8">أغسطس (8)</SelectItem>
                <SelectItem value="9">سبتمبر (9)</SelectItem>
                <SelectItem value="10">أكتوبر (10)</SelectItem>
                <SelectItem value="11">نوفمبر (11)</SelectItem>
                <SelectItem value="12">ديسمبر (12)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Second Filter Row */}
        <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-border/50">
          <div className="w-40">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-10 rounded-xl bg-muted/50">
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الفئات</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Select value={freelanceFilter} onValueChange={setFreelanceFilter}>
              <SelectTrigger className="h-10 rounded-xl bg-muted/50">
                <SelectValue placeholder="حالة العمل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل (Freelance)</SelectItem>
                <SelectItem value="yes">يعمل لحسابه</SelectItem>
                <SelectItem value="no">تحت كفالة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Select value={docTypeFilter} onValueChange={setDocTypeFilter}>
              <SelectTrigger className="h-10 rounded-xl bg-muted/50">
                <SelectValue placeholder="نوع الوثيقة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الوثائق</SelectItem>
                {docTypes.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Select value={relationshipFilter} onValueChange={setRelationshipFilter}>
              <SelectTrigger className="h-10 rounded-xl bg-muted/50">
                <SelectValue placeholder="القرابة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل العلاقات</SelectItem>
                {relationships.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl border border-border/50">
            <span className="text-[10px] font-bold text-muted-foreground px-2">انتهاء الصحية:</span>
            <input
              type="date"
              value={expiryFrom}
              onChange={(e) => setExpiryFrom(e.target.value)}
              className="bg-transparent text-xs outline-none"
            />
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <input
              type="date"
              value={expiryTo}
              onChange={(e) => setExpiryTo(e.target.value)}
              className="bg-transparent text-xs outline-none"
            />
          </div>

          <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl border border-border/50">
            <span className="text-[10px] font-bold text-muted-foreground px-2">تاريخ التسجيل:</span>
            <input
              type="date"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.target.value)}
              className="bg-transparent text-xs outline-none"
            />
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <input
              type="date"
              value={createdTo}
              onChange={(e) => setCreatedTo(e.target.value)}
              className="bg-transparent text-xs outline-none"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setExpiryFrom(""); setExpiryTo("");
              setCreatedFrom(""); setCreatedTo("");
              setGenderFilter("all"); setNationalityFilter("all");
              setSponsorFilter("all"); setStatusFilter("الكل");
              setCategoryFilter("all"); setFreelanceFilter("all");
              setExpiryMonthFilter("all"); setDocTypeFilter("all");
              setRelationshipFilter("all");
            }}
            className="text-[10px] h-8 text-muted-foreground hover:text-foreground"
          >
            إعادة تعيين الكل
          </Button>

          <div className="flex items-center gap-2 border-r pr-4 mr-2">
          <Switch
            checked={showArchived}
            onCheckedChange={(v) => {
              setShowArchived(v);
              if (v && statusFilter !== "مؤرشف") setStatusFilter("الكل");
              if (!v && statusFilter === "مؤرشف") setStatusFilter("الكل");
            }}
            id="archived-toggle"
          />
          <Label htmlFor="archived-toggle" className="text-xs cursor-pointer font-medium">إظهار المؤرشفين</Label>
        </div>

        <div className="mr-auto px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10">
          <span className="text-xs font-bold text-primary">{filtered.length} سجل</span>
        </div>
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
                <th className="text-right p-3 font-medium">انتهاء الصحية</th>
                <th className="text-right p-3 font-medium">تاريخ التسجيل</th>
                <th className="text-right p-3 font-medium">NFC UID</th>
                <th className="text-right p-3 font-medium">رقم العائلة</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium text-center">المستندات</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="p-3 text-center">جاري التحميل...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={11} className="p-3 text-center">لا توجد بيانات</td></tr>
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
                    <td className="p-3 font-mono text-[10px] text-muted-foreground">{formatDate(w.Health_Cert_Expiry)}</td>
                    <td className="p-3 text-[10px] font-mono">{formatDateTime((w as any).createdAt)}</td>
                    <td className="p-3 font-mono text-[10px] text-muted-foreground">{w.NFC_UID || "—"}</td>
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
                        {hasPermission('workers', 'edit') && (
                          <button onClick={() => handleEditClick(w)} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {hasPermission('workers', 'delete') && !w.is_archived && (
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
