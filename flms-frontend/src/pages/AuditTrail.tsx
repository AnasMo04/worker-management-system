import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, ShieldAlert, Monitor, Globe, ChevronLeft, Diff } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "../utils/formatDate";

interface AuditLog {
  id: number;
  Actor_ID: number;
  Action_Type: string;
  Target_Ref: string;
  Target_Name: string;
  Description: string;
  Timestamp: string;
  Details: string;
  User?: { Name: string };
  createdAt: string;
}

export default function AuditTrail() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/audit");
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter(l =>
    l.User.Name.toLowerCase().includes(search.toLowerCase()) ||
    l.Description.toLowerCase().includes(search.toLowerCase()) ||
    l.Target_Ref.toLowerCase().includes(search.toLowerCase())
  );

  const getLogDetails = (detailsStr: string) => {
    try {
      return JSON.parse(detailsStr) || {};
    } catch (e) {
      console.error("Failed to parse log details", e);
      return {};
    }
  };

  const renderDiff = (oldData: any, newData: any) => {
    if (!oldData) return <p className="text-xs text-muted-foreground italic">لا توجد بيانات سابقة للمقارنة.</p>;

    // We only care about keys that exist in newData or changed from oldData
    const changes = Object.keys(newData).filter(key =>
      newData[key] !== oldData[key] &&
      typeof newData[key] !== 'object' &&
      key !== 'updatedAt'
    );

    if (changes.length === 0) return <p className="text-xs text-muted-foreground italic">لم يتم رصد تغييرات في الحقول الأساسية.</p>;

    return (
      <div className="space-y-3">
        {changes.map(key => (
          <div key={key} className="grid grid-cols-2 gap-4 items-center p-2 rounded-lg bg-background border border-border/50 text-[11px]">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{key} (قبل)</span>
              <p className="text-destructive font-mono truncate">{String(oldData[key] || '—')}</p>
            </div>
            <div className="space-y-1 border-r pr-4">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{key} (بعد)</span>
              <p className="text-success font-mono truncate">{String(newData[key] || '—')}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">سجل المراجعة المتقدم</h2>
          <p className="text-muted-foreground text-sm">تتبع الميتا-بيانات والعمليات التقنية للنظام</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالوصف، المستخدم، أو المسار..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <span className="text-xs text-muted-foreground mr-auto">{filtered.length} سجل متاح</span>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm p-6">
        <div className="relative space-y-0 before:absolute before:right-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
          {loading ? (
            <p className="text-center py-10 text-muted-foreground">جاري تحميل السجلات...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">لا توجد سجلات مطابقة</p>
          ) : (
            filtered.map((log) => (
              <div key={log.id} className="relative pr-10 pb-8 last:pb-0 group">
                <div className={cn(
                  "absolute right-0 top-1.5 w-9 h-9 rounded-full border-4 border-card flex items-center justify-center z-10 transition-all group-hover:scale-110",
                  log.Action_Type === 'DELETE' ? "bg-destructive text-white shadow-lg shadow-destructive/20" :
                  log.Action_Type === 'UPDATE' ? "bg-primary text-white shadow-lg shadow-primary/20" :
                  log.Action_Type === 'LOGIN' ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" :
                  "bg-success text-white shadow-lg shadow-success/20"
                )}>
                  {log.Action_Type === 'LOGIN' ? <User className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                </div>

                <div
                  onClick={() => { setSelectedLog(log); setModalOpen(true); }}
                  className="bg-muted/30 hover:bg-muted/50 border border-border rounded-xl p-4 cursor-pointer transition-all hover:translate-x-[-4px] hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-primary">{log.User.Name || "نظام"}</span>
                        <StatusBadge
                          variant={
                            log.Action_Type === 'DELETE' ? 'deported' :
                            log.Action_Type === 'UPDATE' ? 'suspended' :
                            log.Action_Type === 'LOGIN' ? 'active' : 'active'
                          }
                          label={
                            log.Action_Type === 'CREATE' ? 'إضافة' :
                            log.Action_Type === 'UPDATE' ? 'تعديل' :
                            log.Action_Type === 'LOGIN' ? 'دخول' : 'حذف'
                          }
                        />
                      </div>
                      <p className="text-sm font-medium leading-relaxed">
                        {log.Description || `${log.Action_Type} على ${log.Target_Ref}`}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" />
                          {log.Target_Ref}
                        </p>
                        {log.Target_Name && log.Target_Name !== 'N/A' && (
                          <p className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            الهدف: {log.Target_Name}
                          </p>
                        )}
                        <span className="text-[10px] text-primary font-bold flex items-center gap-1 mr-auto opacity-0 group-hover:opacity-100 transition-opacity">
                          عرض التفاصيل <ChevronLeft className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-end font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateTime(log.createdAt)}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end">
                        <Globe className="w-3 h-3" />
                        {getLogDetails(log.Details).ip || "127.0.0.1"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
          <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <ShieldAlert className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">تفاصيل العملية التشغيلية</h3>
                <p className="text-xs text-slate-400 font-mono">Log ID: #{selectedLog.id}</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400">توقيت العملية</p>
              <p className="text-sm font-bold font-mono">{selectedLog && formatDateTime(selectedLog.createdAt)}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-background space-y-6">
            {selectedLog && (() => {
              const details = getLogDetails(selectedLog.Details);
              return (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/40 rounded-2xl border border-border space-y-1">
                      <Label className="text-[10px] text-muted-foreground font-bold">المستخدم المسؤول</Label>
                      <p className="text-sm font-bold flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        {selectedLog.User.Name}
                      </p>
                    </div>
                    <div className="p-4 bg-muted/40 rounded-2xl border border-border space-y-1">
                      <Label className="text-[10px] text-muted-foreground font-bold">نوع العملية</Label>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold uppercase">{selectedLog.Action_Type}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/40 rounded-2xl border border-border space-y-1">
                      <Label className="text-[10px] text-muted-foreground font-bold">عنوان IP والجهاز</Label>
                      <p className="text-sm font-mono flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        {details.ip || "127.0.0.1"}
                      </p>
                    </div>
                  </div>

                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-12 rounded-xl mb-4">
                      <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Diff className="w-4 h-4 ml-2" /> مقارنة البيانات
                      </TabsTrigger>
                      <TabsTrigger value="raw" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Eye className="w-4 h-4 ml-2" /> البيانات الخام (JSON)
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-0 focus-visible:ring-0">
                      <div className="p-5 border-2 border-dashed border-border rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold flex items-center gap-2 text-primary">
                          <Diff className="w-3.5 h-3.5" /> مخلص التغييرات المكتشفة
                        </h4>
                        {selectedLog.Action_Type === 'UPDATE' ? (
                          renderDiff(details.oldData, details.body)
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-sm text-muted-foreground">هذه العملية من نوع {selectedLog.Action_Type}، لا توجد مقارنة "قبل/بعد".</p>
                            <p className="text-[10px] mt-1 text-muted-foreground">راجع البيانات الخام في التبويب الآخر.</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="raw" className="mt-0 focus-visible:ring-0">
                      <div className="space-y-2">
                        <div className="bg-slate-950 text-slate-200 p-5 rounded-2xl font-mono text-[11px] overflow-x-auto border-2 border-slate-900 shadow-inner rtl-grid max-h-[300px]">
                          <pre>{JSON.stringify(details, null, 2)}</pre>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground">بصمة المتصفح (User Agent String)</Label>
                    <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-xl border border-border border-dashed">
                      <Monitor className="w-5 h-5 mt-0.5 text-muted-foreground" />
                      <p className="text-[10px] leading-relaxed break-all font-mono text-muted-foreground">
                        {details.userAgent}
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
