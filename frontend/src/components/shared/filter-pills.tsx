import { cn } from "@/lib/utils";

interface FilterPillsProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  className?: string;
}

/**
 * Reusable filter pill group. Used in articles, schemes, and settings pages.
 * Renders a horizontal list of toggleable category buttons with consistent active styling.
 */
export function FilterPills({ options, selected, onSelect, className }: FilterPillsProps) {
  return (
    <div role="group" aria-label="Filter categories" className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          aria-pressed={selected === option}
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition-colors",
            selected === option
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background text-muted-foreground hover:text-foreground"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
