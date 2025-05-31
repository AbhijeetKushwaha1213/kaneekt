
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BackNavigationProps {
  showHome?: boolean;
  customBackPath?: string;
  className?: string;
}

export function BackNavigation({ showHome = true, customBackPath, className = "" }: BackNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (customBackPath) {
      navigate(customBackPath);
    } else {
      navigate(-1);
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  // Don't show on home page
  if (location.pathname === '/' || location.pathname === '/chats') {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button variant="ghost" size="icon" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      
      {showHome && (
        <Button variant="ghost" size="icon" onClick={handleHome}>
          <Home className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
