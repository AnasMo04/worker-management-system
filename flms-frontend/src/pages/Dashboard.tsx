import { formatDate, formatDateTime, formatNumber } from "../utils/formatDate";
import { useState, useEffect } from "react";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { Users, CreditCard, Scale, Wallet } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from "recharts";
import api from "../api/axiosConfig";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  "active": "hsl(152, 60%, 40%)",
  "suspended": "hsl(38, 92%, 50%)",
  "expired": "hsl(215, 15%, 50%)",
  "runaway": "hsl(0, 72%, 51%)",
  "نشط": "hsl(152, 60%, 40%)",
  "موقوف": "hsl(38, 92%, 50%)",
  "منتهي": "hsl(215, 15%, 50%)",
  "هارب": "hsl(0, 72%, 51%)",
};

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/dashboard/summary");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحميل بيانات لوحة التحكم. تأكد من تسجيل الدخول."
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">جاري تحميل لوحة التحكم...</div>;
  }

  const statusData = data?.statusBreakdown?.map((item: any) => ({
    name: item.Current_Status,
    value: parseInt(item.count),
    color: statusColors[item.Current_Status] || "hsl(215, 15%, 50%)"
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">لوحة التحكم</h2>
        <p className="text-muted-foreground text-sm">نظرة عامة على نظام إدارة العمالة الأجنبية</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="إجمالي العمال"
          value={data?.counts?.totalWorkers || 0}
          icon={<Users />}
          gradient="kpi-gradient-1"
          change="محدث الآن"
        />
        <KPICard
          title="البطاقات النشطة"
          value={data?.counts?.activeCards || 0}
          icon={<CreditCard />}
          gradient="kpi-gradient-2"
          change={`${data?.counts?.totalWorkers ? Math.round((data?.counts?.activeCards / data?.counts?.totalWorkers) * 100) : 0}% من الإجمالي`}
        />
        <KPICard
          title="القضايا المفتوحة"
          value={data?.counts?.openLegalCases || 0}
          icon={<Scale />}
          gradient="kpi-gradient-3"
          change="قضايا قيد المتابعة"
        />
        <KPICard
          title="مدفوعات معلقة"
          value={formatNumber(data?.counts?.pendingPayments || 0)}
          icon={<Wallet />}
          gradient="kpi-gradient-4"
          change="دينار ليبي"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inspections */}
        <div className="lg:col-span-2 bg-card rounded-lg border border-border shadow-sm">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold">آخر عمليات التفتيش</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">ميداني</span>
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
                {!data?.recentInspections || data.recentInspections.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground italic">لا توجد عمليات تفتيش حديثة</td></tr>
                ) : (
                  data.recentInspections.map((item: any) => (
                    <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{item.Worker?.Full_Name || "—"}</td>
                      <td className="p-3">{item.User?.Name || "—"}</td>
                      <td className="p-3 font-mono text-xs">{item.Device_ID || "—"}</td>
                      <td className="p-3 text-muted-foreground text-xs">
                        {formatDateTime(item.Scan_Time)}
                      </td>
                      <td className="p-3"><StatusBadge variant={item.Result as any} /></td>
                    </tr>
                  ))
                )}
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
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ direction: 'rtl', textAlign: 'right' }}
                    formatter={(value: number) => [formatNumber(value), "العدد"]}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm italic">
                لا توجد بيانات متاحة للمخطط
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Audit */}
      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">آخر النشاطات على النظام</h3>
        </div>
        <div className="p-4 space-y-4">
          {!data?.recentAuditLogs || data.recentAuditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4 italic">لا توجد نشاطات حديثة مسجلة</p>
          ) : (
            data.recentAuditLogs.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 group">
                <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors shrink-0" />
                <div className="flex-1 border-b border-border/50 pb-2 group-last:border-0">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{item.User?.Name || "نظام"}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{item.Action_Type}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
