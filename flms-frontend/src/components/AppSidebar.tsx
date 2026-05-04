import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, Users, Briefcase, CreditCard, ClipboardList,
  Scale, Wallet, FileText, Smartphone, UserCog, Activity, Settings, Shield,
} from "lucide-react";

const navItems = [
  { title: "لوحة التحكم", url: "/", icon: LayoutDashboard },
  { title: "الجهات المستضيفة", url: "/sponsors", icon: Briefcase, category: "sponsors" },
  { title: "الأجانب", url: "/workers", icon: Users, category: "workers" },
  { title: "البطاقات الذكية", url: "/smart-cards", icon: CreditCard, category: "smartcards" },
  { title: "سجلات التفتيش", url: "/field-logs", icon: ClipboardList, category: "reports" },
  { title: "القضايا القانونية", url: "/legal-cases", icon: Scale, category: "reports" },
  { title: "المالية", url: "/financials", icon: Wallet, category: "finance" },
  { title: "المستندات", url: "/documents", icon: FileText, category: "workers" },
  { title: "الأجهزة", url: "/devices", icon: Smartphone, category: "reports" },
  { title: "المستخدمون", url: "/users", icon: UserCog, category: "users" },
  { title: "سجل المراجعة", url: "/audit-trail", icon: Activity, category: "users" },
  { title: "الإعدادات", url: "/settings", icon: Settings, category: "users" },
];

export function AppSidebar() {
  const location = useLocation();
  const { hasPermission } = useAuth();

  return (
    <aside className="w-64 h-screen bg-sidebar text-sidebar-foreground border-l border-sidebar-border flex flex-col shrink-0 sticky top-0">
      {/* Logo */}
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner">
            <img src="/FLMS-LOGO.png" alt="FLMS Logo" className="w-14 h-14 object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-widest">FLMS</h1>
            <p className="text-[10px] text-sidebar-muted font-bold">المنظومة الوطنية لإدارة العمالة</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          if (item.category && !hasPermission(item.category, 'view')) return null;
          const isActive = location.pathname === item.url;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/"}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? ""
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-[10px] text-sidebar-muted text-center">الإصدار 1.0.0</p>
      </div>
    </aside>
  );
}
