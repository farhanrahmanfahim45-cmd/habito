import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Route changes should start at the top, the way a page load does. */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
