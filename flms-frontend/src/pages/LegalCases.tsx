import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { X } from "lucide-react";
import { formatDateTime } from "../utils/formatDate";

const cases = [
  { id: 1, number: "LC-2026-001", worker: "عبدالله كمارا", type: "مخالفة إقامة", status: "pending" as const, date: "2026-02-20", description: "تجاوز مدة الإقامة المحددة بدون تجديد" },
  { id: 2, number: "LC-2026-002", worker: "فيكتور أونيكا", type: "هروب من الكفيل", status: "active" as const, date: "2026-02-18", description: "غادر مقر العمل بدون إذن الكفيل" },
  { id: 3, number: "LC-2026-003", worker: "جون مارك", type: "مخالفة عمل", status: "active" as const, date: "2026-02-15", description: "العمل لدى جهة غير مرخصة" },
  { id: 4, number: "LC-2025-048", worker: "سامي حسن", type: "مخالفة مالية", status: "expired" as const, date: "2025-12-01", description: "عدم سداد الرسوم المقررة" },
];

export default function LegalCases() {
  const [selected, setSelected] = useState<typeof cases[0] | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">القضايا القانونية</h2>
        <p className="text-muted-foreground text-sm">إدارة القضايا والمخالفات القانونية</p>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                <th className="text-right p-3 font-medium">رقم القضية</th>
                <th className="text-right p-3 font-medium">العامل</th>
                <th className="text-right p-3 font-medium">نوع المخالفة</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">التاريخ</th>
                <th className="text-right p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs">{c.number}</td>
                  <td className="p-3 font-medium">{c.worker}</td>
                  <td className="p-3">{c.type}</td>
                  <td className="p-3"><StatusBadge variant={c.status} /></td>
                  <td className="p-3 text-xs">{formatDateTime(c.date)}</td>
                  <td className="p-3">
                    <button onClick={() => setSelected(c)} className="text-xs text-primary hover:underline font-medium">عرض التفاصيل</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-lg border border-border shadow-lg w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">تفاصيل القضية {selected.number}</h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">العامل:</span><span className="font-medium">{selected.worker}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">نوع المخالفة:</span><span>{selected.type}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">الحالة:</span><StatusBadge variant={selected.status} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">التاريخ:</span><span>{formatDateTime(selected.date)}</span></div>
              <div><span className="text-muted-foreground">الوصف:</span><p className="mt-1">{selected.description}</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
