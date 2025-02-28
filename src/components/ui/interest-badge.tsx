
import { cn } from "@/lib/utils";

interface InterestBadgeProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function InterestBadge({ 
  label, 
  selected = false, 
  onClick, 
  className 
}: InterestBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all",
        "hover:scale-105 active:scale-95",
        selected
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        onClick && "cursor-pointer",
        className
      )}
    >
      {label}
    </button>
  );
}
