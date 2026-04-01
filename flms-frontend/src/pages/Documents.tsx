import { StatusBadge } from "@/components/StatusBadge";

const documents = [
  { id: 1, worker: "محمد أحمد علي", type: "جواز سفر", expiry: "2028-05-12", status: "active" as const },
  { id: 2, worker: "عبدالله كمارا", type: "إقامة", expiry: "2026-03-01", status: "pending" as const },
  { id: 3, worker: "راجيش كومار", type: "عقد عمل", expiry: "2027-11-05", status: "active" as const },
  { id: 4, worker: "فيكتور أونيكا", type: "تأمين صحي", expiry: "2025-08-12", status: "expired" as const },
  { id: 5, worker: "جون مارك", type: "شهادة مهنية", expiry: "2027-02-01", status: "active" as const },
];

export default function Documents() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">المستندات</h2>
        <p className="text-muted-foreground text-sm">إدارة مستندات ووثائق العمال</p>
      </div>
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                <th className="text-right p-3 font-medium">العامل</th>
                <th className="text-right p-3 font-medium">نوع المستند</th>
                <th className="text-right p-3 font-medium">تاريخ الانتهاء</th>
                <th className="text-right p-3 font-medium">حالة التحقق</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{d.worker}</td>
                  <td className="p-3">{d.type}</td>
                  <td className="p-3 text-xs">{d.expiry}</td>
                  <td className="p-3"><StatusBadge variant={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
