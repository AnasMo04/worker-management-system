import { useState, useEffect, useRef } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Plus, Search, Ban, Link2, History, Shield, AlertTriangle, Wifi, CheckCircle2, Loader2 } from "lucide-react";
import api from "../api/axiosConfig";
import { useToast } from "@/hooks/use-toast";

interface SmartCard {
  id: number;
  Card_Serial_No: string;
  Worker: { Full_Name: string } | null;
  Worker_ID: number | null;
  Issue_Date: string;
  Expiry_Date: string;
  Is_Active: boolean;
  Encryption_Version: string;
  Blacklist_Reason: string | null;
  history?: { date: string; action: string; by: string }[];
}

interface Worker {
  id: number;
  Full_Name: string;
}

export default function SmartCards() {
  const [cards, setCards] = useState<SmartCard[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [issueOpen, setIssueOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SmartCard | null>(null);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [issueStep, setIssueStep] = useState<"prompt" | "reading" | "done">("prompt");
  const [nfcUid, setNfcUid] = useState("");
  const [readingValue, setReadingValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCards();
    fetchWorkers();
  }, []);

  useEffect(() => {
    if (issueStep === "reading" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [issueStep]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/smart-cards");
      setCards(response.data);
    } catch (error) {
      console.error("Error fetching cards:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل في تحميل البطاقات." });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    try {
      const response = await api.get("/api/workers");
      setAvailableWorkers(response.data);
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  const filtered = cards.filter((c) => {
    const matchesSearch = !search || c.Card_Serial_No.toLowerCase().includes(search.toLowerCase()) || (c.Worker && c.Worker.Full_Name.toLowerCase().includes(search.toLowerCase()));
    const status = c.Is_Active ? "active" : "pending"; // Simplified for filter
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: cards.length,
    active: cards.filter((c) => c.Is_Active).length,
    suspended: 0, // Mocked for now
    pending: cards.filter((c) => !c.Is_Active).length,
  };

  const handleIssueCard = () => {
    setIssueStep("reading");
    setReadingValue("");
  };

  const processIssuance = async (serialNumber: string) => {
    try {
      // Check for duplicates
      const dupResponse = await api.get(`/api/smart-cards/check-duplicate?nfc_uid=${serialNumber}`);
      if (dupResponse.data.isDuplicate) {
        toast({ variant: "destructive", title: "خطأ", description: "هذه البطاقة مسجلة مسبقاً في النظام." });
        setIssueStep("prompt");
        return;
      }

      // Issue card
      const response = await api.post("/api/smart-cards/issue", {
        nfc_uid: serialNumber,
        encryption_version: "v3.2"
      });

      setNfcUid(serialNumber);
      setCards([response.data, ...cards]);
      setIssueStep("done");
      toast({ title: "نجاح", description: "تم إصدار البطاقة بنجاح." });
    } catch (err) {
      console.error("API Error during issuance:", err);
      toast({ variant: "destructive", title: "خطأ", description: "فشل في تسجيل البطاقة في النظام." });
      setIssueStep("prompt");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && readingValue) {
      processIssuance(readingValue);
    }
  };

  const handleLinkWorker = async () => {
    if (!selectedCard || !selectedWorker) return;
    try {
      await api.post("/api/smart-cards/link", {
        card_id: selectedCard.id,
        worker_id: parseInt(selectedWorker)
      });

      toast({ title: "تم الربط", description: "تم ربط البطاقة بالعامل بنجاح." });
      setLinkOpen(false);
      setSelectedWorker("");
      fetchCards();
    } catch (error: any) {
      console.error("Linking error:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.response?.data?.message || "فشل في ربط البطاقة."
      });
    }
  };

  const handleCancelCard = async () => {
    if (!selectedCard || !cancelReason) return;
    try {
      await api.post(`/api/smart-cards/cancel/${selectedCard.id}`, {
        reason: cancelReason
      });
      toast({ title: "تم الإلغاء", description: "تم إلغاء البطاقة بنجاح." });
      setCancelOpen(false);
      setCancelReason("");
      fetchCards();
    } catch (error) {
      console.error("Cancellation error:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل في إلغاء البطاقة." });
    }
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
              {loading ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">جاري التحميل...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">لا توجد بطاقات مطابقة</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{c.Card_Serial_No}</td>
                    <td className="p-3 font-medium">{c.Worker?.Full_Name || <span className="text-muted-foreground italic">غير مرتبطة</span>}</td>
                    <td className="p-3">{c.Issue_Date}</td>
                    <td className="p-3">{c.Expiry_Date}</td>
                    <td className="p-3">
                      <StatusBadge
                        variant={!c.Is_Active ? "pending" : "active"}
                        label={!c.Is_Active ? "معلّقة" : "نشطة"}
                      />
                    </td>
                    <td className="p-3 font-mono text-xs">{c.Encryption_Version}</td>
                    <td className="p-3 text-xs text-muted-foreground">{c.Blacklist_Reason || "—"}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {!c.Is_Active && (
                          <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => { setSelectedCard(c); setLinkOpen(true); }}>
                            <Link2 className="h-3 w-3" /> ربط
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="gap-1 text-xs h-7 text-destructive hover:text-destructive" onClick={() => { setSelectedCard(c); setCancelOpen(true); }}>
                          <Ban className="h-3 w-3" /> إلغاء
                        </Button>
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
      <Dialog open={issueOpen} onOpenChange={(o) => { if (!o) { setIssueOpen(false); setIssueStep("prompt"); setReadingValue(""); } else { setIssueOpen(true); } }}>
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
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-warning">البطاقة ستكون في حالة انتظار حتى يتم ربطها بعامل مسجّل في النظام.</p>
              </div>
            </div>
          )}

          {issueStep === "reading" && (
            <div className="flex flex-col items-center gap-5 py-8">
              <input
                ref={inputRef}
                type="text"
                value={readingValue}
                onChange={(e) => setReadingValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onBlur={() => inputRef.current?.focus()}
                className="absolute opacity-0 pointer-events-none"
                autoFocus
              />
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
              <div className="text-center space-y-2 w-full">
                <p className="font-semibold">جارٍ قراءة بيانات البطاقة...</p>
                <p className="text-xs text-muted-foreground">يرجى وضع البطاقة على جهاز القراءة</p>
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
                <p className="font-mono text-sm">UID: {nfcUid}</p>
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
            <DialogDescription>اختر العامل لربطه بالبطاقة {selectedCard?.Card_Serial_No}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Select value={selectedWorker} onValueChange={setSelectedWorker}>
              <SelectTrigger>
                <SelectValue placeholder="اختر العامل..." />
              </SelectTrigger>
              <SelectContent>
                {availableWorkers.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>{w.Full_Name}</SelectItem>
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
            <DialogDescription>هل أنت متأكد من إلغاء البطاقة {selectedCard?.Card_Serial_No}؟ هذا الإجراء لا يمكن التراجع عنه.</DialogDescription>
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
            <DialogTitle>سجل البطاقة {selectedCard?.Card_Serial_No}</DialogTitle>
            <DialogDescription>{selectedCard?.Worker ? `مرتبطة بـ: ${selectedCard.Worker.Full_Name}` : "غير مرتبطة بعامل"}</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="relative space-y-0">
              {selectedCard?.history?.map((h, i) => (
                <div key={i} className="flex gap-3 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    {i < (selectedCard?.history?.length ?? 0) - 1 && <div className="w-px flex-1 bg-border" />}
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
              {(!selectedCard?.history || selectedCard.history.length === 0) && (
                <p className="text-center text-muted-foreground text-sm py-4">لا يوجد سجل لهذه البطاقة</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
