import { useState } from "react";
import { SecurityLogin } from "@/components/security/SecurityLogin";
import { SecurityDashboard } from "@/components/security/SecurityDashboard";
import { SecurityNFCScan } from "@/components/security/SecurityNFCScan";
import { SecurityWorkerResult } from "@/components/security/SecurityWorkerResult";
import { SecurityInspectionForm } from "@/components/security/SecurityInspectionForm";
import { SecurityLegalCases } from "@/components/security/SecurityLegalCases";
import { SecurityFieldLogs } from "@/components/security/SecurityFieldLogs";
import { SecurityDeviceStatus } from "@/components/security/SecurityDeviceStatus";
import { SecurityProfile } from "@/components/security/SecurityProfile";

export type SecurityScreen =
  | "login"
  | "dashboard"
  | "nfc-scan"
  | "worker-result"
  | "inspection-form"
  | "legal-cases"
  | "field-logs"
  | "device-status"
  | "profile";

export interface ScannedWorker {
  id: string;
  name: string;
  passport: string;
  nationality: string;
  sponsor: string;
  status: "active" | "expired" | "suspended" | "runaway";
  cardIssue: string;
  cardExpiry: string;
  photo?: string;
}

export default function SecurityApp() {
  const [screen, setScreen] = useState<SecurityScreen>("login");
  const [scannedWorker, setScannedWorker] = useState<ScannedWorker | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setScreen("dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setScreen("login");
  };

  const handleScanComplete = () => {
    setScannedWorker({
      id: "W-2025-0041",
      name: "محمد أحمد الشريف",
      passport: "AB1234567",
      nationality: "بنغلاديش",
      sponsor: "شركة البناء المتحدة",
      status: "active",
      cardIssue: "2025-01-15",
      cardExpiry: "2026-01-15",
    });
    setScreen("worker-result");
  };

  const navigate = (s: SecurityScreen) => setScreen(s);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      {/* Mobile frame */}
      <div className="w-[390px] h-[844px] bg-[hsl(220,30%,7%)] rounded-[2.5rem] border-4 border-[hsl(220,20%,16%)] shadow-2xl overflow-hidden flex flex-col relative">
        {/* Phone notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-[hsl(220,30%,5%)] rounded-b-2xl z-50" />

        {/* Screen content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
          {screen === "login" && <SecurityLogin onLogin={handleLogin} />}
          {screen === "dashboard" && (
            <SecurityDashboard navigate={navigate} />
          )}
          {screen === "nfc-scan" && (
            <SecurityNFCScan
              onScanComplete={handleScanComplete}
              onBack={() => navigate("dashboard")}
            />
          )}
          {screen === "worker-result" && scannedWorker && (
            <SecurityWorkerResult
              worker={scannedWorker}
              navigate={navigate}
              onBack={() => navigate("dashboard")}
            />
          )}
          {screen === "inspection-form" && (
            <SecurityInspectionForm
              worker={scannedWorker}
              onBack={() =>
                scannedWorker
                  ? navigate("worker-result")
                  : navigate("dashboard")
              }
              onSubmit={() => navigate("dashboard")}
            />
          )}
          {screen === "legal-cases" && (
            <SecurityLegalCases onBack={() => navigate("dashboard")} />
          )}
          {screen === "field-logs" && (
            <SecurityFieldLogs onBack={() => navigate("dashboard")} />
          )}
          {screen === "device-status" && (
            <SecurityDeviceStatus onBack={() => navigate("dashboard")} />
          )}
          {screen === "profile" && (
            <SecurityProfile
              onBack={() => navigate("dashboard")}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </div>
  );
}
