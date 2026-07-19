import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2", className)}>
      <span className="relative grid h-7 w-7 place-items-center overflow-hidden rounded-md bg-primary text-primary-foreground shadow-xs">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            d="M4 20 L12 4 L20 20 L12 15 Z"
            fill="currentColor"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.2"
          />
        </svg>
      </span>
      {showText && (
        <span className="flex items-baseline gap-1.5 text-[15px] font-semibold tracking-tight">
          Startup Navigator
          <span className="hidden text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:inline">
            IN
          </span>
        </span>
      )}
    </Link>
  );
}
