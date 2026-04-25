import React from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

export function LoadingSpinner({ size = "md", className = "", fullScreen = false }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const spinner = <Loader2 className={clsx("animate-spin text-primary", sizeClasses[size], className)} />;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-modal flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
}
