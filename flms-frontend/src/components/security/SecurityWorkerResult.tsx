import { useState } from "react";
import { ScannedWorker, SecurityScreen } from "@/pages/SecurityApp";
import {
  ArrowRight, User, ShieldCheck, ClipboardList, AlertTriangle,
  FileText, Scale, Calendar, Globe, Briefcase, CreditCard,
  Image, Eye, ChevronDown, ChevronUp,
} from "lucide-react";

interface Props {
  worker: ScannedWorker;
  navigate: (s: SecurityScreen) => void;
  onBack: () => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "نشط", color: "hsl(152,60%,40%)" },
  expired: { label: "منتهي", color: "hsl(38,92%,50%)" },
  suspended: { label: "موقوف", color: "hsl(38,85%,55%)" },
  runaway: { label: "هارب", color: "hsl(0,72%,51%)" },
};

const workerDocuments = [
  { id: 1, label: "صورة جواز السفر", type: "image", icon: CreditCard },
  { id: 2, label: "الشهادة الصحية", type: "pdf", icon: FileText },
  { id: 3, label: "صورة الإقامة", type: "image", icon: FileText },
  { id: 4, label: "صورة شخصية", type: "image", icon: Image },
];

export function SecurityWorkerResult({ worker, navigate, onBack }: Props) {
  const sc = statusConfig[worker.status] || statusConfig.active;
  const [docsExpanded, setDocsExpanded] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-full bg-[hsl(220,30%,7%)] pt-10">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <button onClick={onBack} className="w-9 h-9 rounded-lg bg-[hsl(220,25%,12%)] flex items-center justify-center text-[hsl(210,20%,60%)]">
          <ArrowRight className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-bold text-[hsl(210,20%,95%)]">نتيجة التحقق</h2>
        <div className="w-9" />
      </div>

      <div className="px-5 flex-1 pb-10">
        {/* Worker Photo & Status */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-20 h-20 rounded-2xl bg-[hsl(220,25%,15%)] border-2 border-[hsl(220,20%,20%)] flex items-center justify-center mb-3">
            <User className="w-10 h-10 text-[hsl(210,20%,40%)]" />
          </div>
          <h3 className="text-base font-bold text-[hsl(210,20%,95%)]">{worker.name}</h3>
          <span
            className="mt-2 px-3 py-1 rounded-lg text-xs font-semibold border"
            style={{
              color: sc.color,
              backgroundColor: `${sc.color.replace(")", "/0.12)")}`,
              borderColor: `${sc.color.replace(")", "/0.25)")}`,
            }}
          >
            {sc.label}
          </span>
        </div>

        {/* Verification indicator */}
        <div className="flex items-center justify-center gap-2 mb-5 px-4 py-2 rounded-xl bg-[hsl(152,60%,40%)/0.1] border border-[hsl(152,60%,40%)/0.2]">
          <ShieldCheck className="w-4 h-4 text-[hsl(152,60%,40%)]" />
          <span className="text-[11px] text-[hsl(152,60%,40%)] font-medium">التشفير تم التحقق منه</span>
        </div>

        {/* Info Grid */}
        <div className="space-y-2 mb-4">
          {[
            { icon: CreditCard, label: "رقم الجواز", value: worker.passport },
            { icon: Globe, label: "الجنسية", value: worker.nationality },
            { icon: Briefcase, label: "الكفيل", value: worker.sponsor },
            { icon: Calendar, label: "تاريخ الإصدار", value: worker.cardIssue },
            { icon: Calendar, label: "تاريخ الانتهاء", value: worker.cardExpiry },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] rounded-xl p-3"
            >
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-[hsl(210,20%,40%)]" />
                <span className="text-xs text-[hsl(210,20%,50%)]">{item.label}</span>
              </div>
              <span className="text-xs text-[hsl(210,20%,90%)] font-medium">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Worker Documents Section */}
        <div className="mb-6">
          <button
            onClick={() => setDocsExpanded(!docsExpanded)}
            className="w-full flex items-center justify-between bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] rounded-xl p-3 mb-2"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[hsl(175,55%,50%)]" />
              <span className="text-xs font-semibold text-[hsl(210,20%,90%)]">المستندات المرفقة</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[hsl(175,55%,50%)/0.15] text-[hsl(175,55%,50%)] font-bold">{workerDocuments.length}</span>
            </div>
            {docsExpanded ? <ChevronUp className="w-4 h-4 text-[hsl(210,20%,50%)]" /> : <ChevronDown className="w-4 h-4 text-[hsl(210,20%,50%)]" />}
          </button>

          {docsExpanded && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              {workerDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between bg-[hsl(220,25%,10%)] border border-[hsl(220,20%,16%)] rounded-xl p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[hsl(175,55%,50%)/0.1] flex items-center justify-center">
                      <doc.icon className="w-4 h-4 text-[hsl(175,55%,50%)]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-[hsl(210,20%,85%)]">{doc.label}</p>
                      <p className="text-[9px] text-[hsl(210,20%,45%)]">
                        {doc.type === "image" ? "صورة" : "PDF"} • مرفق
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingDoc(viewingDoc === doc.label ? null : doc.label)}
                    className="w-8 h-8 rounded-lg bg-[hsl(220,25%,15%)] flex items-center justify-center text-[hsl(210,20%,55%)] active:scale-95 transition-transform"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Doc preview placeholder */}
          {viewingDoc && (
            <div className="mt-2 p-4 rounded-xl bg-[hsl(220,25%,10%)] border border-[hsl(220,20%,16%)] flex flex-col items-center gap-2 animate-in fade-in duration-200">
              <div className="w-full h-32 rounded-lg bg-[hsl(220,25%,14%)] flex items-center justify-center">
                <Image className="w-8 h-8 text-[hsl(210,20%,30%)]" />
              </div>
              <p className="text-[10px] text-[hsl(210,20%,50%)]">معاينة: {viewingDoc}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("inspection-form")}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[hsl(175,55%,50%)] text-[hsl(220,30%,7%)]"
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[10px] font-bold">تسجيل تفتيش</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[hsl(0,72%,51%)/0.15] border border-[hsl(0,72%,51%)/0.25] text-[hsl(0,72%,55%)]">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-[10px] font-bold">إبلاغ مخالفة</span>
          </button>
          <button
            onClick={() => navigate("legal-cases")}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] text-[hsl(210,20%,70%)]"
          >
            <Scale className="w-5 h-5" />
            <span className="text-[10px] font-semibold">القضايا</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,18%)] text-[hsl(210,20%,70%)]">
            <FileText className="w-5 h-5" />
            <span className="text-[10px] font-semibold">المستندات</span>
          </button>
        </div>
      </div>
    </div>
  );
}
