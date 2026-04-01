import { StatusBadge } from "@/components/StatusBadge";

const transactions = [
  { id: 1, ref: "TXN-2026-0201", worker: "محمد أحمد علي", amount: 1500, status: "paid" as const, date: "2026-02-20", type: "رسوم إقامة" },
  { id: 2, ref: "TXN-2026-0202", worker: "عبدالله كمارا", amount: 2200, status: "pending" as const, date: "2026-02-19", type: "غرامة مخالفة" },
  { id: 3, ref: "TXN-2026-0203", worker: "راجيش كومار", amount: 800, status: "paid" as const, date: "2026-02-18", type: "رسوم بطاقة" },
  { id: 4, ref: "TXN-2026-0204", worker: "فيكتور أونيكا", amount: 3500, status: "failed" as const, date: "2026-02-17", type: "غرامة هروب" },
  { id: 5, ref: "TXN-2026-0205", worker: "جون مارك", amount: 1200, status: "pending" as const, date: "2026-02-16", type: "رسوم تجديد" },
];

const totalCollected = transactions.filter(t => t.status === "paid").reduce((s, t) => s + t.amount, 0);
const totalPending = transactions.filter(t => t.status === "pending").reduce((s, t) => s + t.amount, 0);

export default function Financials() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">المالية</h2>
        <p className="text-muted-foreground text-sm">المعاملات المالية والرسوم</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">إجمالي المحصّل</p>
          <p className="text-2xl font-bold text-success mt-1">{totalCollected.toLocaleString("ar-LY")} د.ل</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">قيد الانتظار</p>
          <p className="text-2xl font-bold text-warning mt-1">{totalPending.toLocaleString("ar-LY")} د.ل</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                <th className="text-right p-3 font-medium">المرجع</th>
                <th className="text-right p-3 font-medium">العامل</th>
                <th className="text-right p-3 font-medium">النوع</th>
                <th className="text-right p-3 font-medium">المبلغ (د.ل)</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-mono text-xs">{t.ref}</td>
                  <td className="p-3 font-medium">{t.worker}</td>
                  <td className="p-3">{t.type}</td>
                  <td className="p-3 font-semibold">{t.amount.toLocaleString("ar-LY")}</td>
                  <td className="p-3"><StatusBadge variant={t.status} /></td>
                  <td className="p-3 text-xs">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
