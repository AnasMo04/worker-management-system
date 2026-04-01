import { ArrowRight, User, Shield, Smartphone, LogOut, Lock, ChevronLeft } from "lucide-react";

interface Props {
  onBack: () => void;
  onLogout: () => void;
}

export function SecurityProfile({ onBack, onLogout }: Props) {
  return (
    <div className="flex flex-col min-h-full bg-[hsl(220,30%,7%)] pt-10">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <button onClick={onBack} className="w-9 h-9 rounded-lg bg-[hsl(220,25%,12%)] flex items-center justify-center text-[hsl(210,20%,60%)]">
          <ArrowRight className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-bold text-[hsl(210,20%,95%)]">حسابي</h2>
        <div className="w-9" />
      </div>

      <div className="px-5 flex-1 pb-10">
        {/* Profile Card */}
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 rounded-full bg-[hsl(175,55%,50%)] flex items-center justify-center mb-3 text-[hsl(220,30%,7%)] text-xl font-bold">
            خ.أ
          </div>
          <h3 className="text-base font-bold text-[hsl(210,20%,95%)]">خالد الأحمدي</h3>
          <span className="mt-1 px-3 py-1 rounded-lg bg-[hsl(175,55%,50%)/0.12] border border-[hsl(175,55%,50%)/0.25] text-[10px] text-[hsl(175,55%,50%)] font-semibold">
            ضابط تفتيش ميداني
          </span>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-6">
          {[
            { icon: Shield, label: "الدور", value: "ضابط" },
            { icon: Smartphone, label: "الجهاز المخصص", value: "DEV-SEC-0041" },
            { icon: User, label: "رقم الشارة", value: "OFF-2241" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] rounded-xl p-3.5"
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="w-4 h-4 text-[hsl(210,20%,40%)]" />
                <span className="text-xs text-[hsl(210,20%,50%)]">{item.label}</span>
              </div>
              <span className="text-xs text-[hsl(210,20%,90%)] font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Security Settings */}
        <p className="text-xs text-[hsl(210,20%,45%)] mb-2 font-semibold">إعدادات الأمان</p>
        <div className="space-y-2 mb-8">
          <button className="w-full flex items-center justify-between bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] rounded-xl p-3.5 text-[hsl(210,20%,70%)]">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-[hsl(210,20%,40%)]" />
              <span className="text-xs">تغيير كلمة المرور</span>
            </div>
            <ChevronLeft className="w-4 h-4 text-[hsl(210,20%,30%)]" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full h-12 bg-[hsl(0,72%,51%)/0.12] border border-[hsl(0,72%,51%)/0.25] text-[hsl(0,72%,55%)] font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
