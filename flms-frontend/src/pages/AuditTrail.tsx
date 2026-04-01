import { useState } from "react";

const auditData = [
  { id: 1, user: "أحمد المنصوري", action: "تحديث بيانات عامل", target: "محمد أحمد علي", time: "2026-02-23 09:20", type: "تعديل" },
  { id: 2, user: "خالد السعيدي", action: "فحص ميداني جديد", target: "عبدالله كمارا", time: "2026-02-23 08:45", type: "إنشاء" },
  { id: 3, user: "سالم العبيدي", action: "إصدار بطاقة ذكية", target: "راجيش كومار", time: "2026-02-23 08:30", type: "إنشاء" },
  { id: 4, user: "أحمد الفقيه", action: "فتح قضية قانونية", target: "فيكتور أونيكا", time: "2026-02-22 16:20", type: "إنشاء" },
  { id: 5, user: "مريم الشريف", action: "تسجيل دفعة مالية", target: "جون مارك", time: "2026-02-22 15:10", type: "إنشاء" },
  { id: 6, user: "فاطمة بن عمر", action: "مراجعة مستند", target: "محمد أحمد علي", time: "2026-02-22 14:00", type: "مراجعة" },
  { id: 7, user: "أحمد المنصوري", action: "تعطيل جهاز", target: "NFC-004", time: "2026-02-22 12:00", type: "تعديل" },
  { id: 8, user: "خالد السعيدي", action: "تحديث حالة عامل", target: "عبدالله كمارا", time: "2026-02-22 11:30", type: "تعديل" },
];

const actionTypes = ["الكل", "إنشاء", "تعديل", "مراجعة", "حذف"];
const usersList = ["الكل", ...new Set(auditData.map(a => a.user))];

export default function AuditTrail() {
  const [userFilter, setUserFilter] = useState("الكل");
  const [typeFilter, setTypeFilter] = useState("الكل");

  const filtered = auditData.filter((a) => {
    const matchUser = userFilter === "الكل" || a.user === userFilter;
    const matchType = typeFilter === "الكل" || a.type === typeFilter;
    return matchUser && matchType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">سجل المراجعة</h2>
        <p className="text-muted-foreground text-sm">تتبع جميع العمليات والأنشطة في النظام</p>
      </div>

      <div className="bg-card rounded-lg border border-border p-4 flex flex-wrap gap-3 items-center">
        <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="h-9 bg-muted rounded-lg px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
          {usersList.map((u) => <option key={u}>{u}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 bg-muted rounded-lg px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
          {actionTypes.map((t) => <option key={t}>{t}</option>)}
        </select>
        <span className="text-xs text-muted-foreground mr-auto">{filtered.length} سجل</span>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-lg border border-border shadow-sm p-5">
        <div className="space-y-4">
          {filtered.map((a) => (
            <div key={a.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-primary shrink-0" />
                <div className="w-0.5 flex-1 bg-border" />
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm"><span className="font-semibold">{a.user}</span> — {a.action}</p>
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">الهدف: {a.target}</p>
                <span className="inline-block mt-1 text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded">{a.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
