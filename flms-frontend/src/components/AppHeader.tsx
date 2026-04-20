import { Bell, Search, Moon, Sun, Smartphone, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/context/SearchContext";

export function AppHeader() {
  const [dark, setDark] = useState(false);
  const [userName, setUserName] = useState("أحمد المنصوري");
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);

    // Get user name from local storage if available
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.name) setUserName(user.name);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, [dark]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setDark(!dark)}
          className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button className="relative w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-bold">3</span>
        </button>
        <button
          onClick={() => navigate("/security-app")}
          className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
          title="تطبيق التفتيش الميداني"
        >
          <Smartphone className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 mr-2 border-r border-border pr-4">
          <div className="text-left">
            <p className="text-sm font-semibold">{userName}</p>
            <p className="text-[11px] text-muted-foreground">مدير النظام</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold hover:bg-primary/80 transition-colors group relative"
          >
            {userName.substring(0, 2)}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              تسجيل الخروج
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
