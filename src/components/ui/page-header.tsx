
import { ReactNode } from "react";
import { BackNavigation } from "./back-navigation";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backLabel?: string;
  fallbackRoute?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  backLabel,
  fallbackRoute,
  actions,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <BackNavigation 
              customBackPath={fallbackRoute}
            />
          )}
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
