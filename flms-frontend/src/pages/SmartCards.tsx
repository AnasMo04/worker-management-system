import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Plus, Search, Ban, Link2, History, Shield, AlertTriangle, Wifi, CheckCircle2, Loader2 } from "lucide-react";

interface SmartCard {
  id: number;
  serial: string;
  worker: string | null;
  workerId: number | null;
  issue: string;
  expiry: string;
  status: "active" | "suspended" | "expired" | "pending";
  encryption: string;
  blacklistReason: string | null;
  history: { date: string; action: string; by: string }[];
}

const initialCards: SmartCard[] = [
  { id: 1, serial: "SC-2026-0001", worker: "محمد أحمد علي", workerId: 101, issue: "2026-01-15", expiry: "2027-01-15", status: "active", encryption: "v3.2", blacklistReason: null, history: [{ date: "2026-01-15", action: "إصدار بطاقة جديدة", by: "أحمد المدير" }, { date: "2026-01-15", action: "ربط بالعامل محمد أحمد علي", by: "أحمد المدير" }] },
  { id: 2, serial: "SC-2026-0002", worker: "عبدالله كمارا", workerId: 102, issue: "2026-01-20", expiry: "2027-01-20", status: "suspended", encryption: "v3.2", blacklistReason: "انتهاء الإقامة", history: [{ date: "2026-01-20", action: "إصدار بطاقة جديدة", by: "أحمد المدير" }, { date: "2026-02-10", action: "إيقاف البطاقة - انتهاء الإقامة", by: "النظام" }] },
  { id: 3, serial: "SC-2026-0003", worker: "راجيش كومار", workerId: 103, issue: "2025-11-05", expiry: "2026-11-05", status: "active", encryption: "v3.1", blacklistReason: null, history: [{ date: "2025-11-05", action: "إصدار بطاقة جديدة", by: "سالم العتيبي" }] },
  { id: 4, serial: "SC-2026-0004", worker: null, workerId: null, issue: "2025-08-12", expiry: "2026-08-12", status: "expired", encryption: "v3.0", blacklistReason: "هروب", history: [{ date: "2025-08-12", action: "إصدار بطاقة جديدة", by: "أحمد المدير" }, { date: "2025-10-01", action: "إلغاء الربط - هروب العامل", by: "النظام" }, { date: "2026-08-12", action: "انتهاء صلاحية البطاقة", by: "النظام" }] },
  { id: 5, serial: "SC-2026-0005", worker: "جون مارك", workerId: 105, issue: "2026-02-01", expiry: "2027-02-01", status: "active", encryption: "v3.2", blacklistReason: null, history: [{ date: "2026-02-01", action: "إصدار بطاقة جديدة", by: "خالد الفيصل" }] },
  { id: 6, serial: "SC-2026-0006", worker: null, workerId: null, issue: "2026-02-20", expiry: "2027-02-20", status: "pending", encryption: "v3.2", blacklistReason: null, history: [{ date: "2026-02-20", action: "إصدار بطاقة جديدة - في انتظار الربط", by: "أحمد المدير" }] },
];

const availableWorkers = [
  { id: 201, name: "علي حسن محمود" },
  { id: 202, name: "سعيد عمر بشير" },
  { id: 203, name: "يوسف إبراهيم" },
];

export default function SmartCards() {
  const [cards, setCards] = useState<SmartCard[]>(initialCards);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [issueOpen, setIssueOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SmartCard | null>(null);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const filtered = cards.filter((c) => {
    const matchesSearch = !search || c.serial.includes(search) || (c.worker && c.worker.includes(search));
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: cards.length,
    active: cards.filter((c) => c.status === "active").length,
    suspended: cards.filter((c) => c.status === "suspended").length,
    pending: cards.filter((c) => c.status === "pending").length,
  };

  const [issueStep, setIssueStep] = useState<"prompt" | "reading" | "done">("prompt");

  const handleIssueCard = () => {
    setIssueStep("reading");
    // Simulate NFC reader detection
    setTimeout(() => {
      const newCard: SmartCard = {
        id: cards.length + 1,
        serial: `SC-2026-${String(cards.length + 1).padStart(4, "0")}`,
        worker: null,
        workerId: null,
        issue: new Date().toISOString().split("T")[0],
        expiry: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
        status: "pending",
        encryption: "v3.2",
        blacklistReason: null,
        history: [{ date: new Date().toISOString().split("T")[0], action: "إصدار بطاقة جديدة - في انتظار الربط", by: "المستخدم الحالي" }],
      };
      setCards([newCard, ...cards]);
      setIssueStep("done");
    }, 3000);
  };

  const handleLinkWorker = () => {
    if (!selectedCard || !selectedWorker) return;
    const worker = availableWorkers.find((w) => w.id === Number(selectedWorker));
    if (!worker) return;
    setCards(cards.map((c) =>
      c.id === selectedCard.id
        ? { ...c, worker: worker.name, workerId: worker.id, status: "active" as const, history: [...c.history, { date: new Date().toISOString().split("T")[0], action: `ربط بالعامل ${worker.name}`, by: "المستخدم الحالي" }] }
        : c
    ));
    setLinkOpen(false);
    setSelectedWorker("");
  };

  const handleCancelCard = () => {
    if (!selectedCard || !cancelReason) return;
    setCards(cards.map((c) =>
      c.id === selectedCard.id
        ? { ...c, status: "suspended" as const, blacklistReason: cancelReason, worker: null, workerId: null, history: [...c.history, { date: new Date().toISOString().split("T")[0], action: `إلغاء البطاقة - ${cancelReason}`, by: "المستخدم الحالي" }] }
        : c
    ));
    setCancelOpen(false);
    setCancelReason("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة البطاقات الذكية</h2>
          <p className="text-muted-foreground text-sm">إصدار وإدارة بطاقات NFC للعمال</p>
        </div>
        <Button onClick={() => setIssueOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إصدار بطاقة جديدة
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إجمالي البطاقات", value: stats.total, icon: CreditCard, color: "text-primary" },
          { label: "بطاقات نشطة", value: stats.active, icon: Shield, color: "text-success" },
          { label: "بطاقات موقوفة", value: stats.suspended, icon: Ban, color: "text-destructive" },
          { label: "في انتظار الربط", value: stats.pending, icon: Link2, color: "text-warning" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-muted ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث بالرقم التسلسلي أو اسم العامل..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="active">نشطة</TabsTrigger>
            <TabsTrigger value="suspended">موقوفة</TabsTrigger>
            <TabsTrigger value="pending">معلّقة</TabsTrigger>
            <TabsTrigger value="expired">منتهية</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                <th className="text-right p-3 font-medium">الرقم التسلسلي</th>
                <th className="text-right p-3 font-medium">العامل</th>
                <th className="text-right p-3 font-medium">تاريخ الإصدار</th>
                <th className="text-right p-3 font-medium">تاريخ الانتهاء</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">التشفير</th>
                <th className="text-right p-3 font-medium">سبب الحظر</th>
                <th className="text-right p-3 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">لا توجد بطاقات مطابقة</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{c.serial}</td>
                    <td className="p-3 font-medium">{c.worker || <span className="text-muted-foreground italic">غير مرتبطة</span>}</td>
                    <td className="p-3">{c.issue}</td>
                    <td className="p-3">{c.expiry}</td>
                    <td className="p-3">
                      <StatusBadge
                        variant={c.status === "pending" ? "pending" : c.status === "active" ? "active" : c.status === "suspended" ? "suspended" : "expired"}
                        label={c.status === "pending" ? "معلّقة" : c.status === "active" ? "نشطة" : c.status === "suspended" ? "موقوفة" : "منتهية"}
                      />
                    </td>
                    <td className="p-3 font-mono text-xs">{c.encryption}</td>
                    <td className="p-3 text-xs text-muted-foreground">{c.blacklistReason || "—"}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {(c.status === "pending" || (!c.worker && c.status !== "expired" && c.status !== "suspended")) && (
                          <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => { setSelectedCard(c); setLinkOpen(true); }}>
                            <Link2 className="h-3 w-3" /> ربط
                          </Button>
                        )}
                        {(c.status === "active" || c.status === "pending") && (
                          <Button size="sm" variant="outline" className="gap-1 text-xs h-7 text-destructive hover:text-destructive" onClick={() => { setSelectedCard(c); setCancelOpen(true); }}>
                            <Ban className="h-3 w-3" /> إلغاء
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="gap-1 text-xs h-7" onClick={() => { setSelectedCard(c); setHistoryOpen(true); }}>
                          <History className="h-3 w-3" /> السجل
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue New Card Dialog */}
      <Dialog open={issueOpen} onOpenChange={(o) => { if (!o && issueStep !== "reading") { setIssueOpen(false); setIssueStep("prompt"); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إصدار بطاقة NFC جديدة</DialogTitle>
            <DialogDescription>
              {issueStep === "prompt" && "ضع البطاقة على جهاز القراءة NFC ثم اضغط بدء القراءة."}
              {issueStep === "reading" && "جارٍ قراءة البطاقة..."}
              {issueStep === "done" && "تم إصدار البطاقة بنجاح!"}
            </DialogDescription>
          </DialogHeader>

          {issueStep === "prompt" && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-muted/50 border border-border">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Wifi className="h-10 w-10 text-primary" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-semibold">ضع البطاقة على جهاز القراءة</p>
                  <p className="text-xs text-muted-foreground">تأكد من وضع البطاقة بشكل صحيح على جهاز NFC Reader</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                <CreditCard className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <p className="font-mono text-sm font-semibold">SC-2026-{String(cards.length + 1).padStart(4, "0")}</p>
                  <p className="text-xs text-muted-foreground">إصدار التشفير: v3.2</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-warning">البطاقة ستكون في حالة انتظار حتى يتم ربطها بعامل مسجّل في النظام.</p>
              </div>
            </div>
          )}

          {issueStep === "reading" && (
            <div className="flex flex-col items-center gap-5 py-8">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
              <div className="text-center space-y-2 w-full">
                <p className="font-semibold">جارٍ قراءة بيانات البطاقة...</p>
                <p className="text-xs text-muted-foreground">يرجى عدم إزالة البطاقة من جهاز القراءة</p>
                <Progress value={66} className="mt-3" />
              </div>
            </div>
          )}

          {issueStep === "done" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-success">تم إصدار البطاقة بنجاح</p>
                <p className="font-mono text-sm">SC-2026-{String(cards.length).padStart(4, "0")}</p>
                <p className="text-xs text-muted-foreground">البطاقة في انتظار الربط بعامل</p>
              </div>
            </div>
          )}

          <DialogFooter>
            {issueStep === "prompt" && (
              <>
                <Button variant="outline" onClick={() => { setIssueOpen(false); setIssueStep("prompt"); }}>إلغاء</Button>
                <Button onClick={handleIssueCard} className="gap-2"><Wifi className="h-4 w-4" /> بدء القراءة</Button>
              </>
            )}
            {issueStep === "done" && (
              <Button onClick={() => { setIssueOpen(false); setIssueStep("prompt"); }} className="gap-2"><CheckCircle2 className="h-4 w-4" /> تم</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Worker Dialog */}
      <Dialog open={linkOpen} onOpenChange={(o) => { setLinkOpen(o); if (!o) setSelectedWorker(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ربط البطاقة بعامل</DialogTitle>
            <DialogDescription>اختر العامل لربطه بالبطاقة {selectedCard?.serial}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Select value={selectedWorker} onValueChange={setSelectedWorker}>
              <SelectTrigger>
                <SelectValue placeholder="اختر العامل..." />
              </SelectTrigger>
              <SelectContent>
                {availableWorkers.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkOpen(false)}>إلغاء</Button>
            <Button onClick={handleLinkWorker} disabled={!selectedWorker} className="gap-2"><Link2 className="h-4 w-4" /> ربط البطاقة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Card Dialog */}
      <Dialog open={cancelOpen} onOpenChange={(o) => { setCancelOpen(o); if (!o) setCancelReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إلغاء البطاقة</DialogTitle>
            <DialogDescription>هل أنت متأكد من إلغاء البطاقة {selectedCard?.serial}؟ هذا الإجراء لا يمكن التراجع عنه.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Select value={cancelReason} onValueChange={setCancelReason}>
              <SelectTrigger>
                <SelectValue placeholder="سبب الإلغاء..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="انتهاء الإقامة">انتهاء الإقامة</SelectItem>
                <SelectItem value="هروب">هروب العامل</SelectItem>
                <SelectItem value="تلف البطاقة">تلف البطاقة</SelectItem>
                <SelectItem value="فقدان البطاقة">فقدان البطاقة</SelectItem>
                <SelectItem value="إنهاء العقد">إنهاء العقد</SelectItem>
                <SelectItem value="أخرى">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>تراجع</Button>
            <Button variant="destructive" onClick={handleCancelCard} disabled={!cancelReason} className="gap-2"><Ban className="h-4 w-4" /> تأكيد الإلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Card History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>سجل البطاقة {selectedCard?.serial}</DialogTitle>
            <DialogDescription>{selectedCard?.worker ? `مرتبطة بـ: ${selectedCard.worker}` : "غير مرتبطة بعامل"}</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="relative space-y-0">
              {selectedCard?.history.map((h, i) => (
                <div key={i} className="flex gap-3 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {i < (selectedCard?.history.length ?? 0) - 1 && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-medium">{h.action}</p>
                    <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{h.date}</span>
                      <span>•</span>
                      <span>{h.by}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
