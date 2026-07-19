import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  colSpan?: string;
}

/**
 * Consistent error-state placeholder used when a query fails.
 * Includes a message and an optional retry action.
 */
export function ErrorState({
  message = "Failed to load content. Please try again.",
  onRetry,
  colSpan = "col-span-full",
}: ErrorStateProps) {
  return (
    <div
      className={`${colSpan} flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center`}
    >
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="mt-3 text-sm font-medium text-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
