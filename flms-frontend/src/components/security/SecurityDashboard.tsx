import { SecurityScreen } from "@/pages/SecurityApp";
import {
  Shield, CreditCard, Search, ClipboardList, Scale,
  User, Smartphone, Wifi, WifiOff, Bell, ChevronLeft,
  AlertTriangle, CheckCircle2, Clock,
} from "lucide-react";

interface Props {
  navigate: (s: SecurityScreen) => void;
}

export function SecurityDashboard({ navigate }: Props) {
  const stats = [
    { label: "تفتيش اليوم", value: "12", icon: ClipboardList, color: "hsl(175,55%,50%)" },
    { label: "مخالفات", value: "3", icon: AlertTriangle, color: "hsl(0,72%,51%)" },
    { label: "تنبيهات نشطة", value: "5", icon: Bell, color: "hsl(38,92%,50%)" },
  ];

  const actions = [
    { label: "مسح بطاقة NFC", icon: CreditCard, screen: "nfc-scan" as SecurityScreen, primary: true },
    { label: "بحث يدوي", icon: Search, screen: "nfc-scan" as SecurityScreen, primary: false },
    { label: "سجلات التفتيش", icon: ClipboardList, screen: "field-logs" as SecurityScreen, primary: false },
    { label: "القضايا المفتوحة", icon: Scale, screen: "legal-cases" as SecurityScreen, primary: false },
  ];

  const recentScans = [
    { name: "محمد أحمد", time: "10:30 ص", status: "valid" },
    { name: "عبدالله سالم", time: "09:45 ص", status: "violation" },
    { name: "رحمن كريم", time: "09:15 ص", status: "valid" },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[hsl(220,30%,7%)] pt-10">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("profile")}
            className="w-10 h-10 rounded-full bg-[hsl(175,55%,50%)] flex items-center justify-center text-[hsl(220,30%,7%)] font-bold text-sm"
          >
            خ.أ
          </button>
          <div>
            <p className="text-sm font-bold text-[hsl(210,20%,95%)]">خالد الأحمدي</p>
            <p className="text-[10px] text-[hsl(210,20%,45%)]">رقم الشارة: OFF-2241</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[hsl(152,60%,40%)/0.15] border border-[hsl(152,60%,40%)/0.2]">
            <Wifi className="w-3 h-3 text-[hsl(152,60%,40%)]" />
            <span className="text-[9px] text-[hsl(152,60%,40%)] font-medium">متصل</span>
          </div>
          <button
            onClick={() => navigate("device-status")}
            className="w-9 h-9 rounded-lg bg-[hsl(220,25%,12%)] flex items-center justify-center text-[hsl(210,20%,50%)]"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 py-3 flex gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex-1 bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] rounded-xl p-3 text-center"
          >
            <s.icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: s.color }} />
            <p className="text-lg font-bold text-[hsl(210,20%,95%)]">{s.value}</p>
            <p className="text-[9px] text-[hsl(210,20%,45%)] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="px-5 py-3">
        <p className="text-xs text-[hsl(210,20%,45%)] mb-3 font-semibold">إجراءات سريعة</p>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => navigate(a.screen)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-colors ${
                a.primary
                  ? "bg-[hsl(175,55%,50%)] text-[hsl(220,30%,7%)]"
                  : "bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] text-[hsl(210,20%,75%)] hover:border-[hsl(175,55%,50%)/0.3]"
              }`}
            >
              <a.icon className="w-6 h-6" />
              <span className="text-xs font-semibold">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Scans */}
      <div className="px-5 py-3 flex-1">
        <p className="text-xs text-[hsl(210,20%,45%)] mb-3 font-semibold">آخر عمليات المسح</p>
        <div className="space-y-2">
          {recentScans.map((scan, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] rounded-xl p-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[hsl(220,25%,18%)] flex items-center justify-center">
                  <User className="w-4 h-4 text-[hsl(210,20%,50%)]" />
                </div>
                <div>
                  <p className="text-sm text-[hsl(210,20%,90%)] font-medium">{scan.name}</p>
                  <p className="text-[10px] text-[hsl(210,20%,40%)]">{scan.time}</p>
                </div>
              </div>
              {scan.status === "valid" ? (
                <CheckCircle2 className="w-5 h-5 text-[hsl(152,60%,40%)]" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-[hsl(0,72%,51%)]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="px-3 pb-8 pt-2">
        <div className="flex items-center justify-around bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] rounded-2xl py-2">
          {[
            { icon: Shield, label: "الرئيسية", screen: "dashboard" as SecurityScreen, active: true },
            { icon: ClipboardList, label: "السجلات", screen: "field-logs" as SecurityScreen, active: false },
            { icon: CreditCard, label: "مسح", screen: "nfc-scan" as SecurityScreen, active: false },
            { icon: Scale, label: "القضايا", screen: "legal-cases" as SecurityScreen, active: false },
            { icon: User, label: "حسابي", screen: "profile" as SecurityScreen, active: false },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.screen)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                item.active
                  ? "text-[hsl(175,55%,50%)]"
                  : "text-[hsl(210,20%,40%)] hover:text-[hsl(210,20%,60%)]"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
