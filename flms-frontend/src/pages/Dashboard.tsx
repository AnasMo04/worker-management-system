import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, CreditCard, Scale, Wallet } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from "recharts";

const statusData = [
  { name: "نشط", value: 12450, color: "hsl(152, 60%, 40%)" },
  { name: "موقوف", value: 2340, color: "hsl(38, 92%, 50%)" },
  { name: "منتهي", value: 890, color: "hsl(215, 15%, 50%)" },
  { name: "هارب", value: 320, color: "hsl(0, 72%, 51%)" },
];

const recentInspections = [
  { id: 1, worker: "محمد أحمد علي", officer: "خالد السعيدي", device: "NFC-001", time: "2026-02-23 09:15", result: "active" as const },
  { id: 2, worker: "عبدالله كمارا", officer: "سالم العبيدي", device: "NFC-003", time: "2026-02-23 08:45", result: "suspended" as const },
  { id: 3, worker: "راجيش كومار", officer: "خالد السعيدي", device: "NFC-001", time: "2026-02-23 08:30", result: "active" as const },
  { id: 4, worker: "فيكتور أونيكا", officer: "أحمد الفقيه", device: "NFC-005", time: "2026-02-22 16:20", result: "expired" as const },
  { id: 5, worker: "جون مارك", officer: "سالم العبيدي", device: "NFC-003", time: "2026-02-22 15:10", result: "runaway" as const },
];

const recentAudit = [
  { id: 1, user: "أحمد المنصوري", action: "تحديث بيانات عامل", time: "منذ 5 دقائق" },
  { id: 2, user: "خالد السعيدي", action: "فحص ميداني جديد", time: "منذ 12 دقيقة" },
  { id: 3, user: "سالم العبيدي", action: "إصدار بطاقة ذكية", time: "منذ 30 دقيقة" },
  { id: 4, user: "أحمد الفقيه", action: "فتح قضية قانونية", time: "منذ ساعة" },
  { id: 5, user: "مريم الشريف", action: "تسجيل دفعة مالية", time: "منذ ساعتين" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">لوحة التحكم</h2>
        <p className="text-muted-foreground text-sm">نظرة عامة على نظام إدارة العمالة الأجنبية</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="إجمالي العمال" value={16000} icon={<Users />} gradient="kpi-gradient-1" change="+125 هذا الشهر" />
        <KPICard title="البطاقات النشطة" value={12450} icon={<CreditCard />} gradient="kpi-gradient-2" change="78% من الإجمالي" />
        <KPICard title="القضايا المفتوحة" value={48} icon={<Scale />} gradient="kpi-gradient-3" change="+3 هذا الأسبوع" />
        <KPICard title="مدفوعات معلقة" value="54,200" icon={<Wallet />} gradient="kpi-gradient-4" change="د.ل" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inspections */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border shadow-sm">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">آخر عمليات التفتيش</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-right p-3 font-medium">العامل</th>
                  <th className="text-right p-3 font-medium">الضابط</th>
                  <th className="text-right p-3 font-medium">الجهاز</th>
                  <th className="text-right p-3 font-medium">الوقت</th>
                  <th className="text-right p-3 font-medium">النتيجة</th>
                </tr>
              </thead>
              <tbody>
                {recentInspections.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium">{item.worker}</td>
                    <td className="p-3">{item.officer}</td>
                    <td className="p-3 font-mono text-xs">{item.device}</td>
                    <td className="p-3 text-muted-foreground text-xs">{item.time}</td>
                    <td className="p-3"><StatusBadge variant={item.result} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Chart */}
        <div className="bg-card rounded-lg border border-border shadow-sm">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold">توزيع حالات العمال</h3>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString("ar-LY")} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Audit */}
      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">آخر النشاطات</h3>
        </div>
        <div className="p-4 space-y-3">
          {recentAudit.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <div className="flex-1">
                <span className="font-medium text-sm">{item.user}</span>
                <span className="text-muted-foreground text-sm mx-2">—</span>
                <span className="text-sm">{item.action}</span>
              </div>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
