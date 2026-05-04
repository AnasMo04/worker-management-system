import { formatDate, formatDateTime } from "../utils/formatDate";
import { useState, useEffect, useRef, useMemo } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Filter, Edit, Plus, UserPlus, Check, ChevronsUpDown, FileCheck, Users, Trash2, Wifi, FileDown, Download, ArrowRight, RotateCcw, Fingerprint, Briefcase, Building2 } from "lucide-react";
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
  fingerprint_template?: string;
  fingerprint_image?: string;
  Native_Language?: string;
  createdAt: string;
  is_archived?: boolean;
}

interface Sponsor {
  id: number;
  Sponsor_Name: string;
}

const categories = [
  { id: "worker", label: "عامل", icon: <Briefcase className="w-5 h-5" /> },
  { id: "student", label: "طالب", icon: <Building2 className="w-5 h-5" /> },
  { id: "dependent", label: "مرافق / تابع", icon: <Users className="w-5 h-5" /> }
];

const docTypes = ["جواز سفر", "بطاقة قنصلية", "إفادة سفارة"];
const relationships = ["زوج/زوجة", "ابن/ابنة", "أب/أم", "أخرى"];
const nationalityOptions = ["بنغلاديش", "غانا", "الهند", "نيجيريا", "الفلبين", "مصر", "تونس", "باكستان", "سوريا", "السودان"];
const languageOptions = ["العربية", "الإنجليزية", "الفرنسية", "الأردية", "البنغالية", "الهندية", "الفلبينية", "الأوسا"];
const statusOptions = [
  { value: "نشط", variant: "active" },
  { value: "موقوف", variant: "suspended" },
  { value: "مرحّل", variant: "deported" },
  { value: "متوفى", variant: "deceased" },
  { value: "خارج البلاد", variant: "left" }
];

const emptyForm = {
  Full_Name: "", Passport_Number: "", Nationality: "", Native_Language: "", Residence_Address: "", Sponsor_ID: "",
  National_ID: "", Birth_Date: "", Category: "worker", Document_Type: "جواز سفر",
  Health_Cert_Expiry: "", Freelance: false, Family_ID: "", Relationship: "",
  Gender: "ذكر", Current_Status: "نشط", NFC_UID: "", fingerprint_template: "", fingerprint_image: "", Finger_Index: "0"
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

  const [isFormView, setIsFormView] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [docs, setDocs] = useState<IndividualDocs>(emptyDocs);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSynthetic, setIsSynthetic] = useState(false);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [biometricStatus, setBiometricStatus] = useState("جاري الاتصال...");
  const [biometricImage, setBiometricImage] = useState<string | null>(null);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [sponsorOpen, setSponsorOpen] = useState(false);
  const [nationalityOpen, setNationalityOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
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
      if (isFormView) {
        setForm(prev => ({ ...prev, NFC_UID: data.uid }));
        toast({
          title: "تم اكتشاف بطاقة",
          description: `الرقم التسلسلي: ${data.uid}`,
        });
      } else {
        // Global Search via NFC
        setSearchQuery(data.uid);
        toast({
          title: "البحث عن طريق البطاقة",
          description: `تم تلقي الرقم: ${data.uid}`,
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

    socketRef.current.on('zk:enrollment-data', (data: {
      template: string,
      image?: string,
      quality?: number,
      finger_index?: number,
      is_synthetic?: boolean
    }) => {
      setForm(prev => ({
        ...prev,
        fingerprint_template: data.template,
        fingerprint_image: data.image || prev.fingerprint_image,
        Finger_Index: data.finger_index?.toString() || prev.Finger_Index
      }));

      if (data.quality !== undefined) setQualityScore(data.quality);
      if (data.is_synthetic !== undefined) setIsSynthetic(data.is_synthetic);

      setIsEnrolling(false);
      setIsCapturing(false);
      toast({ title: "تم التقاط البصمة", description: "تم تسجيل بصمة الإصبع بنجاح." });
    });

    socketRef.current.on('zk:identified', (data: { id: number }) => {
      setIsIdentifying(false);
      setIsCapturing(false);
      setHighlightedId(data.id);

      // Find the worker to show their name in the toast
      const worker = individuals.find(i => i.id === data.id);

      toast({
        title: "تم التعرف على الفرد",
        description: `الاسم: ${worker?.Full_Name || "غير معروف"}`,
      });

      // Clear highlight after 5 seconds
      setTimeout(() => setHighlightedId(null), 5000);

      // Auto scroll to the row if needed or just focus
      const element = document.getElementById(`worker-row-${data.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    // Keyboard Emulator Listener
    let buffer = "";
    let lastTime = Date.now();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFormView) return;
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
  }, [showArchived, isFormView]);

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

    try {
      setIsSaving(true);
      if (isCapturing) await api.post("/api/biometric/capture", { action: 'stop' });
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
      fingerprint_image: ind?.fingerprint_image || "",
      Native_Language: ind?.Native_Language || "",
    });
    if (ind?.fingerprint_image) {
      setBiometricImage(ind.fingerprint_image.startsWith('data:') ? ind.fingerprint_image : `data:image/bmp;base64,${ind.fingerprint_image}`);
    }
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const getFullUrl = (p: string) => p?.startsWith('http') ? p : `${backendUrl}/${p}`;
    setDocs({
      passportPhoto: ind?.Passport_Copy ? { name: "مستند مرفق", url: getFullUrl(ind.Passport_Copy), type: "application/pdf", label: "صورة الوثيقة" } : null,
      healthCert: ind?.Health_Cert_Copy ? { name: "مستند مرفق", url: getFullUrl(ind.Health_Cert_Copy), type: "application/pdf", label: "الشهادة الصحية" } : null,
      residencyPhoto: ind?.Residency_Copy ? { name: "مستند مرفق", url: getFullUrl(ind.Residency_Copy), type: "application/pdf", label: "صورة الإقامة" } : null,
      personalPhoto: ind?.Personal_Photo_Copy ? { name: "صورة مرفقة", url: getFullUrl(ind.Personal_Photo_Copy), type: "image/jpeg", label: "صورة شخصية" } : null,
    });
    setIsFormView(true);
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

  const handleToggleCapture = async () => {
    try {
      const nextState = !isCapturing;
      const action = nextState ? 'start' : 'stop';
      const res = await api.post("/api/biometric/capture", { action });
      if (res.data.success) {
        setIsCapturing(nextState);
        if (nextState) {
          setBiometricImage(null);
          setQualityScore(null);
          setIsSynthetic(false);
        }
      }
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في التحكم بالجهاز." });
    }
  };

  const handleIdentifyFingerprint = async () => {
    try {
      setIsIdentifying(true);

      // 1. Get all workers with templates
      const workersWithTemplates = individuals
        .filter(i => i.fingerprint_template)
        .map(i => ({ id: i.id, template: i.fingerprint_template }));

      if (workersWithTemplates.length === 0) {
        toast({ variant: "destructive", title: "تنبيه", description: "لا توجد بصمات مسجلة في النظام للبحث." });
        setIsIdentifying(false);
        return;
      }

      // 2. Trigger Identify on Backend
      const res = await api.post("/api/biometric/identify", { templates: workersWithTemplates });
      if (res.data.success) {
        setIsCapturing(true);
        toast({ title: "نظام البحث جاهز", description: "يرجى وضع الإصبع على الحساس للمطابقة." });
      }
    } catch (error: any) {
      setIsIdentifying(false);
      toast({ variant: "destructive", title: "خطأ", description: error.response?.data?.message || "فشل في تشغيل نظام البحث." });
    }
  };

  const handleEnrollFingerprint = async () => {
    try {
      setIsEnrolling(true);
      const res = await api.post("/api/biometric/enroll", { fingerIndex: parseInt(form.Finger_Index) });
      if (res.data.success) {
        setIsCapturing(true);
        toast({ title: "جهاز البصمة جاهز", description: res.data.message });
      }
    } catch (error: any) {
      setIsEnrolling(false);
      toast({ variant: "destructive", title: "خطأ", description: error.response?.data?.message || "فشل في تشغيل نظام البصمة." });
    }
  };

  const resetBiometrics = () => {
    setBiometricImage(null);
    setQualityScore(null);
    setIsSynthetic(false);
    setIsCapturing(false);
  };

  const handleClose = async () => {
    if (isCapturing) await api.post("/api/biometric/capture", { action: 'stop' });
    resetBiometrics();
    setIsFormView(false);
    setEditMode(false);
    setSelectedId(null);
    setForm(emptyForm);
    setDocs(emptyDocs);
    setErrors({});
  };

  if (isFormView) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full">
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{editMode ? "تعديل بيانات الفرد" : "إضافة فرد جديد"}</h2>
              <p className="text-muted-foreground text-sm">أدخل البيانات الشخصية، فئة التواجد، ومعلومات الاستضافة.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="p-8 space-y-10">
            <div className="grid grid-cols-3 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm({ ...form, Category: cat.id })}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-2",
                    form.Category === cat.id
                      ? "border-primary bg-primary/5 text-primary shadow-inner"
                      : "border-gray-100 hover:border-primary/20 text-gray-500 bg-gray-50/50"
                  )}
                >
                  <span className={cn(form.Category === cat.id ? "text-primary" : "text-gray-400")}>{cat.icon}</span>
                  <span className="text-sm font-bold">{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">الاسم الكامل <span className="text-destructive">*</span></Label>
                  <Input value={form.Full_Name} onChange={(e) => setForm({ ...form, Full_Name: e.target.value })} placeholder="الاسم الرباعي" className="h-12 rounded-xl" />
                  {errors.Full_Name && <p className="text-xs text-destructive font-medium">{errors.Full_Name}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">الجنس</Label>
                  <Select value={form.Gender} onValueChange={(v) => setForm({ ...form, Gender: v })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="اختر الجنس" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ذكر">ذكر</SelectItem>
                      <SelectItem value="أنثى">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">الجنسية</Label>
                  <Popover open={nationalityOpen} onOpenChange={setNationalityOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={nationalityOpen} className="w-full h-12 rounded-xl justify-between font-normal bg-white">
                        {form.Nationality || "اختر الجنسية..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="بحث عن جنسية..." className="h-10" />
                        <CommandList>
                          <CommandEmpty>لا توجد نتائج</CommandEmpty>
                          <CommandGroup>
                            {nationalityOptions.map((n) => (
                              <CommandItem key={n} value={n} onSelect={() => { setForm({ ...form, Nationality: n }); setNationalityOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", form.Nationality === n ? "opacity-100" : "opacity-0")} />
                                {n}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">اللغة الأم</Label>
                  <Popover open={languageOpen} onOpenChange={setLanguageOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={languageOpen} className="w-full h-12 rounded-xl justify-between font-normal bg-white">
                        {form.Native_Language || "اختر اللغة..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="بحث عن لغة..." className="h-10" />
                        <CommandList>
                          <CommandEmpty>لا توجد نتائج</CommandEmpty>
                          <CommandGroup>
                            {languageOptions.map((l) => (
                              <CommandItem key={l} value={l} onSelect={() => { setForm({ ...form, Native_Language: l }); setLanguageOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", form.Native_Language === l ? "opacity-100" : "opacity-0")} />
                                {l}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">نوع الوثيقة</Label>
                  <Select value={form.Document_Type} onValueChange={(v) => setForm({ ...form, Document_Type: v })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                    <SelectContent>
                      {docTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">رقم الوثيقة <span className="text-destructive">*</span></Label>
                  <Input value={form.Passport_Number} onChange={(e) => setForm({ ...form, Passport_Number: e.target.value })} placeholder="رقم الجواز" className="h-12 rounded-xl font-mono" />
                  {errors.Passport_Number && <p className="text-xs text-destructive font-medium">{errors.Passport_Number}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">الحالة</Label>
                  <Select value={form.Current_Status} onValueChange={(v) => setForm({ ...form, Current_Status: v })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="اختر الحالة" /></SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.value}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">عنوان السكن</Label>
                  <Input value={form.Residence_Address} onChange={(e) => setForm({ ...form, Residence_Address: e.target.value })} placeholder="العنوان الحالي" className="h-12 rounded-xl" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">تاريخ انتهاء الشهادة الصحية</Label>
                  <Input type="date" value={form.Health_Cert_Expiry} onChange={(e) => setForm({ ...form, Health_Cert_Expiry: e.target.value })} className="h-12 rounded-xl" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 self-end h-12">
                  <Label className="text-sm font-bold text-gray-700">يعمل لحسابه (Freelance)</Label>
                  <Switch checked={form.Freelance} onCheckedChange={(v) => setForm({ ...form, Freelance: v })} />
                </div>
              </div>

              {!form.Freelance && (form.Category === "worker" || form.Category === "student") && (
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">الجهة المستضيفة <span className="text-destructive">*</span></Label>
                  <Popover open={sponsorOpen} onOpenChange={setSponsorOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={sponsorOpen} className="w-full h-12 rounded-xl justify-between font-normal bg-white">
                        {form.Sponsor_ID ? sponsors.find((s) => s.id.toString() === form.Sponsor_ID)?.Sponsor_Name : "اختر الجهة..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="بحث عن جهة..." className="h-10" />
                        <CommandList>
                          <CommandEmpty>لا توجد نتائج</CommandEmpty>
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
                  {errors.Sponsor_ID && <p className="text-xs text-destructive font-medium">{errors.Sponsor_ID}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">رقم العائلة (Family ID)</Label>
                  <Input value={form.Family_ID} onChange={(e) => setForm({ ...form, Family_ID: e.target.value })} className="h-12 rounded-xl font-mono" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">صلة القرابة</Label>
                  <Select value={form.Relationship} onValueChange={(v) => setForm({ ...form, Relationship: v })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="اختر الصلة" /></SelectTrigger>
                    <SelectContent>
                      {relationships.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold text-base">
                  <Fingerprint className="w-5 h-5" />
                  البيانات الحيوية (Biometrics)
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{biometricStatus}</span>
                  <Button size="sm" variant={isCapturing ? "destructive" : "secondary"} onClick={handleToggleCapture} className="h-7 text-[10px] gap-1 rounded-lg">
                    {isCapturing ? "إيقاف الحساس" : "تشغيل الحساس"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-6">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs font-bold text-gray-600">إصبع الالتقاط</Label>
                    <Select value={form.Finger_Index} onValueChange={(v) => setForm({ ...form, Finger_Index: v })}>
                      <SelectTrigger className="h-10 text-xs rounded-xl bg-white">
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

                  <div className="flex-1 flex flex-col justify-end">
                    <Button
                      type="button"
                      variant={form.fingerprint_template ? "outline" : "default"}
                      onClick={handleEnrollFingerprint}
                      disabled={isEnrolling}
                      className="gap-2 h-10 text-xs rounded-xl"
                    >
                      <Fingerprint className={cn("w-4 h-4", form.fingerprint_template && "text-green-500")} />
                      {isEnrolling ? "جاري الالتقاط..." : "بدء التقاط البصمة"}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="w-[180px] h-[220px] bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden p-2 shadow-inner">
                    {biometricImage ? (
                      <img src={biometricImage} alt="Fingerprint Preview" className="w-full h-auto object-contain" />
                    ) : (
                      <Fingerprint className="w-10 h-10 text-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-gray-600">جودة الصورة {isSynthetic && <span className="text-orange-500 font-normal ml-1">(اصطناعي)</span>}</span>
                        <span className={cn(
                          qualityScore !== null && qualityScore >= 50 ? "text-green-600" : "text-destructive"
                        )}>
                          {qualityScore !== null ? `${qualityScore}%` : "—"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full transition-all duration-500", qualityScore !== null && qualityScore >= 50 ? "bg-green-500" : "bg-destructive")}
                          style={{ width: `${qualityScore || 0}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed bg-white p-3 rounded-lg border border-gray-100">
                      يرجى وضع الإصبع بوضوح على الحساس حتى تظهر المعاينة وتصل الجودة إلى 50% على الأقل لضمان دقة النظام.
                    </p>

                    {form.fingerprint_template && (
                      <div className="flex items-center gap-2 text-xs text-green-600 font-bold bg-green-50 p-3 rounded-xl border border-green-100 shadow-sm animate-in fade-in">
                        <Check className="w-4 h-4" />
                        تم تسجيل بصمة الإصبع بنجاح في النظام
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <div className="flex items-center gap-2 text-primary font-bold text-base mb-6">
                <FileCheck className="w-5 h-5" />
                المستندات الثبوتية المطلوبة
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DocumentUpload label="صورة الوثيقة" value={docs.passportPhoto} onChange={(d) => setDocs({ ...docs, passportPhoto: d })} />
                <DocumentUpload label="الشهادة الصحية" value={docs.healthCert} onChange={(d) => setDocs({ ...docs, healthCert: d })} />
                <DocumentUpload label="صورة الإقامة" value={docs.residencyPhoto} onChange={(d) => setDocs({ ...docs, residencyPhoto: d })} />
                <DocumentUpload label="صورة شخصية" value={docs.personalPhoto} onChange={(d) => setDocs({ ...docs, personalPhoto: d })} />
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50 border-t border-gray-200 flex justify-end">
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} disabled={isSaving} className="h-11 px-8 rounded-xl border-gray-300 font-bold hover:bg-gray-100">
                إلغاء
              </Button>
              <Button onClick={handleSubmit} className="h-11 px-10 rounded-xl font-bold shadow-lg shadow-primary/20" disabled={isSaving}>
                {isSaving ? "جاري الحفظ..." : (editMode ? "تحديث البيانات" : "تسجيل الفرد")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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
            <Button onClick={() => setIsFormView(true)} className="gap-2">
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
          <div className="relative flex-1 min-w-[300px] flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="البحث الذكي (Musa)..." className="w-full h-11 bg-muted/40 border border-border rounded-xl pr-10 pl-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
            </div>
            <Button
              onClick={handleIdentifyFingerprint}
              disabled={isIdentifying}
              variant={isIdentifying ? "secondary" : "outline"}
              className={cn("h-11 px-4 rounded-xl gap-2", isIdentifying && "animate-pulse")}
            >
              <Fingerprint className="w-4 h-4" />
              {isIdentifying ? "جاري البحث..." : "بحث بالبصمة"}
            </Button>
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
                  <tr
                    key={w?.id}
                    id={`worker-row-${w?.id}`}
                    className={cn(
                      "border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
                      w?.is_archived && "opacity-60 grayscale-[0.5] bg-muted/20",
                      highlightedId === w?.id && "bg-primary/20 ring-2 ring-primary ring-inset"
                    )}
                  >
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

    </div>
  );
}
