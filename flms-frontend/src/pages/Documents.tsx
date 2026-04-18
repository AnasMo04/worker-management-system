import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, FileText, Download, ExternalLink, Calendar, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "../api/axiosConfig";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime, formatDate } from "@/utils/formatDate";

interface Document {
  id: number;
  Worker_ID: number | null;
  Sponsor_ID: number | null;
  Doc_Type: string;
  Doc_Number: string;
  Expiry_Date: string | null;
  File_Path: string;
  Worker?: { Full_Name: string };
  Sponsor?: { Sponsor_Name: string };
  createdAt: string;
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/documents");
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل في تحميل المستندات." });
    } finally {
      setLoading(false);
    }
  };

  const filtered = documents.filter((d) => {
    const name = d.Worker?.Full_Name || d.Sponsor?.Sponsor_Name || "";
    return name.toLowerCase().includes(search.toLowerCase()) ||
           d.Doc_Type.toLowerCase().includes(search.toLowerCase()) ||
           d.Doc_Number?.toLowerCase().includes(search.toLowerCase());
  });

  const getFileUrl = (path: string) => {
    if (!path) return "#";
    if (path.startsWith("http")) return path;
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${backendUrl}/${path}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">المستندات</h2>
          <p className="text-muted-foreground text-sm">إدارة مستندات ووثائق العمال والجهات</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث باسم صاحب المستند أو نوعه..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <span className="text-xs text-muted-foreground mr-auto">{filtered.length} مستند متاح</span>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                <th className="text-right p-3 font-medium">صاحب المستند</th>
                <th className="text-right p-3 font-medium">نوع المستند</th>
                <th className="text-right p-3 font-medium">رقم الوثيقة</th>
                <th className="text-right p-3 font-medium">تاريخ الرفع</th>
                <th className="text-right p-3 font-medium">تاريخ الانتهاء</th>
                <th className="text-right p-3 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">جاري التحميل...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">لا توجد مستندات مطابقة</td></tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        {d.Worker?.Full_Name || d.Sponsor?.Sponsor_Name || "—"}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        {d.Doc_Type}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-xs">{d.Doc_Number || "—"}</td>
                    <td className="p-3 text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDateTime(d.createdAt)}
                      </div>
                    </td>
                    <td className="p-3 text-xs">{formatDate(d.Expiry_Date)}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <a
                          href={getFileUrl(d.File_Path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                          title="عرض المستند"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={getFileUrl(d.File_Path)}
                          download
                          className="p-1.5 rounded-md bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                          title="تحميل"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
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
