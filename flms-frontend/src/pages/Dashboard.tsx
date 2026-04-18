import { useState, useEffect } from "react";
import { formatDateTime, formatNumber, formatTime } from "../utils/formatDate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Users, CreditCard, ShieldAlert, Wallet,
  TrendingUp, Clock, Activity
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import api from "../api/axiosConfig";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/dashboard/summary");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">جاري تحميل لوحة التحكم...</div>;

  const statusColors: any = {
    "نشط": "#10b981",
    "موقوف": "#f59e0b",
    "مرحّل": "#ef4444",
    "خارج البلاد": "#64748b"
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">نظرة عامة</h2>
        <p className="text-muted-foreground text-sm">إحصائيات المنظومة والنشاط الأخير</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="إجمالي الأجانب"
          value={formatNumber(data?.counts?.workers || 0)}
          icon={<Users className="h-5 w-5" />}
          trend="+12% من الشهر الماضي"
          color="text-primary"
        />
        <KPICard
          title="البطاقات النشطة"
          value={formatNumber(data?.counts?.activeCards || 0)}
          icon={<CreditCard className="h-5 w-5" />}
          color="text-success"
        />
        <KPICard
          title="القضايا المفتوحة"
          value={formatNumber(data?.counts?.openCases || 0)}
          icon={<ShieldAlert className="h-5 w-5" />}
          color="text-destructive"
        />
        <KPICard
          title="إجمالي المالية المعلقة"
          value={formatNumber(data?.counts?.pendingPayments || 0)}
          icon={<Wallet className="h-5 w-5" />}
          trend="د.ل"
          color="text-warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">توزيع الحالات (إحصائيات)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.statusBreakdown || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="status" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  cursor={{fill: 'hsl(var(--muted)/0.2)'}}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(value: number) => [formatNumber(value), "العدد"]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {(data?.statusBreakdown || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.status] || "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">آخر الفحوصات الميدانية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data?.recentLogs || []).map((item: any) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="p-2 rounded-full bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{item.Worker?.Full_Name || "عامل غير معروف"}</p>
                    <p className="text-[10px] text-muted-foreground">{item.Result || "تم الفحص بنجاح"}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {item.Scan_Time ? formatDateTime(item.Scan_Time) : "—"}
                    </div>
                  </div>
                </div>
              ))}
              {(data?.recentLogs || []).length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-10">لا توجد فحوصات حديثة</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">سجل النشاط التقني</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(data?.auditLogs || []).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0 border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{item.User?.Name || "نظام"}</p>
                      <p className="text-[10px] text-muted-foreground">{item.Action_Type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono">{formatDateTime(item.createdAt)}</p>
                  </div>
                </div>
              ))}
              {(data?.auditLogs || []).length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-10">لا توجد سجلات حديثة</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
