import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, Edit, Trash2, Shield, Search, Mail, Phone, Lock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { cn } from "@/lib/utils";

interface User {
  id: number;
  Name: string;
  Username: string;
  Email?: string;
  Phone?: string;
  Role: string;
  IsActive: boolean;
  Permissions: Record<string, string[]>;
  createdAt: string;
}

const permissionCategories = [
  { id: "workers", label: "الأجانب / العمال" },
  { id: "sponsors", label: "الجهات المستضيفة" },
  { id: "finance", label: "المالية" },
  { id: "smartcards", label: "البطاقات الذكية" },
  { id: "users", label: "المستخدمين" },
  { id: "reports", label: "التقارير" }
];

const permissionActions = [
  { id: "view", label: "عرض" },
  { id: "create", label: "إضافة" },
  { id: "edit", label: "تعديل" },
  { id: "delete", label: "حذف" }
];

const rolePresets: Record<string, Record<string, string[]>> = {
  admin: permissionCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: ["view", "create", "edit", "delete"] }), {}),
  officer: {
    workers: ["view", "create", "edit"],
    sponsors: ["view", "create", "edit"],
    smartcards: ["view", "create", "edit"],
    finance: ["view"],
    reports: ["view"]
  },
  auditor: {
    workers: ["view"],
    sponsors: ["view"],
    finance: ["view"],
    smartcards: ["view"],
    reports: ["view"]
  },
  clerk: {
    workers: ["view", "create"],
    sponsors: ["view", "create"],
    smartcards: ["view"]
  }
};

const emptyForm = {
  Name: "",
  Username: "",
  Password: "",
  Email: "",
  Phone: "",
  Role: "officer",
  IsActive: true,
  Permissions: {} as Record<string, string[]>
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { hasPermission, user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ variant: "destructive", title: "خطأ", description: "فشل في تحميل قائمة المستخدمين." });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role: string) => {
    setForm({
      ...form,
      Role: role,
      Permissions: rolePresets[role] || {}
    });
  };

  const togglePermission = (category: string, action: string) => {
    const current = form.Permissions[category] || [];
    const updated = current.includes(action)
      ? current.filter(a => a !== action)
      : [...current, action];

    setForm({
      ...form,
      Permissions: { ...form.Permissions, [category]: updated }
    });
  };

  const toggleCategory = (category: string, all: boolean) => {
    setForm({
      ...form,
      Permissions: {
        ...form.Permissions,
        [category]: all ? ["view", "create", "edit", "delete"] : []
      }
    });
  };

  const isCategoryAll = (category: string) => {
    return (form.Permissions[category] || []).length === 4;
  };

  const handleSubmit = async () => {
    if (!form.Name || !form.Username || (!editMode && !form.Password)) {
      toast({ variant: "destructive", title: "تنبيه", description: "يرجى ملء كافة الحقول الأساسية." });
      return;
    }

    try {
      setIsSaving(true);
      if (editMode && selectedId) {
        await api.put(`/api/users/${selectedId}`, form);
        toast({ title: "تم التحديث", description: "تم تحديث بيانات المستخدم بنجاح." });
      } else {
        await api.post("/api/users", form);
        toast({ title: "تمت الإضافة", description: "تم إنشاء المستخدم الجديد بنجاح." });
      }
      setModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: error.response.data.message || "فشل في حفظ البيانات." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditMode(true);
    setSelectedId(user.id);
    setForm({
      Name: user.Name,
      Username: user.Username,
      Password: "",
      Email: user.Email || "",
      Phone: user.Phone || "",
      Role: user.Role,
      IsActive: user.IsActive,
      Permissions: user.Permissions || {}
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المستخدم نهائياً؟")) return;
    try {
      await api.delete(`/api/users/${id}`);
      toast({ title: "تم الحذف", description: "تم حذف المستخدم من النظام." });
      fetchUsers();
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ", description: error.response.data.message || "فشل في الحذف." });
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditMode(false);
    setSelectedId(null);
  };

  const filtered = users.filter(u =>
    u.Name.toLowerCase().includes(search.toLowerCase()) ||
    u.Username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">المستخدمون والصلاحيات</h2>
          <p className="text-muted-foreground text-sm">إدارة حسابات موظفي المنظومة والأذونات الممنوحة لهم</p>
        </div>
        {hasPermission('users', 'create') && (
          <Button onClick={() => { resetForm(); setModalOpen(true); }} className="gap-2">
            <UserPlus className="h-4 w-4" />
            إضافة مستخدم
          </Button>
        )}
      </div>

      <div className="bg-card rounded-lg border border-border p-4 flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو اسم المستخدم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
        <span className="text-xs text-muted-foreground mr-auto">{filtered.length} مستخدم</span>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                <th className="text-right p-3 font-medium">الاسم الكامل</th>
                <th className="text-right p-3 font-medium">اسم المستخدم</th>
                <th className="text-right p-3 font-medium">الدور</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center">جاري التحميل...</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{u.Name}</td>
                  <td className="p-3 font-mono text-xs">{u.Username}</td>
                  <td className="p-3">
                    <StatusBadge variant={u.Role as any} label={u.Role === 'admin' ? 'مدير نظام' : u.Role === 'officer' ? 'ضابط' : u.Role === 'auditor' ? 'مدقق' : 'موظف'} />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <div className={cn("h-2 w-2 rounded-full", u.IsActive ? "bg-success" : "bg-destructive")} />
                      <span className="text-xs">{u.IsActive ? "نشط" : "موقوف"}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-1">
                      {hasPermission('users', 'edit') && (
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(u)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {hasPermission('users', 'delete') && u.id !== currentUser.id && (
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(u.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {editMode ? "تعديل صلاحيات المستخدم" : "إضافة مستخدم جديد للنظام"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <p className="text-sm font-bold border-b pb-2">المعلومات الأساسية</p>

              <div className="space-y-1.5">
                <Label>الاسم الكامل</Label>
                <div className="relative">
                  <Input value={form.Name} onChange={(e) => setForm({ ...form, Name: e.target.value })} className="pr-9" />
                  <UserPlus className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>اسم المستخدم</Label>
                <Input value={form.Username} onChange={(e) => setForm({ ...form, Username: e.target.value })} className="font-mono" />
              </div>

              <div className="space-y-1.5">
                <Label>{editMode ? "تغيير كلمة المرور (اختياري)" : "كلمة المرور"}</Label>
                <div className="relative">
                  <Input type="password" value={form.Password} onChange={(e) => setForm({ ...form, Password: e.target.value })} className="pr-9" />
                  <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>الدور الرئيسي</Label>
                  <Select value={form.Role} onValueChange={handleRoleChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">مدير نظام</SelectItem>
                      <SelectItem value="officer">ضابط</SelectItem>
                      <SelectItem value="auditor">مدقق</SelectItem>
                      <SelectItem value="clerk">موظف إدخال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                  <div className="flex items-center gap-2 h-10 border rounded-md px-3">
                    <Switch checked={form.IsActive} onCheckedChange={(v) => setForm({ ...form, IsActive: v })} />
                    <Label className="text-xs">حساب نشط</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label>البريد الإلكتروني</Label>
                <div className="relative">
                  <Input value={form.Email} onChange={(e) => setForm({ ...form, Email: e.target.value })} className="pr-9" />
                  <Mail className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>رقم الهاتف</Label>
                <div className="relative">
                  <Input value={form.Phone} onChange={(e) => setForm({ ...form, Phone: e.target.value })} className="pr-9" />
                  <Phone className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-bold border-b pb-2">صلاحيات الوصول التفصيلية</p>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {permissionCategories.map((cat) => (
                  <div key={cat.id} className="p-3 border rounded-xl bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{cat.label}</span>
                      <div className="flex items-center gap-2">
                        <Label className="text-[10px] text-muted-foreground">تحديد الكل</Label>
                        <Checkbox
                          checked={isCategoryAll(cat.id)}
                          onCheckedChange={(v) => toggleCategory(cat.id, !!v)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {permissionActions.map((action) => (
                        <div key={action.id} className="flex items-center gap-2 bg-background p-1.5 rounded border text-[10px]">
                          <Checkbox
                            id={`${cat.id}-${action.id}`}
                            checked={(form.Permissions[cat.id] || []).includes(action.id)}
                            onCheckedChange={() => togglePermission(cat.id, action.id)}
                          />
                          <label htmlFor={`${cat.id}-${action.id}`} className="cursor-pointer flex-1">{action.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={isSaving} className="gap-2">
              {isSaving ? "جاري الحفظ..." : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {editMode ? "حفظ التغييرات" : "إنشاء الحساب"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
