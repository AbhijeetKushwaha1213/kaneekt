
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BackNavigationProps {
  label?: string;
  fallbackRoute?: string;
  className?: string;
  variant?: "default" | "ghost" | "outline";
}

export function BackNavigation({ 
  label = "Back", 
  fallbackRoute = "/", 
  className,
  variant = "ghost" 
}: BackNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Check if there's browser history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to a specific route
      navigate(fallbackRoute);
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleBack}
      className={cn("flex items-center gap-2", className)}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
