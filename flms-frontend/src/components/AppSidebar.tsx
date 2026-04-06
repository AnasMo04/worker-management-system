import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Briefcase, CreditCard, ClipboardList,
  Scale, Wallet, FileText, Smartphone, UserCog, Activity, Settings, Shield,
} from "lucide-react";

const navItems = [
  { title: "لوحة التحكم", url: "/dashboard", icon: LayoutDashboard },
  { title: "الجهات المستضيفة", url: "/sponsors", icon: Briefcase },
  { title: "إدارة الأجانب", url: "/workers", icon: Users },
  { title: "البطاقات الذكية", url: "/smart-cards", icon: CreditCard },
  { title: "سجلات التفتيش", url: "/field-logs", icon: ClipboardList },
  { title: "القضايا القانونية", url: "/legal-cases", icon: Scale },
  { title: "المالية", url: "/financials", icon: Wallet },
  { title: "المستندات", url: "/documents", icon: FileText },
  { title: "الأجهزة", url: "/devices", icon: Smartphone },
  { title: "المستخدمون", url: "/users", icon: UserCog },
  { title: "سجل المراجعة", url: "/audit-trail", icon: Activity },
  { title: "الإعدادات", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground border-l border-sidebar-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-sidebar-accent-foreground">FLMS</h1>
            <p className="text-[10px] text-sidebar-muted">المنظومة الوطنية الموحدة</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
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
