import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/security-app" element={<SecurityApp />} />
          <Route
            path="*"
            element={
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
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
