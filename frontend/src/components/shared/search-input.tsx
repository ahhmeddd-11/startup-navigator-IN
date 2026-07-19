import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
  wrapperClassName?: string;
}

/**
 * Reusable search input with a leading search icon.
 * Wraps Shadcn Input to encapsulate the icon-overlay pattern used throughout the app.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  inputClassName,
  wrapperClassName,
  "aria-label": ariaLabel,
  ...rest
}: SearchInputProps) {
  return (
    <div className={wrapperClassName ?? "relative"}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className={inputClassName ?? "h-11 pl-10"}
        {...rest}
      />
    </div>
  );
}
