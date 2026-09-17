import type { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { Footer } from "./Footer";
import { PrototypeNotice } from "./PrototypeNotice";
import { CompareTray } from "@/components/space/CompareTray";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <PrototypeNotice />
      <Header />
      <main id="main" className="flex-1 pb-14 md:pb-0">
        {children}
      </main>
      <Footer />
      <CompareTray />
      <MobileNav />
    </div>
  );
}
