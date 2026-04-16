import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, Calendar, User, Activity, Eye, ArrowRight, ShieldAlert, Monitor, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

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
    l.User?.Name.toLowerCase().includes(search.toLowerCase()) ||
    l.Action_Type.toLowerCase().includes(search.toLowerCase()) ||
    l.Target_Ref.toLowerCase().includes(search.toLowerCase())
  );

  const getLogDetails = (detailsStr: string) => {
    try {
      return JSON.parse(detailsStr);
    } catch (e) {
      return {};
    }
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
            placeholder="بحث بالمستخدم، العملية، أو المسار..."
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
                  "absolute right-0 top-1.5 w-9 h-9 rounded-full border-4 border-card flex items-center justify-center z-10 transition-colors",
                  log.Action_Type === 'DELETE' ? "bg-destructive text-white" :
                  log.Action_Type === 'UPDATE' ? "bg-primary text-white" : "bg-success text-white"
                )}>
                  <Activity className="w-4 h-4" />
                </div>

                <div
                  onClick={() => { setSelectedLog(log); setModalOpen(true); }}
                  className="bg-muted/30 hover:bg-muted/50 border border-border rounded-xl p-4 cursor-pointer transition-all hover:translate-x-[-4px]"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-primary">{log.User?.Name || "نظام"}</span>
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
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-end">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(log.createdAt).toLocaleString('ar-EG')}
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
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              تفاصيل العملية التقنية
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted/50 rounded-xl border border-border">
                  <Label className="text-[10px] text-muted-foreground">المستخدم المسؤول</Label>
                  <p className="text-sm font-bold flex items-center gap-2 mt-1">
                    <User className="w-3.5 h-3.5" />
                    {selectedLog.User?.Name}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl border border-border">
                  <Label className="text-[10px] text-muted-foreground">نوع العملية</Label>
                  <p className="text-sm font-bold mt-1">{selectedLog.Action_Type}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-xl border border-border">
                  <Label className="text-[10px] text-muted-foreground">عنوان IP</Label>
                  <p className="text-sm font-mono mt-1">{getLogDetails(selectedLog.Details).ip}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold">بيانات الطلب (Technical Payload)</Label>
                <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto border-2 border-slate-800 shadow-inner rtl-grid">
                  <pre>{JSON.stringify(getLogDetails(selectedLog.Details).body, null, 2)}</pre>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground">بصمة المتصفح والجهاز (User Agent)</Label>
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                  <Monitor className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <p className="text-[11px] leading-relaxed break-all font-mono">
                    {getLogDetails(selectedLog.Details).userAgent}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
