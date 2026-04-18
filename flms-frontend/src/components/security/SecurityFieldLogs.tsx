import { useState } from "react";
import { ArrowRight, Search, CheckCircle2, AlertTriangle, Clock, Filter } from "lucide-react";
import { formatDateTime } from "../../utils/formatDate";

interface Props {
  onBack: () => void;
}

const logs = [
  { id: 1, worker: "محمد أحمد الشريف", time: "10:30 ص", date: "2026-02-25", result: "valid", location: "المنطقة الصناعية" },
  { id: 2, worker: "عبدالله سالم", time: "09:45 ص", date: "2026-02-25", result: "violation", location: "سوق المركزي" },
  { id: 3, worker: "رحمن كريم", time: "09:15 ص", date: "2026-02-25", result: "valid", location: "مجمع البناء" },
  { id: 4, worker: "سعيد حسن", time: "03:20 م", date: "2026-02-24", result: "expired", location: "منطقة المصانع" },
  { id: 5, worker: "أنور رشيد", time: "11:00 ص", date: "2026-02-24", result: "valid", location: "الميناء" },
];

export function SecurityFieldLogs({ onBack }: Props) {
  const [search, setSearch] = useState("");

  const filtered = logs.filter((l) =>
    l.worker.includes(search) || l.location.includes(search)
  );

  const resultIcon = (r: string) => {
    if (r === "valid") return <CheckCircle2 className="w-4 h-4 text-[hsl(152,60%,40%)]" />;
    if (r === "violation") return <AlertTriangle className="w-4 h-4 text-[hsl(0,72%,51%)]" />;
    return <Clock className="w-4 h-4 text-[hsl(38,92%,50%)]" />;
  };

  return (
    <div className="flex flex-col min-h-full bg-[hsl(220,30%,7%)] pt-10">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <button onClick={onBack} className="w-9 h-9 rounded-lg bg-[hsl(220,25%,12%)] flex items-center justify-center text-[hsl(210,20%,60%)]">
          <ArrowRight className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-bold text-[hsl(210,20%,95%)]">سجلات التفتيش</h2>
        <div className="w-9" />
      </div>

      {/* Search */}
      <div className="px-5 py-2">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(210,20%,35%)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الموقع..."
            className="w-full h-10 bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,20%)] rounded-xl pr-10 pl-4 text-xs text-[hsl(210,20%,90%)] placeholder:text-[hsl(210,20%,30%)] outline-none focus:border-[hsl(175,55%,50%)]"
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 flex-1 pb-10">
        {filtered.map((log, i) => (
          <div key={log.id} className="flex gap-3 mb-1">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-[hsl(175,55%,50%)] mt-3 shrink-0" />
              {i < filtered.length - 1 && <div className="w-0.5 flex-1 bg-[hsl(220,20%,18%)]" />}
            </div>
            {/* Card */}
            <div className="flex-1 bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] rounded-xl p-3 mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[hsl(210,20%,90%)] font-medium">{log.worker}</span>
                {resultIcon(log.result)}
              </div>
              <div className="flex items-center justify-between text-[10px] text-[hsl(210,20%,40%)]">
                <span>{log.location}</span>
                <span>{formatDateTime(`${log.date} ${log.time.replace(' ص', ' AM').replace(' م', ' PM')}`)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
