import { useState } from "react";
import { ArrowRight, Smartphone, RefreshCw, Wifi, WifiOff, Clock, Info } from "lucide-react";

interface Props {
  onBack: () => void;
}

export function SecurityDeviceStatus({ onBack }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [offline, setOffline] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-full bg-[hsl(220,30%,7%)] pt-10">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <button onClick={onBack} className="w-9 h-9 rounded-lg bg-[hsl(220,25%,12%)] flex items-center justify-center text-[hsl(210,20%,60%)]">
          <ArrowRight className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-bold text-[hsl(210,20%,95%)]">حالة الجهاز</h2>
        <div className="w-9" />
      </div>

      <div className="px-5 flex-1 pb-10 space-y-4">
        {/* Device Icon */}
        <div className="flex flex-col items-center py-6">
          <div className="w-16 h-16 rounded-2xl bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] flex items-center justify-center mb-3">
            <Smartphone className="w-8 h-8 text-[hsl(175,55%,50%)]" />
          </div>
          <p className="text-sm font-bold text-[hsl(210,20%,95%)]">DEV-SEC-0041</p>
          <p className="text-[10px] text-[hsl(210,20%,45%)]">Samsung Galaxy XCover 7</p>
        </div>

        {/* Info Cards */}
        {[
          { label: "رقم الجهاز", value: "DEV-SEC-0041", icon: Smartphone },
          { label: "آخر مزامنة", value: "اليوم 08:30 ص", icon: Clock },
          { label: "إصدار التطبيق", value: "v2.1.0 (Build 145)", icon: Info },
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

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full h-12 bg-[hsl(175,55%,50%)] hover:bg-[hsl(175,55%,45%)] disabled:opacity-60 text-[hsl(220,30%,7%)] font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "جاري المزامنة..." : "مزامنة الآن"}
        </button>

        {/* Offline Toggle */}
        <div className="flex items-center justify-between bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] rounded-xl p-3.5">
          <div className="flex items-center gap-2.5">
            {offline ? (
              <WifiOff className="w-4 h-4 text-[hsl(38,92%,50%)]" />
            ) : (
              <Wifi className="w-4 h-4 text-[hsl(152,60%,40%)]" />
            )}
            <span className="text-xs text-[hsl(210,20%,50%)]">وضع عدم الاتصال</span>
          </div>
          <button
            onClick={() => setOffline(!offline)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              offline ? "bg-[hsl(38,92%,50%)]" : "bg-[hsl(220,20%,25%)]"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                offline ? "left-0.5" : "left-[22px]"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
