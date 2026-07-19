import type { ReactNode } from "react";

interface EmptyStateProps {
  /** Optional span count for grid `col-span-*`. Defaults to "full". */
  colSpan?: string;
  message: string;
  children?: ReactNode;
}

/**
 * Consistent empty-state placeholder used when filtered results are empty.
 * Eliminates the repeated dashed-border pattern across article, scheme and resource lists.
 */
export function EmptyState({ colSpan = "col-span-full", message, children }: EmptyStateProps) {
  return (
    <div
      className={`${colSpan} rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground`}
    >
      {children ?? message}
    </div>
  );
}
