import { formatDate, formatDateTime } from "../../utils/formatDate";
import { useState } from "react";
import { ArrowRight, MapPin, Clock, WifiOff, Send, User } from "lucide-react";
import { ScannedWorker } from "@/pages/SecurityApp";

interface Props {
  worker: ScannedWorker | null;
  onBack: () => void;
  onSubmit: () => void;
}

export function SecurityInspectionForm({ worker, onBack, onSubmit }: Props) {
  const [result, setResult] = useState("valid");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSubmit();
    }, 1500);
  };

  const now = new Date();

  const results = [
    { value: "valid", label: "صالح", color: "hsl(152,60%,40%)" },
    { value: "violation", label: "مخالفة", color: "hsl(0,72%,51%)" },
    { value: "expired", label: "منتهي", color: "hsl(38,92%,50%)" },
    { value: "suspended", label: "موقوف", color: "hsl(38,85%,55%)" },
    { value: "unknown", label: "غير معروف", color: "hsl(210,20%,50%)" },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[hsl(220,30%,7%)] pt-10">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <button onClick={onBack} className="w-9 h-9 rounded-lg bg-[hsl(220,25%,12%)] flex items-center justify-center text-[hsl(210,20%,60%)]">
          <ArrowRight className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-bold text-[hsl(210,20%,95%)]">تسجيل تفتيش</h2>
        <div className="w-9" />
      </div>

      <div className="px-5 flex-1 pb-10 space-y-4">
        {/* Worker Info (auto-filled) */}
        {worker && (
          <div className="flex items-center gap-3 bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] rounded-xl p-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(220,25%,18%)] flex items-center justify-center">
              <User className="w-5 h-5 text-[hsl(210,20%,50%)]" />
            </div>
            <div>
              <p className="text-sm text-[hsl(210,20%,90%)] font-medium">{worker.name}</p>
              <p className="text-[10px] text-[hsl(210,20%,40%)]">{worker.passport} • {worker.nationality}</p>
            </div>
          </div>
        )}

        {/* GPS & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-[hsl(175,55%,50%)]" />
              <span className="text-[10px] text-[hsl(210,20%,45%)]">الموقع GPS</span>
            </div>
            <p className="text-xs text-[hsl(210,20%,85%)] font-medium">24.4539° N</p>
            <p className="text-[10px] text-[hsl(210,20%,60%)]">54.3773° E</p>
          </div>
          <div className="bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-[hsl(175,55%,50%)]" />
              <span className="text-[10px] text-[hsl(210,20%,45%)]">وقت المسح</span>
            </div>
            <p className="text-xs text-[hsl(210,20%,85%)] font-medium">{formatDateTime(now).split(" ")[1].substring(0, 5)}</p>
            <p className="text-[10px] text-[hsl(210,20%,60%)]">{formatDate(now)}</p>
          </div>
        </div>

        {/* Result */}
        <div>
          <p className="text-xs text-[hsl(210,20%,45%)] mb-2 font-semibold">نتيجة التفتيش</p>
          <div className="flex flex-wrap gap-2">
            {results.map((r) => (
              <button
                key={r.value}
                onClick={() => setResult(r.value)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  result === r.value
                    ? "border-[hsl(175,55%,50%)] bg-[hsl(175,55%,50%)/0.15] text-[hsl(175,55%,50%)]"
                    : "border-[hsl(220,20%,20%)] bg-[hsl(220,25%,12%)] text-[hsl(210,20%,55%)]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs text-[hsl(210,20%,45%)] mb-2 font-semibold">ملاحظات</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="أدخل ملاحظات التفتيش..."
            className="w-full bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,20%)] rounded-xl p-3 text-sm text-[hsl(210,20%,90%)] placeholder:text-[hsl(210,20%,30%)] outline-none focus:border-[hsl(175,55%,50%)] transition-colors resize-none"
          />
        </div>

        {/* Offline indicator */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(38,92%,50%)/0.1] border border-[hsl(38,92%,50%)/0.2]">
          <WifiOff className="w-3.5 h-3.5 text-[hsl(38,92%,50%)]" />
          <span className="text-[10px] text-[hsl(38,92%,50%)] font-medium">يعمل في وضع عدم الاتصال</span>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-12 bg-[hsl(175,55%,50%)] hover:bg-[hsl(175,55%,45%)] disabled:opacity-60 text-[hsl(220,30%,7%)] font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-[hsl(220,30%,7%)] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              إرسال التقرير
            </>
          )}
        </button>
      </div>
    </div>
  );
}
