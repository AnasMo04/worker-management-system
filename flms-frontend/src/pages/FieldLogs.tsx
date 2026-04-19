import { formatDate, formatDateTime } from "../utils/formatDate";
import { StatusBadge } from "@/components/StatusBadge";

const logs = [
  { id: 1, worker: "محمد أحمد علي", officer: "خالد السعيدي", device: "NFC-001", time: "2026-02-23 09:15", result: "active" as const, gps: "32.8872, 13.1802" },
  { id: 2, worker: "عبدالله كمارا", officer: "سالم العبيدي", device: "NFC-003", time: "2026-02-23 08:45", result: "suspended" as const, gps: "32.9025, 13.1856" },
  { id: 3, worker: "راجيش كومار", officer: "خالد السعيدي", device: "NFC-001", time: "2026-02-23 08:30", result: "active" as const, gps: "32.8760, 13.1790" },
  { id: 4, worker: "فيكتور أونيكا", officer: "أحمد الفقيه", device: "NFC-005", time: "2026-02-22 16:20", result: "expired" as const, gps: "32.8950, 13.1700" },
  { id: 5, worker: "جون مارك", officer: "سالم العبيدي", device: "NFC-003", time: "2026-02-22 15:10", result: "runaway" as const, gps: "32.9100, 13.1650" },
];

export default function FieldLogs() {
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
                <th className="text-right p-3 font-medium">الجهاز</th>
                <th className="text-right p-3 font-medium">وقت المسح</th>
                <th className="text-right p-3 font-medium">النتيجة</th>
                <th className="text-right p-3 font-medium">الموقع GPS</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{l.worker}</td>
                  <td className="p-3">{l.officer}</td>
                  <td className="p-3 font-mono text-xs">{l.device}</td>
                  <td className="p-3 text-xs">{formatDateTime(l.time)}</td>
                  <td className="p-3"><StatusBadge variant={l.result} /></td>
                  <td className="p-3 font-mono text-xs text-muted-foreground">{l.gps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-lg border border-border shadow-sm p-5">
        <h3 className="font-semibold mb-4">الجدول الزمني للتفتيش</h3>
        <div className="space-y-4">
          {logs.map((l) => (
            <div key={l.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <div className="w-0.5 flex-1 bg-border" />
              </div>
              <div className="pb-4">
                <p className="text-sm font-medium">{l.worker}</p>
                <p className="text-xs text-muted-foreground">{l.officer} — {l.device} — {formatDateTime(l.time)}</p>
                <StatusBadge variant={l.result} className="mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
