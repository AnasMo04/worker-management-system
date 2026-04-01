import { StatusBadge } from "@/components/StatusBadge";

const devices = [
  { id: 1, name: "NFC-001", model: "ACR1252U", officer: "خالد السعيدي", lastSync: "2026-02-23 09:15", active: true },
  { id: 2, name: "NFC-002", model: "ACR1252U", officer: "أحمد الفقيه", lastSync: "2026-02-22 18:30", active: true },
  { id: 3, name: "NFC-003", model: "ACR122U", officer: "سالم العبيدي", lastSync: "2026-02-23 08:45", active: true },
  { id: 4, name: "NFC-004", model: "ACR122U", officer: "—", lastSync: "2026-02-10 12:00", active: false },
  { id: 5, name: "NFC-005", model: "ACR1252U", officer: "أحمد الفقيه", lastSync: "2026-02-22 16:20", active: true },
];

export default function Devices() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">الأجهزة</h2>
        <p className="text-muted-foreground text-sm">إدارة أجهزة NFC الميدانية</p>
      </div>
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                <th className="text-right p-3 font-medium">اسم الجهاز</th>
                <th className="text-right p-3 font-medium">الموديل</th>
                <th className="text-right p-3 font-medium">الضابط</th>
                <th className="text-right p-3 font-medium">آخر مزامنة</th>
                <th className="text-right p-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs font-medium">{d.name}</td>
                  <td className="p-3 text-xs">{d.model}</td>
                  <td className="p-3">{d.officer}</td>
                  <td className="p-3 text-xs">{d.lastSync}</td>
                  <td className="p-3"><StatusBadge variant={d.active ? "active" : "expired"} label={d.active ? "نشط" : "غير نشط"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
