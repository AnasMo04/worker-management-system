import { formatDate, formatDateTime } from "../utils/formatDate";
import { useState, useEffect, useRef, useMemo } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Filter, Edit, Plus, UserPlus, Check, ChevronsUpDown, FileCheck, Users, Trash2, Wifi, FileDown, Download, ArrowRight, RotateCcw, Fingerprint } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DocumentUpload, type UploadedDoc } from "@/components/DocumentUpload";
import { io } from "socket.io-client";
import Fuse from "fuse.js";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AMIRI_REGULAR, AMIRI_BOLD } from "../utils/pdfFonts";
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
  createdAt: string;
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

const emptyForm = {
  Full_Name: "", Passport_Number: "", Nationality: "", Residence_Address: "", Sponsor_ID: "",
  National_ID: "", Birth_Date: "", Category: "worker", Document_Type: "جواز سفر",
  Health_Cert_Expiry: "", Freelance: false, Family_ID: "", Relationship: "",
  Gender: "ذكر", Current_Status: "نشط", NFC_UID: "", fingerprint_template: "", Finger_Index: "0"
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

  // Advanced Filters State
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [sponsorFilter, setSponsorFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [nationalityFilter, setNationalityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [freelanceFilter, setFreelanceFilter] = useState("all");
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
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState("جاري الاتصال...");
  const [biometricImage, setBiometricImage] = useState<string | null>(null);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [sponsorOpen, setSponsorOpen] = useState(false);
  const [filterSponsorOpen, setFilterSponsorOpen] = useState(false);
  const [filterNationalityOpen, setFilterNationalityOpen] = useState(false);
  const { toast } = useToast();
  const socketRef = useRef<any>(null);

  useEffect(() => {
    fetchData();

    // Initialize Socket.io for NFC hardware support
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    socketRef.current = io(backendUrl);

    socketRef.current.on('nfc:card-tapped', (data: { uid: string }) => {
      if (addOpen) {
        setForm(prev => ({ ...prev, NFC_UID: data.uid }));
        toast({
          title: "تم اكتشاف بطاقة",
          description: `الرقم التسلسلي: ${data.uid}`,
        });
      }
    });

    socketRef.current.on('zk:status', (data: { message: string }) => {
      setBiometricStatus(data.message);
    });

    socketRef.current.on('zk:feedback', (data: { message: string }) => {
      toast({ title: "تنبيه البصمة", description: data.message });
    });

    socketRef.current.on('zk:error', (data: { message: string }) => {
      toast({ variant: "destructive", title: "خطأ في البصمة", description: data.message });
    });

    socketRef.current.on('zk:image-preview', (data: { image: string }) => {
      setBiometricImage(`data:image/bmp;base64,${data.image}`);
    });

    socketRef.current.on('zk:quality-score', (data: { score: number }) => {
      setQualityScore(data.score);
    });

    socketRef.current.on('zk:enrollment-data', (data: { index: number, template: string }) => {
      setForm(prev => ({ ...prev, fingerprint_template: data.template, Finger_Index: data.index.toString() }));
      setIsEnrolling(false);
      toast({ title: "تم التقاط البصمة", description: `تم تسجيل بصمة الإصبع (الفهرس: ${data.index}) بنجاح.` });
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
        if (buffer.length >= 4) {
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
      if (socketRef.current) socketRef.current.disconnect();
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
      if (statusFilter === "نشط") matchStatus = i?.Current_Status === "نشط" && !i?.is_archived;
      else if (statusFilter === "مؤرشف") matchStatus = i?.is_archived === true;
      else if (statusFilter === "منتهي") {
        const today = new Date().toISOString().split('T')[0];
        matchStatus = i?.Health_Cert_Expiry ? i?.Health_Cert_Expiry < today : false;
      } else if (statusFilter !== "الكل") matchStatus = i?.Current_Status === statusFilter;

      // 3. Sponsor Logic
      const matchSponsor = sponsorFilter === "all" || i?.Sponsor_ID?.toString() === sponsorFilter;

      // 4. Gender Logic
      const matchGender = genderFilter === "all" || i?.Gender === genderFilter;

      // 5. Nationality Logic
      const matchNationality = nationalityFilter === "all" || i?.Nationality === nationalityFilter;

      // 6. Category Logic
      const matchCategory = categoryFilter === "all" || i?.Category === categoryFilter;

      // 7. Freelance Logic
      const matchFreelance = freelanceFilter === "all" || (freelanceFilter === "yes" ? i?.Freelance : !i?.Freelance);

      // 8. Health Expiry Range
      let matchExpiry = true;
      if (expiryFrom && (!i?.Health_Cert_Expiry || i?.Health_Cert_Expiry < expiryFrom)) matchExpiry = false;
      if (expiryTo && (!i?.Health_Cert_Expiry || i?.Health_Cert_Expiry > expiryTo)) matchExpiry = false;

      // 9. CreatedAt Range
      let matchCreated = true;
      const createdDate = i?.createdAt ? i.createdAt.split('T')[0] : "";
      if (createdFrom && (!createdDate || createdDate < createdFrom)) matchCreated = false;
      if (createdTo && (!createdDate || createdDate > createdTo)) matchCreated = false;

      return matchStatus && matchSponsor && matchGender && matchNationality && matchCategory && matchFreelance && matchExpiry && matchCreated;
    });
  }, [individuals, searchQuery, statusFilter, sponsorFilter, genderFilter, nationalityFilter, categoryFilter, freelanceFilter, expiryFrom, expiryTo, createdFrom, createdTo]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.Full_Name.trim()) e.Full_Name = "الاسم مطلوب";
    if (!form.Passport_Number.trim()) e.Passport_Number = "رقم الوثيقة مطلوب";
    if (!form.Freelance && !form.Sponsor_ID && form.Category !== "dependent") e.Sponsor_ID = "الجهة المستضيفة مطلوبة";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const exportToExcel = () => {
    const dataToExport = filtered?.map(w => ({
      "الاسم الكامل": w?.Full_Name || "—",
      "رقم الوثيقة": w?.Passport_Number || "—",
      "الجنسية": w?.Nationality || "—",
      "الفئة": categories.find(c => c.id === w?.Category)?.label || w?.Category || "—",
      "جهة الاستضافة": w?.Freelance ? "يعمل لحسابه" : (w?.Sponsor?.Sponsor_Name || "—"),
      "الحالة": w?.Current_Status || "—",
      "رقم العائلة": w?.Family_ID || "—",
      "انتهاء الصحية": formatDate(w?.Health_Cert_Expiry),
      "تاريخ التسجيل": formatDate(w?.createdAt)
    })) || [];
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "العمال");
    XLSX.writeFile(wb, `Workers_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
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
    doc.text("سجل بيانات العمالة الأجانب (Workers Report)", 277, 28, { align: 'right' });
    doc.line(20, 32, 277, 32);

    const tableData = filtered?.map(w => [
      formatDate(w?.Health_Cert_Expiry),
      w?.Freelance ? "يعمل لحسابه" : (w?.Sponsor?.Sponsor_Name || "—"),
      w?.Current_Status || "—",
      w?.Nationality || "—",
      w?.Passport_Number || "—",
      w?.Full_Name || "—"
    ]) || [];

    (doc as any).autoTable({
      head: [["انتهاء الصحية", "جهة الاستضافة", "الحالة", "الجنسية", "رقم الوثيقة", "الاسم الكامل"]],
      body: tableData,
      startY: 40,
      styles: { font: "Amiri", halign: 'right' },
      headStyles: { font: "Amiri", fillColor: [41, 128, 185], textColor: 255 },
      theme: 'grid'
    });
    doc.save(`Workers_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: "نجاح", description: "تم إنشاء تقرير PDF بنجاح." });
  };

  const resetFilters = () => {
    setStatusFilter("الكل"); setSponsorFilter("all"); setGenderFilter("all");
    setNationalityFilter("all"); setCategoryFilter("all"); setFreelanceFilter("all");
    setExpiryFrom(""); setExpiryTo(""); setCreatedFrom(""); setCreatedTo("");
    setSearchQuery("");
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Biometric Quality Validation
    if (form.fingerprint_template && qualityScore !== null && qualityScore < 50) {
      toast({ variant: "destructive", title: "جودة بصمة ضعيفة", description: `جودة البصمة (${qualityScore}%) غير كافية. يرجى إعادة المحاولة (يجب أن تكون > 50%).` });
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      const sponsorId = (form.Freelance || form.Category === "dependent" || !form.Sponsor_ID) ? null : form.Sponsor_ID;
      if (sponsorId) formData.set("Sponsor_ID", sponsorId);
      else formData.delete("Sponsor_ID");

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
      const msg = error.response?.data?.message || "فشل في حفظ البيانات.";
      toast({ variant: "destructive", title: "خطأ", description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (ind: Individual) => {
    setEditMode(true);
    setSelectedId(ind?.id);
    setForm({
      Full_Name: ind?.Full_Name || "",
      Passport_Number: ind?.Passport_Number || "",
      Nationality: ind?.Nationality || "",
      Residence_Address: ind?.Residence_Address || "",
      Sponsor_ID: ind?.Sponsor_ID?.toString() || "",
      National_ID: "",
      Birth_Date: "",
      Category: ind?.Category || "worker",
      Document_Type: ind?.Document_Type || "جواز سفر",
      Health_Cert_Expiry: ind?.Health_Cert_Expiry || "",
      Freelance: ind?.Freelance || false,
      Family_ID: ind?.Family_ID || "",
      Relationship: ind?.Relationship || "",
      Gender: ind?.Gender || "ذكر",
      Current_Status: ind?.Current_Status || "نشط",
      NFC_UID: ind?.NFC_UID || "",
      fingerprint_template: ind?.fingerprint_template || "",
    });
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const getFullUrl = (p: string) => p?.startsWith('http') ? p : `${backendUrl}/${p}`;
    setDocs({
      passportPhoto: ind?.Passport_Copy ? { name: "مستند مرفق", url: getFullUrl(ind.Passport_Copy), type: "application/pdf", label: "صورة الوثيقة" } : null,
      healthCert: ind?.Health_Cert_Copy ? { name: "مستند مرفق", url: getFullUrl(ind.Health_Cert_Copy), type: "application/pdf", label: "الشهادة الصحية" } : null,
      residencyPhoto: ind?.Residency_Copy ? { name: "مستند مرفق", url: getFullUrl(ind.Residency_Copy), type: "application/pdf", label: "صورة الإقامة" } : null,
      personalPhoto: ind?.Personal_Photo_Copy ? { name: "صورة مرفقة", url: getFullUrl(ind.Personal_Photo_Copy), type: "image/jpeg", label: "صورة شخصية" } : null,
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
      toast({ variant: "destructive", title: "خطأ", description: "فشل في حذف البيانات." });
    }
  };

  const handleEnrollFingerprint = async () => {
    try {
      setIsEnrolling(true);
      const res = await api.post("/api/biometric/enroll", { fingerIndex: parseInt(form.Finger_Index) });
      if (res.data.success) {
        toast({ title: "جهاز البصمة جاهز", description: res.data.message });
      }
    } catch (error: any) {
      setIsEnrolling(false);
      toast({ variant: "destructive", title: "خطأ", description: error.response?.data?.message || "فشل في تشغيل نظام البصمة." });
    }
  };

  const handleClose = () => {
    setAddOpen(false); setEditMode(false); setSelectedId(null);
    setForm(emptyForm); setDocs(emptyDocs); setErrors({});
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
                <FileDown className="h-4 w-4" /> Excel
              </Button>
              <Button onClick={exportToPDF} variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                <Download className="h-4 w-4" /> PDF
              </Button>
            </>
          )}
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
            <Switch checked={showArchived} onCheckedChange={setShowArchived} id="archived-toggle" />
            <Label htmlFor="archived-toggle" className="text-xs cursor-pointer font-medium">عرض الأرشيف</Label>
          </div>
          {hasPermission('workers', 'create') && (
            <Button onClick={() => setAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> إضافة فرد
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-5 space-y-5 shadow-sm">
        {/* Row 1: Search and Primary Status */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-muted-foreground min-w-[120px]">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-bold">تصفية ذكية:</span>
          </div>
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="البحث الذكي (Musa)..." className="w-full h-11 bg-muted/40 border border-border rounded-xl pr-10 pl-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
          </div>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 w-40 rounded-xl bg-muted/40 border-border"><SelectValue placeholder="الحالة" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="الكل">كل الحالات</SelectItem>
                <SelectItem value="نشط">نشط</SelectItem>
                <SelectItem value="منتهي">منتهي</SelectItem>
                <SelectItem value="مؤرشف">المؤرشفين</SelectItem>
                {statusOptions.filter(o => o.value !== "نشط").map(o => <SelectItem key={o.value} value={o.value}>{o.value}</SelectItem>)}
              </SelectContent>
            </Select>

            <Popover open={filterSponsorOpen} onOpenChange={setFilterSponsorOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-11 w-56 rounded-xl bg-muted/40 border-border justify-between font-normal">
                  {sponsorFilter === "all" ? "كل الجهات" : sponsors.find((s) => s.id.toString() === sponsorFilter)?.Sponsor_Name}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="start">
                <Command>
                  <CommandInput placeholder="بحث عن جهة..." />
                  <CommandList>
                    <CommandEmpty>لا توجد نتائج</CommandEmpty>
                    <CommandGroup>
                      <CommandItem value="all" onSelect={() => { setSponsorFilter("all"); setFilterSponsorOpen(false); }}>
                        <Check className={cn("mr-2 h-4 w-4", sponsorFilter === "all" ? "opacity-100" : "opacity-0")} />
                        كل الجهات
                      </CommandItem>
                      {sponsors.map((s) => (
                        <CommandItem key={s.id} value={s.Sponsor_Name} onSelect={() => { setSponsorFilter(s.id.toString()); setFilterSponsorOpen(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", sponsorFilter === s.id.toString() ? "opacity-100" : "opacity-0")} />
                          {s.Sponsor_Name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Row 2: Detailed Demographics and Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="h-10 rounded-xl bg-muted/20 border-border/50"><SelectValue placeholder="الجنس" /></SelectTrigger>
            <SelectContent><SelectItem value="all">كل الأجناس</SelectItem><SelectItem value="ذكر">ذكر</SelectItem><SelectItem value="أنثى">أنثى</SelectItem></SelectContent>
          </Select>
          <Popover open={filterNationalityOpen} onOpenChange={setFilterNationalityOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 w-full rounded-xl bg-muted/20 border-border/50 justify-between font-normal">
                {nationalityFilter === "all" ? "كل الجنسيات" : nationalityFilter}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="بحث عن جنسية..." />
                <CommandList>
                  <CommandEmpty>لا توجد نتائج</CommandEmpty>
                  <CommandGroup>
                    <CommandItem value="all" onSelect={() => { setNationalityFilter("all"); setFilterNationalityOpen(false); }}>
                      <Check className={cn("mr-2 h-4 w-4", nationalityFilter === "all" ? "opacity-100" : "opacity-0")} />
                      كل الجنسيات
                    </CommandItem>
                    {nationalityOptions.map((n) => (
                      <CommandItem key={n} value={n} onSelect={() => { setNationalityFilter(n); setFilterNationalityOpen(false); }}>
                        <Check className={cn("mr-2 h-4 w-4", nationalityFilter === n ? "opacity-100" : "opacity-0")} />
                        {n}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-10 rounded-xl bg-muted/20 border-border/50"><SelectValue placeholder="الفئة" /></SelectTrigger>
            <SelectContent><SelectItem value="all">كل الفئات</SelectItem>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={freelanceFilter} onValueChange={setFreelanceFilter}>
            <SelectTrigger className="h-10 rounded-xl bg-muted/20 border-border/50"><SelectValue placeholder="حالة العمل" /></SelectTrigger>
            <SelectContent><SelectItem value="all">الكل</SelectItem><SelectItem value="yes">حر (Freelance)</SelectItem><SelectItem value="no">تحت كفالة</SelectItem></SelectContent>
          </Select>
        </div>

        {/* Row 3: Date Ranges and Additional Filters */}
        <div className="flex flex-wrap gap-4 items-center pt-2 border-t border-border/30">
          <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-xl border border-border/50">
            <span className="text-[10px] font-bold text-muted-foreground px-1 uppercase tracking-wider">انتهاء الصحية:</span>
            <div className="flex items-center gap-1">
              <input type="date" value={expiryFrom} onChange={(e) => setExpiryFrom(e.target.value)} className="bg-background border border-border/50 rounded-md p-1 text-[10px] outline-none" />
              <span className="text-muted-foreground text-[10px]">إلى</span>
              <input type="date" value={expiryTo} onChange={(e) => setExpiryTo(e.target.value)} className="bg-background border border-border/50 rounded-md p-1 text-[10px] outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted/40 p-2 rounded-xl border border-border/50">
            <span className="text-[10px] font-bold text-muted-foreground px-1 uppercase tracking-wider">تاريخ التسجيل:</span>
            <div className="flex items-center gap-1">
              <input type="date" value={createdFrom} onChange={(e) => setCreatedFrom(e.target.value)} className="bg-background border border-border/50 rounded-md p-1 text-[10px] outline-none" />
              <span className="text-muted-foreground text-[10px]">إلى</span>
              <input type="date" value={createdTo} onChange={(e) => setCreatedTo(e.target.value)} className="bg-background border border-border/50 rounded-md p-1 text-[10px] outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-3 mr-auto">
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5"><RotateCcw className="w-3 h-3 ml-2"/> مسح التصفية</Button>
            <div className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
              <span className="text-xs font-black text-primary">{filtered.length} سجل مطابق</span>
            </div>
          </div>
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
                <tr><td colSpan={12} className="p-10 text-center animate-pulse">جاري التحميل...</td></tr>
              ) : filtered?.length === 0 ? (
                <tr><td colSpan={12} className="p-10 text-center text-muted-foreground">لا توجد بيانات مطابقة لمعايير البحث</td></tr>
              ) : (
                filtered?.map((w) => (
                  <tr key={w?.id} className={cn("border-b border-border last:border-0 hover:bg-muted/30 transition-colors", w?.is_archived && "opacity-60 grayscale-[0.5] bg-muted/20")}>
                    <td className="p-3 font-medium">{w?.Full_Name}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{categories.find(c => c.id === w?.Category)?.label || w?.Category}</span></td>
                    <td className="p-3 font-mono text-xs">{w?.Passport_Number}</td>
                    <td className="p-3">{w?.Nationality}</td>
                    <td className="p-3 text-xs">{w?.Freelance ? "يعمل لحسابه" : (w?.Sponsor?.Sponsor_Name || "—")}</td>
                    <td className="p-3 font-mono text-xs">{formatDate(w?.Health_Cert_Expiry)}</td>
                    <td className="p-3 text-xs font-mono">{formatDateTime(w?.createdAt)}</td>
                    <td className="p-3 font-mono text-[10px]">{w?.NFC_UID || "—"}</td>
                    <td className="p-3 font-mono text-xs text-blue-500 font-bold">{w?.Family_ID || "—"}</td>
                    <td className="p-3"><StatusBadge variant={statusOptions.find(o => o.value === w?.Current_Status)?.variant as any || "default"} label={w?.Current_Status || ""} /></td>
                    <td className="p-3 text-center">{(w?.Passport_Copy || w?.Health_Cert_Copy || w?.Residency_Copy || w?.Personal_Photo_Copy) && <FileCheck className="w-4 h-4 text-green-600 inline" />}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEditClick(w)} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"><Edit className="w-3.5 h-3.5" /></button>
                        {!w?.is_archived && w?.id && <button onClick={() => handleDelete(w.id)} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></button>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" />{editMode ? "تعديل بيانات الفرد" : "إضافة فرد جديد"}</DialogTitle>
            <DialogDescription>أدخل البيانات الشخصية، فئة التواجد، ومعلومات الاستضافة.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-2">
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setForm({ ...form, Category: cat.id })} className={cn("flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1", form.Category === cat.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                  <span className="text-xl">{cat.icon}</span><span className="text-xs font-bold">{cat.label}</span>
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>الاسم الكامل <span className="text-destructive">*</span></Label><Input value={form.Full_Name} onChange={(e) => setForm({ ...form, Full_Name: e.target.value })} placeholder="الاسم الرباعي" /></div>
                <div className="space-y-1.5"><Label>الجنس</Label><Select value={form.Gender} onValueChange={(v) => setForm({ ...form, Gender: v })}><SelectTrigger><SelectValue placeholder="اختر الجنس" /></SelectTrigger><SelectContent><SelectItem value="ذكر">ذكر</SelectItem><SelectItem value="أنثى">أنثى</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>الجنسية</Label><Select value={form.Nationality} onValueChange={(v) => setForm({ ...form, Nationality: v })}><SelectTrigger><SelectValue placeholder="اختر الجنسية" /></SelectTrigger><SelectContent>{nationalityOptions.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>نوع الوثيقة</Label><Select value={form.Document_Type} onValueChange={(v) => setForm({ ...form, Document_Type: v })}><SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger><SelectContent>{docTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1.5"><Label>رقم الوثيقة <span className="text-destructive">*</span></Label><Input value={form.Passport_Number} onChange={(e) => setForm({ ...form, Passport_Number: e.target.value })} placeholder="رقم الجواز" className="font-mono" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>الحالة</Label><Select value={form.Current_Status} onValueChange={(v) => setForm({ ...form, Current_Status: v })}><SelectTrigger><SelectValue placeholder="اختر الحالة" /></SelectTrigger><SelectContent>{statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.value}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1.5"><Label>عنوان السكن</Label><Input value={form.Residence_Address} onChange={(e) => setForm({ ...form, Residence_Address: e.target.value })} placeholder="العنوان الحالي" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>تاريخ انتهاء الشهادة الصحية</Label><Input type="date" value={form.Health_Cert_Expiry} onChange={(e) => setForm({ ...form, Health_Cert_Expiry: e.target.value })} /></div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border">
                <div className="space-y-0.5"><Label>يعمل لحسابه (Freelance)</Label></div>
                <Switch checked={form.Freelance} onCheckedChange={(v) => setForm({ ...form, Freelance: v })} />
              </div>
              {!form.Freelance && (form.Category === "worker" || form.Category === "student") && (
                <div className="space-y-1.5">
                  <Label>الجهة المستضيفة <span className="text-destructive">*</span></Label>
                  <Popover open={sponsorOpen} onOpenChange={setSponsorOpen}>
                    <PopoverTrigger asChild><Button variant="outline" className="w-full justify-between font-normal">{form.Sponsor_ID ? sponsors.find((s) => s.id.toString() === form.Sponsor_ID)?.Sponsor_Name : "اختر الجهة..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start"><Command><CommandInput placeholder="بحث..." /><CommandList><CommandEmpty>لا توجد نتائج</CommandEmpty><CommandGroup>{sponsors.map((s) => <CommandItem key={s.id} value={s.Sponsor_Name} onSelect={() => { setForm({ ...form, Sponsor_ID: s.id.toString() }); setSponsorOpen(false); }}><Check className={cn("mr-2 h-4 w-4", form.Sponsor_ID === s.id.toString() ? "opacity-100" : "opacity-0")} />{s.Sponsor_Name}</CommandItem>)}</CommandGroup></CommandList></Command></PopoverContent>
                  </Popover>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>رقم العائلة (Family ID)</Label><Input value={form.Family_ID} onChange={(e) => setForm({ ...form, Family_ID: e.target.value })} className="font-mono" /></div>
                <div className="space-y-1.5"><Label>صلة القرابة</Label><Select value={form.Relationship} onValueChange={(v) => setForm({ ...form, Relationship: v })}><SelectTrigger><SelectValue placeholder="اختر الصلة" /></SelectTrigger><SelectContent>{relationships.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">البيانات الحيوية (Biometrics)</p>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{biometricStatus}</span>
              </div>

              <div className="grid grid-cols-1 gap-3 p-4 rounded-xl bg-muted/30 border border-dashed border-border/60">
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-1.5">
                    <Label className="text-[10px]">إصبع الالتقاط</Label>
                    <Select value={form.Finger_Index} onValueChange={(v) => setForm({ ...form, Finger_Index: v })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="اختر الإصبع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">الإبهام الأيمن (0)</SelectItem>
                        <SelectItem value="1">السبابة الأيمن (1)</SelectItem>
                        <SelectItem value="2">الوسطى الأيمن (2)</SelectItem>
                        <SelectItem value="3">البنصر الأيمن (3)</SelectItem>
                        <SelectItem value="4">الخنصر الأيمن (4)</SelectItem>
                        <SelectItem value="5">الإبهام الأيسر (5)</SelectItem>
                        <SelectItem value="6">السبابة الأيسر (6)</SelectItem>
                        <SelectItem value="7">الوسطى الأيسر (7)</SelectItem>
                        <SelectItem value="8">البنصر الأيسر (8)</SelectItem>
                        <SelectItem value="9">الخنصر الأيسر (9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 flex flex-col justify-end pt-5">
                    <Button
                      type="button"
                      variant={form.fingerprint_template ? "outline" : "default"}
                      onClick={handleEnrollFingerprint}
                      disabled={isEnrolling}
                      className="gap-2 h-8 text-xs"
                    >
                      <Fingerprint className={cn("w-3.5 h-3.5", form.fingerprint_template && "text-green-500")} />
                      {isEnrolling ? "جاري الالتقاط..." : "بدء الالتقاط"}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-[200px] h-[240px] bg-[#f0f0f0] rounded-lg border flex items-center justify-center overflow-hidden p-1">
                    {biometricImage ? (
                      <img src={biometricImage} alt="Fingerprint Preview" className="w-[200px] h-auto object-contain" />
                    ) : (
                      <Fingerprint className="w-8 h-8 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span>جودة الصورة:</span>
                      <span className={cn(
                        qualityScore !== null && qualityScore >= 50 ? "text-green-600" : "text-destructive"
                      )}>
                        {qualityScore !== null ? `${qualityScore}%` : "—"}
                      </span>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden border">
                      <div
                        className={cn("h-full transition-all duration-500", qualityScore !== null && qualityScore >= 50 ? "bg-green-500" : "bg-destructive")}
                        style={{ width: `${qualityScore || 0}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-tight">
                      يرجى وضع الإصبع بوضوح على الحساس حتى تظهر المعاينة وتصل الجودة إلى 50% على الأقل.
                    </p>
                  </div>
                </div>

                {form.fingerprint_template && (
                  <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold bg-green-50 p-2 rounded-lg border border-green-100">
                    <Check className="w-3.5 h-3.5" />
                    تم تسجيل بصمة الإصبع بنجاح (طول القالب: {Math.round(form.fingerprint_template.length * 0.75)} bytes)
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-semibold mb-3">المستندات المطلوبة</p>
              <div className="grid grid-cols-2 gap-3">
                <DocumentUpload label="صورة الوثيقة" value={docs.passportPhoto} onChange={(d) => setDocs({ ...docs, passportPhoto: d })} />
                <DocumentUpload label="الشهادة الصحية" value={docs.healthCert} onChange={(d) => setDocs({ ...docs, healthCert: d })} />
                <DocumentUpload label="صورة الإقامة" value={docs.residencyPhoto} onChange={(d) => setDocs({ ...docs, residencyPhoto: d })} />
                <DocumentUpload label="صورة شخصية" value={docs.personalPhoto} onChange={(d) => setDocs({ ...docs, personalPhoto: d })} />
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={handleClose}>إلغاء</Button><Button onClick={handleSubmit} disabled={isSaving}>{isSaving ? "جاري الحفظ..." : "حفظ"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
