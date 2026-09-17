import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Onboarding, hasOnboarded } from "./Onboarding";

/**
 * Decides whether first-run onboarding should appear.
 *
 * Only on a genuine first arrival, and never on a deep link — someone who
 * followed a shared listing wants that listing, not three questions.
 */
export function FirstRun() {
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const deepLink = pathname !== "/" && pathname !== "/explore";
    if (!hasOnboarded() && !deepLink) setShow(true);
    // Only on mount: navigating later should never summon it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show) return null;
  return <Onboarding onDone={() => setShow(false)} />;
}
