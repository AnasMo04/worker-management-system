import { formatDateTime } from "../utils/formatDate";
import { StatusBadge } from "@/components/StatusBadge";
import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { useToast } from "@/hooks/use-toast";

export default function FieldLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/field-logs");
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحميل سجلات التفتيش من الخادم."
      });
    } finally {
      setLoading(false);
    }
  };

  const getResultVariant = (res: string) => {
    if (res === 'صالح' || res === 'Verified') return 'active';
    if (res === 'مخالفة') return 'runaway';
    if (res === 'منتهي') return 'expired';
    if (res === 'موقوف') return 'suspended';
    return 'expired';
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">جاري تحميل السجلات...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">سجلات التفتيش الميداني</h2>
        <p className="text-muted-foreground text-sm">سجل عمليات الفحص الميداني بأجهزة NFC</p>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                <th className="text-right p-3 font-medium">العامل</th>
                <th className="text-right p-3 font-medium">الضابط</th>
                <th className="text-right p-3 font-medium">وقت المسح</th>
                <th className="text-right p-3 font-medium">النتيجة</th>
                <th className="text-right p-3 font-medium">الموقع GPS</th>
                <th className="text-right p-3 font-medium">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground italic">لا توجد سجلات تفتيش مسجلة حالياً</td></tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">
                       <div>{l.Worker?.Full_Name || "—"}</div>
                       <div className="text-[10px] text-muted-foreground">{l.Worker?.Passport_Number}</div>
                    </td>
                    <td className="p-3">{l.User?.Name || "—"}</td>
                    <td className="p-3 text-xs">{formatDateTime(l.Scan_Time)}</td>
                    <td className="p-3"><StatusBadge variant={getResultVariant(l.Result) as any} /></td>
                    <td className="p-3 font-mono text-[10px] text-muted-foreground">
                       {l.GPS_Lat && l.GPS_Lon ? `${l.GPS_Lat}, ${l.GPS_Lon}` : (l.Location_Text || "—")}
                    </td>
                    <td className="p-3 text-[10px] max-w-[200px] truncate">{l.Note || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-lg border border-border shadow-sm p-5">
        <h3 className="font-semibold mb-4">الجدول الزمني للتفتيش</h3>
        <div className="space-y-4">
          {logs.slice(0, 10).map((l) => (
            <div key={l.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <div className="w-0.5 flex-1 bg-border" />
              </div>
              <div className="pb-4">
                <p className="text-sm font-medium">{l.Worker?.Full_Name || "عامل غير معروف"}</p>
                <p className="text-xs text-muted-foreground">
                   {l.User?.Name} — {formatDateTime(l.Scan_Time)}
                </p>
                <StatusBadge variant={getResultVariant(l.Result) as any} className="mt-1" />
                {l.Note && <p className="text-[10px] text-muted-foreground mt-1 italic">{l.Note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
