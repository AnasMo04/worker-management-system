import { useState } from "react";
import { ArrowRight, Scale, ChevronLeft, Calendar, Tag } from "lucide-react";
import { formatDateTime } from "../../utils/formatDate";

interface Props {
  onBack: () => void;
}

const cases = [
  { id: "C-2026-001", type: "هروب من العمل", status: "open", date: "2026-02-20", worker: "محمد أحمد" },
  { id: "C-2026-002", type: "مخالفة إقامة", status: "review", date: "2026-02-18", worker: "عبدالله سالم" },
  { id: "C-2026-003", type: "تزوير مستندات", status: "closed", date: "2026-02-10", worker: "رحمن كريم" },
  { id: "C-2025-041", type: "عمالة غير نظامية", status: "open", date: "2026-01-28", worker: "سعيد حسن" },
];

const statusMap: Record<string, { label: string; color: string }> = {
  open: { label: "مفتوحة", color: "hsl(0,72%,51%)" },
  review: { label: "قيد المراجعة", color: "hsl(38,92%,50%)" },
  closed: { label: "مغلقة", color: "hsl(152,60%,40%)" },
};

export function SecurityLegalCases({ onBack }: Props) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? cases : cases.filter((c) => c.status === filter);

  return (
    <div className="flex flex-col min-h-full bg-[hsl(220,30%,7%)] pt-10">
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <button onClick={onBack} className="w-9 h-9 rounded-lg bg-[hsl(220,25%,12%)] flex items-center justify-center text-[hsl(210,20%,60%)]">
          <ArrowRight className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-bold text-[hsl(210,20%,95%)]">القضايا القانونية</h2>
        <div className="w-9" />
      </div>

      {/* Filters */}
      <div className="px-5 py-3 flex gap-2">
        {[
          { key: "all", label: "الكل" },
          { key: "open", label: "مفتوحة" },
          { key: "review", label: "قيد المراجعة" },
          { key: "closed", label: "مغلقة" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
              filter === f.key
                ? "bg-[hsl(175,55%,50%)] text-[hsl(220,30%,7%)]"
                : "bg-[hsl(220,25%,12%)] text-[hsl(210,20%,55%)] border border-[hsl(220,20%,18%)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Cases */}
      <div className="px-5 space-y-3 flex-1 pb-10">
        {filtered.map((c) => {
          const s = statusMap[c.status];
          return (
            <div
              key={c.id}
              className="bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[hsl(210,20%,90%)] font-bold">{c.id}</span>
                <span
                  className="px-2 py-0.5 rounded-md text-[9px] font-semibold border"
                  style={{
                    color: s.color,
                    backgroundColor: `${s.color.replace(")", "/0.12)")}`,
                    borderColor: `${s.color.replace(")", "/0.25)")}`,
                  }}
                >
                  {s.label}
                </span>
              </div>
              <p className="text-sm text-[hsl(210,20%,80%)] font-medium mb-2">{c.type}</p>
              <div className="flex items-center justify-between text-[10px] text-[hsl(210,20%,40%)]">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDateTime(c.date)}
                </div>
                <span>{c.worker}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
