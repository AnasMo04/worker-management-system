import { useState, useEffect } from "react";
import { ArrowRight, CreditCard, Flashlight, X, Loader2, Wifi } from "lucide-react";

interface Props {
  onScanComplete: () => void;
  onBack: () => void;
}

export function SecurityNFCScan({ onScanComplete, onBack }: Props) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const startScan = () => {
    setScanning(true);
    setProgress(0);
  };

  useEffect(() => {
    if (!scanning) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onScanComplete, 300);
          return 100;
        }
        return p + 4;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [scanning, onScanComplete]);

  return (
    <div className="flex flex-col min-h-full bg-[hsl(220,30%,7%)] pt-10">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <button onClick={onBack} className="w-9 h-9 rounded-lg bg-[hsl(220,25%,12%)] flex items-center justify-center text-[hsl(210,20%,60%)]">
          <ArrowRight className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-bold text-[hsl(210,20%,95%)]">مسح بطاقة NFC</h2>
        <div className="w-9" />
      </div>

      {/* Scan Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="relative mb-8">
          {/* Pulse rings */}
          {scanning && (
            <>
              <div className="absolute inset-0 -m-6 rounded-full border-2 border-[hsl(175,55%,50%)/0.2] animate-ping" style={{ animationDuration: "2s" }} />
              <div className="absolute inset-0 -m-12 rounded-full border border-[hsl(175,55%,50%)/0.1] animate-ping" style={{ animationDuration: "2.5s" }} />
            </>
          )}
          <div
            className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 ${
              scanning
                ? "bg-[hsl(175,55%,50%)/0.15] border-2 border-[hsl(175,55%,50%)]"
                : "bg-[hsl(220,25%,12%)] border-2 border-[hsl(220,20%,20%)]"
            }`}
          >
            {scanning ? (
              <Wifi className="w-14 h-14 text-[hsl(175,55%,50%)] animate-pulse" />
            ) : (
              <CreditCard className="w-14 h-14 text-[hsl(210,20%,35%)]" />
            )}
          </div>
        </div>

        <h3 className="text-base font-bold text-[hsl(210,20%,95%)] mb-2">
          {scanning ? "جاري القراءة..." : "ضع البطاقة على الجهاز"}
        </h3>
        <p className="text-xs text-[hsl(210,20%,45%)] text-center mb-6">
          {scanning
            ? "يرجى عدم تحريك البطاقة حتى اكتمال القراءة"
            : "تأكد من تفعيل NFC في إعدادات الجهاز"}
        </p>

        {scanning && (
          <div className="w-full max-w-xs mb-6">
            <div className="h-1.5 bg-[hsl(220,25%,15%)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[hsl(175,55%,50%)] rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-[hsl(210,20%,40%)] text-center mt-2">{progress}%</p>
          </div>
        )}

        {/* NFC Status */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(152,60%,40%)/0.1] border border-[hsl(152,60%,40%)/0.2] mb-8">
          <div className="w-2 h-2 rounded-full bg-[hsl(152,60%,40%)] animate-pulse" />
          <span className="text-[10px] text-[hsl(152,60%,40%)] font-medium">NFC جاهز</span>
        </div>

        {!scanning ? (
          <button
            onClick={startScan}
            className="w-full max-w-xs h-12 bg-[hsl(175,55%,50%)] hover:bg-[hsl(175,55%,45%)] text-[hsl(220,30%,7%)] font-bold rounded-xl transition-colors text-sm"
          >
            بدء المسح
          </button>
        ) : (
          <button
            onClick={onBack}
            className="w-full max-w-xs h-12 bg-[hsl(220,25%,14%)] border border-[hsl(220,20%,22%)] text-[hsl(0,72%,55%)] font-semibold rounded-xl transition-colors text-sm"
          >
            إلغاء
          </button>
        )}
      </div>

      {/* Flashlight toggle */}
      <div className="px-5 pb-10 flex justify-center">
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(220,25%,12%)] text-[hsl(210,20%,50%)] text-xs">
          <Flashlight className="w-4 h-4" />
          الإضاءة
        </button>
      </div>
    </div>
  );
}
