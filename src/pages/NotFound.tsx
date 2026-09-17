import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <span className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-aqua-100 text-aqua-700">
        <Compass size={22} aria-hidden />
      </span>
      <h1 className="font-display text-2xl font-bold text-ink">That page isn't here.</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
        The link may be out of date. Start from Explore and you'll find your way back.
      </p>
      <Link to="/explore" className="mt-6 inline-block">
        <Button>Explore spaces</Button>
      </Link>
    </div>
  );
}
