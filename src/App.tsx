import { BrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { AppRoutes } from "@/routes/AppRoutes";
import { AuthProvider } from "@/hooks/useAuth";
import { I18nProvider } from "@/i18n";
import { HabitoProvider } from "@/hooks/useHabito";
import { ToastProvider } from "@/components/ui/Toast";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { FirstRun } from "@/components/onboarding/FirstRun";

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <HabitoProvider>
            <ToastProvider>
              <ScrollToTop />
              <FirstRun />
              <AppShell>
                <AppRoutes />
              </AppShell>
            </ToastProvider>
          </HabitoProvider>
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}
