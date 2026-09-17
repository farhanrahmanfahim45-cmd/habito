import { BrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { AppRoutes } from "@/routes/AppRoutes";
import { AuthProvider } from "@/hooks/useAuth";
import { HabitoProvider } from "@/hooks/useHabito";
import { ToastProvider } from "@/components/ui/Toast";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HabitoProvider>
          <ToastProvider>
            <ScrollToTop />
            <AppShell>
              <AppRoutes />
            </AppShell>
          </ToastProvider>
        </HabitoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
