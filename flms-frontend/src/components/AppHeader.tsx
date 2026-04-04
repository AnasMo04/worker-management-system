import { Bell, Search, Moon, Sun, Smartphone, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/context/SearchContext";

export function AppHeader() {
  const [dark, setDark] = useState(false);
  const [userName, setUserName] = useState("مستخدم");
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    const storedName = localStorage.getItem("user_name");
    if (storedName) {
      setUserName(storedName);
    } else {
      setUserName("مستخدم");
    }
  }, [dark]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث..."
          className="w-full h-10 bg-muted rounded-lg pr-10 pl-4 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
        />
      </div>

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
          <div className="text-left flex flex-col items-start">
            <p className="text-sm font-semibold">{userName}</p>
            <button
              onClick={handleLogout}
              className="text-[10px] text-destructive hover:underline flex items-center gap-1 transition-all"
            >
              <LogOut className="w-3 h-3" />
              تسجيل خروج
            </button>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
            {userName.substring(0, 1)}
          </div>
        </div>
      </div>
    </header>
  );
}
