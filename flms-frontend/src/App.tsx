import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// أضفنا Navigate هنا باش نقدروا نحولوا المستخدم لصفحة الدخول
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; 
import { AppLayout } from "@/components/AppLayout";

// استدعاء الصفحات
import Dashboard from "./pages/Dashboard";
import Sponsors from "./pages/Sponsors";
import Workers from "./pages/Workers";
import SmartCards from "./pages/SmartCards";
import FieldLogs from "./pages/FieldLogs";
import LegalCases from "./pages/LegalCases";
import Financials from "./pages/Financials";
import Documents from "./pages/Documents";
import Devices from "./pages/Devices";
import UsersPage from "./pages/UsersPage";
import AuditTrail from "./pages/AuditTrail";
import SettingsPage from "./pages/SettingsPage";
import SecurityApp from "./pages/SecurityApp";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 🛡️ مكون الحماية: يفحص التوكن قبل ما يفتح أي صفحة محمية
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  
  // لو مافيش توكن، اطرده لصفحة تسجيل الدخول
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // لو فيه توكن، خليه يخش براحته
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* مسارات عامة (لا تحتاج لتسجيل دخول) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/security-app" element={<SecurityApp />} />

          {/* مسارات محمية (كل المنظومة الداخلية) */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/sponsors" element={<Sponsors />} />
                    <Route path="/workers" element={<Workers />} />
                    <Route path="/smart-cards" element={<SmartCards />} />
                    <Route path="/field-logs" element={<FieldLogs />} />
                    <Route path="/legal-cases" element={<LegalCases />} />
                    <Route path="/financials" element={<Financials />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/devices" element={<Devices />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/audit-trail" element={<AuditTrail />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;