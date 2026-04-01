import { StatusBadge } from "@/components/StatusBadge";

const users = [
  { id: 1, name: "أحمد المنصوري", email: "ahmed@flms.gov.ly", role: "admin" as const, lastLogin: "2026-02-23 08:00" },
  { id: 2, name: "خالد السعيدي", email: "khaled@flms.gov.ly", role: "officer" as const, lastLogin: "2026-02-23 07:45" },
  { id: 3, name: "سالم العبيدي", email: "salem@flms.gov.ly", role: "officer" as const, lastLogin: "2026-02-23 08:30" },
  { id: 4, name: "أحمد الفقيه", email: "afaqih@flms.gov.ly", role: "officer" as const, lastLogin: "2026-02-22 16:00" },
  { id: 5, name: "مريم الشريف", email: "mariam@flms.gov.ly", role: "clerk" as const, lastLogin: "2026-02-22 14:00" },
  { id: 6, name: "فاطمة بن عمر", email: "fatima@flms.gov.ly", role: "auditor" as const, lastLogin: "2026-02-21 10:30" },
  { id: 7, name: "عمر الزاوي", email: "omar@flms.gov.ly", role: "ministry" as const, lastLogin: "2026-02-20 09:00" },
];

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">المستخدمون</h2>
          <p className="text-muted-foreground text-sm">إدارة مستخدمي النظام وصلاحياتهم</p>
        </div>
        <button className="h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          + إضافة مستخدم
        </button>
      </div>
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                <th className="text-right p-3 font-medium">الاسم</th>
                <th className="text-right p-3 font-medium">البريد الإلكتروني</th>
                <th className="text-right p-3 font-medium">الدور</th>
                <th className="text-right p-3 font-medium">آخر دخول</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 font-mono text-xs">{u.email}</td>
                  <td className="p-3"><StatusBadge variant={u.role} /></td>
                  <td className="p-3 text-xs">{u.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
