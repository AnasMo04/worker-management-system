import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, User, Eye, EyeOff, Fingerprint, Globe } from "lucide-react";
import axiosInstance from "../api/axiosConfig"; // تأكد من مسار الملف حسب مجلداتك

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // حالة جديدة لعرض الأخطاء
  const navigate = useNavigate();

  // الدالة الفعلية لتسجيل الدخول
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // منع تحديث الصفحة عند ضغط Enter

    // التحقق من الحقول فارغة
    if (!username || !password) {
      setErrorMsg("الرجاء إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setLoading(true);
    setErrorMsg(""); // تصفير أي خطأ سابق

    try {
      // إرسال الطلب للسيرفر
      const response = await axiosInstance.post('/api/auth/login', {
        username,
        password,
      });

      // تخزين التوكن وبيانات المستخدم في المتصفح
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('user_name', response.data.user.name);
      
      // التوجيه للصفحة الرئيسية بعد النجاح
      navigate("/"); 
      
    } catch (error: any) {
      // التقاط الخطأ من السيرفر وعرضه
      setErrorMsg(error.response?.data?.message || 'حدث خطأ في الاتصال بالخادم. تأكد من تشغيل السيرفر.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex bg-gradient-to-br from-[hsl(215,40%,8%)] via-[hsl(220,35%,12%)] to-[hsl(215,40%,8%)]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2356d4c8' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[hsl(175,55%,50%)]/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[hsl(175,55%,50%)]/5 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          {/* Logo */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[hsl(175,55%,50%)] to-[hsl(175,55%,40%)] flex items-center justify-center mb-8 shadow-xl shadow-[hsl(175,55%,50%)]/20">
            <Shield className="w-12 h-12 text-[hsl(220,30%,7%)]" />
          </div>

          <h1 className="text-3xl font-bold text-[hsl(210,20%,95%)] mb-3 tracking-wide">
            منظومة إدارة العمالة الوافدة
          </h1>
          <p className="text-sm text-[hsl(210,20%,50%)] leading-relaxed mb-8">
            النظام الوطني الموحد لإدارة ومتابعة شؤون العمالة الوافدة
            <br />
            والتفتيش الميداني والبطاقات الذكية
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 w-full">
            {[
              { label: "عامل مسجل", value: "45,230" },
              { label: "كفيل نشط", value: "3,847" },
              { label: "عملية تفتيش", value: "12,650" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-[hsl(175,55%,50%)]">{stat.value}</p>
                <p className="text-[11px] text-[hsl(210,20%,45%)] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Bottom info */}
          <div className="mt-16 flex items-center gap-2 text-[hsl(210,20%,30%)]">
            <Globe className="w-3.5 h-3.5" />
            <span className="text-[11px]">FLMS v2.0 — Foreign Labor Management System</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex flex-col items-center mb-10 lg:hidden">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[hsl(175,55%,50%)] to-[hsl(175,55%,40%)] flex items-center justify-center mb-4 shadow-lg shadow-[hsl(175,55%,50%)]/20">
              <Shield className="w-8 h-8 text-[hsl(220,30%,7%)]" />
            </div>
            <h1 className="text-xl font-bold text-[hsl(210,20%,95%)]">FLMS</h1>
            <p className="text-xs text-[hsl(210,20%,45%)] mt-1">منظومة إدارة العمالة الوافدة</p>
          </div>

          {/* Form Card */}
          <div className="bg-[hsl(220,25%,11%)]/80 backdrop-blur-xl border border-[hsl(220,20%,18%)] rounded-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[hsl(210,20%,93%)]">تسجيل الدخول</h2>
              <p className="text-sm text-[hsl(210,20%,45%)] mt-1">أدخل بيانات الاعتماد للوصول إلى المنظومة</p>
            </div>

            {/* رسالة الخطأ الأنيقة */}
            {errorMsg && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                <Shield className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* تم تحويل الـ div إلى form لدعم زر Enter */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[hsl(210,20%,55%)]">اسم المستخدم</label>
                <div className="relative">
                  <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(210,20%,35%)]" />
                  <input
                    type="text"
                    placeholder="أدخل اسم المستخدم"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-12 bg-[hsl(220,25%,8%)] border border-[hsl(220,20%,20%)] rounded-xl pr-11 pl-4 text-sm text-[hsl(210,20%,90%)] placeholder:text-[hsl(210,20%,30%)] outline-none focus:border-[hsl(175,55%,50%)] focus:ring-1 focus:ring-[hsl(175,55%,50%)]/30 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[hsl(210,20%,55%)]">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(210,20%,35%)]" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 bg-[hsl(220,25%,8%)] border border-[hsl(220,20%,20%)] rounded-xl pr-11 pl-11 text-sm text-[hsl(210,20%,90%)] placeholder:text-[hsl(210,20%,30%)] outline-none focus:border-[hsl(175,55%,50%)] focus:ring-1 focus:ring-[hsl(175,55%,50%)]/30 transition-all"
                  />
                  <button
                    type="button" // مهم باش ما يديرش Submit للـ Form بالغلط
                    onClick={() => setShowPass(!showPass)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(210,20%,35%)] hover:text-[hsl(210,20%,55%)] transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-[hsl(220,20%,25%)] bg-[hsl(220,25%,10%)] accent-[hsl(175,55%,50%)]" />
                  <span className="text-xs text-[hsl(210,20%,50%)]">تذكرني</span>
                </label>
                <button type="button" className="text-xs text-[hsl(175,55%,50%)] hover:text-[hsl(175,55%,60%)] transition-colors">
                  نسيت كلمة المرور؟
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-l from-[hsl(175,55%,45%)] to-[hsl(175,55%,50%)] hover:from-[hsl(175,55%,40%)] hover:to-[hsl(175,55%,45%)] text-[hsl(220,30%,7%)] font-bold rounded-xl transition-all text-sm disabled:opacity-60 shadow-lg shadow-[hsl(175,55%,50%)]/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[hsl(220,30%,7%)]/30 border-t-[hsl(220,30%,7%)] rounded-full animate-spin" />
                    جاري التحقق...
                  </span>
                ) : (
                  "تسجيل الدخول"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 mt-5">
              <div className="flex-1 h-px bg-[hsl(220,20%,18%)]" />
              <span className="text-[10px] text-[hsl(210,20%,30%)]">أو</span>
              <div className="flex-1 h-px bg-[hsl(220,20%,18%)]" />
            </div>

            {/* Biometric */}
            <button
              type="button"
              className="w-full h-12 mt-5 bg-[hsl(220,25%,13%)] border border-[hsl(220,20%,20%)] text-[hsl(210,20%,65%)] rounded-xl flex items-center justify-center gap-2.5 hover:border-[hsl(175,55%,50%)]/40 hover:text-[hsl(210,20%,80%)] transition-all text-sm"
            >
              <Fingerprint className="w-5 h-5" />
              الدخول بالبصمة
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-[hsl(210,20%,30%)]">
              <Lock className="w-3 h-3" />
              <p className="text-[10px]">وصول آمن ومشفر – للمستخدمين المصرح لهم فقط</p>
            </div>
            <p className="text-[10px] text-[hsl(210,20%,22%)]">
              © 2026 جميع الحقوق محفوظة — وزارة العمل والتأهيل
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}