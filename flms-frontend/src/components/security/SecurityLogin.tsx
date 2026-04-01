import { useState } from "react";
import { Shield, Fingerprint, Lock, User, Eye, EyeOff } from "lucide-react";

interface Props {
  onLogin: () => void;
}

export function SecurityLogin({ onLogin }: Props) {
  const [showPass, setShowPass] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex flex-col min-h-full bg-gradient-to-b from-[hsl(215,40%,10%)] to-[hsl(220,30%,7%)] p-6 pt-14">
      {/* Logo */}
      <div className="flex flex-col items-center mt-12 mb-10">
        <div className="w-20 h-20 rounded-2xl bg-[hsl(175,55%,50%)] flex items-center justify-center mb-4 shadow-lg shadow-[hsl(175,55%,50%)/0.3]">
          <Shield className="w-10 h-10 text-[hsl(220,30%,7%)]" />
        </div>
        <h1 className="text-xl font-bold text-[hsl(210,20%,95%)] tracking-wide">FLMS</h1>
        <p className="text-xs text-[hsl(210,20%,50%)] mt-1">Field Inspection App</p>
      </div>

      {/* Form */}
      <div className="space-y-4 flex-1">
        <div className="relative">
          <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(210,20%,40%)]" />
          <input
            type="text"
            placeholder="اسم المستخدم"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-12 bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,20%)] rounded-xl pr-10 pl-4 text-sm text-[hsl(210,20%,90%)] placeholder:text-[hsl(210,20%,35%)] outline-none focus:border-[hsl(175,55%,50%)] transition-colors"
          />
        </div>
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(210,20%,40%)]" />
          <input
            type={showPass ? "text" : "password"}
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 bg-[hsl(220,25%,12%)] border border-[hsl(220,20%,20%)] rounded-xl pr-10 pl-10 text-sm text-[hsl(210,20%,90%)] placeholder:text-[hsl(210,20%,35%)] outline-none focus:border-[hsl(175,55%,50%)] transition-colors"
          />
          <button
            onClick={() => setShowPass(!showPass)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(210,20%,40%)]"
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <button
          onClick={onLogin}
          className="w-full h-12 bg-[hsl(175,55%,50%)] hover:bg-[hsl(175,55%,45%)] text-[hsl(220,30%,7%)] font-bold rounded-xl transition-colors text-sm"
        >
          تسجيل الدخول
        </button>

        <button
          onClick={onLogin}
          className="w-full h-12 bg-[hsl(220,25%,14%)] border border-[hsl(220,20%,22%)] text-[hsl(210,20%,70%)] rounded-xl flex items-center justify-center gap-2 hover:border-[hsl(175,55%,50%)/0.5] transition-colors text-sm"
        >
          <Fingerprint className="w-5 h-5" />
          الدخول بالبصمة
        </button>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 pb-8">
        <div className="flex items-center justify-center gap-1.5 text-[hsl(210,20%,35%)]">
          <Lock className="w-3 h-3" />
          <p className="text-[10px]">وصول آمن – للمستخدمين المصرح لهم فقط</p>
        </div>
      </div>
    </div>
  );
}
